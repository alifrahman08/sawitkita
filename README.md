# 🌴 SawitKita — Sistem Manajemen Koperasi Kelapa Sawit Modern

> **"Kelola Panen, Transparansi Pembayaran, Koperasi Lebih Maju."**

SawitKita adalah platform web SaaS enterprise full-stack yang dirancang khusus untuk memodernisasi tata kelola operasional dan keuangan koperasi kelapa sawit di Indonesia. Sistem ini menghubungkan pengurus koperasi, petugas timbang lapangan, dan petani sawit secara real-time dengan transparansi menyeluruh dari penimbangan TBS hingga pencairan pembayaran dan buku besar simpanan.

---

## 📑 Daftar Isi
1. [Fitur Utama](#-fitur-utama)
2. [Arsitektur & Tech Stack](#-arsitektur--tech-stack)
3. [Alur Bisnis Inti](#-alur-bisnis-inti)
4. [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
5. [Daftar Route Aplikasi](#-daftar-route-aplikasi)
6. [Panduan Instalasi & Menjalankan Lokal](#-panduan-instalasi--menjalankan-lokal)
7. [Konfigurasi Database & Supabase](#-konfigurasi-database--supabase)
8. [Pengujian (Testing)](#-pengujian-testing)
9. [Build & Panduan Deployment ke Vercel](#-build--panduan-deployment-ke-vercel)
10. [Akun Demo Bawaan](#-akun-demo-bawaan)

---

## ✨ Fitur Utama

- **Digitalisasi Jembatan Timbang TBS**: Pencatatan bruto, tara, potongan sortasi/persentase, dan potongan berat sampah/tangkai panjang dengan kalkulasi berat bersih dan nilai uang otomatis.
- **Validasi Otoritatif Sisi Server**: Mencegah kesalahan input (tara $\ge$ bruto, berat negatif, potongan $>100\%$, pembayaran melebihi sisa hak).
- **Pengelolaan Harga TBS Multi-Periode**: Penetapan harga resmi Dinas Perkebunan (Disbun) dengan snapshot harga terkunci saat transaksi dikonfirmasi.
- **Sistem Pembayaran & Alokasi Fleksibel**: Mendukung pelunasan penuh maupun bertahap (parsial) dengan riwayat nomor referensi transfer bank, kuitansi digital, dan ekspor CSV.
- **Buku Besar Simpanan Koperasi (Ledger)**: Pengelolaan Simpanan Pokok, Wajib, dan Sukarela. Penarikan dibatasi hanya untuk simpanan sukarela dengan validasi batas saldo.
- **Portal Mandiri Petani**: Petani dapat login untuk melihat hasil panen kebunnya, status pembayaran TBS, tiket timbang, kuitansi, dan mutasi saldo simpanan tanpa melihat data petani lain (isolasi data terjamin).
- **Laporan & Analitik Interaktif**: Visualisasi grafik Recharts, rekapitulasi tonase panen, rekapitulasi biaya operasional, dan cetak laporan PDF/kertas standar koperasi.
- **Audit Log Lengkap**: Pencatatan kronologis setiap aksi penting (perubahan harga, verifikasi timbang, pembatalan dengan alasan, dan pencairan kas).

---

## 🛠️ Arsitektur & Tech Stack

| Layer | Teknologi |
|---|---|
| **Framework** | [Next.js](https://nextjs.org/) (App Router, Turbopack, React 19) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict Mode) |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com/), Lucide React Icons |
| **Komponen UI** | Desain Agribisnis Elegan (Forest Green `#1b4332`, Leaf Green, Gold Accent) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) & [Supabase](https://supabase.com/) |
| **ORM & Migrasi**| [Prisma ORM v6](https://www.prisma.io/) |
| **Dual-Mode Engine** | Dual-mode data persistence (`prisma/local-dev-db.json` saat offline, PostgreSQL saat online) |
| **Autentikasi** | Secure HTTP-Only Cookie JWT (`sawitkita_session`), bcryptjs password hashing |
| **Validasi** | [Zod](https://zod.dev/) dengan pesan error Bahasa Indonesia |
| **Grafik** | [Recharts](https://recharts.org/) |
| **Pengujian** | [Vitest](https://vitest.dev/) (Unit, Integration, & E2E Business Flow Tests) |

---

## 🔄 Alur Bisnis Inti

### 1. Rumus Penimbangan TBS
Kalkulasi dilakukan secara instan di antarmuka lapangan dan diverifikasi ulang di server:
$$\text{Berat Setelah Tara} = \text{Berat Bruto} - \text{Berat Tara}$$
$$\text{Potongan Persentase (kg)} = \text{Berat Setelah Tara} \times \frac{\text{Persentase Potongan}}{100}$$
$$\text{Berat Bersih} = \text{Berat Setelah Tara} - \text{Potongan Persentase} - \text{Potongan Berat Tambahan}$$
$$\text{Nilai Transaksi} = \text{Berat Bersih} \times \text{Harga TBS per kg}$$

### 2. Siklus Status Transaksi
`DRAFT` $\rightarrow$ `MENUNGGU_VERIFIKASI` $\rightarrow$ `TERKONFIRMASI` $\rightarrow$ `SIAP_DIBAYAR` $\rightarrow$ `DIBAYAR_SEBAGIAN` $\rightarrow$ `LUNAS` (atau `DIBATALKAN` dengan alasan tertulis).

### 3. Alokasi Pembayaran
- Setiap pembayaran dapat dialokasikan ke satu atau banyak transaksi milik petani terkait.
- Jika pembayaran $<$ sisa hak $\rightarrow$ status transaksi menjadi `DIBAYAR_SEBAGIAN`.
- Jika pembayaran $=$ sisa hak $\rightarrow$ status transaksi menjadi `LUNAS`.
- Pembayaran melebihi sisa hak akan ditolak oleh sistem.

### 4. Aturan Simpanan (AD/ART Koperasi)
- **Simpanan Pokok & Wajib**: Hanya dapat disetor selama menjadi anggota aktif dan tidak dapat ditarik sewaktu-waktu (hanya dicairkan saat pengunduran diri).
- **Simpanan Sukarela**: Dapat disetor dan ditarik sewaktu-waktu sesuai saldo yang tersedia.

---

## 👥 Role-Based Access Control (RBAC)

1. **Super Admin**: Akses penuh seluruh sistem, audit log, konfigurasi umum koperasi, dan manajemen akun pengurus.
2. **Admin / Pengurus**: Manajemen data anggota, kebun kelapa sawit, pengaturan harga TBS, input timbang TBS, verifikasi transaksi, pemrosesan pembayaran, mutasi simpanan, pengumuman, dan laporan keuangan.
3. **Anggota / Petani**: Portal mandiri untuk memeriksa data kebun, tiket penimbangan, status hak pembayaran, kuitansi pencairan dana, buku tabungan simpanan, dan pengumuman resmi koperasi.

---

## 📍 Daftar Route Aplikasi

### Halaman Publik & Autentikasi
- `/` — Landing Page interaktif (Hero, Fitur, Alur Kerja, FAQ, CTA).
- `/login` — Login dengan pemilihan akun demo 1-klik untuk semua role.
- `/register` — Pendaftaran mandiri petani sawit baru.
- `/unauthorized` — Halaman proteksi akses (403 Forbidden).

### Panel Admin Koperasi (`/admin/*`)
- `/admin/dashboard` — Ringkasan metrik panen, grafik Recharts, & aktivitas terbaru.
- `/admin/anggota` — CRUD Anggota, pencarian NIK/Nama, status aktif/nonaktif, & ekspor CSV.
- `/admin/kebun` — Manajemen kebun/lahan sawit anggota (luas Ha, tahun tanam, lokasi).
- `/admin/harga-tbs` — Penetapan harga TBS per kg, riwayat harga, & grafik tren Disbun.
- `/admin/transaksi` — Riwayat transaksi timbang, filter status, tiket cetak, & ekspor CSV.
- `/admin/transaksi/tambah` — Formulir kalkulator timbang interaktif real-time.
- `/admin/pembayaran` — Daftar kewajiban bayar, alokasi parsial/penuh, & cetak kuitansi.
- `/admin/simpanan` — Buku besar simpanan pokok/wajib/sukarela & cetak slip mutasi.
- `/admin/laporan` — Rekapitulasi produksi, tonase per kebun, hak petani, & biaya operasional.
- `/admin/pengumuman` — Publikasi pengumuman berdasar target role.
- `/admin/pengaturan` — Konfigurasi profil koperasi, nomor surat, dan aturan potongan.
- `/admin/audit-log` — Jejak audit kronologis seluruh aksi pengguna.

### Portal Mandiri Anggota (`/anggota/*`)
- `/anggota/dashboard` — Ringkasan tonase panen pribadi, estimasi hak bayar, & saldo simpanan.
- `/anggota/kebun` — Data sertifikat lahan dan luas hektare milik pribadi.
- `/anggota/transaksi` — Tiket timbang pribadi & detail potongan timbang.
- `/anggota/pembayaran` — Riwayat pencairan dana & cetak kuitansi pribadi.
- `/anggota/simpanan` — Buku tabungan simpanan pribadi & riwayat setoran.
- `/anggota/pengumuman` — Pengumuman resmi koperasi untuk petani.
- `/anggota/profil` — Informasi pribadi & rekening bank pencairan dana.

---

## 🚀 Panduan Instalasi & Menjalankan Lokal

### 1. Kloning Repositori
```bash
git clone https://github.com/your-username/sawitkita.git
cd sawitkita
```

### 2. Instal Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
*(Catatan: Tanpa setting database tambahan, aplikasi langsung berfungsi menggunakan dual-mode local database engine)*

### 4. Jalankan Development Server
```bash
npm run dev
```
Akses aplikasi melalui browser di **`http://localhost:3000`**.

---

## 🗄️ Konfigurasi Database & Supabase

Untuk menghubungkan ke database PostgreSQL di cloud (misalnya **Supabase**):

### 1. Buat Project Baru di Supabase
1. Masuk ke [Supabase Dashboard](https://supabase.com/dashboard) dan buat project baru.
2. Pilih region terdekat (misalnya `Singapore (ap-southeast-1)`).

### 2. Atur Connection String di `.env`
Buka menu **Project Settings** $\rightarrow$ **Database** di Supabase:
- Salin **Connection string** (Mode: Transaction Pooler) ke `DATABASE_URL`.
- Salin **Connection string** (Mode: Direct / Session) ke `DIRECT_URL`.

Contoh:
```env
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

### 3. Jalankan Migrasi Prisma
```bash
npx prisma migrate deploy
```
atau untuk inisialisasi awal skema:
```bash
npx prisma db push
```

### 4. Jalankan Seeder
```bash
npm run prisma:seed
```

---

## 🧪 Pengujian (Testing)

Proyek ini dilengkapi dengan 27 unit test, integration test, dan end-to-end business flow test yang menguji seluruh logika bisnis kritis:

```bash
# Menjalankan seluruh test suite dengan Vitest
npx vitest run
```

### Cakupan Pengujian:
1. **`tests/calculations.test.ts` (11 tests)**:
   - Rumus berat bersih, potongan persentase, dan potongan berat manual.
   - Penolakan tara $\ge$ bruto dan berat $\le 0$.
   - Alokasi pembayaran parsial & penuh.
   - Pembatasan mutasi simpanan.
2. **`tests/db.test.ts` (7 tests)**:
   - Operasi CRUD anggota, kebun, transaksi, dan penetapan harga aktif.
3. **`tests/e2e-business-flows.test.ts` (9 tests)**:
   - **Alur 1 (Admin)**: Login $\rightarrow$ Tambah Anggota $\rightarrow$ Tambah Kebun $\rightarrow$ Atur Harga TBS $\rightarrow$ Buat Transaksi $\rightarrow$ Verifikasi $\rightarrow$ Bayar $\rightarrow$ Cek Laporan.
   - **Alur 2 (Anggota)**: Login petani $\rightarrow$ akses data miliknya $\rightarrow$ verifikasi isolasi data.
   - **Alur 3 (Pembayaran Bertahap)**: Transaksi $\rightarrow$ Bayar tahap 1 (`DIBAYAR_SEBAGIAN`) $\rightarrow$ Bayar sisa (`LUNAS`).
   - **Alur 4 (Keamanan)**: Pencegahan pembacaan data anggota lain (Data Isolation).
   - **Alur 5 (Validasi Input)**: Penolakan nilai negatif, overpayment, dan penarikan Simpanan Pokok/Wajib.

---

## 📦 Build & Panduan Deployment ke Vercel

### 1. Verifikasi Build Lokal
Pastikan tidak ada kesalahan kompilasi atau TypeScript:
```bash
npm run build
```

### 2. Deploy ke Vercel
1. Hubungkan repositori GitHub Anda ke [Vercel](https://vercel.com).
2. Tambahkan Environment Variables di Vercel Dashboard (**Settings** $\rightarrow$ **Environment Variables**):
   - `DATABASE_URL` : PostgreSQL pooler connection string.
   - `DIRECT_URL` : PostgreSQL direct connection string.
   - `JWT_SECRET` : Kunci rahasia minimal 32 karakter.
   - `NEXT_PUBLIC_APP_URL` : URL domain production Vercel Anda (misal `https://sawitkita.vercel.app`).
3. Tekan tombol **Deploy**.

---

## 🔑 Akun Demo Bawaan

Pada halaman `/login`, tersedia tombol **1-Klik Isi Kredensial Demo** untuk mempermudah evaluasi:

| Role | Email | Password |
|---|---|---|
| **Super Admin** | `superadmin@sawitkita.co.id` | `Admin123!` |
| **Pengurus / Admin** | `pengurus@sawitkita.co.id` | `Admin123!` |
| **Petani (Anggota)** | `budi@petani.id` | `Petani123!` |
| **Petani 2 (Anggota)**| `siti@petani.id` | `Petani123!` |

---

## 📄 Lisensi
Hak Cipta © 2026 **SawitKita Team**. Seluruh hak cipta dilindungi undang-undang.
Dilisensikan di bawah [MIT License](LICENSE).
