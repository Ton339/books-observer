import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BooksController } from './books.controller.js';
import { BooksService } from './books.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [HttpModule, PrismaModule],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule { }