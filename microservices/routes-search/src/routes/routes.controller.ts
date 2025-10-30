import { Controller, Post, Body, Get, Query, Param } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { SearchRouteDto } from './dto/search-route.dto';
import { Route } from './route.schema';

@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post('create')
  create(@Body() createRouteDto: CreateRouteDto): Promise<Route> {
    return this.routesService.create(createRouteDto);
  }

  @Get('search')
  search(@Query() searchDto: SearchRouteDto): Promise<Route[]> {
    return this.routesService.search(searchDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Route> {
    return this.routesService.findOne(id);
  }

  // ¡Nuevo endpoint!
  @Get('driver/:driverId')
  findByDriver(@Param('driverId') driverId: string): Promise<Route[]> {
    return this.routesService.findByDriverId(driverId);
  }
}