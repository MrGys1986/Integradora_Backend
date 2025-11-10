import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RouteDocument = HydratedDocument<Route>;

// Sub-esquema para GeoPoint
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

  @Prop({ type: GeoPointSchema, required: true })
  origin: GeoPoint;

  @Prop({ type: [GeoPointSchema], default: [] })
  stops: GeoPoint[];

  @Prop({ type: GeoPointSchema, required: true })
  destination: GeoPoint;

  @Prop({ required: true })
  schedule: Date;

  @Prop({ default: true })
  isOneTime: boolean;

  @Prop({ default: false })
  isRecurrent: boolean;

  @Prop({ default: '' })
  frequency: string;  // 'weekly', 'daily', etc.

  @Prop({ type: [Number], required: true, default: [] })
  prices: number[];

  @Prop({ enum: ['available', 'booked', 'completed'], default: 'available' })
  status: string;

  @Prop({ required: true })
  vehicleType: string;
}

export const RouteSchema = SchemaFactory.createForClass(Route);

// Índices 2dsphere (solo para origin y destination; stops sin índice para evitar error)
RouteSchema.index({ origin: '2dsphere' });
RouteSchema.index({ destination: '2dsphere' });
// NO agregues índice en stops aquí – causa el error en inserts con array