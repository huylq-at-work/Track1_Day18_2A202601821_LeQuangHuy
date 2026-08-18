/* ==========================================================================
   proB.js — Option B: AI VIẾT THỬ, NGƯỜI DÙNG DUYỆT LẠI (Đàm Việt Cường phụ trách)

   AI đọc ghi chú rồi soạn thử thẻ, nhưng phải hỏi trước khi hiện ra.
   Người học duyệt từng thẻ: Giữ / Sửa / Đổi câu khác / Bỏ.
   Mỗi thẻ luôn chỉ rõ nó lấy ý từ vùng nào trên slide.
   ========================================================================== */
(function () {
  'use strict';

  /* Các phương án AI "viết sẵn" — bấm Đổi câu khác sẽ xoay vòng qua chúng. */
  var CARDS = [
    {
      kind: 'Thẻ giải thích chỗ khó', note: 3,
      src: 'Dựa trên chỗ bạn đánh dấu "chưa hiểu" ở hàng dưới cùng',
      variants: [
        { t: 'Ba nhánh khác nhau ở chỗ nào?', c: '<b>In-Context</b>: nhét thẳng dữ liệu vào câu hỏi — hợp khi dữ liệu ngắn.<br><b>RAG</b>: tìm đúng đoạn cần trong kho tài liệu lớn rồi mới đưa cho model.<br><b>Finetuning</b>: dạy lại chính model — hợp khi cần văn phong riêng.' },
        { t: 'Chọn nhánh nào thì hỏi câu gì?', c: 'Hỏi lần lượt: (1) Dữ liệu có nhét vừa vào câu hỏi không? → <b>In-Context</b>. (2) Không vừa, chỉ cần lôi ra đúng đoạn? → <b>RAG</b>. (3) Vấn đề nằm ở cách model diễn đạt? → <b>Finetuning</b>.' },
        { t: 'Vì sao Day 07 chọn RAG?', c: 'Cả ba nhánh đều nhằm đưa <b>Data</b> tới model, nhưng RAG là nhánh duy nhất xử lý được kho tài liệu lớn mà <i>không phải đụng vào model</i> — đúng câu bạn đã ghi.' }
      ]
    },
    {
      kind: 'Câu hỏi ôn tập 1', note: 2,
      src: 'Dựa trên ghi chú tay của bạn ở ô RAG',
      variants: [
        { t: 'Câu hỏi', c: 'RAG giải quyết vấn đề bằng cách đổi <b>model</b> hay đổi <b>dữ liệu đưa vào model</b>? Vì sao?' },
        { t: 'Câu hỏi', c: 'Kho tài liệu có 5.000 trang — vì sao không dùng In-Context mà phải dùng RAG?' },
        { t: 'Câu hỏi', c: 'Trong sơ đồ, RAG nằm ở tầng nào và nó đẩy cái gì lên cho LLM/VLM?' }
      ]
    },
    {
      kind: 'Câu hỏi ôn tập 2', note: 1,
      src: 'Dựa trên phần bôi vàng ở tiêu đề sơ đồ',
      variants: [
        { t: 'Câu hỏi', c: 'Cả sơ đồ này chỉ có ý nghĩa trong trường hợp nào của LLM/VLM?' },
        { t: 'Câu hỏi', c: 'Nếu LLM đã có sẵn câu trả lời đúng, ta còn cần tới nhánh Data / RAG nữa không?' },
        { t: 'Câu hỏi', c: 'Điền vào chỗ trống: sơ đồ mô tả cách xử lý khi LLM/VLM ______ câu trả lời.' }
      ]
    }
  ];

  var idx = 0, vi = 0, kept = [], mode = 'review', asked = false;
  var app, body, head, foot;

  app = Core.init({
    option: 'B',
    brand: '#0f766e',
    title: 'Option B — AI viết thử, người dùng duyệt lại',
    subtitle: 'Đàm Việt Cường phụ trách · AI hỏi trước, người học quyết định cuối cùng',
    hint: 'Mỗi thẻ AI đề xuất sẽ tự nháy sáng vùng slide mà nó lấy ý ra — bấm nhãn nguồn để xem lại.',
    onSlide: function (slide, a) {
      app = a;
      if (!slide.img) { renderEmpty(); return; }
      a.markAll(true);
      shell();
      if (!asked) popup(); else render();
    }
  });

  /* ---------- popup hỏi trước ---------- */
  function popup() {
    /* Gắn vào .stage (không phải .slidewrap) — slidewrap có line-height:0 và
       overflow:hidden nên popup đặt bên trong sẽ bị chồng chữ và cắt bóng đổ. */
    var wrap = app.stage;
    if (!wrap) return;
    var t = Core.el('div', 'toast',
      '<h4>🤖 AI có gợi ý cho bạn</h4>' +
      '<p>AI đã chuẩn bị sẵn <b>1 thẻ giải thích</b> và <b>2 câu hỏi ôn tập</b> từ ghi chú của bạn trên slide này. Xem không?</p>' +
      '<div class="row"><button class="btn sm" data-a="later">Để sau</button>' +
      '<button class="btn sm pri" data-a="now">Xem ngay</button></div>');
    t.querySelector('[data-a="later"]').onclick = function () { asked = true; t.remove(); later(); };
    t.querySelector('[data-a="now"]').onclick = function () { asked = true; t.remove(); render(); };
    wrap.appendChild(t);
    body.innerHTML = '';
    body.appendChild(Core.el('div', 'notice slate',
      '⏳ AI đang chờ bạn trả lời câu hỏi ở góc phải slide — chưa hiện gợi ý nào ra cả.'));
  }

  function later() {
    body.innerHTML = '';
    body.appendChild(Core.el('div', 'notice slate', 'Bạn đã chọn <b>Để sau</b>. Gợi ý của AI vẫn được giữ, không tự hiện ra.'));
    var b = Core.el('button', 'btn pri', 'Xem gợi ý của AI');
    b.onclick = function () { idx = 0; vi = 0; render(); };
    body.appendChild(b);
    foot.innerHTML = '';
  }

  /* ---------- khung panel ---------- */
  function shell() {
    app.dock.innerHTML = '';
    head = Core.el('div', 'dock-head', '');
    body = Core.el('div', 'dock-body');
    foot = Core.el('div', 'dock-foot');
    app.dock.append(head, body, foot);
    drawHead();
  }

  function drawHead() {
    var label = mode === 'review'
      ? 'AI đề xuất — bạn duyệt từng thẻ'
      : 'Bộ ôn tập của bạn (' + kept.length + ' thẻ)';
    head.innerHTML = '<h2>' + label + '</h2><div class="lead" id="pg"></div>';
    var sw = Core.el('button', 'btn sm', mode === 'review'
      ? '📁 Xem bộ đã giữ (' + kept.length + ')' : '↩ Quay lại duyệt thẻ');
    sw.style.marginTop = '6px';
    sw.onclick = function () {
      mode = (mode === 'review') ? 'kept' : 'review';
      drawHead();
      mode === 'kept' ? drawKept() : render();
    };
    head.appendChild(sw);
  }

  function renderEmpty() {
    shell();
    body.appendChild(Core.el('div', 'notice slate',
      'Trang slide này chưa có ghi chú nên AI không đề xuất gì. Quay lại <b>Slide 5</b>.'));
  }

  /* ---------- duyệt thẻ ---------- */
  function render() {
    mode = 'review';
    drawHead();
    body.innerHTML = '';
    foot.innerHTML = '';

    body.appendChild(Core.el('div', 'notice amber',
      '⚠️ Đây là gợi ý từ AI dựa theo ghi chú của bạn — <b>hãy kiểm tra lại trước khi giữ</b>.'));

    if (idx >= CARDS.length) {
      document.getElementById('pg').textContent = 'Đã duyệt xong cả ' + CARDS.length + ' thẻ.';
      body.appendChild(Core.el('div', 'notice slate',
        'Xong. Bạn đã giữ lại <b>' + kept.length + '/' + CARDS.length + '</b> thẻ.'));
      var again = Core.el('button', 'btn', 'Duyệt lại từ đầu');
      again.onclick = function () { idx = 0; vi = 0; render(); };
      body.appendChild(again);
      return;
    }

    var card = CARDS[idx], v = card.variants[vi];
    document.getElementById('pg').textContent =
      'Thẻ ' + (idx + 1) + '/' + CARDS.length + ' · phương án ' + (vi + 1) + '/' + card.variants.length;

    app.lit(card.note, 1600);

    var box = Core.el('div', 'card',
      '<h3>' + v.t + '</h3><div class="tx">' + v.c + '</div>');
    var src = Core.el('div', 'src', '📍 ' + card.src);
    src.onclick = function () { app.lit(card.note); };
    box.appendChild(src);
    body.appendChild(box);

    var bKeep = Core.el('button', 'btn pri sm', '✓ Đồng ý giữ');
    var bEdit = Core.el('button', 'btn sm', '✎ Sửa lại');
    var bSwap = Core.el('button', 'btn sm', '↻ Đổi câu khác');
    var bDrop = Core.el('button', 'btn sm danger', '✕ Bỏ thẻ này');

    bKeep.onclick = function () {
      var tx = box.querySelector('.tx');
      kept.push({
        kind: card.kind, html: tx.innerHTML, src: card.src, note: card.note,
        edited: tx.innerHTML !== v.c
      });
      idx++; vi = 0; render();
    };
    bEdit.onclick = function () {
      var tx = box.querySelector('.tx');
      var on = tx.isContentEditable;
      tx.contentEditable = !on;
      bEdit.textContent = on ? '✎ Sửa lại' : '✓ Xong sửa';
      if (!on) tx.focus();
    };
    bSwap.onclick = function () { vi = (vi + 1) % card.variants.length; render(); };
    bDrop.onclick = function () { idx++; vi = 0; render(); };

    foot.append(bKeep, bEdit, bSwap, bDrop);
  }

  /* ---------- danh sách đã giữ ---------- */
  function drawKept() {
    body.innerHTML = '';
    foot.innerHTML = '';
    if (!kept.length) {
      body.appendChild(Core.el('div', 'muted', 'Chưa giữ thẻ nào. Quay lại duyệt và bấm "Đồng ý giữ".'));
      return;
    }
    kept.forEach(function (k) {
      var c = Core.el('div', 'card',
        '<h3 style="font-size:11.5px;color:#0f766e;text-transform:uppercase">' + k.kind +
        (k.edited ? ' · bạn đã sửa' : ' · giữ nguyên bản AI viết') + '</h3>' +
        '<div class="tx">' + k.html + '</div>');
      var s = Core.el('div', 'src', '📍 ' + k.src);
      s.onclick = function () { app.lit(k.note); };
      c.appendChild(s);
      body.appendChild(c);
    });
  }
})();
