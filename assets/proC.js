/* ==========================================================================
   proC.js — Option C: AI TỰ LÀM SẴN, NGƯỜI DÙNG CHỈ ĐỌC
             (Trần Đức Bảo phụ trách)

   Mở trang là AI tự đọc nội dung slide và hiện ra ngay, không hỏi trước:
     - một bản tóm tắt khoảng 3 dòng để đọc trước,
     - tối đa 3 ý chính kèm phần bám vào chữ trên slide.
   Guardrail: luôn giữ bản gốc, có nút quay lại và sửa từng phần.

   Tab "Ghi chú gốc" và "Tổng hợp" dùng chung module notesview.js với Option B.
   ========================================================================== */
(function () {
  'use strict';

  var data = null, busy = false, err = null;
  var tab = 'ai';           // 'ai' | 'chat' | 'notes' | 'sum'
  var chat = null;          // khung trò chuyện thời gian thực (Chat)
  var notesView = null;     // khối "Ghi chú gốc" / "Tổng hợp" (NotesView)
  var app, head, tabs, body, foot;

  Core.init({
    option: 'C',
    brand: '#4338ca',
    title: 'Option C — AI làm sẵn hết, bạn chỉ đọc',
    subtitle: 'Trần Đức Bảo phụ trách · AI tự tổng hợp ngay khi mở trang',
    hint: 'Bản tóm tắt bên phải do AI tự sinh khi trang vừa mở — bạn không phải bấm gì.',
    onSlide: function (slide, a) {
      app = a;
      shell();
      if (slide.img && !data && !busy) fetchDigest();
      else draw();
    },
    onKey: function () { if (app && app.slide.img && !data) fetchDigest(); else draw(); }
  });

  /* ---------- gọi AI ngay, không xin phép ---------- */
  function fetchDigest() {
    if (!window.AI || !AI.on()) { draw(); return; }
    busy = true; err = null;
    draw();

    AI.call({
      maxTokens: 8000,
      schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          ideas: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                detail: { type: 'string' },
                quote: { type: 'string' }
              },
              required: ['title', 'detail', 'quote'],
              additionalProperties: false
            }
          }
        },
        required: ['summary', 'ideas'],
        additionalProperties: false
      },
      system:
        'Bạn là trợ giảng cho sinh viên Việt Nam. Trả lời hoàn toàn bằng tiếng Việt. ' +
        'Chỉ dùng thông tin có trong nội dung slide được đưa, không bịa thêm. ' +
        '"summary": tóm tắt slide trong khoảng 3 dòng (2–3 câu ngắn), để người học đọc lướt trước. ' +
        '"ideas": TỐI ĐA 3 ý chính, mỗi ý gồm "title" (một dòng ngắn), ' +
        '"detail" (2–3 câu giải thích) và "quote" (trích đúng cụm chữ xuất hiện trên slide ' +
        'mà ý đó dựa vào, để người học đối chiếu).',
      user: 'Nội dung slide:\n' + app.slide.content
    }).then(function (out) {
      busy = false;
      out.ideas = (out.ideas || []).slice(0, 3);
      data = out;
      draw();
    }).catch(function (e) {
      busy = false; err = e.message; draw();
    });
  }

  /* ---------- khung panel ---------- */
  function shell() {
    app.dock.innerHTML = '';
    head = Core.el('div', 'dock-head',
      '<h2>Bài ôn tập AI tự soạn</h2>' +
      '<div class="lead">Tạo tự động ngay khi bạn mở trang — không cần bấm gì.</div>');
    tabs = Core.el('div', 'tabs');
    body = Core.el('div', 'dock-body');
    foot = Core.el('div', 'dock-foot');
    app.dock.append(head, tabs, body, foot);

    [['ai', 'Bản AI'], ['chat', 'Trò chuyện'],
    ['notes', 'Ghi chú gốc'], ['sum', 'Tổng hợp']].forEach(function (t) {
      var b = Core.el('button', '', t[1]);
      b.dataset.tab = t[0];
      b.onclick = function () {
        if (tab === t[0]) return;
        tab = t[0];
        if (tab !== 'chat' && chat) chat.unmount();
        draw();
      };
      tabs.appendChild(b);
    });
    if (!notesView) notesView = NotesView.create(app);
  }

  /* Đăng ký đúng một lần (không đặt trong shell(), kẻo mỗi lần đổi slide
     lại cộng dồn thêm một listener) */
  Notes.onChange(function () {
    if (app && (tab === 'notes' || tab === 'sum')) draw();
  });

  function draw() {
    if (!app || !body) return;
    body.innerHTML = '';
    foot.innerHTML = '';
    [].forEach.call(tabs.children, function (b) {
      b.classList.toggle('on', b.dataset.tab === tab);
    });

    if (!app.slide.img) {
      body.appendChild(Core.el('div', 'notice slate',
        'Trang slide này chưa có nội dung. Quay lại <b>Slide 5</b>.'));
      return;
    }
    if (tab === 'chat') return drawChat();
    app.captureOff();
    if (tab === 'notes') return notesView.mountRaw(body, foot);
    if (tab === 'sum') return notesView.mountSummary(body, foot);
    if (busy) { body.appendChild(AI.loading('AI đang đọc slide và tóm tắt...')); return; }
    if (!window.AI || !AI.on()) {
      body.appendChild(AI.offNotice(
        'AI chưa được kết nối nên chưa tự soạn được gì.', function () { fetchDigest(); }));
      return;
    }
    if (err) {
      body.appendChild(Core.el('div', 'notice amber', '⚠️ ' + esc(err)));
      var again = Core.el('button', 'btn sm', 'Thử lại');
      again.onclick = fetchDigest;
      body.appendChild(again);
      return;
    }
    if (!data) return;
    drawDigest();
  }

  /* ---------- bản AI soạn ---------- */
  function drawDigest() {
    body.appendChild(Core.el('div', 'notice amber',
      '🤖 <b>AI đã tự soạn bản này</b> ngay khi trang mở, không hỏi bạn trước — ' +
      'đây không phải đáp án chính thức đã được kiểm chứng.'));

    /* tóm tắt ~3 dòng, đọc trước */
    var s = Core.el('div', 'card sumcard',
      '<h3>📄 Đọc nhanh 3 dòng <span class="aitag">AI VIẾT</span></h3>' +
      '<div class="tx">' + esc(data.summary).replace(/\n/g, '<br>') + '</div>');
    s.appendChild(editBtn(s));
    body.appendChild(s);

    if (!data.ideas.length) return;
    body.appendChild(Core.el('div', 'seclabel',
      'Ý chính <span class="count">' + data.ideas.length + '/3</span>'));

    data.ideas.forEach(function (it, i) {
      var c = Core.el('div', 'card',
        '<h3>' + (i + 1) + '. ' + esc(it.title) + '</h3>' +
        '<div class="tx">' + esc(it.detail) + '</div>');
      c.appendChild(Core.el('div', 'quote', '“' + esc(it.quote) + '” — chữ trên slide'));
      c.appendChild(editBtn(c));
      body.appendChild(c);
    });

    var redo = Core.el('button', 'btn sm', '↻ Soạn lại');
    redo.onclick = fetchDigest;
    foot.appendChild(redo);
    foot.appendChild(Core.el('span', 'muted', 'Sửa được từng phần bất cứ lúc nào.'));
  }

  function editBtn(card) {
    var b = Core.el('button', 'btn sm', '✎ Sửa phần này');
    b.style.marginTop = '9px';
    b.onclick = function () {
      var tx = card.querySelector('.tx');
      var onEd = tx.isContentEditable;
      tx.contentEditable = !onEd;
      b.textContent = onEd ? '✎ Sửa phần này' : '✓ Xong sửa';
      if (!onEd) tx.focus();
    };
    return b;
  }

  /* ---------- trò chuyện thời gian thực ---------- */
  function drawChat() {
    if (!chat) chat = Chat.create(app, { context: app.slide.content });
    chat.mount(body, foot);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
    });
  }
})();
