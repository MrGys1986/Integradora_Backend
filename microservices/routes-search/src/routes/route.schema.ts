import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RouteDocument = HydratedDocument<Route>;

// Sub-esquema para GeoPoint (embebido, sin _id)
@Schema({ _id: false })  // Importante: Sin _id para sub-docs
export class GeoPoint {
  @Prop({ type: String, enum: ['Point'], required: true })  // Required aquí valida el campo interno
  type: string;

  @Prop({ type: [Number], required: true })  // Required valida las coords
  coordinates: number[];
}

export const GeoPointSchema = SchemaFactory.createForClass(GeoPoint);

// Esquema principal
@Schema({ timestamps: true })
export class Route {
  @Prop({ required: true })
  driverId: string;

  @Prop({ type: GeoPointSchema })  // ¡Sin required ni index aquí!
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

// ¡Agrega índices manualmente para geospatial (después de crear el schema)!
RouteSchema.index({ origin: '2dsphere' });
RouteSchema.index({ destination: '2dsphere' });