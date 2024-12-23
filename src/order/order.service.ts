import { BadRequestException, Injectable } from '@nestjs/common'; 
import { PrismaService } from '../shared/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    const { userId, companyId, customerId, description, status } = createOrderDto;

  
    if (!['pickup', 'delevery'].includes(status)){
      throw new BadRequestException('invalid status: must be either "pickup" or "delivery"');
    }

    const isPickup = status === 'pickup';
    const isDelivery = status === 'delivery';

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
      },
    });
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
      },
    });
  }

  findOne(id: number) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        company: true,
      },
    });
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return this.prisma.order.update({
      where: { id },
      data: updateOrderDto,
    });
  }

  remove(id: number) {
    return this.prisma.order.delete({
      where: { id },
    });
  }
}
