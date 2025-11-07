import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RouteDocument = HydratedDocument<Route>;

// Sub-esquema para GeoPoint (embebido)
@Schema({ _id: false })
export class GeoPoint {
  @Prop({ type: String, enum: ['Point'], required: true })
  type: string;

  @Prop({ type: [Number], required: true })
  coordinates: number[];
}

export const GeoPointSchema = SchemaFactory.createForClass(GeoPoint);

// Esquema principal
@Schema({ timestamps: true })
export class Route {
  @Prop({ required: true })
  driverId: string;

  @Prop({ type: GeoPointSchema })
  origin: GeoPoint;

  @Prop({ type: GeoPointSchema })
  destination: GeoPoint;

  @Prop({ required: true })
  schedule: Date;

  @Prop({ enum: ['available', 'booked', 'completed'], default: 'available' })
  status: string;

  @Prop({ required: true })
  vehicleType: string;
}

export const RouteSchema = SchemaFactory.createForClass(Route);

// Índices 2dsphere para búsquedas geo
RouteSchema.index({ origin: '2dsphere' });
RouteSchema.index({ destination: '2dsphere' });