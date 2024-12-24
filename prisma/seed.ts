import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create Companies
  const companies = await prisma.company.createMany({
    data: Array.from({ length: 5 }, (_, index) => ({
      name: `Company ${index + 1}`,
      code: `CODE${index + 1}`,
      location: `Location ${index + 1}`,
    })),
  });

  // Create Users
  await prisma.user.createMany({
    data: Array.from({ length: 5 }, (_, index) => ({
      email: `user${index + 1}@example.com`,
      password: `password${index + 1}`,
      role: index === 0 ? 'admin' : 'user',
      companyId: index + 1, // assuming the companyIds are sequential
    })),
  });

  // Create Trucks
  const trucks = await prisma.truck.createMany({
    data: [
      { type: 'Box Truck', maxVolume: 50, maxWeight: 1000, ratePerKm: 5 },
      { type: 'Pickup Truck', maxVolume: 20, maxWeight: 500, ratePerKm: 4 },
    ],
  });

  // Create Truck Rates
  await prisma.truckRate.createMany({
    data: [
      { truckType: 'Box Truck', ratePerKm: 5 },
      { truckType: 'Pickup Truck', ratePerKm: 4 },
    ],
  });

  // Create Orders
  for (let index = 0; index < 20; index++) {
    const order = await prisma.order.create({
      data: {
        orderId: `ORD${index + 1}`,
        customerName: `Customer ${index + 1}`,
        pickupDate: new Date(),
        type: index % 2 === 0 ? 'pickup' : 'delivery',
        userId: (index % 5) + 1, // Assuming user IDs are 1 to 5
        companyId: (index % 5) + 1, // Assuming company IDs are 1 to 5
        customerId: index + 1,
        description: `Order description for order ${index + 1}`,
        status: 'pending',
      },
    });

    // Create Pickup and Drop Locations
    await prisma.pickupLocation.createMany({
      data: [
        {
          address: `Pickup Address 1 for order ${order.orderId}`,
          volume: 10,
          weight: 100,
          orderId: order.id,
        },
        {
          address: `Pickup Address 2 for order ${order.orderId}`,
          volume: 10,
          weight: 100,
          orderId: order.id,
        },
      ],
    });

    await prisma.dropLocation.createMany({
      data: [
        {
          address: `Drop Address 1 for order ${order.orderId}`,
          volume: 10,
          weight: 100,
          orderId: order.id,
        },
        {
          address: `Drop Address 2 for order ${order.orderId}`,
          volume: 10,
          weight: 100,
          orderId: order.id,
        },
      ],
    });

    // Create Route Plan
    await prisma.routePlan.create({
      data: {
        orderId: order.id,
        routeSteps: JSON.stringify([
          { step: 'Start', location: 'Pickup Location 1' },
          { step: 'End', location: 'Drop Location 1' },
        ]),
        distance: 20,
        estimatedTime: 30,
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

    // Create Price Calculations
    await prisma.priceCalculation.create({
      data: {
        orderId: order.id,
        distance: 20,
        totalWeight: 200,
        totalVolume: 10,
        truckPrice: 50,
        totalPrice: 200,
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
