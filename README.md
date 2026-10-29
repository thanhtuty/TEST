# MERN starter

Ứng dụng mẫu gồm React + Vite ở `client` và Express + Mongoose ở `server`.

## Cài đặt

```bash
npm install
npm install --prefix client
npm install --prefix server
```

Tạo `server/.env` từ `server/.env.example` và chỉnh `MONGODB_URI` nếu cần. MongoDB cần chạy cục bộ hoặc dùng MongoDB Atlas.

## Chạy phát triển

```bash
npm run dev
```

Client chạy tại http://localhost:5173, API tại http://localhost:5000. Endpoint kiểm tra: `GET /api/health`.
