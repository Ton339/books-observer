import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreateBookDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    author: string;

    @IsString()
    @IsOptional()
    initialReview?: string;

    // 💡 สำคัญ: ต้องใส่ @Type(() => Number) เพื่อเปลี่ยนค่าจาก Form-Data String ให้เป็น Number
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    @Min(1)
    @Max(5)
    initialRating?: number;

    
}