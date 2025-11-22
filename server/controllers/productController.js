const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const { getPaginationParams, createPaginatedResponse } = require('../utils/pagination');

const prisma = new PrismaClient();

const productSchema = z.object({
    sku: z.string().min(1),
    name: z.string().min(1),
    category: z.string().optional(),
    uom: z.string().default('UNIT'),
    minStock: z.number().min(0).default(0),
    description: z.string().optional(),
    price: z.number().min(0).default(0),
    isActive: z.boolean().default(true),
});

const getProducts = async (req, res) => {
    try {
        const { search, category, activeOnly } = req.query;
        const { page, limit, skip } = getPaginationParams(req.query);

        const where = {};
        if (activeOnly === 'true') {
            where.isActive = true;
        }
        if (category) {
            where.category = category;
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } }
            ];
        }

        // Get total count for pagination
        const totalItems = await prisma.product.count({ where });

        // Get paginated products
        const products = await prisma.product.findMany({
            where,
            include: {
                stock: {
                    include: { warehouse: true }
                }
            },
            orderBy: { name: 'asc' },
            skip,
            take: limit
        });

        // Calculate total stock for each product
        const productsWithStock = products.map(p => {
            const totalStock = p.stock.reduce((acc, s) => acc + s.quantity, 0);
            return { ...p, totalStock };
        });

        // Return paginated response
        res.json(createPaginatedResponse(productsWithStock, totalItems, page, limit));
    } catch (error) {
        console.error('Error in getProducts:', error);
        res.status(500).json({ message: 'Error fetching products' });
    }
};

const getProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                stock: { include: { warehouse: true } },
                transactionItems: {
                    take: 10,
                    orderBy: { transaction: { date: 'desc' } },
                    include: { transaction: true }
                }
            }
        });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product' });
    }
};

const createProduct = async (req, res) => {
    try {
        const data = productSchema.parse(req.body);
        const existing = await prisma.product.findUnique({ where: { sku: data.sku } });
        if (existing) return res.status(400).json({ message: 'SKU already exists' });

        const product = await prisma.product.create({ data });
        res.status(201).json(product);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: 'Error creating product' });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const data = productSchema.partial().parse(req.body);

        const product = await prisma.product.update({
            where: { id },
            data
        });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error updating product' });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if product has transactions or stock
        const hasTransactions = await prisma.transactionItem.findFirst({ where: { productId: id } });
        if (hasTransactions) return res.status(400).json({ message: 'Cannot delete product with history' });

        const hasStock = await prisma.stock.findFirst({ where: { productId: id, quantity: { gt: 0 } } });
        if (hasStock) return res.status(400).json({ message: 'Cannot delete product with stock' });

        // Delete stock entries (if 0)
        await prisma.stock.deleteMany({ where: { productId: id } });
        await prisma.product.delete({ where: { id } });

        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product' });
    }
};

const getProductStock = async (req, res) => {
    try {
        const { id } = req.params;
        const stock = await prisma.stock.findMany({
            where: { productId: id },
            include: { warehouse: true, location: true }
        });
        res.json(stock);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product stock' });
    }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getProductStock };
