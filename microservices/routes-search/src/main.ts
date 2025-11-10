import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Fix CORS: permite origin del frontend, métodos y credentials
  app.enableCors({
    origin: 'http://192.168.0.64:3000',  // Tu IP de frontend; cambia si es dinámica
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,  // Por si usas cookies/auth
  });

  await app.listen(3000);
}
bootstrap();