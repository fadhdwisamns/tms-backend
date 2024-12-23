/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Order` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[orderId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `customerName` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pickupDate` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "createdAt",
DROP COLUMN "customerId",
DROP COLUMN "description",
DROP COLUMN "status",
DROP COLUMN "updatedAt",
ADD COLUMN     "createDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "customerName" TEXT NOT NULL,
ADD COLUMN     "dispatchImmediately" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "multiplePickups" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "orderId" TEXT NOT NULL,
ADD COLUMN     "pickupDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "requireProofOfDelivery" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "truckId" INTEGER,
ADD COLUMN     "type" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "PickupLocation" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "orderId" INTEGER NOT NULL,

    CONSTRAINT "PickupLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DropLocation" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "orderId" INTEGER NOT NULL,

    CONSTRAINT "DropLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutePlan" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "routeSteps" TEXT NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "estimatedTime" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "RoutePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignedDetails" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "vendorName" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,

    CONSTRAINT "AssignedDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceCalculation" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "totalWeight" DOUBLE PRECISION NOT NULL,
    "totalVolume" DOUBLE PRECISION NOT NULL,
    "truckPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PriceCalculation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Truck" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "maxVolume" DOUBLE PRECISION NOT NULL,
    "maxWeight" DOUBLE PRECISION NOT NULL,
    "ratePerKm" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Truck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TruckRate" (
    "id" SERIAL NOT NULL,
    "truckType" TEXT NOT NULL,
    "ratePerKm" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TruckRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssignedDetails_orderId_key" ON "AssignedDetails"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "PriceCalculation_orderId_key" ON "PriceCalculation"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Truck_type_key" ON "Truck"("type");

-- CreateIndex
CREATE UNIQUE INDEX "TruckRate_truckType_key" ON "TruckRate"("truckType");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderId_key" ON "Order"("orderId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_truckId_fkey" FOREIGN KEY ("truckId") REFERENCES "Truck"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickupLocation" ADD CONSTRAINT "PickupLocation_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DropLocation" ADD CONSTRAINT "DropLocation_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutePlan" ADD CONSTRAINT "RoutePlan_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignedDetails" ADD CONSTRAINT "AssignedDetails_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceCalculation" ADD CONSTRAINT "PriceCalculation_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
