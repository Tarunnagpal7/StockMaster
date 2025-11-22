const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const subLocationSchema = z.object({
    name: z.string().min(1),
    warehouseId: z.string().uuid(),
});

const getSubLocations = async (req, res) => {
    try {
        const subLocations = await prisma.subLocation.findMany({
            include: { warehouse: true }
        });
        res.json(subLocations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sub-locations' });
    }
};

const createSubLocation = async (req, res) => {
    try {
        const data = subLocationSchema.parse(req.body);
        const subLocation = await prisma.subLocation.create({ data });
        res.status(201).json(subLocation);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: 'Error creating sub-location' });
    }
};

const deleteSubLocation = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.subLocation.delete({ where: { id } });
        res.json({ message: 'Sub-location deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting sub-location' });
    }
};

module.exports = { getSubLocations, createSubLocation, deleteSubLocation };
