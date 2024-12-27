import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create Companies
  await prisma.company.createMany({
    data: Array.from({ length: 5 }).map((_, i) => ({
      name: `Company ${i + 1}`,
      code: `COMP${Date.now()}${i}`, // Pastikan nilai code unik
      location: `Location ${i + 1}`,
    })),
  });

  // Create Users
  await prisma.user.createMany({
    data: Array.from({ length: 5 }).map((_, i) => ({
      email: `user${i + 1}@example.com`,
      password: `password${i + 1}`,
      role: 'user',
      companyId: i + 1,
    })),
  });

  // Create Trucks
  await prisma.truck.createMany({
    data: Array.from({ length: 5 }).map((_, i) => ({
      type: `Truck Type ${i + 1}`,
      maxVolume: 100 + i * 10,
      maxWeight: 1000 + i * 100,
      ratePerKm: 5 + i,
    })),
  });

  // Create Customers
  await prisma.customer.createMany({
    data: Array.from({ length: 5 }).map((_, i) => ({
      accountId: `ACC${Date.now()}${i}`, // Pastikan nilai accountId unik
      customerName: `Customer ${i + 1}`,
      contactName: `Contact ${i + 1}`,
      phoneNumber: `123456789${i}`,
      zipCode: `ZIP${i + 1}`,
      province: `Province ${i + 1}`,
      city: `City ${i + 1}`,
      district: `District ${i + 1}`,
      subDistrict: `SubDistrict ${i + 1}`,
      building: `Building ${i + 1}`,
      street: `Street ${i + 1}`,
    })),
  });

  // Create Orders
  for (let i = 0; i < 25; i++) {
    const uniqueOrderId = `ORDER${Date.now()}${i}`;
    const order = await prisma.order.create({
      data: {
        orderId: uniqueOrderId,
        customerName: `Customer ${i + 1}`,
        pickupDate: new Date(),
        dispatchImmediately: false,
        requireProofOfDelivery: false,
        multiplePickups: false,
        type: 'pickup',
        user: { connect: { id: (i % 5) + 1 } },
        company: { connect: { id: (i % 5) + 1 } },
        customer: { connect: { id: (i % 5) + 1 } },
        description: `Order description ${i + 1}`,
        status: 'pending',
        truck: { connect: { id: (i % 5) + 1 } },
        pickupLocations: {
          create: [
            {
              address: `Address ${i + 1}`,
              volume: 10 + i,
              weight: 100 + i * 10,
              //            orderId: uniqueOrderId, // Pastikan orderId sesuai
              pickupDetails: {
                create: [
                  {
                    length: 2 + i,
                    width: 2 + i,
                    height: 2 + i,
                    weightVolume: 8 + i,
                    weightActual: 10 + i,
                  },
                ],
              },
            },
          ],
        },
      },
    });

    // Create Price Calculations
    await prisma.priceCalculation.create({
      data: {
        orderId: order.id,
        distance: 20 + i,
        totalWeight: 200 + i * 10,
        totalVolume: 10 + i,
        truckPrice: 50 + i * 5,
        totalPrice: 200 + i * 20,
      },
    });

    // Create Assigned Details
    await prisma.assignedDetails.create({
      data: {
        orderId: order.id,
        vendorName: `Vendor ${order.orderId}`,
        vendorId: `VENDOR${order.orderId}`,
        driverId: `DRIVER${order.orderId}`,
        driverName: `Driver for ${order.orderId}`,
      },
    });
  }

  console.log('Seeding completed!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
