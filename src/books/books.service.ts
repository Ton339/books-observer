import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateBookDto } from './dto/create-book.dto.js';
import { CreateReviewRequestDto, ReviewResponse } from './dto/create-review-request.dto.js';
import { UpdateBookDto } from './dto/update-book.dto.js';
import { diskStorage, Options } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface.js';


const REVIEW_PORT = process.env.REVIEW_PORT || 3001;

@Injectable()
export class BooksService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) { }

  // 💡 2. ระบุ Type คืนค่าเป็น MulterOptions
  static getMulterOptions(): MulterOptions {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    return {
      storage: diskStorage({
        destination: uploadDir,
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `cover-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          // 💡 3. ส่ง 2 Arguments ได้สมบูรณ์ตาม Type Specification ของ NestJS
          return callback(
            new BadRequestException('รองรับเฉพาะไฟล์รูปภาพ (.jpg, .jpeg, .png, .webp) เท่านั้น'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    };
  }

  async createBook(dto: CreateBookDto, coverUrl: string | null) {
    const book = await this.prisma.book.create({
      data: {
        title: dto.title,
        author: dto.author,
        coverUrl,
      },
    });

    let reviewData: ReviewResponse | null = null;

    if (dto.initialReview) {
      const reviewPayload: CreateReviewRequestDto = {
        bookId: book.id,
        comment: dto.initialReview,
        userId: 1,
        rating: dto.initialRating ?? 5,
      };

      const response: AxiosResponse<ReviewResponse> = await firstValueFrom(
        this.httpService.post<ReviewResponse>(
          `http://localhost:${REVIEW_PORT}/reviews`,
          reviewPayload,
        ),
      );

      reviewData = response.data;
    }

    return {
      book,
      initialReview: reviewData,
    };
  }

  async findAll() {
    const books = await this.prisma.book.findMany();
    return books;
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({ where: { id } });
    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    const book = await this.prisma.book.update({ where: { id }, data: updateBookDto });
    return book;
  }

  async remove(id: number) {
    const book = await this.prisma.book.delete({ where: { id } });
    return book;
  }

  async getBookReport(id: number) {
    const book = await this.prisma.book.findUnique({ where: { id } });
    // ยิง HTTP GET ไปหา Review Service (Trace ID จะถูกแนบอัตโนมัติด้วย NestJS Observe)
    const response: AxiosResponse<ReviewResponse> = await firstValueFrom(
      this.httpService.get<ReviewResponse>(
        `http://localhost:${REVIEW_PORT}/reviews/report/${id}`,
      ),
    );
    return { book, reviewReport: response.data };
  }

  // 💡 เพิ่มเมธอดดึงรายละเอียดหนังสือ พร้อมเรียก Report จาก Review Service
  async getBookWithReport(id: number) {
    // 1. ค้นหาข้อมูลหนังสือจาก SQLite ฝั่ง Book Service
    const book = await this.prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      throw new NotFoundException(`ไม่พบหนังสือ ID: ${id}`);
    }

    // 2. ยิง HTTP GET ไปเอา Report จาก Review Service (Port 3001)
    let reviewReport = null;
    try {
      const response = await firstValueFrom(
        this.httpService.get(`http://localhost:${REVIEW_PORT}/reviews/report/${id}`),
      );
      reviewReport = response.data;
    } catch (error) {
      // กรณีไม่พบริวิว หรือ Review Service ตอบกลับเป็น Error
      reviewReport = { message: 'ไม่พบข้อมูลรีวิวหรือบริการย่อยขัดข้อง' };
    }

    // 3. รวมข้อมูลหนังสือและรายงานรีวิวเข้าด้วยกัน
    return {
      book,
      reviewReport,
    };
  }
}
