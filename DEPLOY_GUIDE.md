# คู่มือขึ้นออนไลน์ฟรี (รองรับ PC & มือถือ 100+ คน)

โปรเจกต์นี้พร้อมสำหรับ **Hybrid Split Deployment ฟรี 100%** (ไม่ต้องใช้บัตรเครดิต):
- **Frontend + โมเดล 3D (`public/`)** → โฮสต์ฟรีบน **Cloudflare Pages** (Bandwidth ไม่จำกัด มีเซิร์ฟเวอร์ในไทย โหลดไวมาก)
- **Backend Multiplayer (`server.js`)** → โฮสต์ฟรีบน **Render.com** (รองรับ Socket.IO + HTTPS ฟรี)
- แบ่งห้องอัตโนมัติสูงสุด **4 ลานงาน × 35 คน = 140 คนพร้อมกัน**

---

## ขั้นตอนที่ 1: นำโปรเจกต์ขึ้น GitHub
1. สร้าง Repository ใหม่บน GitHub (เช่น `loy-krathong-3d`)
2. เปิด Terminal ในโฟลเดอร์โปรเจกต์ แล้วรันคำสั่ง:
   ```bash
   git init
   git add .
   git commit -m "Ready for online deploy (compressed models + multi-room)"
   git branch -M main
   git remote add origin https://github.com/<ชื่อบัญชีของคุณ>/loy-krathong-3d.git
   git push -u origin main
   ```
   *(ไฟล์ `.gitignore` ตั้งค่าไว้แล้ว จะไม่อัปโหลด `node_modules/` หรือไฟล์สำรองขึ้นไป)*

---

## ขั้นตอนที่ 2: เปิดเซิร์ฟเวอร์เกมฟรีบน Render.com
1. เข้า [https://render.com](https://render.com) → ล็อกอินด้วย **GitHub**
2. กด **New +** → เลือก **Web Service** → เลือก Repo `loy-krathong-3d`
3. ตรวจสอบค่าตั้งต้น (ระบบจะอ่านจาก `render.yaml` ให้อัตโนมัติ):
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
4. กด **Create Web Service** รอประมาณ 2–3 นาทีจนขึ้นสถานะ `Live`
5. คัดลอก URL ที่ได้ เช่น `https://loy-krathong-3d-server.onrender.com`

---

## ขั้นตอนที่ 3: เชื่อม Frontend เข้ากับ Render แล้วขึ้น Cloudflare Pages
1. เปิดไฟล์ `public/config.js` ในโปรเจกต์ของคุณ แล้วใส่ URL จากขั้นตอนที่ 2:
   ```js
   window.LOY_KRATHONG_CONFIG = {
     serverUrl: 'https://loy-krathong-3d-server.onrender.com'
   };
   ```
2. บันทึกและ Push ขึ้น GitHub อีกครั้ง:
   ```bash
   git add public/config.js
   git commit -m "Set Render backend URL"
   git push
   ```
3. เข้า [https://dash.cloudflare.com](https://dash.cloudflare.com) → ล็อกอินด้วย **GitHub** (สมัครฟรี ไม่ต้องใส่บัตร)
4. ไปที่เมนู **Workers & Pages** → **Create** → แท็บ **Pages** → **Connect to Git** → เลือก Repo `loy-krathong-3d`
5. ตั้งค่า Build:
   - **Framework preset:** `None`
   - **Build command:** *(เว้นว่าง)*
   - **Build output directory:** `public`
6. กด **Save and Deploy** → ไม่ถึง 1 นาทีจะได้ลิงก์ `https://loy-krathong-3d.pages.dev` พร้อมส่งให้เพื่อนเปิดเล่นทั้งมือถือและ PC ได้ทันที!

---

## ขั้นตอนที่ 4 (แนะนำวันงาน): ตั้งกันเซิร์ฟเวอร์ Render หลับ (ฟรี)
Render แพ็กเกจ Free จะพักเครื่องหากไม่มีคนเข้าเกิน 15 นาที (ทำให้คนแรกต้องรอ ~30 วินาที):
1. สมัครฟรีที่ [https://uptimerobot.com](https://uptimerobot.com)
2. กด **Add New Monitor** → Type: `HTTP(s)`
3. ใส่ URL: `https://loy-krathong-3d-server.onrender.com/api/health`
4. ตั้ง Interval: **Every 10 minutes** → กด Save
5. เท่านี้เซิร์ฟเวอร์จะตื่นพร้อมรับผู้ร่วมงาน 100 คนตลอดคืนวันลอยกระทง!
