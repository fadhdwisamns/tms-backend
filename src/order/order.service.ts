import { BadRequestException, Injectable } from '@nestjs/common'; 
import { PrismaService } from '../shared/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    const { userId, companyId, customerId, description, status, truckId , orderId } = createOrderDto;

  
    // Validasi status order
    if (!['pickup', 'delivery'].includes(status)) {
      throw new BadRequestException('Invalid status: must be either "pickup" or "delivery"');
    }
    const uniqueOrderId = orderId || `ORDER${Date.now()}`;
    // Ambil informasi truk berdasarkan truckId
    let truck = await this.prisma.truck.findUnique({
      where: { id: truckId },
    });

    if (!truck) {
      throw new BadRequestException('Truck not found');
    }

      // Ambil informasi rute untuk perhitungan jarak
      const routePlan = await this.prisma.routePlan.findFirst({
        where: { orderId: uniqueOrderId },
      });

    if (!routePlan) {
      throw new BadRequestException('Route Plan not found');
    }

    // Hitung total jarak dari RoutePlan
    const totalDistance = routePlan.distance;

    // Ambil informasi pickup locations untuk perhitungan berat dan volume
    const pickupLocations = await this.prisma.pickupLocation.findMany({
      where: { orderId: uniqueOrderId },
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

    
    const pickupLocation = await this.prisma.pickupLocation.findMany({
      where: { orderId: uniqueOrderId },
    })
    return this.prisma.order.create({
      data: {
        orderId: `ORDER${Date.now()}`, // Menambahkan orderId yang unik
        customerName: `Customer ${customerId}`, // Menambahkan customerName
        pickupDate: new Date(), // Menambahkan pickupDate (misalnya waktu sekarang)
        type: status === 'delivery' ? 'delivery' : 'pickup', // Menambahkan type berdasarkan status
        user: { connect: { id: userId } },
        company: { connect: { id: companyId } },
        customerId,
        description,
        status,
        truck: { connect: { id: truck.id } }, // Menghubungkan order dengan truck yang dipilih
        priceCalculation: { connect: { id: priceCalculation.id } },  // Menghubungkan perhitungan harga dengan order
      },
    });
  }
  
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
      },
    });
  }

  update(orderId: string, updateOrderDto: UpdateOrderDto) {
    return this.prisma.order.update({
      where: { orderId },
      data: updateOrderDto,
    });
  }

  remove(orderId: string) {
    return this.prisma.order.delete({
      where: { orderId },
    });
  }
}
