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

        // Fix low stock count query - using relation correctly
        // We need to find products where the SUM of stock quantity is less than minStock
        
        const allProducts = await prisma.product.findMany({
            where: productFilter,
            include: { stock: true }
        });

        const lowStockCount = allProducts.filter(p => {
            let totalStock = 0;
            if (warehouseId && warehouseId !== 'ALL') {
                // Filter stock for specific warehouse
                const stockEntry = p.stock.find(s => s.warehouseId === warehouseId);
                totalStock = stockEntry ? stockEntry.quantity : 0;
            } else {
                // Sum all stock
                totalStock = p.stock.reduce((acc, s) => acc + s.quantity, 0);
            }
            return totalStock <= p.minStock;
        }).length;

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

module.exports = { getDashboardStats, getDashboardGraphData };
