import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureSwagger } from './shared/swagger.config';
import { UnauthorizedFilter } from './auth/unauthorized.filter';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure Swagger
  configureSwagger(app);
  app.useGlobalFilters(new UnauthorizedFilter());
  await app.listen(3000);
}
bootstrap();

