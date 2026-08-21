# Prototype Feedback Note — Đàm Việt Cường

Mỗi thành viên hoàn thành một bản. Bản của **Đàm Việt Cường — 2A202601566**.

**Người ghi:** Đàm Việt Cường — 2A202601566  
**Ngày:** 18/08/2026  
**Thứ tự chạy:** A → B → C → D  
**Prototype:** [prototype/index.html](prototype/index.html) và [proB.html](proB.html)  

**Tester / context:** Bạn Nguyễn Văn Nam (Học viên lớp AI thực chiến, thường xuyên dùng Notion và Google Docs để ôn tập). Có thói quen ôn lại bài bằng ghi chú và ảnh chụp trước buổi học tiếp theo. Không phải thành viên nhóm, không phải interviewee Day 17.

---

## Observation

| Observation | Note |
|---|---|
| **First action** | **Option A (`proA.html`):** Bấm mở khay ghi chú, kéo thử 1 đoạn text vào khung trống, sau đó dừng lại khi thấy phải tự gõ lời giải thích.<br>**Option B (`proB.html`):** Đọc slide 11 khoảng 10 giây, thấy thẻ hỏi *"Bạn có cần trợ giúp với slide này không?"* hiện ra thì bấm ngay `[✓ Có, giúp mình với]`. Sau đó thử bấm làm câu trắc nghiệm số 1.<br>**Option C (`proC.html`):** Vừa mở trang thấy bài tóm tắt và 3 câu hỏi hiện ra ngay, liền đọc lướt câu 1 và bấm chọn đáp án. |
| **Chỗ dừng, do dự hoặc hiểu sai** | **Option A:** Do dự ở bước gõ chữ, nói: *"Tối muộn rồi mà phải tự ngồi gõ lại tóm tắt với câu hỏi thế này thì lười lắm, không có động lực làm"**.<br>**Option B:** Khựng lại 3 giây khi thấy AI yêu cầu quyền đọc slide, nhưng gật đầu đồng ý vì thấy câu hỏi xuất hiện rất đúng lúc mình đang dừng lại đọc.<br>**Option C:** Do dự không biết nội dung AI tóm tắt có bị thiếu ý quan trọng của thầy trên lớp không. |
| **Evidence được đọc hay bỏ qua** | **Option A:** Đọc lướt text trong khay ghi chú.<br>**Option B:** Đọc kỹ phần giải thích *vì sao đúng / vì sao sai* ở câu trắc nghiệm sau khi chọn đáp án; thử bấm tab *Trò chuyện* để gõ hỏi thêm 1 câu.<br>**Option C:** Bỏ qua phần tóm tắt dài ở trên, nhảy thẳng vào làm quiz. |
| **Cách tester sửa hoặc lấy lại control** | **Option A:** Tự xóa ô text để gõ lại.<br>**Option B:** Thử bấm nút `[↻ Soạn lại]` để xem AI có đổi câu hỏi khác không; nhìn thấy nút `[Thu hồi — về lại im lặng]` và nói: *"Nút này hay, nếu không muốn AI làm phiền nữa thì tắt được ngay"**.<br>**Option C:** Bấm nút `[Quay lại ghi chú gốc]` để kiểm tra xem ghi chú cũ có còn nguyên không. |
| **Option được chọn** | **Option B** (AI chủ động hỏi thăm & Co-Creation) |
| **Lý do và trade-off** | **Lý do:** *"Option B cho cảm giác tự nhiên nhất. AI không nhảy bổ vào mặt khi mình chưa cần, nhưng đúng lúc mình dừng lại đọc kỹ thì nó lên tiếng hỏi giúp. Có đủ cả tóm tắt, câu hỏi và chỗ chat hỏi thêm."*<br>**Trade-off:** Chấp nhận mất 1 click bấm *"Có, giúp mình với"* để đổi lại sự thoải mái và quyền kiểm soát. |
| **Evidence chống lại kỳ vọng của nhóm** | Ban đầu nhóm dự đoán Option C (1-click có sẵn) sẽ được chọn vì nhanh nhất, nhưng tester lại cảm thấy Option C hơi "vội vã" và làm mất cảm giác tự học; tester thích sự tương tác từng bước của Option B hơn. |

**Câu tester nói, nguyên văn:**
> "Option B cho cảm giác tự nhiên nhất. AI không nhảy bổ vào mặt khi mình chưa cần, nhưng đúng lúc mình dừng lại đọc kỹ thì nó lên tiếng hỏi giúp. Nút Thu hồi về im lặng này hay, không muốn làm phiền thì tắt được ngay."

---

## Phân tích tách biệt 4 lớp (Four-Layer Synthesis)

```text
OBSERVED (Quan sát thực tế):
- Tester dành phần lớn thời gian (10/18 phút) để trải nghiệm Option B: thử trả lời quiz, xem phần giải thích lỗi sai, và thử gõ câu hỏi vào tab "Trò chuyện".
- Tester bấm thử nút "Thu hồi" ở Option B để xác nhận xem hệ thống có thực sự quay về trạng thái im lặng không.
- Tester từ chối Option A vì quá tốn công tự soạn, và dè dặt với Option C vì sợ học vẹt theo AI.

INTERPRETED (Nhóm diễn giải ý nghĩa):
- Cơ chế Dwell Trigger (chờ 10s hoặc phát hiện ghi chú mới mới hỏi) của Option B tạo ra cảm giác "AI có mắt quan sát tinh tế" chứ không phải là một công cụ spam tự động.
- Người học cần một trợ lý đồng hành (Co-Pilot) vừa có khả năng tóm tắt/quiz, vừa cho phép trò chuyện đào sâu ngay khi cần.

DECIDED — NEXT CHANGE (Quyết định thay đổi ở iteration tiếp theo):
- Giữ vững kiến trúc cốt lõi của Option B.
- Bổ sung thêm tính năng: Cho phép bấm trực tiếp vào một vùng hình ảnh trên slide (Point & Ask) để gửi vào ô chat thay vì chỉ gõ chữ chung chung.

STILL UNPROVEN (Điều vẫn chưa chứng minh được từ 1 tester):
- Chưa chứng minh được liệu trong thực tế dài hạn, tester có kiên nhẫn làm hết 4 câu trắc nghiệm sau mỗi slide hay chỉ làm 1-2 slide rồi thôi.
```

---

## Kết luận được phép

Với Hypothesis Problem này, chúng tôi đã thử bốn cách giải. Tester đã từ chối Option A do rào cản gõ tay, đánh giá cao cơ chế Dwell trigger và quyền kiểm soát (nút Thu hồi) ở Option B, đồng thời đề xuất tính năng hỏi trực tiếp tại điểm chạm trên slide. Vì vậy iteration tiếp theo chúng tôi sẽ hoàn thiện cơ chế kết hợp giải thích tại chỗ (Point & Solve) và bộ câu hỏi tự kiểm tra theo yêu cầu.

Không viết: *User đã xác nhận solution này đúng.*
