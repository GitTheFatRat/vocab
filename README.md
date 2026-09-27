# Thẻ Từ Vựng IELTS

Web app học từ vựng kiểu flashcard, chứa 119 từ (3 bộ) trích từ ảnh IELTS Space, mỗi từ có câu ví dụ.

## Chạy thử local

```bash
npm install
npm run dev
```

Mở http://localhost:5173

## Deploy lên Vercel

**Cách 1 — không cần cài gì (nhanh nhất):**
1. Push thư mục này lên một repo GitHub.
2. Vào https://vercel.com/new, chọn "Import Git Repository", chọn repo vừa push.
3. Vercel tự nhận diện framework "Vite" → Build Command `npm run build`, Output Directory `dist` (mặc định, không cần sửa gì).
4. Bấm Deploy.

**Cách 2 — dùng Vercel CLI:**
```bash
npm install -g vercel
vercel        # lần đầu sẽ hỏi cấu hình, chọn mặc định là được
vercel --prod # deploy bản chính thức
```

## Tùy chỉnh

- Toàn bộ từ vựng + câu ví dụ nằm trong `src/data/vocabulary.js` — thêm/sửa từ trực tiếp ở đây.
- Giao diện: `src/App.css`.
- Logic học (lật thẻ, xáo bài, đánh dấu đã thuộc, lọc theo bộ): `src/App.jsx`.

## Cách học trong app

- Nhấn vào thẻ (hoặc phím Space) để lật xem nghĩa + câu ví dụ.
- ← / → để chuyển thẻ trước/sau.
- Nút "Đã thuộc" / "Chưa thuộc" (hoặc phím K / U) để đánh dấu — trạng thái lưu ở localStorage của trình duyệt, không mất khi tắt tab.
- Bật "Chỉ ôn từ chưa thuộc" để chỉ luyện những từ chưa đánh dấu thuộc — học nhồi nhanh trước khi thi.
- Tab trên cùng lọc theo từng bộ 1/2/3 hoặc xem tất cả.
