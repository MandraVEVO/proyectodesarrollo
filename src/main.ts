import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('bootstrap');

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,  // Activa la transformación automática
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Habilitar CORS para todas las rutas
  app.enableCors({
    origin: true, // o especifica orígenes permitidos: ['http://localhost:3000', 'https://myapp.com']
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // Si necesitas enviar cookies o cabeceras de autenticación
  });
  
  await app.listen(process.env.PORT ?? 3000);
  logger.log(`Application is running on: ${process.env.PORT}`);
}
bootstrap();
