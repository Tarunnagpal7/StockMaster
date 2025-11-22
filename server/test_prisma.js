const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        console.log('Testing Location access...');
        const locations = await prisma.location.findMany({ include: { warehouses: true } });
        console.log('Locations:', locations);

        console.log('Testing Warehouse access...');
        const warehouses = await prisma.warehouse.findMany({ include: { location: true } });
        console.log('Warehouses:', warehouses);

        console.log('Success!');
    } catch (error) {
        console.error('Prisma Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
