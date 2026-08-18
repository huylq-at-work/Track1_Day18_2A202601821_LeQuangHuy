/* ==========================================================================
   proC.js — Option C: AI LÀM SẴN HẾT, NGƯỜI DÙNG XEM VÀ SỬA (Trần Đức Bảo phụ trách)

   Mở trang là AI đã soạn xong: 3 ý chính + 1 đoạn giải thích + 3 câu hỏi.
   Không hỏi trước, nhưng luôn giữ bản ghi chú gốc và cho quay lại tức thì.
   Chia tab để toàn bộ nằm gọn trong một màn hình.
   ========================================================================== */
(function () {
  'use strict';

  var IDEAS = [
    {
      note: 1, h: '1. Sơ đồ chỉ dùng khi LLM/VLM không tự trả lời được',
      c: 'Toàn bộ nhánh Data bên dưới chỉ có ý nghĩa khi model <b>không có sẵn</b> câu trả lời trong tri thức của nó. Model đã biết rồi thì không cần tới các nhánh này.'
    },
    {
      note: 2, h: '2. Cả ba nhánh đều đổ về một chỗ: Data',
      c: 'In-Context, RAG và Finetuning là ba đường khác nhau nhưng đều nhằm đưa <b>Data</b> lên cho LLM/VLM. Khác nhau ở <i>cách</i> đưa vào, không phải ở <i>cái</i> đưa vào.'
    },
    {
      note: 2, h: '3. Day 07 đi theo nhánh RAG',
      c: 'RAG = đưa <b>đúng</b> dữ liệu cần thiết vào agent, thay vì phải sửa hay đào tạo lại model. Đó là lý do cả buổi tập trung vào nhánh này.'
    }
  ];

  var EXPLAIN = {
    note: 3,
    h: 'Khi nào dùng In-Context, khi nào RAG, khi nào Finetuning?',
    c: 'Hỏi lần lượt 3 câu là ra:<br>' +
      '<b>1.</b> Dữ liệu ngắn, nhét thẳng vào câu hỏi được không? → <b>In-Context</b> (slide ghi: "dữ liệu ngắn").<br>' +
      '<b>2.</b> Dữ liệu quá lớn, chỉ cần lôi ra đúng đoạn liên quan? → <b>RAG</b> (slide ghi: "corpus lớn").<br>' +
      '<b>3.</b> Vấn đề nằm ở cách model diễn đạt? → <b>Finetuning</b> (slide ghi: "cần style riêng").<br>' +
      '<i>Mẹo:</i> hai nhánh đầu chỉ đổi <b>dữ liệu đưa vào</b>, riêng nhánh ba mới đụng vào <b>chính model</b>.'
  };

  var QUIZ = {
    'Cơ bản': [
      { note: 1, q: 'Sơ đồ này áp dụng trong trường hợp nào?', a: ['Khi LLM/VLM không có sẵn câu trả lời', 'Khi LLM/VLM trả lời quá chậm', 'Khi người dùng hỏi sai câu'], r: 0 },
      { note: 2, q: 'Ba nhánh cùng đẩy cái gì lên cho LLM/VLM?', a: ['Câu hỏi', 'Data', 'Câu trả lời'], r: 1 },
      { note: 2, q: 'Day 07 tập trung vào nhánh nào?', a: ['In-Context', 'Finetuning', 'RAG'], r: 2 }
    ],
    'Nâng cao': [
      { note: 3, q: 'Kho 5.000 trang, cần trả lời đúng theo tài liệu đó. Nhánh nào hợp nhất?', a: ['In-Context — nhét cả 5.000 trang vào câu hỏi', 'RAG — tìm đúng đoạn liên quan rồi mới đưa cho model', 'Finetuning — dạy lại model bằng 5.000 trang'], r: 1 },
      { note: 3, q: 'Nhánh nào là nhánh DUY NHẤT thay đổi chính bản thân model?', a: ['In-Context', 'RAG', 'Finetuning'], r: 2 },
      { note: 2, q: 'Vì sao nói RAG là "đưa đúng dữ liệu vào agent thay vì đổi model"?', a: ['Vì RAG chỉ can thiệp vào dữ liệu đưa vào, giữ nguyên model', 'Vì RAG huấn luyện lại model bằng dữ liệu mới', 'Vì RAG thay LLM bằng model nhỏ hơn'], r: 0 }
    ]
  };

  var tab = 'y', level = 'Cơ bản', raw = false;
  var app, head, tabs, body, foot;

  Core.init({
    option: 'C',
    brand: '#4338ca',
    title: 'Option C — AI làm sẵn hết, người dùng xem và sửa',
    subtitle: 'Trần Đức Bảo phụ trách · AI tự soạn ngay khi mở trang, luôn có đường quay lại',
    hint: 'Bấm nhãn nguồn trong mỗi mục để nháy sáng đúng vùng slide mà AI lấy ý ra.',
    onSlide: function (slide, a) {
      app = a;
      if (!slide.img) { renderEmpty(); return; }
      a.markAll(true);
      shell();
      draw();
    }
  });

  /* ---------- khung panel ---------- */
  function shell() {
    app.dock.innerHTML = '';
    head = Core.el('div', 'dock-head',
      '<h2>Bài ôn tập AI tự soạn</h2>' +
      '<div class="lead">Đã tạo xong ngay khi bạn mở trang — không cần bấm gì.</div>');
    tabs = Core.el('div', 'tabs');
    body = Core.el('div', 'dock-body');
    foot = Core.el('div', 'dock-foot');
    app.dock.append(head, tabs, body, foot);

    [['y', 'Ý chính'], ['g', 'Giải thích'], ['q', 'Câu hỏi']].forEach(function (t) {
      var b = Core.el('button', '', t[1]);
      b.dataset.tab = t[0];
      b.onclick = function () { tab = t[0]; raw = false; draw(); };
      tabs.appendChild(b);
    });
  }

  function renderEmpty() {
    app.dock.innerHTML = '';
    var h = Core.el('div', 'dock-head', '<h2>Bài ôn tập AI tự soạn</h2>');
    var b = Core.el('div', 'dock-body');
    b.appendChild(Core.el('div', 'notice slate',
      'Trang slide này chưa có ghi chú nên AI chưa soạn gì. Quay lại <b>Slide 5</b>.'));
    app.dock.append(h, b);
  }

  /* ---------- vẽ nội dung ---------- */
  function draw() {
    body.innerHTML = '';
    foot.innerHTML = '';
    tabs.style.display = raw ? 'none' : '';
    [].forEach.call(tabs.children, function (b) { b.classList.toggle('on', b.dataset.tab === tab); });

    if (raw) { drawRaw(); } else if (tab === 'y') { drawIdeas(); }
    else if (tab === 'g') { drawExplain(); } else { drawQuiz(); }

    drawFoot();
  }

  function banner() {
    return Core.el('div', 'notice amber',
      '🤖 <b>AI đã tự soạn bản này</b> từ 3 mẩu ghi chú của bạn — không phải đáp án chính thức đã được kiểm chứng.');
  }

  function srcChip(noteId, label) {
    var s = Core.el('div', 'src', '📍 ' + label);
    s.onclick = function () { app.lit(noteId); };
    return s;
  }

  function editable(card) {
    var b = Core.el('button', 'btn sm', '✎ Sửa phần này');
    b.style.marginTop = '8px';
    b.onclick = function () {
      var tx = card.querySelector('.tx');
      var on = tx.isContentEditable;
      tx.contentEditable = !on;
      b.textContent = on ? '✎ Sửa phần này' : '✓ Xong sửa';
      if (!on) tx.focus();
    };
    return b;
  }

  function drawIdeas() {
    body.appendChild(banner());
    IDEAS.forEach(function (i) {
      var c = Core.el('div', 'card', '<h3>' + i.h + '</h3><div class="tx">' + i.c + '</div>');
      c.appendChild(srcChip(i.note, 'Lấy ý từ vùng đánh dấu ' + i.note + ' trên slide'));
      c.appendChild(editable(c));
      body.appendChild(c);
    });
  }

  function drawExplain() {
    body.appendChild(banner());
    var c = Core.el('div', 'card',
      '<h3>' + EXPLAIN.h + ' <span class="aitag">AI TỰ VIẾT</span></h3><div class="tx">' + EXPLAIN.c + '</div>');
    c.style.borderLeft = '4px solid #4338ca';
    c.appendChild(srcChip(EXPLAIN.note, 'Lấy từ chỗ bạn đánh dấu "chưa hiểu"'));
    c.appendChild(editable(c));
    body.appendChild(c);
  }

  function drawQuiz() {
    body.appendChild(Core.el('div', 'notice amber',
      '⚠️ <b>Câu hỏi do AI tự đặt, chưa ai kiểm tra lại</b> — khác với phần tóm tắt vốn bám sát chữ trên slide.'));

    QUIZ[level].forEach(function (item, i) {
      var c = Core.el('div', 'card', '<h3>Câu ' + (i + 1) + '. ' + item.q + '</h3>');
      item.a.forEach(function (t, j) {
        var b = Core.el('button', 'opt', t);
        b.onclick = function () {
          [].forEach.call(c.querySelectorAll('.opt'), function (o, k) {
            o.disabled = true;
            if (k === item.r) o.classList.add('right');
          });
          if (j !== item.r) b.classList.add('wrong');
          c.querySelector('.res').textContent =
            (j === item.r) ? '✓ Đúng rồi.' : '✗ Chưa đúng — đáp án đúng đã tô xanh.';
          app.lit(item.note, 1100);
        };
        c.appendChild(b);
      });
      c.appendChild(Core.el('div', 'res', ''));
      c.appendChild(srcChip(item.note, 'Vùng liên quan trên slide'));
      body.appendChild(c);
    });
  }

  function drawRaw() {
    body.appendChild(Core.el('div', 'notice amber',
      '↺ Đang xem <b>3 mẩu ghi chú gốc</b> — chưa qua xử lý của AI. Bản AI soạn vẫn được giữ nguyên.'));
    app.slide.notes.forEach(function (n) {
      var c = Core.el('div', 'card', '<div class="tx">' + n.text + '</div>');
      c.style.borderLeft = '4px solid #94a3b8';
      c.appendChild(srcChip(n.id, n.meta));
      body.appendChild(c);
    });
  }

  /* ---------- thanh dưới: rollback + độ khó ---------- */
  function drawFoot() {
    var bBack = Core.el('button', 'btn sm ' + (raw ? 'pri' : 'warnb'),
      raw ? '↩ Xem lại bài AI soạn' : '↺ Quay lại ghi chú gốc');
    bBack.onclick = function () { raw = !raw; draw(); };
    foot.appendChild(bBack);

    if (!raw && tab === 'q') {
      var bLv = Core.el('button', 'btn sm', 'Độ khó: ' + level);
      bLv.onclick = function () {
        level = (level === 'Cơ bản') ? 'Nâng cao' : 'Cơ bản';
        draw();
      };
      foot.appendChild(bLv);
    }
    foot.appendChild(Core.el('span', 'muted', raw ? 'Bản gốc luôn được giữ song song.' : 'Sửa được từng phần bất cứ lúc nào.'));
  }
})();
