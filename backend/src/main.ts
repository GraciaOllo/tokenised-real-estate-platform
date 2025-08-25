import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
const app = await NestFactory.create<NestExpressApplication>(AppModule);

// Serve static files from uploads directory
app.useStaticAssets(join(__dirname, '..', 'uploads'), {
  prefix: '/uploads/',
});

app.enableCors({
origin: 'http://localhost:5173',
credentials: true,
});

app.useGlobalPipes(new ValidationPipe());

await app.listen(3001);
console.log('Green Backend running on http://localhost:3001');
}
bootstrap();