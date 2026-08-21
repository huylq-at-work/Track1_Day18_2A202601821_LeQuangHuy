# Prototype Link — Nhóm cuong, Day 18

**Case B** — AI Notes: Personal Learning Notes  
Bốn option: A (Huy) · B (Cường) · C (Bảo) · D (Quân)

---

## 1. Bản chung bốn option — dùng cho buổi test

**[prototype/index.html](prototype/index.html)**

Mở thẳng bằng trình duyệt. Một file, không cần cài gì, không gọi mạng. Bốn nút A / B / C / D
ngay trên khung chat, chuyển qua lại được mà **ngữ cảnh và task giữ nguyên**.

Đây là bản chạy vòng so sánh, vì nội dung là **canned output viết sẵn** nên tái lập được giữa
các tester — điều kiện để so sánh bốn option cho ra kết quả đọc được.

Có sẵn **nhật ký hành vi** ở cột phải: ghi mọi thao tác kèm mốc giờ, copy ra dán vào biên bản.

Hướng dẫn dùng: [prototype/README.md](prototype/README.md)

---

## 2. Bộ prototype gọi OpenAI API thật

| Option | File | Phụ trách |
|---|---|---|
| A | [proA.html](proA.html) | Lê Quang Huy |
| B | [proB.html](proB.html) | Đàm Việt Cường (Smart Dwell Trigger & Card Review) |
| C | [proC.html](proC.html) | Trần Đức Bảo |
| D | [proD.html](proD.html) | Hoàng Minh Quân |

Chạy trên slide thật, gọi model thật. Cách chạy:

```bash
cp .env.example .env
```

Dán `OPENAI_API_KEY` vào `.env`, rồi:

```bash
python serve.py
```

Mở `http://localhost:8000/proA.html` (hoặc `proB.html`, `proC.html`, `proD.html`). Key nằm ở phía server, không xuống trình duyệt.
`.env` đã nằm trong `.gitignore` — **không commit key vào repo**.

> **Vì sao bộ này không dùng cho vòng so sánh:** gọi model thật thì hai tester chạy cùng một
> option **không nhận được cùng nội dung**, nên yêu cầu *"cùng ngữ cảnh, cùng task"* chỉ còn
> đúng ở phần slide. Dùng bộ này để đào sâu chất lượng nội dung sau khi đã xong vòng so sánh.

---

## 3. Bản đào sâu Option B (Đàm Việt Cường)

**[prototype-option-b.html](prototype-option-b.html)** — Đàm Việt Cường.

Chỉ Option B, nhưng có thêm **màn luyện tập trắc nghiệm thật (Active Recall Quiz Mode)** với micro-interactions, modal chỉnh sửa trực tiếp (Inline Edit), đổi câu hỏi (Regenerate), duyệt nhanh (Batch Accept) mà bản chung không có. Chạy sau vòng so sánh, khi cần xem bước tiếp theo sau khoảnh khắc duyệt thẻ.

---

## 4. Tài liệu thiết kế đi kèm

- [three-option-design-sheet.md](three-option-design-sheet.md) — design sheet gốc
- [02-three-solution-options.md](02-three-solution-options.md) — bốn option, distance check
- [03-human-ai-design-pass.md](03-human-ai-design-pass.md) — Human–AI Decision Table bốn cột
- [03-human-ai-design-damvietcuong.md](03-human-ai-design-damvietcuong.md) — Human–AI Design chi tiết Option B (Đàm Việt Cường)
- [04-micro-prototype.md](04-micro-prototype.md) — cấu trúc màn hình và những thứ prototype cố tình không làm
