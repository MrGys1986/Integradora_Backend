import { IsOptional, IsNumber, IsDateString, IsArray, IsString } from 'class-validator';  

export class SearchRouteDto {
  // Para búsqueda por proximidad a un punto (origen o destino)
  @IsOptional()
  @IsNumber()
  nearLng?: number;

  @IsOptional()
  @IsNumber()
  nearLat?: number;

  @IsOptional()
  @IsNumber()
  maxDistance?: number; // En metros, default 5000m (5km)

  // Para área (polígono aproximado, e.g., bounding box como array de [lng,lat])
  @IsOptional()
  @IsArray()
  boundingBox?: [[number, number], [number, number]]; // [[minLng, minLat], [maxLng, maxLat]]

  // Filtro por origen/destino aproximado
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

  // Filtro por horario (e.g., después de una fecha)
  @IsOptional()
  @IsDateString()
  afterSchedule?: string;

  @IsOptional()
  @IsString()
  status?: string;
}