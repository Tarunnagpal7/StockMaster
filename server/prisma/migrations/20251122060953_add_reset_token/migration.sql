/*
  Warnings:

  - A unique constraint covering the columns `[warehouseId,locationId,productId]` on the table `Stock` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Stock_warehouseId_productId_key";

-- AlterTable
ALTER TABLE "Stock" ADD COLUMN     "locationId" TEXT;

-- CreateTable
CREATE TABLE "ResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReorderRule" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "minStock" INTEGER NOT NULL,
    "maxStock" INTEGER NOT NULL,

    CONSTRAINT "ReorderRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResetToken_token_key" ON "ResetToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_warehouseId_locationId_productId_key" ON "Stock"("warehouseId", "locationId", "productId");

-- AddForeignKey
ALTER TABLE "ResetToken" ADD CONSTRAINT "ResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReorderRule" ADD CONSTRAINT "ReorderRule_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
