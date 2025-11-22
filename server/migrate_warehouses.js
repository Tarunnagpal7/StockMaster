const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting migration...');

    // 1. Create a default Location
    let defaultLocation = await prisma.location.findUnique({ where: { name: 'Main Location' } });
    if (!defaultLocation) {
        defaultLocation = await prisma.location.create({
            data: { name: 'Main Location' }
        });
        console.log('Created default Location:', defaultLocation);
    } else {
        console.log('Found default Location:', defaultLocation);
    }

    // 2. Update Warehouses
    const warehouses = await prisma.warehouse.findMany({
        where: {
            OR: [
                { shortcode: null },
                { locationId: null }
            ]
        }
    });

    console.log(`Found ${warehouses.length} warehouses to update.`);

    for (const wh of warehouses) {
        const shortcode = `WH-${wh.name.substring(0, 3).toUpperCase()}-${wh.id.substring(0, 4)}`;
        await prisma.warehouse.update({
            where: { id: wh.id },
            data: {
                shortcode: wh.shortcode || shortcode,
                locationId: wh.locationId || defaultLocation.id
            }
        });
        console.log(`Updated warehouse ${wh.name} with shortcode ${shortcode}`);
    }

    console.log('Migration completed.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
