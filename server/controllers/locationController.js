const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const locationSchema = z.object({
    name: z.string().min(1),
    warehouseId: z.string().uuid(),
});

const getLocations = async (req, res) => {
    try {
        const locations = await prisma.location.findMany({
            include: { warehouse: true }
        });
        res.json(locations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching locations' });
    }
};

const createLocation = async (req, res) => {
    try {
        const data = locationSchema.parse(req.body);
        const location = await prisma.location.create({ data });
        res.status(201).json(location);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: 'Error creating location' });
    }
};

const updateLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const data = locationSchema.partial().parse(req.body);
        const location = await prisma.location.update({
            where: { id },
            data
        });
        res.json(location);
    } catch (error) {
        res.status(500).json({ message: 'Error updating location' });
    }
};

const deleteLocation = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.location.delete({ where: { id } });
        res.json({ message: 'Location deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting location' });
    }
};

module.exports = { getLocations, createLocation, updateLocation, deleteLocation };
