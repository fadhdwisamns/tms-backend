import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../shared/prisma.service';

@Module({
  imports: [JwtModule.register({
    secret: process.env.JWT_SECRET || 'secret',
    signOptions: { expiresIn: '1d' },
  })],
  controllers: [AuthController],
  providers: [AuthService, PrismaService],
})
export class AuthModule {}