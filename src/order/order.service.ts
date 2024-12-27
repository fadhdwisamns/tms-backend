import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    const { userId, companyId, customerId, description, status, truckId, orderId, multiPickup, multiDrop } = createOrderDto;

    // Validasi status order
    if (!['pickup', 'delivery'].includes(status)) {
      throw new BadRequestException('Invalid status: must be either "pickup" or "delivery"');
    }
    const uniqueOrderId = orderId || `ORDER${Date.now()}`;

    // Ambil informasi truk berdasarkan truckId
    let truck = await this.prisma.truck.findUnique({ where: { id: truckId } });
    if (!truck) {
      throw new BadRequestException('Truck not found');
    }

    if ( multiPickup && !multiDrop) {
      throw new BadRequestException('Multi-drop must be enabled for multi-pickup orders');
    }
      // Ambil informasi rute untuk perhitungan jarak
      const routePlan = await this.prisma.routePlan.findFirst({
        where: { orderId },
      });

    if (!routePlan) {
      throw new BadRequestException('Route Plan not found');
    }

    // Hitung total jarak dari RoutePlan
    const totalDistance = routePlan.distance;

    // Ambil informasi pickup locations untuk perhitungan berat dan volume
    const pickupLocations = await this.prisma.pickupLocation.findMany({
      where: { orderId: uniqueOrderId },
      include: { pickupDetails: true }, // Include pickupDetails in the query
    });

    const totalWeight = pickupLocations.reduce((acc, location) => acc + location.weight, 0);
    const totalVolume = pickupLocations.reduce((acc, location) => acc + location.volume, 0);

    // Validasi apakah truk yang dipilih sesuai dengan berat dan volume
    if (truck.maxWeight < totalWeight || truck.maxVolume < totalVolume) {
      // Jika truk tidak dapat menangani order, cari truk lain dengan tipe yang sama
      truck = await this.prisma.truck.findFirst({
        where: {
          type: truck.type, // Cari truk dengan tipe yang sama
          AND: [
            { maxWeight: { gte: totalWeight } },  // Pastikan berat bisa ditangani
            { maxVolume: { gte: totalVolume } },  // Pastikan volume bisa ditangani
          ],
        },
        orderBy: { maxWeight: 'asc' },  // Pilih truk dengan kapasitas lebih besar
      });

      // Jika tidak ada truk yang bisa menangani order, throw error
      if (!truck) {
        throw new BadRequestException('No suitable truck found for the order');
      }
    }

    // Ambil tarif truk berdasarkan tipe truk
    const truckRate = await this.prisma.truckRate.findUnique({
      where: { truckType: truck.type },
    });

    if (!truckRate) {
      throw new BadRequestException('Truck rate not found');
    }

    // Hitung harga berdasarkan tarif truk dan jarak
    const truckPrice = truckRate.ratePerKm * totalDistance;

    // Hitung total harga
    const totalPrice = truckPrice + this.calculateAdditionalCharges(totalWeight, totalVolume);
    // Ambil informasi rute untuk perhitungan jarak

    // Membuat entry PriceCalculation
    const priceCalculation = await this.prisma.priceCalculation.create({
      data: {
        orderId: uniqueOrderId,
        distance: totalDistance,
        totalWeight,
        totalVolume,
        truckPrice,
        totalPrice,
      },
    });

    
    // const pickupLocation = await this.prisma.pickupLocation.findMany({
    //   where: { orderId: uniqueOrderId },
    // })
    return this.prisma.order.create({
      data: {
        orderId: uniqueOrderId, // Menambahkan orderId yang unik
        customerName: `Customer ${customerId}`, // Menambahkan customerName
        pickupDate: new Date(), // Menambahkan pickupDate (misalnya waktu sekarang)
        type: status === 'delivery' ? 'delivery' : 'pickup', // Menambahkan type berdasarkan status
        user: { connect: { id: userId } },
        company: { connect: { id: companyId } },
        customer: { connect: { id: customerId } },
        description,
        status,
        truck: { connect: { id: truck.id } }, // Menghubungkan order dengan truck yang dipilih
        priceCalculation: { connect: { id: priceCalculation.id } },  // Menghubungkan perhitungan harga dengan order
        pickupLocations: {
          create: pickupLocations.map((loc) => ({
            address: loc.address,
            volume: loc.volume,
            weight: loc.weight,
            pickupDetails: {
              create: loc.pickupDetails?.map((detail) => ({
                length: detail.length,
                width: detail.width,
                height: detail.height,
                weightVolume: detail.weightVolume,
                weightActual: detail.weightActual,
              })) || [],
            },
          })),
        },
      },
    });
  }
  //   const order = await this.prisma.order.create({
  //     data: {
  //       orderId: uniqueOrderId,
  //       userId,
  //       companyId,
  //       customerId,
  //       description,
  //       status,
  //       truckId: truck.id,
  //       totalWeight,
  //       // totalVolume,
  //       // totalDistance,
  //       // totalPrice,
  //       multiPickup,
  //       multiDrop,
  //       pickupLocations: {
  //         create: pickupLocations.map((loc) => ({
  //           address: loc.address,
  //           weight: loc.weight,
  //           volume: loc.volume,
  //         })),
  //       },
  //     },
  //   });

  //   return order;
  // }
  // Fungsi untuk menghitung biaya tambahan berdasarkan berat dan volume
  calculateAdditionalCharges(weight: number, volume: number): number {
    let additionalCharge = 0;

    // Hitung biaya tambahan berdasarkan berat dan volume
    if (weight > 1000) {  // Misalnya biaya tambahan jika berat lebih dari 1000 kg
      additionalCharge += 100;
    }
    if (volume > 50) {  // Misalnya biaya tambahan jika volume lebih dari 50 m³
      additionalCharge += 50;
    }

    return additionalCharge;
  }

  findAll(filter?: { status?: string; type?: string }) {
    const { status, type } = filter || {};
    return this.prisma.order.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(type ? { type } : {}),
      },
      include: {
        user: true,
        company: true,
        truck: true,
        priceCalculation: true,
        pickupLocations: true,
      },
    });
  }

  findOne(orderId: string) {
    return this.prisma.order.findUnique({
      where: { orderId },
      include: {
        user: true,
        company: true,
        truck: true,
        priceCalculation: true,
        pickupLocations: true,
      },
    });
  }

  async getPickupDetails(orderId: string) {
    const pickupLocations = await this.prisma.pickupLocation.findMany({
      where: { orderId },
      include: { pickupDetails: true },
    });
    if (!pickupLocations || pickupLocations.length === 0) {
      throw new BadRequestException('No pickup locations found for the given order ID');
    }
    return pickupLocations.flatMap(location => location.pickupDetails);
  }
  async getPickupLocations(orderId: string) {
    const pickupLocations = await this.prisma.pickupLocation.findMany({
      where: { orderId },
      include: { pickupDetails: true },
    });
    return pickupLocations.length === 0 ? [] : pickupLocations;
  }

  update(orderId: string, updateOrderDto: UpdateOrderDto) {
    const { userId, companyId, customerId, truckId, status, description, pickupLocations } = updateOrderDto;

    return this.prisma.order.update({
      where: { orderId },
      data: {
        user: userId ? { connect: { id: userId } } : undefined,
        company: companyId ? { connect: { id: companyId } } : undefined,
        customer: customerId ? { connect: { id: customerId } } : undefined,
        truck: truckId ? { connect: { id: truckId } } : undefined,
        description,
        status,
        pickupLocations: pickupLocations ? {
          create: pickupLocations.map((loc) => ({
            address: loc.address,
            volume: loc.volume,
            weight: loc.weight,
            pickupDetails: {
              create: loc.pickupDetails.map((detail) => ({
                length: detail.length,
                width: detail.width,
                height: detail.height,
                weightVolume: detail.weightVolume,
                weightActual: detail.weightActual,
              })),
            },
          })),
        } : undefined,
      },
    });
  }

  remove(orderId: string) {
    return this.prisma.order.delete({
      where: { orderId },
    });
  }
}
