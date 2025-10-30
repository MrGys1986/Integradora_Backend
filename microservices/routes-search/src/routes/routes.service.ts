import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Route, RouteDocument } from './route.schema';
import { CreateRouteDto } from './dto/create-route.dto';
import { SearchRouteDto } from './dto/search-route.dto';

@Injectable()
export class RoutesService {
  constructor(@InjectModel(Route.name) private routeModel: Model<RouteDocument>) {}

  async create(createRouteDto: CreateRouteDto): Promise<Route> {
    const createdRoute = new this.routeModel(createRouteDto);
    return createdRoute.save();
  }

  async search(searchDto: SearchRouteDto): Promise<Route[]> {
    const query: any = {};

    // Lógica de proximidad: $near para rutas cerca de un punto (e.g., origen del cliente)
    if (searchDto.nearLng && searchDto.nearLat) {
      query['$or'] = [
        { origin: { $near: { $geometry: { type: 'Point', coordinates: [searchDto.nearLng, searchDto.nearLat] }, $maxDistance: searchDto.maxDistance || 5000 } } },
        { destination: { $near: { $geometry: { type: 'Point', coordinates: [searchDto.nearLng, searchDto.nearLat] }, $maxDistance: searchDto.maxDistance || 5000 } } },
      ];
    }

    // Búsqueda por área (bounding box aproximado con $geoWithin)
    if (searchDto.boundingBox) {
      const [[minLng, minLat], [maxLng, maxLat]] = searchDto.boundingBox;
      query['$or'] = [
        { origin: { $geoWithin: { $box: [[minLng, minLat], [maxLng, maxLat]] } } },
        { destination: { $geoWithin: { $box: [[minLng, minLat], [maxLng, maxLat]] } } },
      ];
    }

    // Filtros por origen/destino específicos (usa $near con distancia pequeña, e.g., 100m)
    if (searchDto.originLng && searchDto.originLat) {
      query.origin = {
        $near: { $geometry: { type: 'Point', coordinates: [searchDto.originLng, searchDto.originLat] }, $maxDistance: 100 },
      };
    }
    if (searchDto.destLng && searchDto.destLat) {
      query.destination = {
        $near: { $geometry: { type: 'Point', coordinates: [searchDto.destLng, searchDto.destLat] }, $maxDistance: 100 },
      };
    }

    // Filtro por horario
    if (searchDto.afterSchedule) {
      query.schedule = { $gte: new Date(searchDto.afterSchedule) };
    }

    if (searchDto.status) {
      query.status = searchDto.status;
    }

    return this.routeModel.find(query).limit(20).exec(); // Limita resultados
  }

  // Opcional: findById para detalles
  async findOne(id: string): Promise<Route> {
    const route = await this.routeModel.findById(id).exec();
    if (!route) throw new NotFoundException(`Route ${id} not found`);
    return route;
  }

  async findByDriverId(driverId: string): Promise<Route[]> {
  const routes = await this.routeModel.find({ driverId }).exec();
  if (routes.length === 0) {
    throw new NotFoundException(`No se encontraron rutas para el conductor ${driverId}`);
  }
  return routes;
}
}