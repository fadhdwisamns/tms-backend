
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export const configureSwagger = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('TMS API')
    .setDescription('API documentation for Trucking Management System')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('orders')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
};

