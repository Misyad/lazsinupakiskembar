# PRD KOINNU Ranting System

## 1. Status Dokumen

**Nama produk:** KOINNU Ranting System  
**Organisasi:** LAZISNU Pakiskembar  
**Jenis produk:** Web application operasional ranting  
**Status dokumen:** Pedoman utama proyek  
**Bahasa produk:** Indonesia  
**Target pengguna awal:** Pengurus ranting, bendahara, petugas lapangan, dan publik  
**Status implementasi saat ini:** MVP dummy-data berbasis Next.js single-page app  
**Target implementasi berikutnya:** Fullstack production-ready dengan database, autentikasi, RBAC, audit log, dan deployment Jenkins

Dokumen ini menjadi acuan utama untuk keputusan produk, desain fitur, struktur data, prioritas pengembangan, dan validasi hasil kerja. Jika ada perubahan scope, perubahan tersebut harus memperbarui PRD ini terlebih dahulu atau dicatat sebagai keputusan teknis yang merujuk ke PRD ini.

## 2. Ringkasan Produk

KOINNU Ranting System adalah sistem digital untuk mengelola GERAKAN KOIN NU di tingkat ranting. Sistem ini mendukung pendataan rumah donatur, distribusi kaleng, penarikan koin, validasi bendahara, rekap keuangan, laporan periodik, transparansi publik, dan monitoring petugas lapangan.

Produk ini dibuat agar pengelolaan dana umat lebih rapi, transparan, mudah diaudit, dan tidak bergantung pada catatan manual yang rawan hilang, terlambat, atau tidak konsisten.

## 3. Masalah yang Diselesaikan

Pengelolaan KOIN NU di ranting umumnya menghadapi masalah berikut:

- Data rumah donatur tersebar di buku, chat, atau spreadsheet pribadi.
- Nomor kaleng tidak selalu unik dan riwayat distribusi sulit dilacak.
- Penarikan koin dicatat manual dan rawan salah rekap.
- Bendahara sulit membedakan transaksi pending, sah, dan ditolak.
- Laporan bulanan membutuhkan waktu lama.
- Transparansi ke masyarakat belum tersaji cepat.
- Audit internal sulit karena tidak ada jejak perubahan data.
- Petugas lapangan tidak punya alur input yang sederhana saat bertugas.

Sistem ini harus menyelesaikan masalah tersebut dengan alur kerja yang jelas, data terpusat, permission yang tegas, dan laporan yang siap dipakai pengurus.

## 4. Tujuan Produk

### 4.1 Tujuan Bisnis

- Digitalisasi administrasi LAZISNU Pakiskembar.
- Meningkatkan kepercayaan masyarakat terhadap pengelolaan dana KOIN NU.
- Mengurangi pekerjaan rekap manual pengurus dan bendahara.
- Mempercepat proses validasi penarikan dan penyusunan laporan.
- Menyiapkan data yang rapi untuk audit internal dan pertanggungjawaban publik.

### 4.2 Tujuan Pengguna

- Admin ranting dapat mengelola rumah, kaleng, petugas, dan laporan dari satu sistem.
- Petugas lapangan dapat input penarikan secara cepat melalui scan QR atau pencarian kaleng.
- Bendahara dapat memvalidasi pemasukan dan mencatat pengeluaran dengan bukti yang jelas.
- Publik dapat melihat ringkasan transparansi tanpa melihat data sensitif.

### 4.3 KPI

| KPI | Target MVP | Target Produksi |
| --- | ---: | ---: |
| Data rumah terdigitalisasi | 100 rumah | 1000+ rumah |
| Kaleng memiliki nomor unik | 100% | 100% |
| Penarikan masuk sistem | 80% | 95% |
| Transaksi tervalidasi bendahara | 90% | 98% |
| Laporan bulanan otomatis | Ada | Siap cetak PDF/Excel |
| Audit log aksi penting | Partial | 100% aksi penting |
| Halaman publik | Ringkasan | Real-time terkontrol |

## 5. Prinsip Produk

- **Data resmi adalah data tervalidasi.** Transaksi pending tidak boleh masuk saldo resmi.
- **Backend harus menjadi sumber kebenaran.** UI boleh membantu, tetapi validasi final berada di server.
- **Data publik dipisahkan dari data internal.** Publik tidak boleh melihat nomor HP, alamat detail, catatan internal, dan audit log.
- **Setiap aksi penting harus bisa diaudit.** Create, update, delete, validasi, penolakan, export, dan publikasi laporan harus tercatat.
- **Alur lapangan harus cepat.** Input penarikan harus nyaman dipakai di HP.
- **Scope dibuat bertahap.** Jangan menambah integrasi eksternal sebelum fondasi data dan role stabil.

## 6. Kondisi Implementasi Saat Ini

Repo saat ini adalah MVP frontend dengan dummy data.

### 6.1 Stack Saat Ini

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Lucide React icons
- Dockerfile production
- Docker Compose
- Jenkinsfile untuk CI/CD
- Cloudflare Tunnel untuk publikasi domain

### 6.2 Modul Dummy yang Sudah Ada

- Login simulasi berdasarkan role.
- Dashboard statistik.
- Data rumah donatur.
- Tracking kaleng.
- Input penarikan.
- Validasi transaksi.
- Keuangan ringkas.
- Laporan ringkas.
- Transparansi publik.
- Pengaturan role dan integrasi WhatsApp placeholder.

### 6.3 Batasan Saat Ini

- Belum ada database.
- Belum ada autentikasi nyata.
- Belum ada API server.
- Data masih tersimpan di state frontend.
- QR belum benar-benar dibuat dan dipindai.
- Export PDF/Excel belum tersedia.
- Audit log belum persisten.
- WhatsApp gateway belum terhubung.

## 7. Scope Produk

### 7.1 In Scope Produksi

- Autentikasi pengguna.
- Role based access control.
- Dashboard operasional.
- Manajemen rumah donatur.
- Manajemen kaleng.
- QR kaleng.
- Penarikan koin.
- Validasi bendahara.
- Keuangan kas masuk dan kas keluar.
- Laporan periodik.
- Export PDF dan Excel.
- Transparansi publik.
- Audit log.
- Pengaturan user, role, wilayah, kategori, dan integrasi.
- Deployment otomatis melalui Jenkins.

### 7.2 Out of Scope untuk Fase Awal

- Mobile app native.
- Payment gateway.
- Integrasi bank otomatis.
- AI analytics.
- Multi organisasi skala nasional.
- Marketplace donasi.
- Akuntansi kompleks setingkat ERP.

## 8. Persona dan Role

### 8.1 Super Admin

Pengelola tertinggi sistem. Biasanya pengurus inti atau teknis sistem.

Kebutuhan:

- Mengelola user dan role.
- Mengelola setting global.
- Mengakses semua data.
- Melihat audit log.
- Memperbaiki data bermasalah.

### 8.2 Admin Ranting

Pengurus operasional ranting.

Kebutuhan:

- Mengelola rumah donatur.
- Mengelola kaleng.
- Mengatur wilayah dan petugas.
- Melihat laporan operasional.
- Mempublikasikan ringkasan transparansi.

### 8.3 Petugas Lapangan

Petugas yang melakukan distribusi dan penarikan kaleng.

Kebutuhan:

- Melihat daftar rumah tugas.
- Scan QR kaleng.
- Input nominal penarikan.
- Menambahkan catatan lapangan.
- Melihat status input yang pernah dibuat.

### 8.4 Bendahara

Pengelola validasi dan kas.

Kebutuhan:

- Memvalidasi atau menolak penarikan.
- Melihat saldo.
- Mencatat kas keluar.
- Export laporan keuangan.
- Melihat rekap transaksi tervalidasi.

### 8.5 Viewer Publik

Masyarakat atau jamaah yang melihat transparansi.

Kebutuhan:

- Melihat total pemasukan.
- Melihat total penyaluran.
- Melihat saldo publik.
- Melihat dokumentasi program.
- Tidak melihat data pribadi donatur.

## 9. Permission Matrix

| Modul | Super Admin | Admin Ranting | Petugas | Bendahara | Publik |
| --- | --- | --- | --- | --- | --- |
| Dashboard internal | Full | Full | Terbatas | Full | Tidak |
| Rumah donatur | Full | Full | Read terbatas | Read | Tidak |
| Kaleng | Full | Full | Read dan update tugas | Read | Tidak |
| Penarikan | Full | Read | Create | Validate | Tidak |
| Keuangan | Full | Read/limited create | Tidak | Full | Tidak |
| Laporan | Full | Full | Terbatas | Full | Tidak |
| Transparansi publik | Publish | Publish | Tidak | Review | Read |
| User dan role | Full | Tidak | Tidak | Tidak | Tidak |
| Audit log | Full | Read terbatas | Tidak | Read keuangan | Tidak |

Aturan permission harus diterapkan di UI dan server. UI tidak boleh menjadi satu-satunya pembatas akses.

## 10. Modul dan Requirement

### 10.1 Dashboard

Dashboard menampilkan kondisi operasional harian.

Data utama:

- Total rumah aktif.
- Total kaleng aktif.
- Total pemasukan bulan berjalan.
- Total transaksi pending.
- Saldo kas.
- Wilayah dengan kontribusi tertinggi.
- Petugas aktif.
- Tren pemasukan.

Acceptance criteria:

- Statistik hanya menghitung transaksi tervalidasi untuk angka resmi.
- Petugas hanya melihat ringkasan sesuai tugasnya.
- Dashboard mobile tetap dapat dibaca tanpa horizontal scroll.
- Data dashboard diambil dari server, bukan dihitung hanya di client.

### 10.2 Rumah Donatur

Modul rumah digunakan untuk mendata keluarga atau titik donatur.

Field utama:

| Field | Keterangan |
| --- | --- |
| ID rumah | ID internal |
| Nama kepala keluarga | Nama penanggung jawab |
| Nomor HP | Kontak aktif, opsional jika belum ada |
| Alamat | Alamat detail internal |
| RT/RW | Wilayah kecil |
| Dusun/Desa | Wilayah administratif |
| Status | Active, Inactive |
| Tanggal bergabung | Tanggal mulai ikut program |
| Catatan internal | Tidak tampil publik |

Fitur:

- Tambah rumah.
- Edit rumah.
- Nonaktifkan rumah.
- Search nama, HP, alamat, dan nomor kaleng.
- Filter RT/RW dan status.
- Import data dari Excel.
- Riwayat rumah dan kaleng.

Acceptance criteria:

- Nomor HP divalidasi format Indonesia.
- Rumah nonaktif tidak boleh menerima penarikan baru.
- Perubahan data rumah tercatat di audit log.
- Penghapusan data produksi sebaiknya soft delete.

### 10.3 Kaleng

Modul kaleng mengatur inventaris dan distribusi kaleng KOIN NU.

Format nomor awal:

```text
KNU-RT01-001
```

Status kaleng:

- Active
- Inactive
- Lost
- Damaged

Fitur:

- Generate nomor kaleng.
- Assign kaleng ke rumah.
- Pindah kaleng antar rumah.
- Generate QR.
- Cetak label QR.
- Tracking riwayat distribusi.

Acceptance criteria:

- Nomor kaleng unik.
- Satu kaleng hanya boleh aktif di satu rumah pada satu waktu.
- Kaleng Lost, Damaged, atau Inactive tidak bisa dipakai untuk penarikan.
- QR harus memuat identifier yang tidak mudah ditebak jika dipakai publik.

### 10.4 Penarikan Koin

Modul penarikan dipakai oleh petugas lapangan.

Flow:

1. Petugas scan QR atau mencari nomor kaleng.
2. Sistem menampilkan rumah terkait.
3. Petugas mengisi nominal, tanggal, dan catatan.
4. Sistem menyimpan transaksi sebagai Pending.
5. Bendahara memvalidasi atau menolak.
6. Transaksi Validated masuk ke saldo dan laporan resmi.

Status transaksi:

- Pending
- Validated
- Rejected
- Voided

Acceptance criteria:

- Nominal wajib lebih dari 0.
- Petugas tidak bisa validasi transaksinya sendiri kecuali diberi permission khusus.
- Transaksi Pending tidak menambah saldo.
- Transaksi Rejected wajib memiliki alasan.
- Transaksi Validated tidak boleh diubah langsung; gunakan Void atau koreksi.

### 10.5 Keuangan

Modul keuangan menjadi sumber saldo resmi.

Jenis transaksi:

- Income: berasal dari penarikan tervalidasi atau pemasukan manual yang disetujui.
- Expense: penyaluran, operasional, atau biaya lain.
- Adjustment: koreksi saldo dengan approval.

Fitur:

- Validasi pemasukan.
- Input kas keluar.
- Kategori keuangan.
- Bukti transaksi.
- Rekap saldo.
- Export laporan.

Acceptance criteria:

- Saldo = total income tervalidasi - total expense tervalidasi + adjustment tervalidasi.
- Kas keluar wajib memiliki kategori, nominal, tanggal, deskripsi, dan pembuat.
- Koreksi saldo harus tercatat di audit log.
- File bukti tidak boleh menggagalkan penyimpanan transaksi utama jika storage eksternal bermasalah; status upload harus dicatat.

### 10.6 Laporan

Laporan disiapkan untuk pengurus dan audit.

Jenis laporan:

- Harian.
- Mingguan.
- Bulanan.
- Tahunan.
- Per RT/RW.
- Per petugas.
- Per rumah.
- Per kaleng.
- Per kategori pengeluaran.

Export:

- PDF untuk laporan resmi.
- Excel untuk audit dan olah data.

Acceptance criteria:

- Filter tanggal wajib tersedia.
- Laporan resmi hanya memakai transaksi tervalidasi.
- Export memiliki judul organisasi, periode, tanggal cetak, dan pembuat.
- Data sensitif tidak masuk export publik.

### 10.7 Transparansi Publik

Halaman publik menampilkan informasi yang aman dibuka masyarakat.

Konten:

- Total dana terkumpul.
- Total dana tersalurkan.
- Saldo publik.
- Ringkasan program.
- Dokumentasi penyaluran.
- Grafik agregat.

Tidak boleh tampil:

- Nomor HP donatur.
- Alamat detail rumah.
- Nama petugas internal jika tidak diperlukan.
- Catatan internal.
- Audit log.
- Data transaksi mentah.

Acceptance criteria:

- Bisa dibuka tanpa login.
- Data berasal dari laporan yang sudah dipublikasikan.
- Publikasi dapat ditarik kembali oleh admin.
- Mobile-first.

### 10.8 WhatsApp Notification

WhatsApp digunakan untuk notifikasi operasional.

Use case:

- Reminder jadwal penarikan.
- Notifikasi transaksi pending ke bendahara.
- Broadcast ringkasan laporan ke pengurus.
- Notifikasi publikasi laporan.

Provider yang dapat dipakai:

- Fonnte.
- Evolution API.
- Baileys.

Acceptance criteria:

- Integrasi dibuat sebagai adapter.
- Kegagalan pengiriman WhatsApp tidak membatalkan transaksi utama.
- Status pengiriman dicatat.
- Template pesan tidak hardcoded di banyak tempat.

### 10.9 Audit Log

Audit log mencatat aksi penting.

Wajib dicatat:

- Login dan logout.
- Create/update/nonaktif rumah.
- Assign/pindah/status kaleng.
- Input penarikan.
- Validasi, penolakan, void transaksi.
- Input kas keluar.
- Export laporan.
- Publikasi laporan.
- Perubahan role dan permission.

Acceptance criteria:

- Audit log tidak bisa diedit dari UI.
- Metadata sensitif disanitasi.
- Audit log dapat difilter berdasarkan actor, aksi, entity, dan tanggal.

## 11. Data Model Target

### 11.1 Users

```sql
id
name
email
phone
password_hash
status
last_login_at
created_at
updated_at
deleted_at
```

### 11.2 Roles

```sql
id
name
description
created_at
updated_at
```

### 11.3 UserRoles

```sql
id
user_id
role_id
created_at
```

### 11.4 Permissions

```sql
id
key
description
created_at
```

### 11.5 RolePermissions

```sql
id
role_id
permission_id
created_at
```

### 11.6 Areas

```sql
id
name
type
parent_id
created_at
updated_at
```

Contoh type: village, rw, rt.

### 11.7 Houses

```sql
id
code
head_name
phone
address
area_id
status
joined_at
notes
created_by
created_at
updated_at
deleted_at
```

### 11.8 CoinBoxes

```sql
id
box_number
status
qr_token
created_at
updated_at
deleted_at
```

### 11.9 CoinBoxAssignments

```sql
id
coin_box_id
house_id
assigned_by
assigned_at
unassigned_at
notes
```

### 11.10 Withdrawals

```sql
id
coin_box_id
house_id
collector_id
amount
status
notes
collected_at
validated_by
validated_at
rejected_by
rejected_at
rejection_reason
voided_by
voided_at
void_reason
created_at
updated_at
```

### 11.11 CashTransactions

```sql
id
type
source
amount
category_id
description
reference_type
reference_id
status
created_by
validated_by
validated_at
created_at
updated_at
```

### 11.12 FinancialCategories

```sql
id
name
type
status
created_at
updated_at
```

### 11.13 PublicReports

```sql
id
period_start
period_end
title
summary
total_income
total_expense
balance
status
published_by
published_at
created_at
updated_at
```

### 11.14 Attachments

```sql
id
entity_type
entity_id
file_name
file_url
mime_type
size
uploaded_by
created_at
```

### 11.15 AuditLogs

```sql
id
actor_id
action
entity_type
entity_id
metadata_json
ip_address
user_agent
created_at
```

## 12. API Target

Endpoint final dapat berubah mengikuti framework, tetapi domain API minimal sebagai berikut.

### Auth

```text
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Rumah

```text
GET    /api/houses
POST   /api/houses
GET    /api/houses/:id
PATCH  /api/houses/:id
DELETE /api/houses/:id
POST   /api/houses/import
```

### Kaleng

```text
GET   /api/coin-boxes
POST  /api/coin-boxes
PATCH /api/coin-boxes/:id
POST  /api/coin-boxes/:id/assign
POST  /api/coin-boxes/:id/unassign
GET   /api/coin-boxes/:id/qr
```

### Penarikan

```text
GET  /api/withdrawals
POST /api/withdrawals
POST /api/withdrawals/:id/validate
POST /api/withdrawals/:id/reject
POST /api/withdrawals/:id/void
```

### Keuangan

```text
GET  /api/finance/summary
GET  /api/finance/transactions
POST /api/finance/expenses
POST /api/finance/adjustments
```

### Laporan

```text
GET /api/reports/monthly
GET /api/reports/by-area
GET /api/reports/by-collector
GET /api/reports/export/pdf
GET /api/reports/export/xlsx
```

### Publik

```text
GET /api/public/transparency
GET /api/public/reports/:id
```

## 13. UI Information Architecture

### Area Admin

```text
/login
/dashboard
/houses
/coin-boxes
/withdrawals
/finance
/reports
/settings/users
/settings/roles
/settings/areas
/settings/integrations
/audit-logs
```

### Area Petugas

```text
/collector
/collector/tasks
/collector/scan
/collector/withdrawals
```

### Area Publik

```text
/
/transparansi
/laporan/:period
```

Untuk fase MVP berikutnya, boleh tetap memakai single-page dashboard selama rute dan data model produksi belum siap. Namun setiap fitur baru harus diarahkan agar mudah dipindah ke route final.

## 14. UX dan Desain

### 14.1 Prinsip UX

- Aplikasi operasional harus padat, jelas, dan cepat dipakai.
- Petugas lapangan harus bisa menyelesaikan input penarikan dalam kurang dari 1 menit.
- Tombol aksi penting harus eksplisit: Validasi, Tolak, Void, Export.
- Status transaksi harus mudah dibedakan dengan badge.
- Form mobile tidak boleh terlalu panjang tanpa pengelompokan.

### 14.2 Tone Visual

- Profesional, bersih, dan administratif.
- Warna utama boleh mengikuti identitas NU/LAZISNU, tetapi jangan membuat satu halaman monoton.
- Gunakan card untuk item/data berulang, bukan untuk membungkus semua section.
- Tabel desktop harus mudah discan.
- Mobile memakai list yang ringkas.

### 14.3 Copywriting

- Gunakan Bahasa Indonesia.
- Hindari istilah teknis untuk petugas lapangan.
- Gunakan istilah konsisten:
  - Rumah donatur
  - Kaleng
  - Penarikan
  - Validasi
  - Kas masuk
  - Kas keluar
  - Transparansi

## 15. Non-Functional Requirements

### 15.1 Security

- Password wajib di-hash.
- Session harus httpOnly.
- API internal wajib cek authentication.
- API mutasi wajib cek permission.
- Input nominal, tanggal, status, dan relasi wajib divalidasi server-side.
- Data publik wajib disaring di server.
- Audit log metadata tidak boleh menyimpan password, token, atau secret mentah.

### 15.2 Performance

- Halaman dashboard internal target load < 3 detik pada jaringan normal.
- Query dashboard memakai agregasi server/database.
- Sistem harus sanggup menangani minimal 5000 rumah dan 100.000 transaksi penarikan.
- Tabel besar harus memakai pagination atau infinite loading terkontrol.

### 15.3 Reliability

- Deployment tidak boleh menghapus data.
- Database harus dibackup otomatis.
- Error integrasi WhatsApp tidak boleh menggagalkan transaksi utama.
- Health check production wajib tersedia.

### 15.4 Backup dan Restore

- Backup database harian.
- Retensi minimal 7 hari.
- Retensi ideal 30 hari.
- Restore harus diuji sebelum sistem dipakai produksi penuh.

### 15.5 Observability

- Log error server harus tersedia.
- Build Jenkins harus mencatat commit yang dideploy.
- Container production harus memiliki restart policy.
- Health check minimal endpoint halaman utama atau API health.

## 16. Arsitektur Target

### 16.1 Prinsip

- Repo tetap fullstack agar pengembangan cepat.
- Business logic kritikal berada di server.
- Komponen UI dipisah dari service data.
- Integrasi eksternal dibuat modular.
- Hindari menyimpan state bisnis hanya di client.

### 16.2 Stack Target

| Area | Pilihan |
| --- | --- |
| Web framework | Next.js App Router |
| Bahasa | TypeScript |
| Styling | Tailwind CSS |
| Database | MySQL atau PostgreSQL |
| ORM/query | Prisma atau query layer terstruktur |
| Auth | Credential login dengan session |
| Export | PDF dan XLSX server-side |
| Storage | Local volume dulu, R2/S3 saat perlu |
| Deployment | Docker, Docker Compose, Jenkins |
| Tunnel | Cloudflare Tunnel |

Catatan database: server saat ini sudah memiliki MySQL container. Jika ingin cepat produksi di server yang ada, MySQL adalah pilihan paling praktis. PostgreSQL boleh dipakai jika ada alasan teknis kuat dan disiapkan deployment-nya.

## 17. CI/CD dan Deployment

### 17.1 Kondisi Saat Ini

Job Jenkins:

```text
LAZISNU-PAKISKEMBAR
```

Repo:

```text
https://github.com/Misyad/lazsinupakiskembar.git
```

Branch:

```text
main
```

Container:

```text
lazisnu-pakiskembar-app
```

Port:

```text
host 3002 -> container 3000
```

Domain tunnel:

```text
https://lazisnupakem.projecthasan.com
```

### 17.2 Pipeline Wajib

- Checkout.
- Docker build.
- Install dependency dengan `npm ci`.
- Lint.
- Build Next.js.
- Deploy Docker Compose.
- Health check.

### 17.3 Aturan Deployment

- Jangan commit `node_modules`.
- Jangan commit `.next`.
- Jangan commit secret.
- Semua env production harus lewat environment file/secret server.
- Build gagal harus menghentikan deploy.
- Health check gagal harus dianggap deployment gagal.

## 18. Environment dan Konfigurasi

### 18.1 Environment Target

```text
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=3000
```

Saat sudah memakai database:

```text
DATABASE_URL=
SESSION_SECRET=
APP_URL=
WHATSAPP_PROVIDER=
WHATSAPP_API_KEY=
```

### 18.2 Secret Handling

- Secret tidak boleh masuk repo.
- Secret disimpan di Jenkins credentials, `.env` server, atau secret manager.
- Dokumentasi boleh menyebut nama env, bukan nilai secret.

## 19. Roadmap

### Phase 0: MVP Dummy dan CI/CD

Status: berjalan.

Target:

- UI dummy tersedia.
- Docker deployment tersedia.
- Jenkins job tersedia.
- Domain tunnel aktif.
- PRD menjadi pedoman.

Exit criteria:

- Build Jenkins sukses.
- App bisa dibuka via domain tunnel.
- PRD lengkap tersimpan di repo.

### Phase 1: Fondasi Backend

Target:

- Database schema.
- Migration.
- Seed role awal.
- Auth login nyata.
- Session.
- Protected admin area.
- API dasar rumah, kaleng, dan penarikan.

Exit criteria:

- Data tidak hilang saat refresh.
- Role login berbeda menghasilkan akses berbeda.
- Mutasi data melewati API.

### Phase 2: Operasional KOIN NU

Target:

- CRUD rumah produksi.
- CRUD kaleng produksi.
- Assign kaleng.
- QR generation.
- Input penarikan.
- Validasi bendahara.
- Audit log dasar.

Exit criteria:

- Satu siklus rumah -> kaleng -> penarikan -> validasi -> saldo berjalan dari database.

### Phase 3: Keuangan dan Laporan

Target:

- Kas masuk otomatis dari penarikan tervalidasi.
- Kas keluar.
- Rekap saldo.
- Laporan periodik.
- Export PDF/Excel.
- Filter laporan.

Exit criteria:

- Bendahara bisa membuat laporan bulanan siap cetak.

### Phase 4: Transparansi Publik

Target:

- Halaman publik dari data terpublikasi.
- Publikasi laporan.
- Dokumentasi program.
- Sanitasi data sensitif.

Exit criteria:

- Publik bisa melihat ringkasan dana tanpa akses data internal.

### Phase 5: Integrasi dan Hardening

Target:

- WhatsApp notification.
- Import Excel.
- Backup otomatis.
- Audit log lengkap.
- Monitoring error.
- Optimasi mobile lapangan.

Exit criteria:

- Sistem siap dipakai operasional ranting secara rutin.

## 20. Acceptance Criteria Global

Sebuah fitur dianggap selesai jika:

- Data tersimpan di backend/database jika fitur tersebut bukan dummy.
- Validasi server-side tersedia.
- Permission role diterapkan.
- UI responsive.
- Loading, empty state, dan error state ditangani.
- Aksi penting tercatat audit log.
- Tidak membocorkan data sensitif.
- Lint dan build lolos.
- Jika menyentuh deployment, Jenkins build harus sukses.

## 21. Testing Strategy

### 21.1 Manual Test Wajib

- Login tiap role.
- Akses halaman sesuai role.
- Tambah rumah.
- Assign kaleng.
- Input penarikan.
- Validasi penarikan.
- Tolak penarikan.
- Lihat saldo.
- Export laporan.
- Akses halaman publik.

### 21.2 Automated Test Target

- Unit test helper validasi.
- Test permission server.
- Test kalkulasi saldo.
- Test API mutasi utama.
- Test sanitasi data publik.

## 22. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Data manual awal tidak rapi | Import sulit | Sediakan template Excel dan validasi import |
| Petugas tidak terbiasa aplikasi | Input lambat | Mobile-first dan alur sederhana |
| Role terlalu longgar | Data bocor | RBAC server-side |
| Saldo tidak konsisten | Laporan tidak dipercaya | Transaksi immutable, validasi bendahara, audit log |
| Tunnel/domain gagal | Akses publik terganggu | Health check origin dan DNS checklist |
| Backup tidak diuji | Risiko kehilangan data | Jadwalkan restore test |

## 23. Keputusan Teknis yang Dikunci

- Produk utama tetap bernama KOINNU Ranting System.
- Bahasa UI dan dokumen produk menggunakan Bahasa Indonesia.
- Project ini bukan MPJ Event dan tidak boleh memakai asumsi domain bisnis MPJ Event.
- Port production saat ini adalah `3002` di host/LXC.
- Job Jenkins saat ini adalah `LAZISNU-PAKISKEMBAR`.
- Repo utama adalah `https://github.com/Misyad/lazsinupakiskembar.git`.
- PRD ini menjadi pedoman utama sampai digantikan oleh revisi berikutnya.

## 24. Definisi Done untuk Phase Berikutnya

Phase backend pertama dianggap selesai jika:

- Ada schema database.
- Ada auth nyata.
- Ada role Super Admin, Admin Ranting, Petugas Lapangan, Bendahara.
- Ada API rumah, kaleng, dan penarikan.
- Ada audit log minimal.
- UI tidak lagi bergantung pada dummy state untuk data utama.
- Jenkins build dan deploy sukses.
- Domain production bisa dibuka.

