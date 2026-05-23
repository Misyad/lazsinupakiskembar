# PRD KOINNU Ranting System

## 1. Ringkasan Produk

**Nama produk:** KOINNU Ranting System  
**Jenis produk:** Web-based management system  
**Pemilik proses:** Pengurus Ranting LAZISNU  
**Tujuan utama:** digitalisasi pengelolaan GERAKAN KOIN NU dari distribusi kaleng, pendataan rumah donatur, penarikan koin, rekap keuangan, laporan transparansi, sampai monitoring petugas lapangan.

KOINNU Ranting System dirancang sebagai sistem terpusat untuk membantu ranting LAZISNU mengelola dana umat secara rapi, transparan, mudah diaudit, dan mudah digunakan oleh petugas lapangan maupun pengurus.

## 2. Latar Belakang

Program GERAKAN KOIN NU sering menghadapi kendala operasional berikut:

- Data rumah donatur tidak rapi.
- Kaleng KOIN NU tidak terdata dengan baik.
- Rekap penarikan masih manual.
- Laporan terlambat dan sulit diverifikasi.
- Transparansi kepada masyarakat belum real-time.
- Audit internal sulit dilakukan karena jejak transaksi kurang lengkap.

Sistem digital dibutuhkan agar ranting dapat bekerja lebih profesional, mengurangi risiko manipulasi data, mempercepat laporan, dan meningkatkan kepercayaan masyarakat.

## 3. Tujuan Bisnis dan KPI

### Tujuan Bisnis

- Digitalisasi administrasi LAZISNU ranting.
- Meningkatkan transparansi dana umat.
- Mengurangi pekerjaan rekap manual.
- Mempermudah audit dan pertanggungjawaban.
- Meningkatkan kepercayaan masyarakat kepada gerakan sedekah KOIN NU.

### KPI Utama

| KPI | Target |
| --- | --- |
| Rumah aktif | 1000+ |
| Akurasi data | 95% |
| Laporan otomatis | 100% |
| Penarikan tepat waktu | 90% |
| Transparansi publik | Real-time |

## 4. Scope Produk

### In Scope

- Dashboard operasional.
- Pendataan rumah donatur.
- Pendataan dan tracking kaleng.
- Generate QR kaleng.
- Input penarikan koin.
- Validasi transaksi oleh bendahara.
- Rekap kas masuk dan kas keluar.
- Audit log.
- Laporan harian, mingguan, bulanan, tahunan, per RT, dan per petugas.
- Export PDF dan Excel.
- Multi user role.
- WhatsApp notification.
- Monitoring wilayah.
- Halaman transparansi publik.

### Out of Scope Phase Awal

- Mobile app native.
- AI analytics.
- Payment gateway kompleks.
- Integrasi bank otomatis.

## 5. Role dan Permission

| Role | Akses Utama |
| --- | --- |
| Super Admin | Mengelola seluruh data, setting sistem, role, permission, user, dan konfigurasi global. |
| Admin Ranting | Mengelola rumah donatur, kaleng, petugas, laporan ranting, dan input penyaluran. |
| Petugas Lapangan | Scan QR kaleng, melihat data rumah terkait tugas, input hasil penarikan, update status rumah. |
| Bendahara | Validasi pemasukan, input kas keluar, rekap saldo, export laporan keuangan. |
| Viewer Publik | Melihat ringkasan transparansi dana yang sudah dipublikasikan. |

### Prinsip Permission

- Semua halaman admin wajib dilindungi authentication.
- Semua API internal wajib memvalidasi role dan permission.
- Viewer publik tidak boleh mengakses data personal rumah, nomor HP, catatan internal, atau audit log.
- Aksi create, update, delete, validasi, dan export wajib tercatat di audit log.

## 6. Modul Produk

### A. Dashboard

Dashboard menampilkan kondisi operasional secara ringkas dan real-time.

Komponen utama:

- Total rumah aktif.
- Total kaleng aktif.
- Total pemasukan bulan ini.
- Grafik pemasukan.
- Wilayah terbaik.
- Petugas aktif.
- Penarikan menunggu validasi.
- Saldo kas terkini.

Acceptance criteria:

- Data dashboard diperbarui kurang dari 5 detik setelah transaksi penting tersimpan.
- Tampilan responsive pada desktop dan mobile.
- Statistik mengikuti permission role pengguna.
- Data publik dan data internal dipisahkan.

### B. Manajemen Rumah Donatur

Modul ini digunakan untuk mendata rumah penerima kaleng.

Field utama:

| Field | Tipe | Keterangan |
| --- | --- | --- |
| ID Rumah | Auto | ID internal sistem. |
| Nama Kepala Keluarga | Text | Nama penanggung jawab rumah. |
| Nomor HP | Text | Nomor kontak keluarga. |
| Alamat | Text | Alamat lengkap. |
| RT/RW | Text | Wilayah administrasi kecil. |
| Desa | Text | Desa atau dusun. |
| Status Aktif | Boolean | Aktif atau nonaktif. |
| Tanggal Bergabung | Date | Tanggal mulai menjadi donatur. |
| Nomor Kaleng | Relation | Relasi ke kaleng aktif. |

Fitur:

- Tambah, edit, dan hapus data rumah.
- Search nama, nomor HP, alamat, dan nomor kaleng.
- Filter RT/RW, desa, dan status aktif.
- Import Excel.
- Riwayat distribusi kaleng.

Acceptance criteria:

- Satu rumah dapat memiliki maksimal satu kaleng aktif pada satu waktu.
- Data nomor HP divalidasi formatnya.
- Import Excel menampilkan hasil sukses dan gagal.
- Perubahan status rumah tercatat di audit log.

### C. Manajemen Kaleng

Modul ini digunakan untuk tracking kaleng KOIN NU.

Format nomor kaleng:

```text
KNU-RT01-001
```

Field utama:

| Field | Tipe | Keterangan |
| --- | --- | --- |
| Nomor Kaleng | String | Nomor unik kaleng. |
| Status | Enum | Active, Lost, Damaged, Inactive. |
| Rumah Pemilik | Relation | Rumah yang sedang memegang kaleng. |
| Tanggal Distribusi | Date | Tanggal kaleng diberikan. |
| QR Code | Generated | QR berisi identifier kaleng. |

Fitur:

- Generate nomor kaleng.
- Generate QR.
- Cetak label.
- Tracking status kaleng.
- Riwayat pemindahan kaleng.

Acceptance criteria:

- Nomor kaleng unik dan tidak bisa dipakai ganda.
- QR mengarah ke data kaleng yang valid.
- Kaleng hilang atau rusak tidak bisa digunakan untuk penarikan aktif.
- Semua perubahan status tercatat di audit log.

### D. Penarikan Koin

Modul ini digunakan petugas untuk input hasil pengambilan koin.

Flow utama:

1. Petugas scan QR kaleng.
2. Sistem menampilkan data rumah dan kaleng.
3. Petugas input nominal dan catatan.
4. Sistem menyimpan transaksi sebagai pending validation.
5. Bendahara memvalidasi transaksi.
6. Transaksi valid masuk ke dashboard dan laporan keuangan resmi.

Field utama:

| Field | Tipe | Keterangan |
| --- | --- | --- |
| ID Transaksi | Auto | ID internal transaksi. |
| Nomor Kaleng | Relation | Kaleng yang ditarik. |
| Jumlah | Currency | Nominal hasil penarikan. |
| Petugas | Relation | User petugas lapangan. |
| Tanggal | DateTime | Waktu input penarikan. |
| Catatan | Text | Catatan tambahan. |
| Status Validasi | Enum | Pending, Validated, Rejected. |

Acceptance criteria:

- Nominal wajib lebih dari 0.
- Petugas hanya bisa input penarikan untuk kaleng aktif.
- Transaksi pending belum menambah saldo resmi.
- Bendahara dapat menerima atau menolak transaksi dengan catatan.
- Bukti transaksi dapat dibuat setelah transaksi tersimpan.

### E. Keuangan

Modul keuangan mengelola kas masuk, kas keluar, saldo, validasi, dan audit.

Fitur:

- Kas masuk dari penarikan yang tervalidasi.
- Kas keluar untuk penyaluran atau biaya operasional.
- Saldo real-time.
- Validasi transaksi.
- Audit log keuangan.
- Rekap per periode.

Acceptance criteria:

- Saldo hanya menghitung transaksi yang sudah tervalidasi.
- Kas keluar wajib memiliki kategori, nominal, tanggal, dan catatan.
- Perubahan transaksi keuangan hanya dapat dilakukan oleh role berwenang.
- Semua aksi validasi dan perubahan kas tercatat.

### F. Laporan

Jenis laporan:

- Harian.
- Mingguan.
- Bulanan.
- Tahunan.
- Per RT.
- Per petugas.
- Per status rumah.
- Per status kaleng.

Export:

- PDF.
- Excel.

Acceptance criteria:

- Laporan dapat difilter berdasarkan tanggal, RT/RW, desa, petugas, dan status.
- Export PDF cocok untuk laporan resmi.
- Export Excel cocok untuk audit dan olah data lanjutan.
- Data laporan mengikuti transaksi tervalidasi.

### G. Transparansi Publik

Halaman publik menampilkan ringkasan dana tanpa membuka data sensitif.

Konten utama:

- Total dana terkumpul.
- Total dana disalurkan.
- Saldo publik.
- Dokumentasi penyaluran.
- Grafik pemasukan.
- Ringkasan program.

Acceptance criteria:

- Publik tidak dapat melihat nomor HP, alamat detail, catatan internal, atau identitas petugas.
- Data publik hanya menampilkan informasi yang sudah dipublikasikan.
- Halaman dapat dibuka tanpa login.
- Tampilan mobile-first dan mudah dibagikan.

### H. WhatsApp Gateway

WhatsApp digunakan sebagai kanal notifikasi operasional.

Fitur:

- Reminder jadwal penarikan.
- Broadcast laporan ringkas.
- Notifikasi donasi atau penarikan.
- Notifikasi validasi bendahara.

Vendor yang dapat digunakan:

- Fonnte.
- Evolution API.
- Baileys.

Acceptance criteria:

- Integrasi dibuat sebagai adapter agar vendor bisa diganti.
- Nomor tujuan divalidasi sebelum pengiriman.
- Status pengiriman dicatat.
- Kegagalan pengiriman tidak boleh menggagalkan transaksi utama.

## 7. User Flow

### Flow Distribusi Kaleng

```text
Admin tambah rumah
Admin generate nomor kaleng
Admin cetak QR dan label
Petugas distribusi kaleng
Rumah menjadi aktif
Sistem mencatat riwayat distribusi
```

### Flow Penarikan

```text
Petugas datang ke rumah
Petugas scan QR kaleng
Sistem menampilkan data rumah
Petugas input nominal
Transaksi tersimpan sebagai pending
Bendahara validasi
Transaksi masuk dashboard dan laporan
```

### Flow Transparansi Publik

```text
Bendahara validasi pemasukan
Admin input penyaluran
Admin publikasi ringkasan
Publik melihat laporan transparansi
```

## 8. Struktur Data Awal

### Users

```sql
id
name
email
password_hash
role
status
created_at
updated_at
```

### Houses

```sql
id
name
phone
address
rt_rw
village
status
joined_at
created_at
updated_at
```

### CoinBoxes

```sql
id
box_number
house_id
status
qr_code
distributed_at
created_at
updated_at
```

### Withdrawals

```sql
id
coin_box_id
amount
collector_id
status
notes
validated_by
validated_at
rejection_reason
created_at
updated_at
```

### CashTransactions

```sql
id
type
source
amount
category
description
reference_id
created_by
created_at
updated_at
```

### PublicReports

```sql
id
period
total_income
total_expense
balance
summary
published_at
created_by
created_at
updated_at
```

### AuditLogs

```sql
id
actor_id
action
entity_type
entity_id
metadata
created_at
```

## 9. UI Pages

| Halaman | Fungsi |
| --- | --- |
| Login | Authentication pengguna. |
| Dashboard | Statistik dan ringkasan operasional. |
| Rumah | Data rumah donatur. |
| Kaleng | Tracking kaleng dan QR. |
| Penarikan | Input dan validasi transaksi penarikan. |
| Keuangan | Kas masuk, kas keluar, saldo, dan audit keuangan. |
| Laporan | Filter dan export laporan. |
| Transparansi Publik | Ringkasan dana untuk masyarakat. |
| Pengaturan | User, role, sistem, dan integrasi WhatsApp. |

## 10. Non-Functional Requirement

### Performance

- Initial page load maksimal 3 detik pada koneksi normal.
- Mendukung minimal 5000 rumah donatur.
- Query dashboard harus memakai agregasi yang efisien.

### Security

- Authentication wajib untuk area admin.
- Password disimpan dalam bentuk hash.
- Role permission divalidasi di UI dan API.
- HTTPS wajib pada production.
- Audit log wajib untuk aksi penting.

### Backup

- Auto backup harian database.
- Backup minimal disimpan 7 sampai 30 hari sesuai kapasitas server.
- Restore database perlu diuji berkala.

### Responsive

- Mobile-first.
- Form input penarikan harus nyaman dipakai petugas lapangan.
- Dashboard tetap terbaca pada layar kecil.

## 11. Arsitektur Teknologi

Stack awal yang dikunci:

- **Frontend dan backend:** Next.js App Router.
- **Styling:** TailwindCSS.
- **Database:** PostgreSQL.
- **ORM:** Prisma.
- **Authentication:** credential login dengan session atau JWT.
- **Realtime:** polling ringan untuk MVP, Socket.IO bila kebutuhan realtime meningkat.
- **Storage:** Cloudflare R2 atau S3-compatible storage untuk dokumentasi dan bukti.
- **Export:** service internal untuk PDF dan Excel.
- **Hosting:** VPS Ubuntu.

Prinsip arsitektur:

- Satu repo fullstack untuk mempercepat MVP.
- API internal tetap dipisahkan secara jelas dari UI.
- Business rule penting berada di server.
- Role permission tidak hanya bergantung pada frontend.
- Integrasi eksternal seperti WhatsApp dibuat modular.

## 12. SOP Digital

### SOP Penarikan

- Penarikan ideal dilakukan minimal 2 petugas.
- Petugas scan QR kaleng sebelum input nominal.
- Foto bukti bersifat opsional pada phase awal.
- Transaksi wajib divalidasi bendahara.
- Selisih atau catatan khusus wajib diisi pada transaksi bermasalah.

### SOP Audit

- Rekap bulanan wajib dibuat.
- Selisih wajib dicatat dan dijelaskan.
- Export laporan disimpan oleh bendahara.
- Audit log tidak boleh diedit manual dari UI.

## 13. Roadmap

### Phase 1: Fondasi Operasional

- Login dan role dasar.
- Dashboard internal.
- Pendataan rumah.
- Pendataan kaleng.
- Input penarikan.
- Validasi bendahara.
- Rekap kas dasar.

### Phase 2: QR, Export, dan Notifikasi

- Generate dan scan QR.
- Cetak label kaleng.
- Export PDF dan Excel.
- WhatsApp reminder dan broadcast.
- Halaman transparansi publik.

### Phase 3: Analitik dan Optimasi Wilayah

- Analitik wilayah.
- Ranking RT atau wilayah terbaik.
- Monitoring performa petugas.
- Gamifikasi RT.
- Dashboard publik lebih lengkap.

### Phase 4: Ekspansi Platform

- Mobile app native.
- QRIS sedekah.
- AI prediksi donasi.
- Integrasi bank otomatis.
- Offline mode untuk petugas lapangan.

## 14. Risiko dan Mitigasi

| Risiko | Mitigasi |
| --- | --- |
| Data hilang | Auto backup harian dan prosedur restore. |
| Petugas kesulitan memakai sistem | UI sederhana, mobile-first, dan form singkat. |
| Internet lambat | Optimasi payload, cache data dasar, dan rencana offline mode. |
| Manipulasi data | Role permission, validasi bendahara, dan audit log. |
| Nomor kaleng ganda | Unique constraint pada nomor kaleng. |
| Laporan tidak dipercaya | Transparansi publik dan data tervalidasi. |

## 15. Estimasi Pengembangan

| Tahap | Durasi |
| --- | --- |
| UI/UX | 1 minggu |
| Backend foundation | 2 minggu |
| Frontend implementation | 2 minggu |
| Testing | 1 minggu |
| Deployment | 3 hari |

Estimasi total: sekitar 1,5 bulan untuk versi awal yang layak digunakan.

## 16. Acceptance Scenario Utama

- Admin dapat membuat data rumah, membuat nomor kaleng, dan menghubungkan kaleng ke rumah.
- Petugas dapat scan QR kaleng dan input nominal penarikan.
- Bendahara dapat memvalidasi atau menolak transaksi penarikan.
- Transaksi tervalidasi otomatis memengaruhi saldo dan laporan.
- Dashboard menampilkan statistik rumah, kaleng, pemasukan, saldo, dan performa wilayah.
- Laporan dapat difilter dan diekspor.
- Viewer publik hanya melihat data transparansi yang aman.
- Setiap aksi penting tercatat di audit log.

## 17. Visi Jangka Panjang

KOINNU Ranting System bukan hanya aplikasi sedekah, tetapi fondasi digital untuk pusat data sosial ranting, transparansi umat, digitalisasi NU, dan penguatan ekonomi sosial berbasis jamaah.

Target akhirnya adalah setiap rumah NU menjadi bagian dari gerakan sedekah berkelanjutan yang transparan, modern, dan mudah dipertanggungjawabkan.
