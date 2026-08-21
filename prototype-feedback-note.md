# Prototype Feedback Note — Lê Quang Huy

**Người facilitate:** Lê Quang Huy — 2A202601821  
**Nhóm:** cuong · **Case B** — AI Notes: Personal Learning Notes  
**Prototype:** [prototype/index.html](prototype/index.html) — bản chung bốn option  
**Ngày:** 19/08/2026  

**Tester:** anh Coach Lab — **chưa kịp hỏi tên**  
**Ngoài nhóm:** Có. Không phải thành viên nhóm, không phải interviewee Day 17.  
**Có context liên quan:** Có — cũng là sinh viên, vẫn đang đi học và ôn bài.  

> **Đúng chân dung target user.** Anh Coach Lab cũng là học sinh — sinh viên, cũng ôn bài như
> đối tượng mô tả trong Hypothesis Problem. Vai trò coach là việc bạn ấy làm thêm, không làm
> bạn ấy thôi là người trải nghiệm thật.
>
> Một điểm cần nhớ khi đọc kết quả: bạn ấy **đã nắm nội dung bài học** dùng làm fixture. Xem
> mục "Giới hạn của phiên này".

**Thứ tự mở option:** D → C → A → B, sau đó đảo qua lại nhiều lần  
**Thời lượng:** 10:09:38 → 10:22:57 — 13 phút 19 giây  

---

## Observation

| Observation | Note |
|---|---|
| **First action** | **A:** mở ra là **gõ ngay sau 3 giây**, không chờ máy nói.<br>**D:** 13 giây rồi chọn mẩu đầu tiên.<br>**B, C:** không có thao tác nào trong lượt mở đầu — bốn phút đầu buổi chỉ đảo option, 10 lần chuyển, không làm gì. |
| **Chỗ dừng, do dự hoặc hiểu sai** | **C: dừng 7 phút 36 giây** (10:13:51 → 10:21:27) không thao tác nào — khối thời gian dài nhất buổi, hơn nửa buổi test. Nhật ký không phân biệt được đang đọc kỹ, đang nói chuyện, hay đang bí. *(người facilitate cần bổ sung)* |
| **Evidence được đọc hay bỏ qua** | Không đo trực tiếp được — nhật ký chỉ ghi thao tác có bấm, không ghi cuộn hay rê chuột. **Dấu hiệu gián tiếp:** mẩu *Ghi chú ngắn · Slide 7* — mẩu duy nhất mang tag đỏ *"AI không chắc"* — là mẩu được quay lại ở **cả ba option có thao tác**: gắn vào thẻ ở A, thẻ bị sửa và bị đổi ở B, và là mẩu duy nhất được xin *"giải thích dễ hơn"* ở D. Trong khi mẩu *Ảnh chụp + Chưa hiểu · Slide 11* chỉ mở **4 giây** rồi thôi. |
| **Cách tester sửa hoặc lấy lại control** | **B:** bấm *Sửa* rồi *Đổi thẻ khác* — **không** bấm *Giữ*, **không** bấm *Bỏ*.<br>**C:** đổi mục tiêu sang "Ôn nhanh 5 phút", rồi **rollback sau đúng 4 giây**.<br>**D:** xin *giải thích dễ hơn* → *đóng, về ba mẩu* → chọn lại mẩu khác.<br>**A:** gửi một thẻ nhưng **0 mẩu gắn kèm**; gắn nguồn cho thẻ kế rồi bỏ dở. |
| **Option được chọn** | **C và D** — tester đề nghị gộp hai cái |
| **Lý do và trade-off** | *(người facilitate cần bổ sung — hiện chỉ có phần tester đề xuất, chưa có câu trả lời "đổi lại mất gì")* |
| **Evidence chống lại kỳ vọng của nhóm** | **Ba chỗ.** (1) Tester nói giữ hai nút *giữ / sửa* ở B, nhưng hành vi cho thấy hai nút thật sự dùng là *sửa / đổi* — nút *giữ* **chưa bấm lần nào**. (2) Nhóm lo khung chat làm tester ngồi chờ AI ở Option A — **không xảy ra**, gõ ngay sau 3 giây. (3) Mẩu *"chưa hiểu"* — thứ cả Hypothesis Problem xoay quanh — gần như bị bỏ qua, trong khi mẩu ghi chú ngắn mới là chỗ tester quay lại nhiều nhất. |

**Câu tester nói, nguyên văn:**

> "option C cũng hay đấy, nhưng anh nghĩ kết hợp thêm với hướng mở rộng thêm hướng chọn mục để
> mở giống option D thì hay hơn"

> Đây là **đề xuất thiết kế** của tester, không phải quan sát hành vi. Ghi nguyên văn để giữ
> đúng lời; xếp vào cột "tester nói", không được đọc thành kết quả kiểm chứng.

**Các ý còn lại, thuật lại** (chưa có nguyên văn):

- Nếu làm theo B thì giảm giao diện xuống còn **hai nút**: *giữ thẻ* hoặc *sửa thẻ*.
- Thích hơn một phương án **gộp C với D**.
- Cơ chế mong muốn: sau khi AI tổng hợp, **AI tự xác định chỗ nào chưa logic hoặc thiếu thông
  tin**, **hỏi lại người dùng**, rồi liệt kê thành từng mục; bấm vào một mục thì AI **giải
  thích tường minh** phần đó.

---

## Nhật ký thao tác

Nguyên văn, xuất bằng nút *Copy nhật ký*. Bản đầy đủ kèm phân tích ở
[06-test-record.md](06-test-record.md).

```
10:13:51	[C]	chuyển sang option C
10:21:27	[C]	đổi mục tiêu sang "Ôn nhanh 5 phút"
10:21:31	[C]	rollback — bỏ bản AI soạn, quay về ghi chú thô
10:22:04	[D]	chọn mẩu Highlight · Slide 3
10:22:06	[D]	chọn mẩu Ghi chú ngắn · Slide 7
10:22:09	[D]	chọn mẩu Ảnh chụp + Chưa hiểu · Slide 11 — chỗ đánh dấu chưa hiểu
10:22:16	[A]	bắt đầu gõ nội dung cho thẻ tóm tắt
10:22:26	[A]	gửi thẻ tóm tắt vào sổ — 0 mẩu gắn kèm
10:22:41	[B]	sửa tay thẻ tự kiểm tra, nguồn Ghi chú ngắn · Slide 7
10:22:45	[B]	bấm đổi thẻ khác, nguồn Ghi chú ngắn · Slide 7
10:22:52	[D]	xin bản giải thích dễ hơn cho Ghi chú ngắn · Slide 7
10:22:54	[D]	đóng lời giải — Ghi chú ngắn · Slide 7, quay về ba mẩu thô
```

---

## Kết luận được phép

> Với Hypothesis Problem này, chúng tôi đã thử bốn cách giải. Tester đã dành hơn nửa buổi trên
> Option C, thao tác nhiều nhất trên Option D, rollback ở C sau 4 giây, gõ ngay ở A mà không
> chờ AI, và quay lại mẩu Slide 7 ở cả ba option có thao tác trong khi gần như bỏ qua mẩu đánh
> dấu "chưa hiểu". Vì vậy iteration tiếp theo chúng tôi sẽ chạy lại Option B với thời lượng đủ
> để tester duyệt hết thẻ trước khi kết luận nút nào thừa, và hỏi vì sao mẩu "chưa hiểu" lại là
> mẩu ít được mở nhất.

**Không viết:** *User đã xác nhận solution này đúng.*

---

## Giới hạn của phiên này

- **Tester đã biết sẵn nội dung bài học dùng làm fixture.** Ba mẩu ghi chú lấy từ bài Day 17,
  mà anh Coach Lab thì đã nắm phần đó. Điều này giải thích được một chỗ trong nhật ký: mẩu
  *"chưa hiểu" Slide 11* — Pain vs Consequence — chỉ được mở **4 giây**. Với người đã hiểu sẵn
  thì mẩu đó không có gì để hỏi, nên việc bỏ qua nó **không nói được gì** về việc mẩu "chưa
  hiểu" có phải trọng tâm hay không.
- **Không phải mọi khoảng lặng đều là "đang bí".** Bốn phút đầu đảo option 10 lần, và 7 phút 36
  giây trên Option C không thao tác — nhật ký không cho biết đó là đọc kỹ, cân nhắc, hay nói
  chuyện với người ngồi cạnh. Cộng lại là phần lớn thời lượng buổi test **không có dữ liệu
  hành vi**. Chỉ người facilitate mới điền được.
- **Không hỏi được câu trade-off cuối buổi.** Câu nguyên văn có nói *"thì hay hơn"* nhưng không
  nói **đổi lại mất gì**. Gộp C với D nghĩa là AI vẫn soạn sẵn cả gói (chi phí đọc của C) cộng
  thêm một lớp chọn mục — chưa biết tester có chịu cái giá đó không.
- Hai ý còn lại (rút Option B xuống hai nút; cơ chế AI tự nêu chỗ thiếu rồi hỏi lại) vẫn là
  **thuật lại**, chưa có nguyên văn.
- Chưa hỏi được tên tester.
