import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule, ObserveInstrument } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    instrument: ObserveInstrument,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // 💡 เปลี่ยนมาใช้ process.cwd() ชี้ไปยังโฟลเดอร์ uploads ที่ Root ของโปรเจกต์
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  await app.listen(process.env.BOOK_PORT ?? 3000);
  console.log(`📚 Book Service running on http://localhost:${process.env.BOOK_PORT ?? 3000}`);
}
await bootstrap();