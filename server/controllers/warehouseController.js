const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const warehouseSchema = z.object({
    name: z.string().min(1),
    shortcode: z.string().min(1),
    locationId: z.string().uuid(),
    type: z.enum(['MAIN', 'STORE', 'RETURNS']).default('MAIN'),
    capacity: z.number().int().nonnegative().default(0),
});

const getWarehouses = async (req, res) => {
    try {
        const warehouses = await prisma.warehouse.findMany({
            include: {
                location: true,
                _count: { select: { stock: true } }
            }
        });
        res.json(warehouses);
    } catch (error) {
        console.error('Error fetching warehouses:', error);
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
        // Check for unique constraint violation on shortcode
        if (error.code === 'P2002') {
             return res.status(400).json({ message: 'Shortcode must be unique' });
        }
        res.status(500).json({ message: 'Error creating warehouse' });
    }
};

module.exports = { getWarehouses, createWarehouse };
