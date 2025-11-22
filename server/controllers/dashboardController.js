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
        const totalProducts = await prisma.product.count({ where: productFilter });

        const lowStockCount = await prisma.product.count({
            where: {
                ...productFilter,
                stock: {
                    some: {
                        quantity: { lte: prisma.product.fields.minStock }
                    }
                }
            }
        });

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
