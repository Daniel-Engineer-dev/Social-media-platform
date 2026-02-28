# Authentication Workflow — Hướng dẫn chi tiết

Tài liệu minh họa toàn bộ luồng đăng ký/đăng nhập qua **3 phương thức**: Email+Password, Google OAuth, GitHub OAuth.

---

## 1. Đăng ký bằng Email + Password

### Workflow

```
👤 User (Browser)          📄 auth/page.tsx          🔧 /api/auth/register          🗄️ PostgreSQL
       |                         |                            |                           |
       |--- Nhập name, email, -->|                            |                           |
       |    password             |                            |                           |
       |                         |-- Validate form ---------->|                           |
       |                         |   (password ≥ 6 chars)     |                           |
       |                         |                            |-- SELECT * FROM users --->|
       |                         |                            |   WHERE email = ?          |
       |                         |                            |                           |
       |                         |                  [Nếu email đã tồn tại]                |
       |                         |<-- 409 "Email đã dùng" ----|                           |
       |                         |                                                        |
       |                         |                  [Nếu email chưa tồn tại]              |
       |                         |                            |-- bcrypt.hash(password) --|
       |                         |                            |-- INSERT INTO users ----->|
       |                         |<-- 201 "Thành công!" ------|                           |
       |                         |                            |                           |
       |                         |-- Auto-login (signIn) ---->|                           |
       |<-- Redirect "/" --------|                            |                           |
```

### Code quan trọng — `app/api/auth/register/route.ts`

**Hash mật khẩu với bcrypt:**

```typescript
// 💡 KHÔNG BAO GIỜ lưu plaintext password vào database
// bcrypt.hash(password, saltRounds) — tạo hash một chiều
// saltRounds = 10 → ~100ms để hash, đủ chậm để chống brute-force
const password_hash = await bcrypt.hash(password, 10)

// Kết quả: "$2b$10$N9qo8uLOickgx2ZMRZoMye..." (60 chars)
// Mỗi lần hash cùng 1 password → ra kết quả KHÁC NHAU (vì salt random)
```

**Auto-generate username:**

```typescript
// Lấy phần trước @ của email, chỉ giữ a-z và 0-9
let username = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "")
// "nguyen.van.a@gmail.com" → "nguyenvana"

// Nếu username đã tồn tại → thêm số ngẫu nhiên
const existingUsername = await prisma.user.findUnique({ where: { username } })
if (existingUsername) {
  username = `${username}${Math.floor(Math.random() * 9999)}`
  // "nguyenvana" → "nguyenvana4721"
}
```

---

## 2. Đăng nhập bằng Email + Password

### Workflow

```
👤 User          📄 auth/page.tsx          ⚡ NextAuth          🔐 authorize()          🗄️ DB
    |                   |                       |                      |                   |
    |-- Nhập email, -->|                       |                      |                   |
    |   password        |                       |                      |                   |
    |                   |-- signIn("credentials",                      |                   |
    |                   |   { email, password,   |                      |                   |
    |                   |     redirect: false }) |                      |                   |
    |                   |                       |-- authorize() ------>|                   |
    |                   |                       |                      |-- SELECT user --->|
    |                   |                       |                      |                   |
    |                   |             [User không tồn tại]             |                   |
    |                   |<-- error: "Email không tồn tại" -------------|                   |
    |                   |                                              |                   |
    |                   |             [User dùng OAuth, không có pass] |                   |
    |                   |<-- error: "Tài khoản dùng OAuth" ------------|                   |
    |                   |                                              |                   |
    |                   |             [User tồn tại]                   |                   |
    |                   |                       |      bcrypt.compare(password, hash)      |
    |                   |                       |                      |                   |
    |                   |             [Sai mật khẩu]                   |                   |
    |                   |<-- error: "Mật khẩu không đúng" -------------|                   |
    |                   |                                              |                   |
    |                   |             [Đúng mật khẩu]                  |                   |
    |                   |                       |<-- return user ------|                   |
    |                   |                       |-- Tạo JWT cookie -->|                   |
    |                   |<-- { ok: true } ------|                      |                   |
    |<-- redirect "/" --|                       |                      |                   |
```

### Code quan trọng — `lib/auth.ts`

**Credentials Provider — hàm `authorize`:**

```typescript
Credentials({
  // 💡 `authorize` là hàm QUAN TRỌNG NHẤT của Credentials provider
  // NextAuth gọi hàm này khi user submit form login
  // Return object → đăng nhập thành công
  // Throw error → đăng nhập thất bại
  async authorize(credentials) {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // 💡 So sánh password bằng bcrypt.compare()
    // KHÔNG DÙNG: password === user.password (vì password đã hash)
    // bcrypt.compare tự tách salt từ hash rồi hash input để so sánh
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    // Return object này sẽ được truyền vào JWT callback
    return {
      id: user.id,        // → token.id
      email: user.email,   // → token.email
      name: user.name,     // → token.name
      image: user.avatar_url,
    }
  },
})
```

**JWT Callbacks — cách session hoạt động:**

```typescript
callbacks: {
  // 💡 BƯỚC 1: jwt callback — chạy mỗi khi tạo/refresh token
  // `user` chỉ có giá trị lần ĐẦU TIÊN (khi mới đăng nhập)
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id  // Gắn user.id vào JWT token
    }
    return token
    // Token này được MÃ HÓA và lưu trong cookie trình duyệt
    // Mỗi request gửi kèm cookie → server giải mã → biết user là ai
  },

  // 💡 BƯỚC 2: session callback — chạy khi gọi useSession() hoặc auth()
  // Chuyển data từ token → session object phía client
  async session({ session, token }) {
    if (session.user) {
      session.user.id = token.id as string
    }
    return session
    // Client dùng: const { data: session } = useSession()
    // session.user.id → UUID của user trong database
  },
}
```

> **💡 JWT vs Database Session:**
>
> - **JWT** (đang dùng): Token lưu trong cookie, server không cần query DB mỗi request → nhanh hơn
> - **Database Session**: Mỗi request server phải query bảng `sessions` → chậm hơn nhưng có thể revoke session

---

## 3. Đăng nhập/Đăng ký bằng Google OAuth

### Workflow

```
👤 User          📄 page.tsx        ⚡ NextAuth        🔵 Google        🔐 signIn CB        🗄️ DB
    |                 |                  |                  |                 |                |
    |-- Bấm Google -->|                  |                  |                 |                |
    |                 |-- signIn ------->|                  |                 |                |
    |                 |   ("google")     |                  |                 |                |
    |<-- Redirect ----|-----------------|-- Redirect ----->|                 |                |
    |                                   |   (consent page) |                 |                |
    |-- Cho phép ---------------------->|                  |                 |                |
    |                                   |<-- auth code ----|                 |                |
    |                                   |                  |                 |                |
    |                                   |-- Exchange code ->|                |                |
    |                                   |   for tokens     |                 |                |
    |                                   |<-- tokens + -----|                 |                |
    |                                   |   profile        |                 |                |
    |                                   |                  |                 |                |
    |                                   |-- signIn callback --------------->|                |
    |                                   |                                   |-- Find user -->|
    |                                   |                                   |   by email     |
    |                                   |                                   |                |
    |                                   |                  [User chưa tồn tại → TẠO MỚI]     |
    |                                   |                                   |-- INSERT --->  |
    |                                   |                                   |   users +      |
    |                                   |                                   |   accounts     |
    |                                   |                  [User đã tồn tại → LINK account]  |
    |                                   |                                   |-- INSERT --->  |
    |                                   |                                   |   accounts     |
    |                                   |                                   |                |
    |                                   |<-- return true -------------------|                |
    |                                   |-- Tạo JWT ----->|                 |                |
    |<-- Redirect "/" ------------------|                  |                 |                |
```

### Code quan trọng — `signIn` callback

```typescript
async signIn({ user, account, profile }) {
  // 💡 user — thông tin cơ bản từ OAuth provider
  //    user.email = "abc@gmail.com"
  //    user.name = "Nguyễn Văn A"
  //    user.image = "https://lh3.googleusercontent.com/..."

  // 💡 account — thông tin OAuth token
  //    account.provider = "google"
  //    account.providerAccountId = "109834756283..."  (Google user ID)
  //    account.access_token = "ya29.a0..."  (dùng để gọi Google API)
  //    account.id_token = "eyJhbGci..."  (JWT chứa thông tin user)

  // Bỏ qua Credentials provider (đã xử lý ở authorize)
  if (account?.provider === "credentials") {
    return true
  }

  // BƯỚC 1: Tìm hoặc tạo user
  let existingUser = await prisma.user.findUnique({
    where: { email: user.email },
  })

  if (!existingUser) {
    // 💡 TỰ ĐỘNG TẠO TÀI KHOẢN cho user OAuth lần đầu
    // password_hash = null → user này KHÔNG THỂ login bằng email/password
    existingUser = await prisma.user.create({
      data: {
        email: user.email,
        name: user.name || username,
        username,                    // auto-generated
        avatar_url: user.image,      // lấy avatar từ Google/GitHub
        password_hash: null,         // ← QUAN TRỌNG: OAuth user không có password
      },
    })
  }

  // BƯỚC 2: Link OAuth account với user
  // 💡 Bảng `accounts` cho phép 1 user link NHIỀU provider
  //    VD: cùng 1 user có thể login bằng cả Google VÀ GitHub
  const existingAccount = await prisma.account.findUnique({
    where: {
      provider_provider_account_id: {
        provider: account.provider,                      // "google"
        provider_account_id: account.providerAccountId,  // Google user ID
      },
    },
  })

  if (!existingAccount) {
    await prisma.account.create({
      data: {
        user_id: existingUser.id,
        provider: account.provider,
        provider_account_id: account.providerAccountId,
        access_token: account.access_token,    // dùng để gọi API bên thứ 3
        refresh_token: account.refresh_token,  // dùng để lấy access_token mới
        // 💡 expires_at: NextAuth trả về giây (Unix timestamp)
        //    Prisma cần DateTime → nhân 1000 để chuyển sang milliseconds
        expires_at: account.expires_at
          ? new Date(account.expires_at * 1000)
          : null,
      },
    })
  }

  // 💡 Gắn database user ID cho JWT callback
  user.id = existingUser.id
  return true  // Cho phép đăng nhập
}
```

---

## 4. Đăng nhập/Đăng ký bằng GitHub OAuth

### Workflow

```
👤 User          📄 page.tsx        ⚡ NextAuth        ⬛ GitHub         🔐 signIn CB        🗄️ DB
    |                 |                  |                  |                 |                |
    |-- Bấm GitHub -->|                  |                  |                 |                |
    |                 |-- signIn ------->|                  |                 |                |
    |                 |   ("github")     |                  |                 |                |
    |<-- Redirect ----|-----------------|-- Redirect ----->|                 |                |
    |                                   |  /login/oauth    |                 |                |
    |-- Authorize --------------------->|                  |                 |                |
    |                                   |<-- code ---------|                 |                |
    |                                   |-- POST token --->|                 |                |
    |                                   |<-- access_token -|                 |                |
    |                                   |                  |                 |                |
    |                                   |-- signIn callback (CÙNG logic Google ↑) ---------->|
    |                                   |                                   |-- Tìm/tạo --->|
    |                                   |                                   |   user +       |
    |                                   |                                   |   account      |
    |                                   |<-- return true -------------------|                |
    |<-- Redirect "/" ------------------|                  |                 |                |
```

> **📝 Lưu ý:** GitHub OAuth dùng **cùng `signIn` callback** với Google. Sự khác biệt chỉ ở:
>
> - `account.provider` = `"github"` thay vì `"google"`
> - `account.providerAccountId` = GitHub user ID
> - Profile data (name, avatar) lấy từ GitHub profile

---

## 5. Tổng quan Database Schema

```
┌─────────────────────────────────┐         ┌──────────────────────────────────────┐
│           users                 │         │            accounts                  │
├─────────────────────────────────┤         ├──────────────────────────────────────┤
│ id            UUID (PK)         │◄───────┐│ id                  UUID (PK)       │
│ email         TEXT (UNIQUE)     │        ││ user_id             UUID (FK) ──────┘
│ password_hash TEXT (NULL=OAuth) │        ││ provider            TEXT             │
│ name          TEXT              │        ││ provider_account_id TEXT             │
│ username      TEXT (UNIQUE)     │        ││ access_token        TEXT             │
│ avatar_url    TEXT              │        ││ refresh_token       TEXT             │
│ ...                             │        ││ expires_at          TIMESTAMPTZ      │
└─────────────────────────────────┘        │└──────────────────────────────────────┘
                                           │
                                           │  1 user → nhiều accounts
                                           │  (Google + GitHub + ...)
```

**3 kịch bản thực tế:**

| Kịch bản | `users.password_hash` | `accounts` records |
|---|---|---|
| Đăng ký email/password | `$2b$10$N9qo...` (bcrypt hash) | Không có |
| Đăng ký Google | `NULL` | 1 record (provider=google) |
| User dùng cả Google + GitHub | `NULL` | 2 records (google + github) |
| User đăng ký email → sau đó link Google | `$2b$10$...` | 1 record (provider=google) |

---

## 6. Middleware — Bảo vệ routes

```
🌐 User request đến bất kỳ route
          │
          ▼
    ┌─────────────┐     Có
    │ Static file? ├──────────► ✅ Cho phép
    │ /_next, .png │
    └──────┬──────┘
           │ Không
           ▼
    ┌─────────────┐     Có
    │ API auth?    ├──────────► ✅ Cho phép
    │ /api/auth/*  │
    └──────┬──────┘
           │ Không
           ▼
    ┌─────────────┐     Có
    │ Có JWT token ├──────────► ✅ Cho phép (đã login)
    │ trong cookie?│
    └──────┬──────┘
           │ Không
           ▼
    ┌─────────────┐     Có
    │ Public route?├──────────► ✅ Cho phép (/auth)
    │ /auth        │
    └──────┬──────┘
           │ Không
           ▼
    🔒 Redirect → /auth
```

```typescript
// 💡 getToken giải mã JWT từ cookie — KHÔNG cần query database
const token = await getToken({
  req: request,
  secret: process.env.NEXTAUTH_SECRET,  // key dùng để giải mã
})

// Nếu không có token (chưa login) VÀ route không public → redirect
if (!token && !isPublicRoute) {
  return NextResponse.redirect(new URL("/auth", request.nextUrl.origin))
}
```

---

## 7. Frontend — Cách gọi OAuth

```typescript
// 📄 auth/page.tsx

// Credentials login — KHÔNG redirect, xử lý kết quả tại chỗ
const result = await signIn("credentials", {
  email: formData.email,
  password: formData.password,
  redirect: false,  // 💡 Quan trọng: false → trả về result object
})
// result = { ok: true/false, error: "...", status: 200/401 }


// OAuth login — CÓ redirect sang Google/GitHub
await signIn("google", {
  callbackUrl: "/",  // 💡 URL sau khi login thành công
  // Không có redirect: false → NextAuth tự redirect
})
// Browser sẽ chuyển sang: https://accounts.google.com/...
// Sau đó Google redirect về: /api/auth/callback/google
// NextAuth xử lý → redirect về callbackUrl "/"
```

> **💡 Tại sao Credentials dùng `redirect: false` còn OAuth thì không?**
>
> - **Credentials**: xử lý tại chỗ, hiển thị lỗi inline (ví dụ "sai mật khẩu")
> - **OAuth**: BẮT BUỘC redirect sang trang bên thứ 3 (Google/GitHub), không thể xử lý inline

---

## 8. Tóm tắt các concepts Backend quan trọng

| Concept | Giải thích |
|---|---|
| **bcrypt** | Hash password một chiều. Mỗi lần hash ra kết quả khác nhau (salt random). Dùng `compare()` để verify |
| **JWT (JSON Web Token)** | Token mã hóa chứa thông tin user, lưu trong cookie. Server giải mã để xác thực, không cần query DB |
| **OAuth 2.0** | Giao thức cho phép login qua bên thứ 3. Luồng: redirect → consent → callback → exchange code → tokens |
| **Credentials Provider** | NextAuth provider cho email/password. Hàm `authorize()` quyết định cho login hay không |
| **signIn Callback** | Chạy SAU khi provider xác thực thành công. Dùng để tạo/link user trong database |
| **jwt Callback** | Chạy khi tạo/refresh token. Gắn thêm data vào token (ví dụ: user.id) |
| **session Callback** | Chạy khi client gọi `useSession()`. Chuyển data từ token → session object |
| **Middleware** | Kiểm tra JWT token trước mỗi request. Redirect về /auth nếu chưa login |
| **Prisma** | ORM cho TypeScript, truy vấn database bằng code thay vì viết SQL thuần |
