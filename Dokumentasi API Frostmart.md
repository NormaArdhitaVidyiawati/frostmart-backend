# Dokumentasi API Lengkap & Terbaru - FrostMart

Dokumen ini berisi dokumentasi terpadu untuk seluruh layanan API di backend FrostMart, mencakup alur otentikasi (Auth), manajemen pengguna (Users), manajemen produk (Products & Image Upload), pesanan (Orders), transaksi (Transactions), pencatatan stok (Inventory Logs), serta konfigurasi caching Redis.

---

## 1. Informasi Umum & Konfigurasi

### 1.1 Detail Koneksi & Standar API
- **Base URL API:** `http://localhost:5000/api`
- **Collection Postman:** `Frostmart API.postman_collection.json`
- **Content-Type Utama:** `application/json`
- **Otentikasi:** Token JWT Bearer pada header `Authorization: Bearer <access_token>` atau via Cookies.

### 1.2 Hak Akses (Authorization)
- **Public:** Tanpa token (dapat diakses oleh siapa saja).
- **Login:** Memerlukan token pengguna/admin yang valid.
- **Admin:** Memerlukan token pengguna dengan klaim `"role": "admin"`.

### 1.3 Alur Otentikasi & Penyimpanan Token
- **Access Token:** Menggunakan stateless JWT dengan masa kedaluwarsa **1 jam**.
- **Refresh Token:** Menggunakan stateless JWT dengan masa kedaluwarsa **7 hari**.
- **Penyimpanan Token:** Disimpan di sisi client menggunakan HTTP-Only Cookie (`access_token` dan `refresh_token`).
- **Catatan Local Development:** Cookie diset dengan atribut `secure=true`. Pada koneksi HTTP lokal (non-HTTPS), beberapa client/browser mungkin tidak mengirim cookie secara otomatis. Sebagai solusi alternatif saat pengujian API:
  - Kirim token akses via header `Authorization: Bearer <access_token>`.
  - Kirim token refresh via header `x-refresh-token`.

### 1.4 Standar Format Response
Respons API secara umum mengembalikan data langsung atau dibungkus dalam bentuk objek. Contoh format terpadu:
```json
{
  "status": "success",
  "data": [],
  "message": "ok"
}
```

---

## 2. Konfigurasi Caching Redis & Invalidation

Untuk mempercepat performa aplikasi, caching menggunakan Redis dipasang pada beberapa endpoint utama.

### 2.1 Endpoint yang Menggunakan Cache
- `GET /api/products` (Daftar produk dengan pagination & pencarian)
- `GET /api/products/:id` (Detail spesifik produk)

Setiap respons dari endpoint di atas akan memuat properti `"source"` pada level teratas:
- `"source": "db"` : Menandakan *cache miss* (data diambil langsung dari database PostgreSQL).
- `"source": "cache"` : Menandakan *cache hit* (data diambil cepat dari memori Redis).

### 2.2 Aturan Caching & Konfigurasi
- **Redis Key Pattern:**
  - Pencarian/List: `cache:/api/products?page=1&limit=10...` (menggunakan URL request asli sebagai key).
  - Detail Produk: `cache:/api/products/:id`
  - Metadata Foto Produk: `product:image:{id}` (digunakan oleh layanan upload foto).
- **Default TTL (Time-to-Live):** 60 detik.
- **Konfigurasi `.env` untuk Redis:**
  ```env
  REDIS_HOST=localhost
  REDIS_PORT=6379
  REDIS_USERNAME=
  REDIS_PASSWORD=
  ```
  *(Untuk Redis Cloud, isi `REDIS_USERNAME=default` dan lengkapi host, port, beserta password).*

### 2.3 Penghapusan Cache (Cache Invalidation)
Cache produk akan otomatis dihapus (*invalidated*) dengan pola `cache:/api/products*` ketika terjadi aksi manipulasi data berikut:
- Penambahan produk baru (`createProduct`)
- Pembaruan produk (`updateProduct`)
- Penghapusan produk (`deleteProduct`)
- Upload/Ganti/Hapus Foto Produk (`uploadProductPhoto`, `replaceProductPhoto`, `deleteProductPhoto`)
- Pembelian baru (`orders.checkout` - karena stok produk berkurang)
- Penyesuaian stok manual (`inventory-logs.adjust`)

### 2.4 Redis CLI Cheatsheet
```bash
# Melihat semua key cache produk
KEYS cache:/api/products*

# Melihat key metadata foto produk
KEYS product:image:*

# Membaca data cache daftar produk
GET "cache:/api/products?page=1&limit=10"

# Mengecek sisa waktu simpan cache (TTL)
TTL "cache:/api/products?page=1&limit=10"

# Menghapus cache tertentu secara manual
DEL "cache:/api/products?page=1&limit=10"
```

---

## 3. Rincian API Endpoint

### 3.1 AUTHENTICATION API

#### 3.1.1 Registrasi User Baru (Signup)
- **URL:** `/auth/local/signup`
- **Method:** `POST`
- **Akses:** Public
- **Validasi Input:**
  - `name`: string, min 3, max 225
  - `email`: format email valid
  - `password`: string, min 6
- **Request Body:**
  ```json
  {
    "name": "User Baru",
    "email": "user@frostmart.local",
    "password": "User12345"
  }
  ```
- **Response Sukses (201 Created):**
  ```json
  {
    "user": {
      "id": 2,
      "name": "User Baru",
      "email": "user@frostmart.local",
      "role": "user"
    }
  }
  ```

#### 3.1.2 Masuk Aplikasi (Signin)
- **URL:** `/auth/local/signin`
- **Method:** `POST`
- **Akses:** Public
- **Request Body:**
  ```json
  {
    "email": "user@frostmart.local",
    "password": "User12345"
  }
  ```
- **Response Sukses (200 OK):**
  ```json
  {
    "user": {
      "id": 2,
      "name": "User Baru",
      "email": "user@frostmart.local",
      "role": "user"
    }
  }
  ```

#### 3.1.3 Segarkan Token Akses (Refresh Token)
- **URL:** `/auth/refresh-token`
- **Method:** `POST`
- **Akses:** Public
- **Header Opsional:** `x-refresh-token: <refresh_token>`
- **Response Sukses (200 OK):**
  ```json
  {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
  ```

#### 3.1.4 Ambil Informasi Akun Aktif (Get Me)
- **URL:** `/auth/user/me`
- **Method:** `GET`
- **Akses:** Login (User/Admin)
- **Response Sukses (200 OK):**
  ```json
  {
    "id": 2,
    "name": "User Baru",
    "email": "user@frostmart.local",
    "role": "user"
  }
  ```

#### 3.1.5 Perbarui Profil Akun Aktif (Update Me)
- **URL:** `/auth/user/me`
- **Method:** `PUT`
- **Akses:** Login
- **Validasi Input:**
  - `name`: string, min 3, max 225 (wajib)
  - `email`: optional
  - `password`: optional, min 6
- **Request Body:**
  ```json
  {
    "name": "Nama Baru User",
    "password": "PasswordBaru123"
  }
  ```
- **Response Sukses (200 OK):**
  ```json
  {
    "id": 2,
    "name": "Nama Baru User",
    "email": "user@frostmart.local",
    "role": "user"
  }
  ```

#### 3.1.6 Keluar Aplikasi (Logout)
- **URL:** `/auth/remove-session`
- **Method:** `DELETE`
- **Akses:** Login
- **Response Sukses (200 OK):**
  ```json
  {
    "message": "Logged out successfully"
  }
  ```

---

### 3.2 USERS API (ADMIN ONLY)

#### 3.2.1 Mengambil Daftar Pengguna
- **URL:** `/users`
- **Query Params:** `page` (default 1), `limit` (default 10), `search`
- **Method:** `GET`
- **Akses:** Admin
- **Response Sukses (200 OK):**
  ```json
  {
    "page": 1,
    "limit": 10,
    "search": "",
    "total_pages": 1,
    "data": [
      {
        "id": 2,
        "name": "Nama Baru User",
        "email": "user@frostmart.local",
        "role": "user"
      }
    ]
  }
  ```

#### 3.2.2 Mengambil Detail Pengguna By ID
- **URL:** `/users/:id`
- **Method:** `GET`
- **Akses:** Admin
- **Response Sukses (200 OK):**
  ```json
  {
    "id": 2,
    "name": "Nama Baru User",
    "email": "user@frostmart.local",
    "role": "user"
  }
  ```

#### 3.2.3 Mengubah Role Pengguna
- **URL:** `/users/:id/role`
- **Method:** `PATCH`
- **Akses:** Admin
- **Request Body:**
  ```json
  {
    "role": "admin"
  }
  ```
- **Response Sukses (200 OK):** Mengembalikan objek profil pengguna yang telah diperbarui.

#### 3.2.4 Menghapus Pengguna
- **URL:** `/users/:id`
- **Method:** `DELETE`
- **Akses:** Admin (Catatan: Admin tidak dapat menghapus akunnya sendiri).
- **Response Sukses (200 OK):**
  ```json
  {
    "message": "User deleted successfully"
  }
  ```

---

### 3.3 PRODUCTS API

#### 3.3.1 Mengambil Daftar Produk (Ter-caching)
- **URL:** `/products`
- **Query Params:** `page` (default 1), `limit` (default 20), `search` (nama produk)
- **Method:** `GET`
- **Akses:** Public
- **Response Sukses (200 OK):**
  ```json
  {
    "source": "db",
    "page": 1,
    "limit": 20,
    "search": "",
    "total_pages": 1,
    "data": [
      {
        "id": 1,
        "name": "Frozen Nugget Premium",
        "price": 52000,
        "stock": 120,
        "category": "Frozen Chicken",
        "brand": "Frostmart",
        "sku_code": "FN-PREM-01",
        "visibility_status": "active",
        "size": "500g",
        "shelf_life": "12 Bulan",
        "certification": "Halal MUI",
        "created_at": "2026-06-11T03:00:00.000Z"
      }
    ]
  }
  ```

#### 3.3.2 Mengambil Detail Produk By ID
- **URL:** `/products/:id`
- **Method:** `GET`
- **Akses:** Public
- **Response Sukses (200 OK):**
  ```json
  {
    "source": "cache",
    "id": 1,
    "name": "Frozen Nugget Premium",
    "description": "Nugget ayam beku premium ukuran keluarga",
    "price": 52000,
    "stock": 120,
    "category": "Frozen Chicken",
    "brand": "Frostmart",
    "sku_code": "FN-PREM-01",
    "visibility_status": "active",
    "size": "500g",
    "shelf_life": "12 Bulan",
    "certification": "Halal MUI",
    "created_at": "2026-06-11T03:00:00.000Z",
    "image": {
      "url": "https://res.cloudinary.com/...",
      "public_id": "products/abcd1234"
    }
  }
  ```

#### 3.3.2.1 Manajemen Metadata & Upload Foto Produk (Multer + Cloudinary)
- **Mekanisme Penyimpanan:** File fisik dikirim ke folder `products` di Cloudinary. Metadata URL serta public_id disimpan di Redis key `product:image:{id}`.
- **Validasi Upload Middleware:**
  - Batas ukuran file maksimal: **512 KB**
  - Tipe format file: `image/png`, `image/jpeg`, `image/jpg`, `image/webp`
  - Nama parameter form-data multipart wajib: `image`

- **POST /api/products/photo/:id** (Upload foto baru)
  - **Akses:** Admin
  - **Body (form-data):** `image` (tipe File)
  - **Response 201:** `{"message": "Upload berhasil", "data": "https://res.cloudinary.com/..."}`

- **PUT /api/products/photo/:id** (Mengganti foto lama)
  - **Akses:** Admin
  - **Body (form-data):** `image` (tipe File)
  - **Response 200:** `{"message": "Foto diganti", "data": "https://res.cloudinary.com/..."}`
  *(Sistem akan otomatis menghapus file foto lama di Cloudinary terlebih dahulu)*.

- **DELETE /api/products/photo/:id** (Menghapus foto produk)
  - **Akses:** Admin
  - **Response 200:** `{"message": "Foto dihapus"}`

---

#### 3.3.3 Menambah Produk Baru
- **URL:** `/products`
- **Method:** `POST`
- **Akses:** Admin
- **Validasi Input:**
  - `name`: string, min 3 (wajib)
  - `price`: angka, > 0 (wajib)
  - `stock`: angka integer, >= 0 (wajib)
  - `category`: string (optional, default: 'Uncategorized')
  - `sku_code`: string (optional)
  - `visibility_status`: enum 'active'/'draft' (default: 'active')
  - `brand`: string (optional, default: 'Frostmart')
  - `size`: string (optional)
  - `shelf_life`: string (optional)
  - `certification`: string (optional)
- **Request Body:**
  ```json
  {
    "name": "Sosis Sapi Jumbo",
    "price": 60000,
    "stock": 50,
    "category": "Sosis",
    "sku_code": "SOS-JUMB-02",
    "brand": "Frostmart",
    "size": "1kg",
    "shelf_life": "6 Bulan",
    "certification": "Halal MUI"
  }
  ```
- **Response Sukses (201 Created):** Mengembalikan objek produk baru lengkap dengan kolom yang baru ditambahkan.

#### 3.3.4 Memperbarui Data Produk
- **URL:** `/products/:id`
- **Method:** `PUT`
- **Akses:** Admin
- **Request Body:** Format sama dengan penambahan produk.
- **Response Sukses (200 OK):** Mengembalikan objek produk terupdate.

#### 3.3.5 Menghapus Produk
- **URL:** `/products/:id`
- **Method:** `DELETE`
- **Akses:** Admin
- **Response Sukses (200 OK):**
  ```json
  {
    "message": "Product deleted successfully"
  }
  ```

---

### 3.4 ORDERS API

#### 3.4.1 Checkout (Membuat Pesanan Baru)
- **URL:** `/orders/checkout`
- **Method:** `POST`
- **Akses:** Login
- **Request Body (Multipart Form-Data):**
  - `items`: JSON array string berisi objek item belanja (berisi `product_id` dan `quantity`).
  - `payment_method` / `paymentMethod`: nama metode pembayaran.
  - `shippingAddress` / `shipping_address`: alamat pengiriman (optional, string).
  - `payment_proof` (File): Bukti pembayaran transfer (wajib diunggah jika metode pembayaran non-COD).
- **Response Sukses (201 Created):**
  ```json
  {
    "order": {
      "id": 10,
      "user_id": 2,
      "total_price": 52000,
      "status": "pending",
      "shipping_address": "Jalan Semangka Raya, Cikarang Barat (Penerima: User Baru)",
      "items": [
        {
          "product_id": 1,
          "productName": "Frozen Nugget Premium",
          "quantity": 1,
          "price": 52000
        }
      ]
    },
    "transaction": {
      "id": 7,
      "order_id": 10,
      "payment_method": "Transfer Bank",
      "payment_status": "pending",
      "payment_proof_url": "https://res.cloudinary.com/..."
    }
  }
  ```

#### 3.4.2 Mengambil Pesanan Saya (Get My Orders)
- **URL:** `/orders/my`
- **Method:** `GET`
- **Akses:** Login
- **Response Sukses (200 OK):** Mengembalikan array daftar pesanan milik pengguna yang login.

#### 3.4.3 Mengambil Detail Pesanan By ID
- **URL:** `/orders/:id`
- **Method:** `GET`
- **Akses:** Login (Khusus pemilik pesanan atau admin)
- **Response Sukses (200 OK):** Mengembalikan detail pesanan, daftar item, dan informasi transaksi terkait.

#### 3.4.4 Mengambil Semua Pesanan (Admin)
- **URL:** `/orders`
- **Method:** `GET`
- **Akses:** Admin
- **Response Sukses (200 OK):** Mengembalikan seluruh data transaksi pesanan di aplikasi.

#### 3.4.5 Mengubah Status Pesanan
- **URL:** `/orders/:id/status`
- **Method:** `PATCH`
- **Akses:** Admin
- **Request Body:**
  ```json
  {
    "status": "paid" 
  }
  ```
  *(Status pilihan: `pending`, `paid`, `cancelled`, `completed`)*.
- **Aturan Bisnis & Validasi:**
  - Status order hanya boleh diganti ke `paid` atau `completed` apabila pembayaran transaksi pesanan tersebut telah terverifikasi/lunas (`payment_status === 'paid'`).
  - Bila status pesanan diubah ke `cancelled`, stok produk yang dipesan otomatis dikembalikan (*restock*) dan perubahan dicatat di `inventory_log` dengan tipe `IN`.
  - **Aturan Pembatalan Otomatis (Order Expiration):**
    - Pesanan non-COD (`Transfer Bank`, `E-Wallet`, `QRIS`) yang berstatus `pending` ("Menunggu") akan secara otomatis dibatalkan oleh sistem setelah **10 menit** sejak waktu dibuat jika user **belum mengunggah bukti pembayaran** (`payment_proof_url` kosong/null) **dan** status pembayaran transaksi belum menjadi `paid` ("Lunas").
    - Jika user sudah mengunggah bukti pembayaran atau status transaksi diubah menjadi `paid` ("Lunas"), pesanan **tidak akan dibatalkan secara otomatis** setelah 10 menit untuk memberikan kesempatan bagi admin memverifikasi pembayaran secara manual di rekening/e-wallet.

---

### 3.5 TRANSACTIONS API

#### 3.5.1 Mengambil Transaksi Saya
- **URL:** `/transactions/my`
- **Method:** `GET`
- **Akses:** Login
- **Response Sukses (200 OK):** Daftar riwayat transaksi pembayaran milik pengguna.

#### 3.5.2 Mengambil Detail Transaksi By ID
- **URL:** `/transactions/:id`
- **Method:** `GET`
- **Akses:** Login (Pemilik transaksi atau admin)

#### 3.5.3 Mengambil Semua Transaksi (Admin)
- **URL:** `/transactions`
- **Method:** `GET`
- **Akses:** Admin

#### 3.5.4 Konfirmasi/Verifikasi Status Pembayaran Transaksi
- **URL:** `/transactions/:id/status`
- **Method:** `PATCH`
- **Akses:** Admin
- **Request Body:**
  ```json
  {
    "payment_status": "paid"
  }
  ```
  *(Status pilihan: `pending`, `paid`, `failed`, `refunded`)*.
- **Response Sukses (200 OK):** Objek transaksi terupdate.

---

### 3.6 INVENTORY LOGS API (ADMIN ONLY)

#### 3.6.1 Mengambil Log Perubahan Stok
- **URL:** `/inventory-logs`
- **Query Params:** `page`, `limit`, `product_id` (opsional)
- **Method:** `GET`
- **Akses:** Admin
- **Response Sukses (200 OK):**
  ```json
  {
    "page": 1,
    "limit": 20,
    "product_id": 1,
    "total_pages": 1,
    "data": [
      {
        "id": 1,
        "product_id": 1,
        "change_type": "OUT",
        "quantity": 1,
        "description": "Checkout order #10 by user #2",
        "created_at": "2026-06-11T03:05:00.000Z"
      }
    ]
  }
  ```

#### 3.6.2 Melakukan Penyesuaian Stok Manual (Adjust)
- **URL:** `/inventory-logs/adjust`
- **Method:** `POST`
- **Akses:** Admin
- **Request Body:**
  ```json
  {
    "product_id": 1,
    "change_type": "IN",
    "quantity": 10,
    "description": "Restock manual dari suplier"
  }
  ```
  *(Pilihan `change_type`: `IN` untuk menambah stok, `OUT` untuk mengurangi stok)*.
- **Response Sukses (210 Created):**
  ```json
  {
    "product": {
      "id": 1,
      "stock": 130
    },
    "log": {
      "id": 2,
      "product_id": 1,
      "change_type": "IN",
      "quantity": 10,
      "description": "Restock manual dari suplier (by user #1)"
    }
  }
  ```
- **Error 400:** Dikembalikan apabila operasi `OUT` menyebabkan nilai stok produk menjadi minus.

---

### 3.7 ADDRESSES API

#### 3.7.1 Menambahkan Alamat Baru
- **URL:** `/addresses`
- **Method:** `POST`
- **Akses:** Login
- **Request Body:**
  ```json
  {
    "address_type": "rumah",
    "recipient_name": "Budi Santoso",
    "city_district": "Bekasi Barat",
    "postal_code": "17135",
    "full_address": "Jl. Semangka Raya No. 42",
    "is_primary": true
  }
  ```
- **Response Sukses (201 Created):**
  ```json
  {
    "status": "success",
    "data": {
      "id": 5,
      "user_id": 2,
      "address_type": "rumah",
      "recipient_name": "Budi Santoso",
      "city_district": "Bekasi Barat",
      "postal_code": "17135",
      "full_address": "Jl. Semangka Raya No. 42",
      "is_primary": true,
      "created_at": "2026-06-11T04:20:00.000Z"
    }
  }
  ```

#### 3.7.2 Mengambil Daftar Alamat Pengguna (Get My Addresses)
- **URL:** `/addresses/me`
- **Method:** `GET`
- **Akses:** Login
- **Response Sukses (200 OK):**
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": 5,
        "user_id": 2,
        "address_type": "rumah",
        "recipient_name": "Budi Santoso",
        "city_district": "Bekasi Barat",
        "postal_code": "17135",
        "full_address": "Jl. Semangka Raya No. 42",
        "is_primary": true,
        "created_at": "2026-06-11T04:20:00.000Z"
      }
    ]
  }
  ```

#### 3.7.3 Memperbarui Alamat
- **URL:** `/addresses/:id`
- **Method:** `PUT`
- **Akses:** Login (Pemilik alamat)
- **Request Body:**
  ```json
  {
    "recipient_name": "Budi Santoso Wibowo"
  }
  ```
- **Response Sukses (200 OK):** Mengembalikan objek alamat yang diperbarui.

#### 3.7.4 Menghapus Alamat
- **URL:** `/addresses/:id`
- **Method:** `DELETE`
- **Akses:** Login (Pemilik alamat)
- **Response Sukses (200 OK):**
  ```json
  {
    "status": "success",
    "message": "Address deleted successfully"
  }
  ```

---

### 3.8 STORE REGISTRATIONS API

#### 3.8.1 Mengambil Detail Toko Aktif (Payment Detail & QRIS)
- **URL:** `/store-registrations/active`
- **Method:** `GET`
- **Akses:** Public
- **Response Sukses (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "store_name": "Frostmart Official",
      "bank_1": "1234567890",
      "bank_account_name": "FROSTMART INDONESIA",
      "ewallet_1": "081234567890",
      "ewallet_owner_name": "FROSTMART",
      "qris_url": "https://res.cloudinary.com/..."
    }
  }
  ```

#### 3.8.2 Mendaftarkan Toko Baru (Register Store)
- **URL:** `/store-registrations`
- **Method:** `POST`
- **Akses:** Login
- **Request Body (Multipart Form-Data):**
  - `store_type`: tipe toko (`individu` / `badan_usaha`).
  - `owner_name`: nama pemilik.
  - `nik`: NIK KTP pemilik.
  - `store_name`: nama toko.
  - `category`: kategori toko frozen food.
  - `address`: alamat lengkap toko.
  - `phone`: no telepon toko.
  - `ktp_image` (File): file gambar KTP pemilik.
  - `product_proof_1` (File): file gambar bukti produk 1.
  - `product_proof_2` (File): file gambar bukti produk 2.
- **Response Sukses (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "id": 3,
      "user_id": 2,
      "store_name": "Toko Frozen Budi",
      "status": "pending",
      "ktp_image_url": "https://res.cloudinary.com/..."
    }
  }
  ```

#### 3.8.3 Mengambil Data Pendaftaran Toko Saya (Get My Registration)
- **URL:** `/store-registrations/my`
- **Method:** `GET`
- **Akses:** Login
- **Response Sukses (200 OK):** Mengembalikan data pendaftaran toko milik pengguna aktif.

#### 3.8.4 Memperbarui Registrasi Toko
- **URL:** `/store-registrations/:id`
- **Method:** `PUT`
- **Akses:** Login (Pemilik toko / Admin)
- **Request Body (Multipart Form-Data):**
  - `store_name` (optional): nama toko baru.
- **Response Sukses (200 OK):** Mengembalikan data registrasi toko terupdate.

#### 3.8.5 Menghapus/Membatalkan Registrasi Toko
- **URL:** `/store-registrations/:id`
- **Method:** `DELETE`
- **Akses:** Login (Pemilik toko / Admin)
- **Response Sukses (200 OK):**
  ```json
  {
    "success": true,
    "message": "Store registration deleted successfully"
  }
  ```

---

## 4. Alur & Petunjuk Pengujian (Testing)

### 4.1 Cara Menjadikan Pengguna Sebagai Admin
Untuk menguji endpoint khusus admin, ubah role akun Anda di database PostgreSQL (Neon) melalui SQL editor:
```sql
UPDATE users
SET role = 'admin'
WHERE email = 'admin@frostmart.local';
```
*Catatan: Anda harus masuk/signin ulang setelah menjalankan query agar role baru masuk ke dalam JWT payload.*

### 4.2 Skenario Pengujian End-to-End (E2E) yang Disarankan
1. **Daftar Akun Baru:** Kirim `POST /api/auth/local/signup`.
2. **Ubah Role ke Admin:** Jalankan query SQL di atas untuk akun tersebut.
3. **Masuk Akun:** Jalankan `POST /api/auth/local/signin` untuk memperoleh akses token.
4. **Buat Produk:** Tambahkan data produk baru via `POST /api/products`.
5. **Upload Foto:** Kirim file multipart gambar lewat `POST /api/products/photo/:id`.
6. **Lakukan Checkout:** Buat pesanan baru via `POST /api/orders/checkout` dengan beberapa item.
7. **Verifikasi Aturan Pembayaran:** Coba ubah langsung status pesanan ke `completed` (`PATCH /api/orders/:id/status`). Server harus menolak (400 Bad Request) karena status transaksi masih `pending`.
8. **Konfirmasi Transaksi:** Ubah status transaksi menjadi lunas (`PATCH /api/transactions/:id/status` dengan `"payment_status": "paid"`).
9. **Selesaikan Pesanan:** Sekarang ubah status pesanan ke `completed`. Ini harus berhasil (200 OK).
10. **Periksa Stok & Log:** Kirim `GET /api/inventory-logs` untuk melihat log stok `OUT` dari checkout yang tercatat otomatis.
