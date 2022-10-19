import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import * as morgan from 'morgan';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NewrelicInterceptor } from '@interceptors/newrelic.interceptor';
import fastifyCookie from '@fastify/cookie';
import CONFIG from './config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.useGlobalInterceptors(new NewrelicInterceptor());

  initializeValidationPipe(app);

  initializeSwagger(app);

  await enableCookie(app);

  initializeMorgan(app);

  enableCors(app);

  await app.listen(CONFIG.PORT, '0.0.0.0');
}

bootstrap().then(() => {
  Logger.log(`Server is running on port ${CONFIG.PORT}`, 'Main');
});

async function enableCookie(app) {
  await app.register(fastifyCookie, {
    secret: 'my-secret', // for cookies signature
  });
}

function initializeSwagger(app) {
  if (CONFIG.DEV) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Borrow a Book')
      .setDescription('Borrow a Book API')
      .setVersion(CONFIG.VERSION)
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig, {
      deepScanRoutes: true,
    });
    SwaggerModule.setup('docs', app, document, {
      explorer: true,
    });
  }
}

function enableCors(app) {
  app.enableCors({
    origin: CONFIG.ORIGINS,
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
}

function initializeValidationPipe(app) {
  app.useGlobalPipes(
    new ValidationPipe({
      // disableErrorMessages: true,
      transform: true,
      whitelist: true, // Delete properties which is not in dto
      forbidNonWhitelisted: true,
      forbidUnknownValues: false,
      // skipMissingProperties: true,
    }),
  );
}

function initializeMorgan(app) {
  app.use(
    morgan(':remote-addr :url :method :req[origin] :status :response-time ms'),
  );
}
