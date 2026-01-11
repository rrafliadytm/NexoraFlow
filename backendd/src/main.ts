import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: false,
      exceptionFactory: (errors: ValidationError[]) => {
        const formattedErrors = {};

        errors.forEach((error) => {
          const field = error.property;
          formattedErrors[field] = Object.values(error.constraints || {});
        });

        return new BadRequestException({
          statusCode: 400,
          error: 'Bad Request',
          errors: formattedErrors,
        });
      },
    }),
  );

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: '*',
  });

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('NexoraFlow API')
    .setVersion('0.1')
    .build();

  app.setGlobalPrefix('api/v1');

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  app.use('/docs', apiReference({ spec: '/docs' }));

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
