import { IsString, IsNotEmpty, IsDateString, IsEnum, ValidateNested, IsMongoId } from 'class-validator';  // IsMongoId ya está en class-validator
import { Type } from 'class-transformer';

export class GeoPointDto {
  @IsNotEmpty()
  type: 'Point';

  @IsNotEmpty()
  coordinates: [number, number]; // [lng, lat]
}

export class CreateRouteDto {
  @IsMongoId({ message: 'driverId debe ser un ObjectId válido de MongoDB' })  // ¡Esto valida automáticamente!
  driverId: string;

  @ValidateNested()
  @Type(() => GeoPointDto)
  origin: GeoPointDto;

  @ValidateNested()
  @Type(() => GeoPointDto)
  destination: GeoPointDto;

  @IsDateString()
  schedule: string;

  @IsString()
  @IsNotEmpty()
  vehicleType: string;

  @IsEnum(['available', 'booked', 'completed'])
  status?: string;
}