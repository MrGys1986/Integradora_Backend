import { IsMongoId, IsString, IsNotEmpty, IsDateString, IsEnum, ValidateNested, IsArray, ArrayMinSize, ArrayMaxSize, IsNumber, IsPositive, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class GeoPointDto {
  @IsNotEmpty()
  type: 'Point';

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  coordinates: [number, number];  // [lng, lat]
}

export class CreateRouteDto {
  @IsMongoId({ message: 'driverId debe ser un ObjectId válido de MongoDB' })
  driverId: string;

  @ValidateNested()
  @Type(() => GeoPointDto)
  origin: GeoPointDto;

  @ValidateNested({ each: true })
  @Type(() => GeoPointDto)
  @IsOptional()
  @IsArray()
  stops?: GeoPointDto[];  // Paradas intermedias (B, C, etc.)

  @ValidateNested()
  @Type(() => GeoPointDto)
  destination: GeoPointDto;

  @IsDateString()
  schedule: string;  // Fecha y hora de salida

  @IsBoolean()
  isOneTime: boolean = true;  // True para viaje único (default)

  @IsBoolean()
  isRecurrent: boolean = false;  // True para recurrente

  @IsOptional()
  @IsString()
  frequency?: string;  // e.g., 'weekly', 'daily' (requerido si isRecurrent=true)

  @IsArray()
  @IsNumber({}, { each: true })
  @IsPositive({ each: true })
  prices: number[];  // Precios por tramo: [A-B, A-C, ..., A-D]

  @IsString()
  @IsNotEmpty()
  vehicleType: string;

  @IsEnum(['available', 'booked', 'completed'])
  status?: string = 'available';
}