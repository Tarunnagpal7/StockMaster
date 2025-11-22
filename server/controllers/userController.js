const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};

const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id },
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user' });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body; // Only allowing role update for now

        if (req.user.role !== 'MANAGER') {
            return res.status(403).json({ message: 'Only managers can update users' });
        }

        const user = await prisma.user.update({
            where: { id },
            data: { role }
        });
        res.json({ id: user.id, role: user.role });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user' });
    }
};

module.exports = { getUsers, getUser, updateUser };
