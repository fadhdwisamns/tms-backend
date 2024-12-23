import { IsNotEmpty, IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ example: 1, description: 'ID pengguna yang membuat pesanan' })
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ example: 2, description: 'ID pelanggan yang terkait dengan pesanan' })
  @IsInt()
  @IsNotEmpty()
  customerId: number;

  @ApiProperty({ example: 1, description: 'ID perusahaan terkait pesanan' })
  @IsInt()
  @IsNotEmpty()
  companyId: number;

  @ApiProperty({ example: 'Pengiriman elektronik', description: 'Deskripsi pesanan' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'pickup', description: 'Status pesanan, bisa "pickup" atau "delivery"' })
  @IsString()
  @IsNotEmpty()
  status: string;
}
