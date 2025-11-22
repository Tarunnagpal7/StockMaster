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

module.exports = { getDashboardStats };
