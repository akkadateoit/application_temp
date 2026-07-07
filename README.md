# ระบบรับสมัครนักศึกษาออนไลน์ — มหาวิทยาลัยนอร์ทกรุงเทพ

เว็บแอป Next.js (App Router + TypeScript + Tailwind) สำหรับรับสมัครนักศึกษาระดับปริญญาตรี
แทนใบสมัครกระดาษ (อ้างอิงฟิลด์จาก `docs/application-reference.jpg`)

## ฟีเจอร์
- หน้า PDPA ที่ต้องกดยอมรับก่อนเข้าฟอร์มสมัคร (`/`)
- ฟอร์มสมัครออนไลน์ตามแบบฟอร์มจริง พร้อมแนบรูปบัตรประชาชนและสลิปโอนเงิน (`/apply`)
- ตรวจสอบสถานะใบสมัครด้วยเลขบัตรประชาชน (`/status`)
- หน้าแอดมิน: ดู/ค้นหา/แก้ไขใบสมัคร, ดูไฟล์แนบ, จัดการบัญชีแอดมิน (`/admin`)
- เชื่อมต่อ PostgreSQL, ไฟล์แนบเก็บบน disk ของ server (`uploads/`)

## เตรียมสภาพแวดล้อม

1. ติดตั้ง dependency
   ```bash
   npm install
   ```
2. คัดลอก `.env.example` เป็น `.env` แล้วกรอกค่าจริง (host/user/password ของ PostgreSQL,
   `SESSION_SECRET` แบบสุ่มยาวๆ, `UPLOAD_DIR`)
3. สร้างตารางใน PostgreSQL (รันครั้งเดียว ทำไปแล้วบน 172.21.0.46 ฐานข้อมูล `nbu_application`)
   ```bash
   psql "postgresql://postgres:<password>@<host>:5432/nbu_application" -f scripts/schema.sql
   ```
4. สร้างบัญชีแอดมินคนแรก (รันซ้ำได้ ใช้ตั้งรหัสผ่านใหม่ก็ได้)
   ```bash
   node --env-file=.env scripts/seed-admin.mjs <username> <password>
   ```

## พัฒนา / รัน

```bash
npm run dev      # dev server ที่ http://localhost:3000
npm run build    # ตรวจ type และ build สำหรับ production
npm run start    # รันเซิร์ฟเวอร์ production (หลัง build)
```

## โครงสร้างที่สำคัญ

- `src/app/page.tsx` — หน้า PDPA
- `src/app/apply/page.tsx` — ฟอร์มสมัคร, `src/app/apply/success` — หน้ายืนยัน
- `src/app/status/page.tsx` — ตรวจสอบสถานะด้วยเลขบัตรประชาชน
- `src/app/admin/**` — หน้าแอดมิน (ต้อง login), `src/middleware.ts` guard เส้นทางนี้
- `src/app/api/**` — API routes ทั้งหมด
- `src/lib/db.ts` — PostgreSQL connection pool
- `src/lib/session.ts` — JWT session cookie สำหรับแอดมิน
- `src/lib/upload.ts` — validate/บันทึกไฟล์แนบลง `uploads/`
- `scripts/schema.sql` — DDL ของตาราง `applications`, `admin_users`
- `scripts/seed-admin.mjs` — เพิ่ม/รีเซ็ตรหัสผ่านบัญชีแอดมิน

## Deploy บน Ubuntu หลัง Nginx

ดูตัวอย่างใน `deploy/`:
- `deploy/nginx.conf.example` — reverse proxy ไปที่พอร์ต 3000 ของ `next start`
- `deploy/app.service.example` — systemd unit ให้แอปรันค้างและ auto-restart

ขั้นตอนคร่าวๆ บนเซิร์ฟเวอร์ Ubuntu:
```bash
git clone <repo> /var/www/nbu-application
cd /var/www/nbu-application
npm ci
cp .env.example .env   # แก้ค่าให้ถูกต้อง
npm run build
sudo cp deploy/app.service.example /etc/systemd/system/nbu-application.service
sudo systemctl daemon-reload && sudo systemctl enable --now nbu-application
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/nbu-application
sudo ln -s /etc/nginx/sites-available/nbu-application /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

⚠️ **ความปลอดภัย**: บัญชีแอดมินเริ่มต้น (`admin`) ถูกตั้งรหัสผ่านให้ตรงกับรหัสผ่านฐานข้อมูล
PostgreSQL ตามที่ระบุไว้ตอนสร้างระบบ — แนะนำให้เข้า `/admin/users` แล้วเปลี่ยนรหัสผ่าน
(หรือรัน `seed-admin.mjs` ซ้ำด้วยรหัสผ่านใหม่) ก่อนใช้งานจริง เพื่อไม่ให้รหัสผ่านฐานข้อมูล
กับรหัสผ่านเข้าเว็บเป็นค่าเดียวกัน
