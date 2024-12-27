-- CreateTable
CREATE TABLE "PickupDetail" (
    "id" SERIAL NOT NULL,
    "pickupLocationId" INTEGER NOT NULL,
    "length" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "weightVolume" DOUBLE PRECISION NOT NULL,
    "weightActual" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PickupDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "accountId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "subDistrict" TEXT NOT NULL,
    "building" TEXT NOT NULL,
    "street" TEXT NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_accountId_key" ON "Customer"("accountId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickupDetail" ADD CONSTRAINT "PickupDetail_pickupLocationId_fkey" FOREIGN KEY ("pickupLocationId") REFERENCES "PickupLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
