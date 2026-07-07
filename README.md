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
- `src/app/admin/**` — หน้าแอดมิน (ต้อง login), `src/proxy.ts` guard เส้นทางนี้
- `src/app/api/**` — API routes ทั้งหมด
- `src/lib/db.ts` — PostgreSQL connection pool
- `src/lib/session.ts` — JWT session cookie สำหรับแอดมิน
- `src/lib/upload.ts` — validate/บันทึกไฟล์แนบลง `uploads/`
- `scripts/schema.sql` — DDL ของตาราง `applications`, `admin_users`
- `scripts/seed-admin.mjs` — เพิ่ม/รีเซ็ตรหัสผ่านบัญชีแอดมิน

## Deploy บน Ubuntu หลัง Nginx (คุมด้วย PM2)

เซิร์ฟเวอร์นี้รันทุกแอปผ่าน PM2 โดยใช้ ecosystem file ร่วมกันที่ `/var/www/ecosystem.config.js`
พอร์ตที่ใช้สำหรับระบบนี้คือ **3400** (ตรวจสอบก่อนว่าไม่ชนกับแอปอื่นใน ecosystem.config.js)

ดูตัวอย่างใน `deploy/`:
- `deploy/nginx.conf.example` — reverse proxy ไปที่พอร์ต 3400 ของ `next start`
- `deploy/ecosystem-snippet.example.js` — object ที่ต้องเพิ่มเข้าไปใน `apps` array ของ ecosystem.config.js

ขั้นตอนบนเซิร์ฟเวอร์ Ubuntu (path จริง: `/var/www/app/application_temp`):
```bash
cd /var/www/app/application_temp
npm ci
cp .env.example .env   # แก้ค่าให้ถูกต้อง (host/user/password DB, SESSION_SECRET)
npm run build

# เพิ่ม object จาก deploy/ecosystem-snippet.example.js เข้าไปใน apps array ของ
# /var/www/ecosystem.config.js ด้วยมือ แล้วรัน:
cd /var/www
pm2 start ecosystem.config.js --only nbu-application
pm2 save

# ตั้งค่า Nginx
sudo cp /var/www/app/application_temp/deploy/nginx.conf.example /etc/nginx/sites-available/nbu-application
sudo ln -s /etc/nginx/sites-available/nbu-application /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

⚠️ **ความปลอดภัย**: บัญชีแอดมินเริ่มต้น (`admin`) ถูกตั้งรหัสผ่านให้ตรงกับรหัสผ่านฐานข้อมูล
PostgreSQL ตามที่ระบุไว้ตอนสร้างระบบ — แนะนำให้เข้า `/admin/users` แล้วเปลี่ยนรหัสผ่าน
(หรือรัน `seed-admin.mjs` ซ้ำด้วยรหัสผ่านใหม่) ก่อนใช้งานจริง เพื่อไม่ให้รหัสผ่านฐานข้อมูล
กับรหัสผ่านเข้าเว็บเป็นค่าเดียวกัน
