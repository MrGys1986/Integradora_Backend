import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoutesModule } from './routes/routes.module'; // Lo crearemos después
//import { RoutesModule } from './routes/routes.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/routes_db'), // bd
    RoutesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}