# Group Feedback Synthesis — Nhóm cuong

**Case B** — AI Notes: Personal Learning Notes  
**Thành viên:** 
1. Lê Quang Huy (2A202601821) — Phụ trách Option A
2. Đàm Việt Cường (2A202601566) — Phụ trách Option B
3. Trần Đức Bảo (2A202601472) — Phụ trách Option C
4. Hoàng Minh Quân (2A202601574) — Phụ trách Option D  

---

## 1. Bốn Feedback Note từ 4 Testers Độc Lập

| Feedback Note | Facilitate | Tester | Prototype đã dùng | Option có sẵn | Option chọn |
|---|---|---|---|---|---|
| [prototype-feedback-note.md](prototype-feedback-note.md) | Lê Quang Huy | anh Coach Lab (HS/SV, ngoài nhóm) | Bản chung canned | A, B, C, D | C và D |
| [06-prototype-feedback-damvietcuong.md](06-prototype-feedback-damvietcuong.md) | Đàm Việt Cường | Nguyễn Văn Nam (học viên ngoài nhóm) | Bản chung & proB | A, B, C, D | B |
| [06-prototype-feedback-tranducbao.md](06-prototype-feedback-tranducbao.md) | Trần Đức Bảo | Lê Minh Đức (bàn bên cạnh, ngoài nhóm) | Bộ gọi API thật | A, B, C | B (đòi thêm cơ chế như D) |
| [06-prototype-feedback-hoangminhquan.md](06-prototype-feedback-hoangminhquan.md) | Hoàng Minh Quân | Một bạn cùng lớp (ngoài nhóm) | Bản chung canned | A, B, C, D | C và D |

> **Ghi chú về môi trường test:** Hai phiên của Huy và Quân chạy trên bản chung canned 4 option. Phiên của Cường chạy trên bản chung kết hợp kiểm tra tương tác deep-dive ở Option B. Phiên của Bảo chạy trên bộ gọi API thật giai đoạn đầu (khi chưa có D).

---

## 2. Bảng Đối Chiếu Phản Hồi Từ 4 Testers

| Tiêu chí đối chiếu | Feedback 1 (Huy facilitate) | Feedback 2 (Cường facilitate) | Feedback 3 (Bảo facilitate) | Feedback 4 (Quân facilitate) | Pattern chung & Điểm khác biệt |
|---|---|---|---|---|---|
| **Hành động đầu tiên (First Action)** | A: Gõ ngay sau 3s. D: Chọn mẩu Slide 3 sau 13s. B/C: Không làm gì ở 4 phút đầu. | Option B: Dừng đọc Slide 11 khoảng 10s, AI hỏi thì bấm đồng ý ngay và làm câu quiz 1. | Mở Option C làm thử câu hỏi trước, sau đó chuyển sang Option B để so sánh. | A: Thấy 3 mẩu & ô trống, không gõ. B: Lướt qua 4 thẻ, không sửa/chốt. C/D: C mở ra có cả bộ; D bấm ngay Slide 11 (chưa hiểu). | Cả 4 testers đều bỏ qua việc tự gõ thủ công ở A khi phải tốn nhiều công sức; ưu tiên tốc độ tiếp cận lời giải đáp. |
| **Khó khăn / Điểm nghẽn chính** | Bị nghẽn nếu phải duyệt tuần tự các thẻ khi đang vội. C sinh bản dài chiếm nhiều thời gian đọc. | Option A quá tốn công tự gõ. Option C sinh tóm tắt hơi dài dòng làm giảm cảm giác chủ động. | Tốc độ gọi API hỏi đáp đôi khi bị chậm 2-3s; muốn bấm trực tiếp vào hình ảnh slide để hỏi ngay. | A: Dừng ở ô trống tưởng chat máy sẽ viết. C: Dừng vì bản dài. D: Không dừng — bấm 1 mẩu là ra ngay lời giải. | **Pattern rõ rệt:** Option A bị từ chối 100% vì rào cản thao tác lớn. Option C có giá trị khi muốn xem toàn bộ nhưng dễ quá tải; Option B và D giải quyết tốt khi cần giải tỏa đúng 1 điểm chưa hiểu. |
| **Cách lấy lại quyền kiểm soát** | B: Bấm Sửa và Đổi thẻ khác. C: Đổi mục tiêu rồi rollback sau 4s. D: Xin giải thích dễ hơn $\rightarrow$ Đóng về 3 mẩu. | Bấm nút `[↻ Soạn lại]` và bấm thử nút `[Thu hồi — về lại im lặng]` ở Option B để xác nhận quyền kiểm soát. | Bấm nút `[Quay lại ghi chú gốc]` ở Option C và dùng tab `Ghi chú gốc` ở Option B. | Dùng nút *[Giải thích dễ hơn]* $\rightarrow$ *[Đóng, về ba mẩu]* $\rightarrow$ chọn lại Slide 11 ở Option D. | Tất cả testers đều chủ động sử dụng các nút điều hướng / đổi cách giải thích / rollback về bản gốc khi cần. |
| **Option được chọn** | **C và D** (Gộp cả 2) | **Option B** (Ask & Propose) | **Option B** (Ask & Propose) | **C và D** (Gộp cả 2) | Đa số chọn sự linh hoạt: vừa có khả năng giải thích đúng 1 điểm nghẽn, vừa có thể tạo cả bộ ôn tập khi cần. |
| **Lý do & Trade-off chấp nhận** | *"C với D tiện. C có sẵn cả bài, D bấm đúng chỗ chưa hiểu là xong, nhanh."* | *"Option B tự nhiên nhất. AI không nhảy bổ vào mặt, hỏi đúng lúc dừng đọc. Đổi lại mất 1 click đồng ý."* | Thích tương tác hỏi đáp đúng lúc, không bị ép nhận bài soạn sẵn. | *"C có sẵn cả bài, D bấm đúng chỗ chưa hiểu là xong. Đổi lại A phải tự viết, B phải bấm duyệt nhiều."* | Người học không muốn mất công gõ tay (A) hoặc bấm duyệt quá nhiều thẻ (B) khi đang vội, mà muốn chọn đúng chế độ phù hợp với thời gian mình có. |

---

## 3. Pattern — Chỗ các phiên trùng nhau

**P1 — Đòi hỏi cơ chế "hỏi đúng chỗ đang vướng" (Targeted Point & Ask):**
- Cả 4 testers đều đánh giá cao việc có thể chỉ tay/bấm vào đúng mẩu ghi chú hoặc slide chưa hiểu (Slide 11) để nhận ngay giải thích ngắn gọn mà không cần qua nhiều bước trung gian.

**P2 — Chi phí duyệt thẻ ở Option B:**
- Bắt người học phải duyệt qua từng thẻ (*Giữ / Sửa / Đổi / Bỏ*) trước khi được học gây ma sát nếu người học đang cần ôn gấp. Tester có xu hướng muốn vào thẳng bài học hoặc quiz.

**P3 — Tầm quan trọng của hàng rào an toàn (Recovery Path):**
- Cả 4 phiên đều ghi nhận tester sử dụng các nút *Rollback*, *Thu hồi về im lặng*, *Đóng về 3 mẩu thô*, chứng minh đường phục hồi giúp người học an tâm thử nghiệm AI.

---

## 4. Next Change của Nhóm

Chốt theo pattern mạnh nhất từ 4 phiên thực nghiệm:

> **Tích hợp cơ chế Hybrid hai mức độ:**  
> 1. **Mức 1 (Point & Solve / Targeted Help - theo Option B & D):** Cho phép người học bấm trực tiếp vào đúng mẩu ghi chú hoặc vùng ảnh slide đánh dấu "Chưa hiểu" để nhận ngay lời giải thích ngắn gọn/dễ hiểu chỉ cho đúng điểm đó.  
> 2. **Mức 2 (Full Study Pack - theo Option C):** Nút *"Soạn sẵn cả bộ ôn tập"* dành cho lúc người học muốn có trọn gói 3 ý chính và bài trắc nghiệm Active Recall toàn bài.  
> Không bắt ép người học phải duyệt tuần tự từng thẻ nếu họ chỉ đang cần giải tỏa nhanh 1 khái niệm khó trước giờ lên lớp.

---

## 5. Still Unproven

- **Hypothesis Problem chưa được kiểm chứng định lượng:** Các phiên mới đo *interaction & preference*, chưa đo lường được *learning outcome* (điểm số hoặc thời gian tiết kiệm thực tế dài hạn).
- **Chưa nguồn nào cho hậu quả định lượng:** Thiếu số liệu về số giờ lãng phí cụ thể hoặc điểm số sụt giảm.
- **Tính bền vững của thói quen ôn tập:** Liệu người học có duy trì thói quen làm bài quiz tự kiểm tra đều đặn hay không.

---

## 6. Đối Chiếu Gate 5 (GATE 5 Passed)

- [x] **Có đủ 4 bản feedback độc lập** từ 4 thành viên trong nhóm với 4 testers ngoài nhóm ([Huy](prototype-feedback-note.md), [Cường](06-prototype-feedback-damvietcuong.md), [Bảo](06-prototype-feedback-tranducbao.md), [Quân](06-prototype-feedback-hoangminhquan.md)).
- [x] **Chỉ ra được pattern hành vi và điểm khác biệt thực chất** (P1, P2, P3).
- [x] **Chốt rõ ràng một Group Next Change tích hợp** có dữ liệu quan sát từ các buổi test làm căn cứ.
- [x] **Nêu rõ các điều Still Unproven** và giữ đúng giới hạn kết luận.
