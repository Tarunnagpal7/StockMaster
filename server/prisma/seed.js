const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');


const prisma = new PrismaClient();

async function main() {

    console.log("🌱 Seeding database...");

    // --- USERS ---
    const admin = await prisma.user.create({
        data: {
            email: 'admin@example.com',
            passwordHash: 'hashedpassword',
            name: 'Admin User',
            role: 'ADMIN'
        }
    });

    const staff = await prisma.user.create({
        data: {
            email: 'staff@example.com',
            passwordHash: 'hashedpassword',
            name: 'John Staff',
            role: 'STAFF'
        }
    });

    // --- LOCATIONS ---
    const mainLocation = await prisma.location.create({
        data: {
            name: "Main Facility"
        }
    });

    const cityWarehouseLocation = await prisma.location.create({
        data: {
            name: "City Warehouse Zone"
        }
    });

    // --- WAREHOUSES ---
    const warehouseA = await prisma.warehouse.create({
        data: {
            name: "Main Warehouse",
            shortcode: "MAIN",
            locationId: mainLocation.id
        }
    });

    const warehouseB = await prisma.warehouse.create({
        data: {
            name: "City Distribution",
            shortcode: "CITY",
            locationId: cityWarehouseLocation.id
        }
    });

    // --- PRODUCTS ---
    const products = await prisma.product.createMany({
        data: [
            {
                sku: "PRD001",
                name: "Steel Rod",
                category: "Material",
                price: 120,
                uom: "KG",
                isActive: true
            },
            {
                sku: "PRD002",
                name: "Copper Wire",
                category: "Material",
                price: 95.5,
                uom: "ROLL",
                isActive: true
            },
            {
                sku: "PRD003",
                name: "Safety Gloves",
                category: "Safety",
                price: 15,
                uom: "PAIR",
                isActive: false
            },
            {
                sku: "PRD004",
                name: "Packaging Tape",
                category: "Supplies",
                price: 4,
                uom: "ROLL",
                isActive: true
            }
        ]
    });

    console.log("✔ Products added!");

    // Fetch Products to create stock relations
    const productList = await prisma.product.findMany();

    // --- STOCK ENTRIES ---
    for (const product of productList) {
        await prisma.stock.create({
            data: {
                warehouseId: warehouseA.id,
                productId: product.id,
                quantity: Math.floor(Math.random() * 200) + 20
            }
        });

        await prisma.stock.create({
            data: {
                warehouseId: warehouseB.id,
                productId: product.id,
                quantity: Math.floor(Math.random() * 100) + 10
            }
        });
    }

    console.log("📦 Stock levels created.");

    // --- SAMPLE TRANSACTION ---
    const transaction = await prisma.transaction.create({
        data: {
            type: "TRANSFER",
            status: "COMPLETED",
            createdById: admin.id,
            sourceWarehouseId: warehouseA.id,
            targetWarehouseId: warehouseB.id,
            items: {
                create: [
                    {
                        productId: productList[0].id,
                        quantity: 10
                    },
                    {
                        productId: productList[1].id,
                        quantity: 5
                    }
                ]
            }
        }
    });

    console.log("➡ Example transaction created:", transaction.id);

    console.log("🎉 Seeding completed!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });