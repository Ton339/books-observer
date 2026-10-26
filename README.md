# Book Service (Microservice)

ระบบบริหารจัดการข้อมูลหนังสือ (**Book Service**) พัฒนาด้วย **NestJS** และ **Prisma (SQLite)** ทำหน้าที่เป็น Microservice รับผิดชอบการจัดการข้อมูลหนังสือ อัปโหลดไฟล์รูปปกหนังสือ และสื่อสารข้ามไปยัง Review Service ผ่าน HTTP Client พร้อมรองรับ **Distributed Tracing & APM ด้วย NestJS Observe**

---

## 📌 คุณสมบัติหลัก (Features)

* **Book Management:** จัดการข้อมูลหนังสือ (สร้าง, ดึงรายการทั้งหมด, ดึงตาม ID)
* **File Upload & Static Hosting:** รองรับการอัปโหลดไฟล์รูปปกหนังสือ (`.jpg`, `.jpeg`, `.png`, `.webp` ขนาดไม่เกิน 5MB) และให้บริการไฟล์ Static ผ่าน `/uploads/...`
* **Inter-service Communication:** สื่อสารกับ Review Service (Port 3002) แบบ Synchronous HTTP:
* ส่งสร้างรีวิวเริ่มต้น (`initialReview`) เมื่อมีการบันทึกหนังสือใหม่
* ดึงรายงานสรุปรีวิว (`GET /books/:id/report`) มาแสดงผลร่วมกับข้อมูลหนังสือ


* **Distributed Tracing:** แนบ Trace ID (`x-request-id`) ไปกับ HTTP Header ข้ามไปยัง Review Service อัตโนมัติ เพื่อแสดง Waterfall Trace บน NestJS Observe Dashboard

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

* **Framework:** NestJS (v11+)
* **ORM:** Prisma ORM (v6+)
* **Database:** SQLite
* **HTTP Client:** `@nestjs/axios` (Axios)
* **File Handling:** `@nestjs/platform-express` (Multer)
* **Observability:** `@nestjs/observe` (Auto-instrumentation)
* **Validation:** `class-validator`, `class-transformer`

---

## ⚙️ การติดตั้งและตั้งค่าระบบ (Installation & Setup)

### 1. ติดตั้ง Dependencies

```bash
npm install

```

### 2. ตั้งค่า Database & Prisma Client

```bash
# อัปเดต Schema ลง SQLite Database (dev.db)
npx prisma db push

# สร้าง Prisma Client
npx prisma generate

```

### 3. ใส่ข้อมูลจำลอง (Seed Data)

คำสั่งนี้จะทำการสร้างข้อมูลหนังสือ 5 เล่ม พร้อมสร้างไฟล์รูปภาพปกตัวอย่างลงในโฟลเดอร์ `./uploads`:

```bash
npx prisma db seed

```

### 4. เชื่อมต่อ NestJS Observe

```bash
npx @nestjs/observe link

```

*(ระบบจะสร้าง `OBSERVE_APP_KEY` และ `OBSERVE_APP_SECRET` ลงในไฟล์ `.env` อัตโนมัติ)*

---

## 🚀 การสั่งรันโปรเจกต์ (Running the App)

```bash
# Development Mode (Port 3001)
npm run start:dev

```

---

## 📍 รายการ API Endpoints

| Method | Endpoint | Form Data / Query | คำอธิบาย |
| --- | --- | --- | --- |
| `POST` | `/books` | `multipart/form-data` | สร้างหนังสือใหม่ (รองรับไฟล์รูปปก `cover` และรีวิวเริ่มต้น `initialReview`) |
| `GET` | `/books` | - | ดึงรายการหนังสือทั้งหมด |
| `GET` | `/books/:id` | `id` (number) | ดึงข้อมูลหนังสือตาม ID |
| `GET` | `/books/:id/report` | `id` (number) | **ดึงข้อมูลหนังสือพร้อมรายงานรีวิวสรุป** (ยิงข้ามไปดึงจาก Review Service) |

---

## 🧪 ขั้นตอนการทดสอบ Distributed Tracing (NestJS Observe)

1. สั่งรันทั้ง **Book Service** (Port 3001) และ **Review Service** (Port 3002) คู่กัน
2. ยิง Request ทดสอบสร้างหนังสือพร้อมรีวิวเริ่มต้น และไฟล์รูปปก:
```bash
curl -X POST http://localhost:3001/books \
  -F "title=Clean Code" \
  -F "author=Robert C. Martin" \
  -F "initialReview=หนังสือดีมาก อ่านเข้าใจง่าย" \
  -F "initialRating=5" \
  -F "cover=@/path/to/cover.jpg"

```


3. ยิง Request ดึงรายละเอียดหนังสือพร้อมรายงานสรุปรีวิว:
```bash
curl http://localhost:3001/books/1/report

```


4. เข้าไปยัง Dashboard [observe.nestjs.com](https://observe.nestjs.com) เมนู **Traces** เพื่อดู Waterfall Flow แสดงการยิง HTTP Cross-service และการทำงานของ Prisma DB ชัดเจนในเส้นเดียว"# books-observer" 
