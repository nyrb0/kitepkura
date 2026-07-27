import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import type { Response } from 'express';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.setGlobalPrefix('api');
    app.useStaticAssets(join(process.cwd(), 'uploads'), {
        prefix: '/uploads/',
        setHeaders: (res: Response) => {
            res.setHeader('Access-Control-Allow-Origin', '*'); // <--- Раздаем файл с разрешениями для всех фронтендов
            res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        },
    });
    app.enableCors({
        origin: ['http://localhost:3000', 'http://localhost:5173'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.listen(process.env.PORT ?? 2000, '0.0.0.0');
}
bootstrap();
