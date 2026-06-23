# User Guide - KOINNU Ranting System

## Panduan Pengguna Berdasarkan Role

### Petugas Lapangan

**Tugas Utama:** Input penarikan koin dari rumah donatur

**Workflow Input Penarikan:**

1. **Login ke Sistem**
   - Buka aplikasi di browser mobile
   - Masukkan email dan password
   - Klik "Masuk"

2. **Scan QR Kaleng (Recommended)**
   - Klik menu "Penarikan"
   - Tap icon QR Scanner
   - Arahkan kamera ke QR code pada kaleng
   - Kaleng akan ter-select otomatis

3. **Input Nominal dan Catatan**
   - Masukkan nominal uang (Rupiah)
   - Tambahkan catatan jika perlu
   - Pilih tanggal penarikan
   - Klik "Simpan sebagai Pending"

4. **Verifikasi Data**
   - Cek riwayat penarikan
   - Status akan menunjukkan "Pending"
   - Menunggu validasi bendahara

**Tips:**
- Pastikan nominal sesuai dengan isi kaleng
- Tulis catatan jika ada hal khusus
- Scan QR lebih cepat dari manual input
- Periksa koneksi internet sebelum input

### Bendahara

**Tugas Utama:** Validasi penarikan dan kelola keuangan

**Workflow Validasi Penarikan:**

1. **Lihat Penarikan Pending**
   - Klik menu "Penarikan" atau "Keuangan"
   - Filter status "Pending"
   - Periksa detail setiap penarikan

2. **Validasi Penarikan**
   - Cek nominal dan catatan
   - Verifikasi dengan bukti fisik
   - Klik "Validasi" jika benar
   - Atau klik "Tolak" jika ada masalah

3. **Input Kas Keluar (Opsional)**
   - Klik menu "Keuangan"
   - Pilih "Input Kas Keluar"
   - Masukkan kategori, nominal, deskripsi
   - Klik "Simpan"

4. **Cek Saldo dan Laporan**
   - Menu "Keuangan" untuk saldo real-time
   - Menu "Laporan" untuk ringkasan periode
   - Export PDF/Excel untuk dokumentasi

**Tips:**
- Validasi segera untuk update saldo
- Tolak dengan alasan yang jelas
- Export laporan di akhir bulan
- Backup data secara rutin

### Admin Ranting

**Tugas Utama:** Kelola rumah donatur, kaleng, dan pengguna

**Workflow Tambah Rumah:**

1. **Tambah Rumah Baru**
   - Klik menu "Rumah"
   - Klik "Tambah Rumah"
   - Isi nama, alamat, RT/RW, telpon
   - Pilih tanggal bergabung
   - Klik "Simpan"

2. **Assign Kaleng ke Rumah**
   - Klik menu "Kaleng"
   - Pilih kaleng yang available
   - Klik "Assign ke Rumah"
   - Pilih rumah tujuan
   - Konfirmasi

3. **Kelola Pengguna (Jika Ada Permission)**
   - Klik menu "Pengaturan"
   - Tambah/edit user
   - Atur role dan permission
   - Klik "Simpan"

**Tips:**
- Data rumah harus lengkap dan akurat
- Satu kaleng hanya untuk satu rumah
- Track status kaleng (active, lost, damaged)
- Review audit log untuk monitoring

## FAQ (Frequently Asked Questions)

**Q: Lupa password, bagaimana reset?**
A: Hubungi admin sistem untuk reset password.

**Q: Penarikan pending tidak bisa diedit?**
A: Hubungi bendahara untuk void, lalu input ulang.

**Q: QR Scanner tidak berfungsi?**
A: Pastikan browser memiliki izin kamera. Gunakan input manual jika perlu.

**Q: Nominal penarikan salah input?**
A: Hubungi bendahara untuk void penarikan, lalu input ulang dengan nominal benar.

**Q: Kaleng hilang, bagaimana prosedurnya?**
A: Hubungi admin untuk update status kaleng menjadi "Lost".

**Q: Export laporan error?**
A: Cek koneksi internet. Jika masih error, hubungi admin sistem.

**Q: Saldo tidak sesuai?**
A: Hanya penarikan "Tervalidasi" yang masuk saldo. Cek status penarikan.

## Troubleshooting

**Problem: Tidak bisa login**
- Pastikan email dan password benar
- Cek koneksi internet
- Clear browser cache
- Coba browser lain

**Problem: Input penarikan gagal**
- Cek koneksi internet
- Pastikan nominal > 0
- Pastikan kaleng dan rumah valid
- Refresh halaman dan coba lagi

**Problem: Halaman loading lama**
- Cek kecepatan koneksi
- Tutup aplikasi lain yang berat
- Restart browser
- Cek status server: /api/health

**Problem: Data tidak muncul**
- Refresh halaman (F5 atau pull-to-refresh)
- Logout dan login ulang
- Clear browser cache
- Hubungi admin jika masih bermasalah

## Best Practices

**Untuk Petugas:**
- Input penarikan segera setelah pengambilan
- Selalu cek nominal sebelum simpan
- Gunakan QR scanner untuk efisiensi
- Foto bukti fisik jika perlu (simpan offline)

**Untuk Bendahara:**
- Validasi penarikan maksimal 1×24 jam
- Backup laporan bulanan
- Rekonsiliasi saldo secara berkala
- Dokumentasi kas keluar lengkap

**Untuk Admin:**
- Data rumah selalu up-to-date
- Monitor status kaleng berkala
- Review audit log untuk keamanan
- Training pengguna baru

## Kontak Support

**Technical Support:**
- Email: support@lazisnupakem.org
- WhatsApp: 0812-3456-7890

**Admin Sistem:**
- Koordinator Ranting
- Email: admin@lazisnupakem.org
