const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // 1. Clean up
    await prisma.ledger.deleteMany();
    await prisma.transactionItem.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.stock.deleteMany();
    await prisma.product.deleteMany();
    await prisma.warehouse.deleteMany();
    await prisma.user.deleteMany();

    // 2. Create Users
    const passwordHash = await bcrypt.hash('password123', 10);

    const manager = await prisma.user.create({
        data: {
            email: 'manager@stockmaster.com',
            name: 'Alice Manager',
            role: 'MANAGER',
            passwordHash,
        },
    });

    const staff = await prisma.user.create({
        data: {
            email: 'staff@stockmaster.com',
            name: 'Bob Staff',
            role: 'STAFF',
            passwordHash,
        },
    });

    console.log('👤 Users created');

    // 3. Create Warehouses
    const mainWarehouse = await prisma.warehouse.create({
        data: { name: 'Main Distribution Center', type: 'MAIN', location: 'New York, NY' },
    });

    const storeWarehouse = await prisma.warehouse.create({
        data: { name: 'Downtown Store', type: 'STORE', location: 'Brooklyn, NY' },
    });

    const returnsWarehouse = await prisma.warehouse.create({
        data: { name: 'Returns Processing', type: 'RETURNS', location: 'Jersey City, NJ' },
    });

    console.log('🏭 Warehouses created');

    // 4. Create Products
    const productsData = [
        { sku: 'LAP-001', name: 'Pro Laptop 14"', category: 'Electronics', uom: 'UNIT', minStock: 5, description: 'High performance laptop' },
        { sku: 'PHN-002', name: 'SmartPhone X', category: 'Electronics', uom: 'UNIT', minStock: 10, description: 'Latest smartphone model' },
        { sku: 'CH-003', name: 'Ergo Chair', category: 'Furniture', uom: 'UNIT', minStock: 2, description: 'Ergonomic office chair' },
        { sku: 'TBL-004', name: 'Standing Desk', category: 'Furniture', uom: 'UNIT', minStock: 2, description: 'Electric standing desk' },
        { sku: 'CBL-005', name: 'USB-C Cable 2m', category: 'Accessories', uom: 'UNIT', minStock: 50, description: 'Braided USB-C cable' },
    ];

    const products = [];
    for (const p of productsData) {
        const product = await prisma.product.create({ data: p });
        products.push(product);
    }

    console.log('📦 Products created');

    // 5. Initial Stock (via Transactions)
    // Receipt for Main Warehouse
    const receipt = await prisma.transaction.create({
        data: {
            type: 'IN',
            status: 'COMPLETED',
            reference: 'PO-INIT-001',
            createdById: manager.id,
            targetWarehouseId: mainWarehouse.id,
            items: {
                create: [
                    { productId: products[0].id, quantity: 50 }, // Laptops
                    { productId: products[1].id, quantity: 100 }, // Phones
                    { productId: products[4].id, quantity: 500 }, // Cables
                ]
            }
        },
        include: { items: true }
    });

    // Create Ledger Entries & Update Stock for Receipt
    for (const item of receipt.items) {
        // Update Stock
        await prisma.stock.upsert({
            where: { warehouseId_productId: { warehouseId: mainWarehouse.id, productId: item.productId } },
            update: { quantity: { increment: item.quantity } },
            create: { warehouseId: mainWarehouse.id, productId: item.productId, quantity: item.quantity }
        });

        // Create Ledger
        await prisma.ledger.create({
            data: {
                transactionId: receipt.id,
                productId: item.productId,
                warehouseId: mainWarehouse.id,
                quantityChange: item.quantity,
                balanceAfter: item.quantity, // Simplified for initial seed
            }
        });
    }

    console.log('🚚 Initial stock receipt processed');

    console.log('✅ Seed completed');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
