const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const warehouseSchema = z.object({
    name: z.string().min(1),
    location: z.string().optional(),
    type: z.enum(['MAIN', 'STORE', 'RETURNS']).default('MAIN'),
});

const getWarehouses = async (req, res) => {
    try {
        const warehouses = await prisma.warehouse.findMany({
            include: {
                _count: { select: { stock: true } }
            }
        });
        res.json(warehouses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching warehouses' });
    }
};

const createWarehouse = async (req, res) => {
    try {
        const data = warehouseSchema.parse(req.body);
        const warehouse = await prisma.warehouse.create({ data });
        res.status(201).json(warehouse);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: 'Error creating warehouse' });
    }
};

module.exports = { getWarehouses, createWarehouse };
