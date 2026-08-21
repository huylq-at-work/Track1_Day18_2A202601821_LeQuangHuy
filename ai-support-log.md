# AI Support Log — Đàm Việt Cường (2A202601566)

**Học viên:** Đàm Việt Cường  
**Mã học viên (MHV):** 2A202601566  
**Nhóm:** cuong  
**Case nghiên cứu:** Case B — AI Notes: Personal Learning Notes  
**Công cụ sử dụng:** Antigravity / Gemini / Claude  

---

## 1. AI đã giúp tôi ở đâu?

Đối chiếu với danh mục **được phép** ở mục 10 của đề bài:

| Việc mục 10 cho phép | Đã dùng ở đâu trong bài làm của Cường |
|---|---|
| Gợi ý cơ chế còn thiếu trong Solution Parking Lot | Rà soát cơ chế *Ask & Propose* (Dual Mode: Thẻ giải thích + Thẻ Active Recall Quiz) cho Option B |
| Tạo content fixture và canned AI output | Tham gia xây dựng 3 mẩu ghi chú mẫu (Slide 3, 7, 11) và bộ câu hỏi trắc nghiệm kiểm tra |
| Viết code / component cho prototype | Dựng [prototype-option-b.html](prototype-option-b.html) và module [assets/proB.js](assets/proB.js) (Smart Dwell Trigger 10s, Modal Inline Edit, Regenerate, Quiz Mode) |
| Rà soát các option có thật khác về mechanism / role split không | Phân tích ranh giới can thiệp của Option B so với Don't Act (A), Ask on demand (D), Act (C) trong [03-human-ai-design-damvietcuong.md](03-human-ai-design-damvietcuong.md) |
| Tìm câu hỏi dẫn dắt trong test prompt | Soạn câu hỏi quan sát trung tính cho facilitator trong [05-test-prep.md](05-test-prep.md) và [prototype-feedback-note.md](prototype-feedback-note.md) |

Ngoài ra, AI hỗ trợ format bảng biểu, đối chiếu dữ liệu phỏng vấn bạn Mai (Day 17) và chuẩn hóa Markdown links trong toàn bộ repository.

---

## 2. Những chỗ AI làm sai hoặc hời hợt, và đã sửa thế nào

1. **Khởi đầu các options bị trùng lặp:** Ban đầu AI gợi ý 3 options nhưng thực chất chỉ thay đổi giao diện (Option A dạng danh sách, Option B dạng thẻ, Option C dạng bảng) mà không có sự phân định rõ ràng về **vai trò và quyền tự chủ giữa Con người và AI**.
   - **Cách sửa:** Tôi cùng nhóm định nghĩa lại trục phân biệt cốt lõi: *Ai làm việc biến ghi chú thành thứ dùng lại được* (*Don't Act vs Ask on demand vs Ask/Propose vs Act*).
2. **Thiên vị giải pháp tự động hóa 100%:** AI có xu hướng mặc định rằng Option C (tự làm sẵn 100%) là phương án tối ưu nhất và người dùng sẽ luôn thích nhất, bỏ qua rủi ro làm người học bị động và cảm giác bị áp đặt nội dung.
   - **Cách sửa:** Bổ sung cơ chế Dwell trigger (chờ 10s hoặc phát hiện ghi chú mới mới hỏi) ở Option B và nút Rollback khôi phục dữ liệu tức thì ở Option C.
3. **Câu hỏi test có tính định hướng (Leading Questions):** Ban đầu AI gợi ý các câu hỏi phỏng vấn như *"Bạn có thấy tính năng này thông minh và tiết kiệm thời gian không?"*, dễ làm sai lệch dữ liệu quan sát.
   - **Cách sửa:** Chuyển toàn bộ thành câu hỏi trung tính theo quy chuẩn: *"Trong tình huống này, bạn sẽ làm gì tiếp theo?"* và *"Vừa rồi có chỗ nào bạn không chắc chuyện gì đang xảy ra không?"*.

---

## 3. Những chỗ AI từ chối làm, theo mục 10

- **Không bịa đặt quote / observation:** Tuyệt đối không để AI tự tạo dữ liệu phỏng vấn tester giả; toàn bộ ghi chép trong [06-prototype-feedback-damvietcuong.md](06-prototype-feedback-damvietcuong.md) là từ buổi test thật với bạn Nguyễn Văn Nam.
- **Không tự ý chọn solution:** Không để AI tự đưa ra kết luận "Option B đã được chứng minh là đúng"; giữ nguyên các điểm *Still Unproven* về việc chưa đo lường được kết quả học tập dài hạn.

---

## 4. Phần người nộp tự đánh giá

### 4.1. Việc tôi tự làm, không dùng AI
- Thực hiện phỏng vấn bạn Trần Thị Hoa Mai ở Day 17, ghi nhận các trích dẫn đắt giá về chi phí chuyển đổi từ ghi chú tay sang quiz và nguy cơ mất file Notepad.
- Trực tiếp facilitate phiên Solution Testing với Tester Nguyễn Văn Nam, ghi nhận từng thao tác khựng, do dự và hành vi bấm thử nút *Thu hồi*.
- Đưa ra quyết định chốt tính năng *Point & Solve / Dwell Trigger* kết hợp thay vì ép người dùng duyệt từng thẻ tuần tự.

### 4.2. Chỗ tôi thấy AI hời hợt nhất, và tôi đã làm gì
AI thường bỏ qua các rủi ro về mặt tâm lý người học khi bị máy móc làm phiền (Spamming triggers). Tôi đã phải trực tiếp can thiệp vào logic code của `assets/proB.js` để cài đặt thời gian chờ 10 giây (Dwell Time) và bổ sung nút *Thu hồi về lại im lặng* để người học luôn làm chủ nhịp độ học.

### 4.3. Nếu làm lại, tôi sẽ dùng AI khác đi ở chỗ nào
Tôi sẽ yêu cầu AI tập trung nhiều hơn vào việc phân tích các edge cases (ví dụ: khi ghi chú chỉ có 1 dòng hoặc ảnh chụp bị mờ) để xây dựng tín hiệu Uncertainty rõ ràng hơn ngay từ đầu.
