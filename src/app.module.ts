import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [AuthModule , OrderModule],
  controllers: [AppController],
  providers: [AppService],

})
export class AppModule {}
