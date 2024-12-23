import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PrismaService } from '../shared/prisma.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [OrderController],
  providers: [OrderService, PrismaService],
  imports: [AuthModule]
})
export class OrderModule {}
