import { IsOptional, IsNumber, IsDateString, IsArray, IsString } from 'class-validator';

export class SearchRouteDto {
  @IsOptional()
  @IsNumber()
  nearLng?: number;

  @IsOptional()
  @IsNumber()
  nearLat?: number;

  @IsOptional()
  @IsNumber()
  maxDistance?: number;

  @IsOptional()
  @IsArray()
  boundingBox?: [[number, number], [number, number]];

  @IsOptional()
  @IsNumber()
  originLng?: number;

  @IsOptional()
  @IsNumber()
  originLat?: number;

  @IsOptional()
  @IsNumber()
  destLng?: number;

  @IsOptional()
  @IsNumber()
  destLat?: number;

  @IsOptional()
  @IsDateString()
  afterSchedule?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  destinationPlace?: string;  // Nuevo: nombre de lugar para geocodificar y buscar destino cercano
}