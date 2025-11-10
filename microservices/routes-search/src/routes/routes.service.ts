import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Route, RouteDocument } from './route.schema';
import { CreateRouteDto } from './dto/create-route.dto';
import { SearchRouteDto } from './dto/search-route.dto';
import { SearchByPointsDto } from './dto/search-by-points.dto';

@Injectable()
export class RoutesService {
  constructor(@InjectModel(Route.name) private routeModel: Model<RouteDocument>) {}

  async create(createRouteDto: CreateRouteDto): Promise<Route> {
    const { stops, prices, isOneTime, isRecurrent, frequency } = createRouteDto;

    // Validación: número de precios debe ser stops.length + 1
    if (prices.length !== (stops?.length || 0) + 1) {
      throw new NotFoundException('El número de precios debe coincidir con el número de tramos (origen + paradas + destino)');
    }

    // Validación mutuamente exclusivos
    if (isOneTime && isRecurrent) {
      throw new BadRequestException('No se puede ser viaje único Y recurrente al mismo tiempo. Elige uno solo.');
    }
    if (!isOneTime && !isRecurrent) {
      throw new BadRequestException('Debe especificar si es viaje único (isOneTime: true) o recurrente (isRecurrent: true).');
    }

    // Si recurrente, valida frequency
    if (isRecurrent && !frequency) {
      throw new BadRequestException('Si es recurrente, especifica la frequency (e.g., "weekly", "daily")');
    }

    const createdRoute = new this.routeModel(createRouteDto);
    return createdRoute.save();
  }

  async search(searchDto: SearchRouteDto): Promise<Route[]> {
    const query: any = {};

    if (searchDto.nearLng && searchDto.nearLat) {
      query['$or'] = [
        { origin: { $near: { $geometry: { type: 'Point', coordinates: [searchDto.nearLng, searchDto.nearLat] }, $maxDistance: searchDto.maxDistance || 5000 } } },
        { destination: { $near: { $geometry: { type: 'Point', coordinates: [searchDto.nearLng, searchDto.nearLat] }, $maxDistance: searchDto.maxDistance || 5000 } } },
      ];
    }

    if (searchDto.boundingBox) {
      const [[minLng, minLat], [maxLng, maxLat]] = searchDto.boundingBox;
      query['$or'] = [
        { origin: { $geoWithin: { $box: [[minLng, minLat], [maxLng, maxLat]] } } },
        { destination: { $geoWithin: { $box: [[minLng, minLat], [maxLng, maxLat]] } } },
      ];
    }

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

    // Nuevo: búsqueda por nombre de lugar de destino
    if (searchDto.destinationPlace) {
      try {
        const geoResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchDto.destinationPlace)}&limit=1&countrycodes=mx`
        );
        const geoData = await geoResponse.json();
        if (geoData.length > 0) {
          const destCoords = [parseFloat(geoData[0].lon), parseFloat(geoData[0].lat)];
          query.destination = {
            $near: { $geometry: { type: 'Point', coordinates: destCoords }, $maxDistance: searchDto.maxDistance || 5000 },
          };
        } else {
          throw new BadRequestException('No se encontró el lugar de destino');
        }
      } catch (error) {
        throw new BadRequestException('Error al geocodificar el lugar de destino: ' + error.message);
      }
    }

    if (searchDto.afterSchedule) {
      query.schedule = { $gte: new Date(searchDto.afterSchedule) };
    }

    if (searchDto.status) {
      query.status = searchDto.status;
    }

    return this.routeModel.find(query).limit(20).exec();
  }

  async searchByPoints(searchDto: SearchByPointsDto): Promise<Route[]> {
    const { originLng, originLat, destLng, destLat, tolerance = 100, status, vehicleType } = searchDto;

    const originQuery: any = {
      origin: {
        $near: {
          $geometry: { type: 'Point', coordinates: [originLng, originLat] },
          $maxDistance: tolerance,
        },
      },
      ...(status && { status }),
      ...(vehicleType && { vehicleType }),
    };

    const nearOriginRoutes = await this.routeModel.find(originQuery).limit(50).exec();
    const originIds = new Set(nearOriginRoutes.map(r => r._id.toString()));

    const destQuery: any = {
      destination: {
        $near: {
          $geometry: { type: 'Point', coordinates: [destLng, destLat] },
          $maxDistance: tolerance,
        },
      },
      ...(status && { status }),
      ...(vehicleType && { vehicleType }),
    };

    const nearDestRoutes = await this.routeModel.find(destQuery).limit(50).exec();
    const destIds = new Set(nearDestRoutes.map(r => r._id.toString()));

    const commonIds = [...originIds].filter(id => destIds.has(id));

    if (commonIds.length === 0) {
      throw new BadRequestException('No se encontraron rutas que coincidan con origen y destino');
    }

    const routes = await this.routeModel.find({ _id: { $in: commonIds } }).limit(20).exec();

    return routes;
  }

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