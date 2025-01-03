import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth-guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('orders') // Menandai endpoint untuk dokumentasi Swagger
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  findAll(@Query('status') status?: string, @Query('type') type?: string) {
    return this.orderService.findAll({ status, type });
  }


  @Get(':orderId')
  findOne(@Param('orderId') orderId: string) {
    return this.orderService.findOne(orderId);
  }

  @Patch(':orderId')
  update(@Param('orderId') orderId: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(orderId, updateOrderDto);
  }

  @Delete(':orderId')
  remove(@Param('orderId') orderId: string) {
    return this.orderService.remove(orderId);
  }

  @Get(':orderId/pickup-details')
  @ApiOperation({ summary: 'Get pickup details by order ID' })
  @ApiResponse({ status: 200, description: 'Pickup details retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async getPickupDetails(@Param('orderId') orderId: string) {
    return this.orderService.getPickupDetails(orderId);
  }

  @Get(':orderId/pickup-location')
  @ApiOperation({ summary: 'Get pickup location by order ID' })
  @ApiResponse({ status: 200, description: 'Pickup location retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async getPickupLocation(@Param('orderId') orderId: string) {
    return this.orderService.getPickupLocations(orderId);
  }
}