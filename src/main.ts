import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');

  //versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1', '2']
  });

  // global jwtAuthGuard in main.ts
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  //interceptor
  app.useGlobalInterceptors(new TransformInterceptor(reflector));

  //cors
  app.enableCors({
    origin: configService.get<string>('REACT_URL'),
    credentials: true
  });

  //===========
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  //auto-validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true
  }));

  //config cookies
  app.use(cookieParser());

  //config helmet
  app.use(helmet())

  await app.listen(port);
}
bootstrap();
