const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const where = {
            transaction: {
                date: { gte: startDate },
                status: 'COMPLETED',
                type: 'OUT'
            }
        };

        console.log('Running query...');
        const topProducts = await prisma.transactionItem.groupBy({
            by: ['productId'],
            where,
            _sum: {
                quantity: true
            },
            orderBy: {
                _sum: {
                    quantity: 'desc'
                }
            },
            take: 5
        });
        console.log('Result:', topProducts);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
