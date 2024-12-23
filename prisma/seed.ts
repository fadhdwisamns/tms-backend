import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create 5 companies
  const companies = await Promise.all(
    Array.from({ length: 5 }).map((_, index) =>
      prisma.company.create({
        data: {
          name: `Company ${index + 1}`,
          code: `JKT${Math.floor(Math.random() * 1000000)}`,
          location: `Location ${index + 1}`,
        },
      })
    )
  );

  // Create 20 users
  const users = await Promise.all(
    Array.from({ length: 20 }).map((_, index) =>
      prisma.user.create({
        data: {
          email: `user${index + 1}@example.com`,
          password: `password${index + 1}`,
          role: index % 3 === 0 ? 'admin' : index % 2 === 0 ? 'driver' : 'user',
          companyId: companies[index % 5].id, // Assign to a random company
        },
      })
    )
  );

  // Create 20 trucks
  const trucks = await Promise.all(
    Array.from({ length: 20 }).map((_, index) =>
      prisma.truck.create({
        data: {
          type: `Truck Type ${index + 1}`,
          maxVolume: Math.random() * 100,
          maxWeight: Math.random() * 1000,
          ratePerKm: Math.random() * 10,
        },
      })
    )
  );

  // Create 20 orders
  const orders = await Promise.all(
    Array.from({ length: 20 }).map((_, index) =>
      prisma.order.create({
        data: {
          orderId: `ORDER${index + 1}`,
          customerName: `Customer ${index + 1}`,
          pickupDate: new Date(),
          type: index % 2 === 0 ? 'pickup' : 'delivery',
          description: `Order description ${index + 1}`,
          status: 'Pending',
          companyId: companies[index % 5].id,
          userId: users[index % 20].id, // Assign to a random user
          truckId: trucks[index % 20].id, // Assign to a random truck
          customerId: index + 1,
        },
      })
    )
  );

  // Create 20 pickup locations
  await Promise.all(
    Array.from({ length: 20 }).map((_, index) =>
      prisma.pickupLocation.create({
        data: {
          address: `Pickup Address ${index + 1}`,
          volume: Math.random() * 10,
          weight: Math.random() * 100,
          orderId: orders[index % 20].id,
        },
      })
    )
  );

  // Create 20 drop locations
  await Promise.all(
    Array.from({ length: 20 }).map((_, index) =>
      prisma.dropLocation.create({
        data: {
          address: `Drop Address ${index + 1}`,
          volume: Math.random() * 10,
          weight: Math.random() * 100,
          orderId: orders[index % 20].id,
        },
      })
    )
  );

  // Create 20 route plans
  await Promise.all(
    Array.from({ length: 20 }).map((_, index) =>
      prisma.routePlan.create({
        data: {
          orderId: orders[index % 20].id,
          routeSteps: JSON.stringify(['Step 1', 'Step 2']),
          distance: Math.random() * 100,
          estimatedTime: Math.random() * 60,
        },
      })
    )
  );

  // Create 20 assigned details
  await Promise.all(
    Array.from({ length: 20 }).map((_, index) =>
      prisma.assignedDetails.create({
        data: {
          orderId: orders[index % 20].id,
          vendorName: `Vendor ${index + 1}`,
          vendorId: `VENDOR${index + 1}`,
          driverId: `DRIVER${index + 1}`,
          driverName: `Driver ${index + 1}`,
        },
      })
    )
  );

  // Create 20 price calculations
  await Promise.all(
    Array.from({ length: 20 }).map((_, index) =>
      prisma.priceCalculation.create({
        data: {
          orderId: orders[index % 20].id,
          distance: Math.random() * 100,
          totalWeight: Math.random() * 1000,
          totalVolume: Math.random() * 100,
          truckPrice: Math.random() * 100,
          totalPrice: Math.random() * 1000,
        },
      })
    )
  );

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
