# Employee Management App (Angular 18)

Aplikasi web simpel buat ngatur data karyawan (Employee Management) sama master data grup/divisi. Dibangun murni pake Angular 18 dan udah nerapin *Standalone Components*.

## Halaman & Fitur yang Tersedia

**1. Login Page**
- Halaman login simpel dengan validasi wajib isi. 
- Buat masuk, pake aja kredensial statis ini:
  - Username: `admin`
  - Password: `admin123`
- Kalo berhasil login, langsung diarahkan ke Dashboard dan status loginnya disimpen di `localStorage`.

**2. Dashboard Page**
- Nampilin *summary cards* (total karyawan, yang aktif, yang non-aktif, sama total grup).
- Ada grafik batang (*Bar Chart*) buat ngelihat sebaran karyawan di tiap grup/divisi.
- Ada grafik donat (*Donut Chart*) buat ngelihat persentase divisi dan status aktif karyawan.
- Di bagian bawah, nampilin 8 log aktivitas terbaru yang ada di sistem.

**3. Employee List Page**
- Nampilin daftar karyawan (kita pake *dummy data* lebih dari 100 baris dari file JSON).
- **Pencarian & Filter**: Bisa nyari teks (nama, email), atau filter lewat dropdown grup dan status. Search box-nya udah dikasih *debounce* 400ms, jadi browser nggak ngelag pas ngetik panjang.
- **Pagination**: Tabelnya udah dipisah per halaman. Bisa milih mau nampilin 10, 25, 50, atau 100 data sekaligus. Komponen pagination-nya dipasang di atas dan bawah tabel.
- **Sorting**: Header tabel bisa diklik buat ngurutin data (A-Z atau Z-A).
- **Aksi Tabel**:
  - **Edit**: Lari ke halaman ubah data. Kalo sukses, muncul notifikasi *toast* kuning.
  - **Delete**: Munculin modal konfirmasi hapus. Kalo di-oke-in, data kehapus dari database lokal dan muncul *toast* notifikasinya.
  - **History**: Ada ikon buat ngecek log histori si karyawan (ditampilin lewat popup modal).

**4. Add & Edit Employee Page**
- Form buat nambahin atau ngubah profil karyawan.
- Validasi komplit: Semua kolom wajib diisi. Input *Basic Salary* cuma nerima angka.
- Buat input *Birth Date*, kita pake `flatpickr`. Udah dibatasin biar nggak bisa milih tanggal di masa depan.
- Dropdown grupnya dinamis, cuma nampilin grup yang statusnya 'Active' dari Master Group.

**5. Employee Detail Page**
- Liat informasi profil karyawan secara lengkap.
- Angka gaji pokoknya otomatis udah dikonversi ke format mata uang Rupiah yang rapi.
- Kalau pencet tombol "Back", dia bakal nge-load kondisi *list* sebelumnya (jadi halaman, filter, dan sorting terakhir nggak keriset).

**6. Master Group CRUD Page**
- Master data buat nambahin/ngubah grup divisi. Di-seed awal dari file `groups.json`.
- Punya fitur *List*, *Search*, *Sorting*, dan *Pagination* persis kayak halaman Employee.
- **Ubah Status**: Bisa ubah status grup secara satuan (klik dari *badge* status) atau ubah banyak sekaligus (*bulk change*) lewat fitur centang-centang.
- **Penjagaan (Safeguard)**: Sistemnya udah pintar. Kita nggak bakal dibolehin buat ngehapus atau nge-non-aktifin grup kalau grup tersebut masih dipake sama karyawan. Nanti bakal muncul *toast* peringatan merah.
- Form tambah dan ubah grup dibikin satu standar ukuran lebarnya biar selaras sama form employee.
- Semua list grup, baik di tabel master, atau di halaman karyawan, bisa diklik buat lompat ke detail grupnya.

**7. Employee Report Page**
- Fitur *Report* dengan **Infinite Scroll**. Datanya diload bertahap per-batch pake metode *Async Generator (yield)*. Jadi walau datanya ribuan, *browser* nggak bakal ngehang.
- Datanya tetep bisa difilter (berdasarkan kata kunci, grup, atau status).
- **Print**: Bisa langsung cetak laporan. Layoutnya udah disesuaikan biar rapi dan judul kolom (*thead*) nggak dobel-dobel di tiap halaman.
- **Export to Excel**: Laporan bisa diunduh ke file `.tsv` yang ramah Excel, dan gajinya otomatis diformat jadi angka Rupiah.

**8. Shared Components & Helpers**
- Kode HTML-nya dibikin rapi dan *clean*. Bagian UI yang diulang-ulang (kayak Header, Breadcrumb, Pagination, Modal Confirm Delete, Modal History) udah dipisah jadi komponen sendiri (*Reusable Shared Component*).
- Fungsi-fungsi buat urusan ganti format tanggal, uang, atau algoritma *generator pagination*, dikumpulin jadi satu di folder *helpers*.

---

## Environment & Prerequisite
- **Node.js**: v18+ (lebih disarankan pake v20 LTS atau v22 LTS)
- **NPM**: v9+
- **Angular CLI**: v18 (udah nempel di dependency *package.json*)

## Cara Menjalankan Project

**1. Siapin Environment**
Sama ratain nama `.env.example` di root folder jadi `.env`. Boleh jalanin *command* ini di terminal:
```bash
cp .env.example .env
```

**2. Install Dependency**
Jalanin perintah ini buat nge-download semua library pendukungnya:
```bash
npm install
```

**3. Jalanin Aplikasi Lokal (Dev Mode)**
Nyalain *local server* Angular-nya pake:
```bash
npm run start
```
Tunggu sampai selesai *compile*, abis itu buka browser dan ketik: `http://localhost:4200/`

**4. Build Aplikasi (Mode Produksi)**
Kalo aplikasinya udah *ready* buat dirilis dan mau nge-build ke dalam folder `dist/`, jalanin:
```bash
npm run build
```
