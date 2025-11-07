import { IsOptional, IsNumber, IsPositive } from 'class-validator';

export class SearchByPointsDto {
  // Origen aproximado
  @IsNumber()
  originLng: number;  // Obligatorio

  @IsNumber()
  originLat: number;  // Obligatorio

  // Destino aproximado
  @IsNumber()
  destLng: number;  // Obligatorio

  @IsNumber()
  destLat: number;  // Obligatorio

  // Tolerancia en metros (default 100m para "exacto")
  @IsOptional()
  @IsPositive()
  tolerance: number = 100;

  // Filtros opcionales
  @IsOptional()
  status?: string;

  @IsOptional()
  vehicleType?: string;
}