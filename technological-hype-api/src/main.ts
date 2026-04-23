import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const LOCALHOST_ORIGINS = /^http:\/\/localhost:\d+$/;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: LOCALHOST_ORIGINS,
    methods: ['GET'],
    allowedHeaders: ['Content-Type'],
  });

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Technological Hype API')
    .setDescription(
      'Cartelera de Hype Tecnológico: expone los videos transformados con Nivel de Hype y destaca la Joya de la Corona.',
    )
    .setVersion('1.0.0')
    .addTag('videos', 'Endpoints de la cartelera de videos')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'api/docs-json',
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
