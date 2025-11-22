const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getDashboardStats = async (req, res) => {
    try {
        const { warehouseId, category, status, type } = req.query;

        // Build filters
        const productFilter = {};
        if (category && category !== 'ALL') productFilter.category = category;

        const transactionFilter = {};
        if (warehouseId && warehouseId !== 'ALL') {
            transactionFilter.OR = [
                { sourceWarehouseId: warehouseId },
                { targetWarehouseId: warehouseId }
            ];
        }
        if (status && status !== 'ALL') transactionFilter.status = status;
        if (type && type !== 'ALL') transactionFilter.type = type;

        // 1. KPIs
        let totalProducts;
        if (warehouseId && warehouseId !== 'ALL') {
            // If specific warehouse, count distinct products in that warehouse
            const warehouseStock = await prisma.stock.findMany({
                where: { warehouseId },
                select: { productId: true },
                distinct: ['productId']
            });
            totalProducts = warehouseStock.length;
        } else {
            totalProducts = await prisma.product.count({ where: productFilter });
        }

        // Optimized Low Stock Count
        let lowStockCount = 0;
        if (warehouseId && warehouseId !== 'ALL') {
             // For specific warehouse, we can just check the stock table directly
             // This assumes minStock is on the Product, so we need to join
             const lowStockItems = await prisma.stock.findMany({
                where: {
                    warehouseId,
                    quantity: {
                        lte: prisma.product.fields.minStock // This might not work directly in all Prisma versions depending on relation, but let's try a raw query for safety and speed as promised
                    }
                }
             });
             // Actually, Prisma doesn't support comparing fields across relations easily in where clause without raw query or fetching.
             // Let's use a raw query for maximum performance as planned.
             const result = await prisma.$queryRaw`
                SELECT COUNT(*)::int as count
                FROM "Stock" s
                JOIN "Product" p ON s."productId" = p.id
                WHERE s."warehouseId" = ${warehouseId}
                AND s.quantity <= p."minStock"
             `;
             lowStockCount = result[0].count;

        } else {
            // Global low stock: Sum of all stock vs minStock
            // This is tricky because stock is scattered across warehouses.
            // We need to group by productId, sum quantity, and compare with minStock.
            const result = await prisma.$queryRaw`
                SELECT COUNT(*)::int as count
                FROM (
                    SELECT p.id, p."minStock", COALESCE(SUM(s.quantity), 0) as total_stock
                    FROM "Product" p
                    LEFT JOIN "Stock" s ON p.id = s."productId"
                    WHERE 1=1 -- Add category filter if needed
                    GROUP BY p.id, p."minStock"
                    HAVING COALESCE(SUM(s.quantity), 0) <= p."minStock"
                ) as low_stock_products
            `;
            lowStockCount = result[0].count;
        }

        const pendingReceipts = await prisma.transaction.count({
            where: { ...transactionFilter, type: 'IN', status: 'DRAFT' }
        });

        const pendingDeliveries = await prisma.transaction.count({
            where: { ...transactionFilter, type: 'OUT', status: 'DRAFT' }
        });

        const pendingTransfers = await prisma.transaction.count({
            where: { ...transactionFilter, type: 'TRANSFER', status: 'DRAFT' }
        });

        // 2. Recent Activity
        const recentActivity = await prisma.transaction.findMany({
            take: 5,
            orderBy: { date: 'desc' },
            where: transactionFilter,
            include: {
                items: { include: { product: true } },
                sourceWarehouse: true,
                targetWarehouse: true,
                createdBy: { select: { name: true } }
            }
        });

        res.json({
            totalProducts,
            lowStockCount,
            pendingReceipts,
            pendingDeliveries,
            pendingTransfers,
            recentActivity
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
};

const getDashboardGraphData = async (req, res) => {
    try {
        const { warehouseId, period } = req.query; // period: 'WEEKLY', 'MONTHLY', '3WEEKS'

        let startDate = new Date();
        if (period === 'WEEKLY') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (period === 'MONTHLY') {
            startDate.setMonth(startDate.getMonth() - 1);
        } else if (period === '3WEEKS') {
            startDate.setDate(startDate.getDate() - 21);
        } else {
             startDate.setDate(startDate.getDate() - 7); // Default to weekly
        }

        const where = {
            date: { gte: startDate },
            status: 'COMPLETED' // Only completed transactions
        };

        if (warehouseId && warehouseId !== 'ALL') {
            where.OR = [
                { sourceWarehouseId: warehouseId },
                { targetWarehouseId: warehouseId }
            ];
        }

        const transactions = await prisma.transaction.findMany({
            where,
            include: {
                items: true
            },
            orderBy: { date: 'asc' }
        });

        // Aggregate by date
        const groupedData = {};
        
        // Initialize all dates in range to 0
        for (let d = new Date(startDate); d <= new Date(); d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            groupedData[dateStr] = { date: dateStr, incoming: 0, outgoing: 0 };
        }

        transactions.forEach(tx => {
            const dateStr = tx.date.toISOString().split('T')[0];
            if (!groupedData[dateStr]) return;

            const totalQty = tx.items.reduce((sum, item) => sum + item.quantity, 0);

            if (tx.type === 'IN') {
                if (!warehouseId || warehouseId === 'ALL' || tx.targetWarehouseId === warehouseId) {
                     groupedData[dateStr].incoming += totalQty;
                }
            } else if (tx.type === 'OUT') {
                if (!warehouseId || warehouseId === 'ALL' || tx.sourceWarehouseId === warehouseId) {
                    groupedData[dateStr].outgoing += totalQty;
                }
            } else if (tx.type === 'TRANSFER') {
                 if (warehouseId && warehouseId !== 'ALL') {
                    if (tx.targetWarehouseId === warehouseId) {
                        groupedData[dateStr].incoming += totalQty;
                    }
                    if (tx.sourceWarehouseId === warehouseId) {
                        groupedData[dateStr].outgoing += totalQty;
                    }
                 }
            }
        });

        const graphData = Object.values(groupedData);

        res.json(graphData);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching graph data' });
    }
};

const getDashboardPieChartData = async (req, res) => {
    try {
        const { warehouseId } = req.query;

        // Use raw query to get both product count and total stock quantity per category
        let query;
        if (warehouseId && warehouseId !== 'ALL') {
            query = prisma.$queryRaw`
                SELECT 
                    p.category,
                    COUNT(DISTINCT p.id)::int as "productCount",
                    COALESCE(SUM(s.quantity), 0)::int as "stockQuantity"
                FROM "Product" p
                LEFT JOIN "Stock" s ON p.id = s."productId" AND s."warehouseId" = ${warehouseId}
                GROUP BY p.category
            `;
        } else {
            query = prisma.$queryRaw`
                SELECT 
                    p.category,
                    COUNT(DISTINCT p.id)::int as "productCount",
                    COALESCE(SUM(s.quantity), 0)::int as "stockQuantity"
                FROM "Product" p
                LEFT JOIN "Stock" s ON p.id = s."productId"
                GROUP BY p.category
            `;
        }

        const result = await query;

        // Format for frontend
        const formattedData = result.map(item => ({
            name: item.category || 'Uncategorized',
            value: item.productCount, // For Pie Chart (Product Distribution)
            stockValue: item.stockQuantity // For Bar Chart (Stock Distribution)
        }));

        res.json(formattedData);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching distribution data' });
    }
};

module.exports = { getDashboardStats, getDashboardGraphData, getDashboardPieChartData };
