import { IsNotEmpty, IsString, IsInt, IsOptional, isString , ValidateNested ,IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class PickupDetailDto {
  @IsNotEmpty()
  length: number;

  @IsNotEmpty()
  width: number;

  @IsNotEmpty()
  height: number;

  @IsNotEmpty()
  weightVolume: number;

  @IsNotEmpty()
  weightActual: number;
}

class PickupLocationDto {
  @IsString()
  address: string;

  @IsNotEmpty()
  volume: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PickupDetailDto)
  pickupDetails: PickupDetailDto[];
  weight: any;
}

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

  @ApiProperty({ example: 3, description: 'ID truk yang terkait dengan pesanan' })
  @IsInt()
  @IsOptional() 
  truckId?: number;

  @ApiProperty({ example: 'ORDER123456', description: 'ID pesanan unik' })
  @IsString()
  @IsOptional() 
  orderId?: string;

  @ApiProperty({ example: 'true'})
  @IsString()
  @IsOptional()
  multiPickup?: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  multiDrop?: boolean;

  @ApiProperty({ example: 100.5 })
  @IsOptional()
  totalWeight?: number; // Tambahkan properti ini

  @ApiProperty({ example: 100.5 })
  @IsOptional()
  totalVolume?: number; // Tambahkan properti ini

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PickupLocationDto)
  pickupLocations: PickupLocationDto[];
  
}
