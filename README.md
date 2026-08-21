# Track 1 — Day 18 — Solution Test

## 1. Thông tin cá nhân và nhóm

| | |
|---|---|
| **Họ tên** | Đàm Việt Cường |
| **MHV** | 2A202601566 |
| **Nhóm** | cuong |
| **Case** | **B — AI Notes: Personal Learning Notes** (tiếp nối Day 17, không đổi case) |
| **Option tôi chịu trách nhiệm** | **Option B — Cùng làm (Ask / Propose)** |

**Thành viên nhóm:**

| Thành viên | MHV | Option phụ trách |
|---|---|---|
| Lê Quang Huy | 2A202601821 | **A** — User tự làm (Don't Act) |
| Đàm Việt Cường | 2A202601566 | **B** — Cùng làm (Ask / Propose) |
| Trần Đức Bảo | 2A202601472 | **C** — AI làm sẵn (Act with Guardrails) |
| Hoàng Minh Quân | 2A202601574 | **D** — Chỉ đúng chỗ (Ask on demand) |

> **Lệch so với đề:** Đề giả định nhóm ba người và ba option. Nhóm này có **bốn** thành viên
> nên làm **bốn** option. Quân vắng buổi Day 17, vào Day 18 và nhận Option D.

---

## 2. Hypothesis Problem

Bản nhóm dùng trong Day 18:

> **Khi** ngồi ôn lại trước buổi học kế tiếp, **người học** khó biến các mẩu ghi chú, ảnh chụp
> và điểm đánh dấu chưa hiểu thành một thứ dùng lại được **vì** chúng nằm rải rác trên nhiều
> công cụ và phải tốn công tổng hợp thủ công mới dùng được, **dẫn đến** phải đọc lại tuần tự từ
> đầu hoặc đẩy sang công cụ ngoài, và không đo được mình đang hổng chỗ nào.

**Nối với observation Day 17 nào** — pattern duy nhất lặp qua **hai nguồn phỏng vấn độc lập**:
chỗ vướng nằm ở **khâu chuyển đổi**, không ở khâu ghi.

- Hoàn (Huy phỏng vấn): *"Thầy cô giảng nhanh quá thì mình sẽ là chụp ảnh lại... Mình không hiểu
  thì mình cứ gửi lên mình hỏi là cái này tại sao như này."* — phải đẩy sang công cụ ngoài mới dùng được.
- Mai (Cường phỏng vấn): *"Thực ra mình cảm thấy tốn thời gian nhất là mình sẽ lại phải từ cái
  file ghi chú đấy để tổng hợp ra..."* — chính user gọi tên khâu đắt nhất.

Situation *"trước buổi học kế tiếp"* lấy từ lời Hoàn: *"tối trước hôm đấy của hôm hôm sau học
môn đấy"* — đã sửa so với bản Day 17 vốn ghi *"sau buổi học"*.

**Điều còn chưa biết:**

- **Chưa nguồn nào cho hậu quả định lượng** — không giờ, không điểm, không lần hỏng việc nào.
- Rằng note rời rạc là thứ **cản** việc hiểu bài. Mẩu duy nhất nghe giống vậy bật ra **sau khi**
  interviewer đã nêu sẵn nguyên nhân, nên không dùng được.
- Hoàn bỏ bài **có chủ đích theo mục tiêu điểm** — cách giải thích thứ ba mà Day 17 không có.
  Nếu đa số người học như vậy thì cả hypothesis lẫn bốn option đều lệch.

Chi tiết: [01-evidence-huddle.md](01-evidence-huddle.md).

---

## 3. Solution Options và prototype

Trục phân biệt là **ai làm việc biến ghi chú thành thứ dùng lại được**. Cùng target user, cùng
situation, cùng task, cùng ba mẩu fixture.

| | Vai trò AI | Cơ chế | Người dùng làm gì |
|---|---|---|---|
| **A** (Huy) | **Don't Act** | Chỉ xếp ghi chú theo slide và tự lưu. Không sinh chữ nào | Chọn loại thẻ, gắn mẩu nguồn, **tự viết toàn bộ** |
| **D** (Quân) | **Ask on demand** | Im cho tới khi người dùng chỉ một mẩu, rồi sinh **đúng một** lời giải | Chỉ một mẩu, đọc, xin bản dễ hơn, hoặc đóng |
| **B** (Cường) | **Ask / Propose** | Soạn sẵn hai nhóm thẻ (giải thích + tự kiểm tra), mỗi thẻ ghi rõ nguồn | Duyệt / sửa / đổi / bỏ từng thẻ |
| **C** (Bảo) | **Act** | Soạn trọn gói ngay khi mở: 3 ý cốt lõi + 1 mục giải thích + 3 câu tự kiểm tra | Đọc, đổi mục tiêu, hoặc rollback |

**Link prototype** — chi tiết ở [prototype-link.md](prototype-link.md):

- **Bản chung bốn option (canned output cho vòng so sánh):** [prototype/index.html](prototype/index.html)
- **Bộ prototype gọi OpenAI API thật (đầy đủ 4 options):** [proA](proA.html) · [proB](proB.html) · [proC](proC.html) · [proD](proD.html)
- **Bản đào sâu Option B của Cường (UI/UX Pro Max):** [prototype-option-b.html](prototype-option-b.html)

Thiết kế: [three-option-design-sheet.md](three-option-design-sheet.md) ·
[02-three-solution-options.md](02-three-solution-options.md) ·
[03-human-ai-design-pass.md](03-human-ai-design-pass.md) ·
[03-human-ai-design-damvietcuong.md](03-human-ai-design-damvietcuong.md)

---

## 4. Đóng góp của tôi trong nhóm (Đàm Việt Cường — 2A202601566)

**Option B — chịu trách nhiệm chính.** Thiết kế cơ chế Ask & Propose với Dual Mode: AI tự động phân tích ghi chú và điểm chưa hiểu để đề xuất (1) Thẻ tóm tắt/giải thích điểm khó (cho Hoàn) và (2) Thẻ câu hỏi tự kiểm tra Active Recall (cho Mai). Xây dựng cơ chế **Smart Dwell Trigger** trong [assets/proB.js](assets/proB.js) và [proB.html](proB.html) — AI chỉ chủ động hỏi khi người học dừng lại 10 giây ở slide hoặc vừa ghi thêm một mẩu ghi chú mới.

**Bản deep-dive Option B.** Thiết kế và xây dựng [prototype-option-b.html](prototype-option-b.html) chuẩn UI/UX Pro Max với đầy đủ micro-interactions, modal chỉnh sửa trực tiếp (Inline Edit), đổi câu hỏi (Regenerate), duyệt nhanh (Batch Accept) và chế độ làm Quiz thực chiến có chấm điểm tức thì.

**Dữ liệu đầu vào Day 17.** Thực hiện phỏng vấn bạn Trần Thị Hoa Mai (01317), ghi nhận các trích dẫn đắt giá về rào cản chi phí chuyển đổi từ ghi chú tay sang quiz và nguy cơ mất file Notepad, làm bằng chứng nòng cốt cho bảng [01-evidence-huddle.md](01-evidence-huddle.md).

**Human–AI Design Pass.** Viết [03-human-ai-design-damvietcuong.md](03-human-ai-design-damvietcuong.md), phân tích 4 quyết định thiết kế cho Option B, xác định ranh giới can thiệp an toàn (Ask & Propose) và thiết lập đường khôi phục dữ liệu tức thì (*Recovery Path*).

**Facilitation & Feedback.** Trực tiếp thực hiện phiên Solution Testing với Tester (bạn Nguyễn Văn Nam), ghi nhận hành vi thao tác thực tế và hoàn thành [06-prototype-feedback-damvietcuong.md](06-prototype-feedback-damvietcuong.md). Cùng nhóm đối chiếu 4 phiên test độc lập để hoàn thiện [group-feedback-synthesis.md](group-feedback-synthesis.md).

---

## 5. Prototype Feedback

### Observation từ phiên tôi facilitate (Đàm Việt Cường facilitate)

Chi tiết: [06-prototype-feedback-damvietcuong.md](06-prototype-feedback-damvietcuong.md).

- **Tester:** Nguyễn Văn Nam (Học viên lớp AI thực chiến, thường xuyên dùng Notion/Docs).
- **Hành vi quan sát:**
  - Ở Option A (`proA.html`): Mở khay ghi chú, kéo thả 1 mẩu nhưng dừng lại không gõ vì lười tự soạn vào buổi tối.
  - Ở Option B (`proB.html`): Đọc slide 11 khoảng 10 giây, thấy AI hỏi thăm thì bấm ngay `[✓ Có, giúp mình với]`. Thử làm quiz và đọc kỹ phần giải thích đáp án sai; thử gõ câu hỏi vào tab *Trò chuyện*.
  - Bấm thử nút `[Thu hồi — về lại im lặng]` ở Option B để xác nhận quyền làm chủ.
- **Lựa chọn:** Tester chọn **Option B** vì cảm giác được hỗ trợ đúng lúc mà không bị áp đặt.

### Feedback synthesis từ 4 phiên của nhóm

Đầy đủ: [group-feedback-synthesis.md](group-feedback-synthesis.md).

Bốn điểm rút ra từ 4 phiên đối chiếu:

1. **Option A bị loại bỏ 100%:** Cả 4 testers đều từ chối việc phải tự gõ lại tóm tắt và câu hỏi từ đầu.
2. **Nhu cầu giải quyết nhanh điểm nghẽn:** Tester phiên của Quân (Feedback 4) bỏ qua bước duyệt thẻ, bấm thẳng vào Slide 11 để lấy lời giải nhanh (Option D) và đánh giá cao tính tiện lợi của Option C khi cần có sẵn cả bài.
3. **Chi phí duyệt thẻ ở Option B:** Việc bắt người học phải duyệt qua từng thẻ trước khi học có thể gây nản lòng nếu người học đang vội.
4. **Hàng rào an toàn:** Nút *Rollback* và nút *Thu hồi về im lặng* giúp người học yên tâm thử nghiệm AI.

### Next Change nhóm chốt cho iteration tiếp theo

> **Tích hợp cơ chế Hybrid hai mức độ:**  
> 1. **Mức 1 (Point & Solve / Targeted Help):** Bấm trực tiếp vào mẩu note/slide chưa hiểu để nhận ngay lời giải thích ngắn gọn trong 5 giây mà không cần duyệt thẻ (kế thừa Option D & B).  
> 2. **Mức 2 (Full Study Pack):** Nút *"Soạn sẵn cả bộ ôn tập"* tạo trọn gói 3 ý chính + bài quiz ở trạng thái nhận sẵn (kế thừa Option C), người học chỉ can thiệp vào thẻ nào thấy cần sửa.

### Still Unproven

- Hypothesis Problem **chưa được kiểm chứng định lượng**. Các phiên đo *interaction & preference*, chưa đo *learning outcome*.
- **Chưa nguồn nào cho hậu quả định lượng** (số giờ lãng phí cụ thể hoặc điểm số).
- Liệu người học có duy trì thói quen ôn tập đều đặn với bộ quiz do AI soạn hay không.

**Không tuyên bố** *"User đã xác nhận solution này đúng."*

---

## 6. AI Support Log

Đầy đủ: [ai-support-log.md](ai-support-log.md).

**Có dùng AI:** Dựng cấu trúc repo và format markdown; viết mã JavaScript cho module AI Co-Pilot trong `assets/proB.js`, `assets/proD.js` và `prototype-option-b.html`; chuẩn hóa bảng Human–AI Decision Table; soát lỗi logic giữa 4 options.

**Không dùng AI:** Tuyệt đối không bịa đặt quote/observation của tester; không viết lại evidence làm mất ranh giới giữa lời tester và diễn giải; không chọn option thay tester.

**Các điểm AI làm chưa chuẩn và đã tự sửa:**
- AI ban đầu tạo 3 options chỉ khác nhau về giao diện (màu sắc/bố cục), tôi và nhóm đã định nghĩa lại trục phân biệt cốt lõi: **Ai làm việc biến ghi chú thành thứ dùng lại được** (*Don't Act vs Ask on demand vs Ask/Propose vs Act*).
- AI có xu hướng mặc định người dùng luôn thích tự động hóa 100%, tôi đã bổ sung các nút kiểm soát và cơ chế Dwell trigger để tránh làm phiền người học.
