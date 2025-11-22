const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');

const prisma = new PrismaClient();

const generateTokens = (user) => {
    const accessToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

const login = async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) return res.status(401).json({ message: 'Invalid credentials' });

        const tokens = generateTokens(user);
        res.json({ ...tokens, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

const signup = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        // Basic validation
        if (!email || !password || !name) return res.status(400).json({ message: "Missing fields" });

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ message: "User already exists" });

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, passwordHash, name, role: 'STAFF' }
        });

        const tokens = generateTokens(user);
        res.status(201).json({ ...tokens, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: "Error registering user" });
    }
};

const me = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user' });
    }
};

const refresh = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.sendStatus(401);

    jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, user) => {
        if (err) return res.sendStatus(403);
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
        const tokens = generateTokens(dbUser);
        res.json(tokens);
    });
};

const resetOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const otp = '123456'; // Mock OTP
        const expiresAt = new Date(Date.now() + 10 * 60000); // 10 mins

        await prisma.resetToken.create({
            data: { userId: user.id, token: otp, expiresAt }
        });

        console.log(`OTP for ${email}: ${otp}`); // Log to console for demo
        res.json({ message: 'OTP sent' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending OTP' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const validToken = await prisma.resetToken.findFirst({
            where: { userId: user.id, token: otp, expiresAt: { gt: new Date() } }
        });

        if (!validToken) return res.status(400).json({ message: 'Invalid or expired OTP' });

        const passwordHash = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash }
        });

        // Delete used tokens
        await prisma.resetToken.deleteMany({ where: { userId: user.id } });

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ message: 'Error resetting password' });
    }
};

module.exports = { login, signup, register: signup, me, refresh, resetOtp, resetPassword };
