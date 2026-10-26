import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// 1x1 Pixel PNG Buffer (สำหรับสร้างไฟล์รูปภาพจริงที่เบราว์เซอร์เปิดอ่านได้)
const DUMMY_IMAGE_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

async function main() {
  // 1. ตรวจสอบและสร้างโฟลเดอร์ ./uploads โดยใช้ process.cwd() แทน __dirname
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // 2. ล้างข้อมูลหนังสือเก่าก่อน
  await prisma.book.deleteMany();

  // 3. กำหนดข้อมูลหนังสือพร้อมชื่อไฟล์รูปปก
  const booksData = [
    {
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      author: 'Robert C. Martin',
      filename: 'clean-code.png',
    },
    {
      title: 'The Pragmatic Programmer',
      author: 'Andrew Hunt, David Thomas',
      filename: 'pragmatic-programmer.png',
    },
    {
      title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
      author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
      filename: 'design-patterns.png',
    },
    {
      title: 'Refactoring: Improving the Design of Existing Code',
      author: 'Martin Fowler',
      filename: 'refactoring.png',
    },
    {
      title: 'Domain-Driven Design',
      author: 'Eric Evans',
      filename: 'ddd.png',
    },
  ];

  // 4. เขียนไฟล์รูปภาพจริงลงโฟลเดอร์ ./uploads และบันทึกลง SQLite
  for (const item of booksData) {
    const filePath = path.join(uploadDir, item.filename);

    fs.writeFileSync(filePath, Buffer.from(DUMMY_IMAGE_BASE64, 'base64'));

    await prisma.book.create({
      data: {
        title: item.title,
        author: item.author,
        coverUrl: `/uploads/${item.filename}`,
      },
    });
  }

  console.log('✅ Seed 5 books and created image files in ./uploads successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });