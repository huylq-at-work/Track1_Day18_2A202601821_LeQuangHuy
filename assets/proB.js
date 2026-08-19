/* ==========================================================================
   proB.js — Option B: AI CHỦ ĐỘNG HỎI THĂM, NGƯỜI DÙNG QUYẾT ĐỊNH
             (Đàm Việt Cường phụ trách)

   Khác Option C (tự làm sẵn, không hỏi) và khác bản B cũ (xin phép ngay khi
   mở trang): giờ AI im lặng quan sát, chỉ CHỦ ĐỘNG hỏi "cần giúp không?"
   khi có một trong hai tín hiệu:
     - bạn ở lại slide này khoảng 10 giây, hoặc
     - bạn vừa ghi một mẩu ghi chú cho slide này.
   Bấm "Hỏi ngay" cũng kích hoạt được, không cần chờ.

   Đồng ý xong thì có đủ các tính năng như Option C — tóm tắt + câu hỏi ôn
   tập, trò chuyện thời gian thực, xem/tổng hợp ghi chú — chỉ khác cách vào:
   Option C hiện thẳng ra (Act), Option B luôn hỏi trước (Ask/Propose).
   ========================================================================== */
(function () {
  'use strict';

  var DWELL_MS = 10000;   // 10 giây dừng ở slide thì tự hỏi

  var perm = null;        // null = chưa từng hỏi | 'yes' | 'no' = vừa từ chối
  var asking = false;     // đang hiện thẻ "cần trợ giúp không?"
  var reason = null;      // 'dwell' | 'note' | 'manual' — vì sao AI hỏi lúc này
  var dwellTimer = null;
  var noteBaseline = 0;   // số ghi chú của slide này lúc bắt đầu chờ — dùng để phát hiện mẩu MỚI

  var data = null;        // { summary, questions[] }
  var qi = 0;             // câu đang hiển thị
  var answers = [];       // đáp án người học đã chọn
  var busy = false, err = null;
  var askText = '', askAns = null, askBusy = false;   // ô hỏi nhanh khi chưa đồng ý

  var tab = 'study';       // 'study' | 'chat' | 'notes' | 'sum' — chỉ dùng khi perm==='yes'
  var chat = null;
  var notesView = null;
  var app, head, tabs, body, foot;

  Core.init({
    option: 'B',
    brand: '#0f766e',
    title: 'Option B — AI chủ động hỏi thăm',
    subtitle: 'Đàm Việt Cường phụ trách · Hỏi trước khi giúp, không tự ý đọc slide',
    hint: 'Ở lại slide khoảng 10 giây hoặc ghi một ghi chú — AI sẽ tự lên tiếng hỏi bạn có cần giúp không.',
    onSlide: function (slide, a) {
      app = a;
      shell();
      clearDwellTimer();
      asking = false;
      if (slide.img && perm !== 'yes') {
        noteBaseline = Notes.count(slide.no);
        scheduleDwell();
      }
      render();
    },
    onKey: function () { render(); }
  });

  /* Ghi chú thay đổi ở bất cứ đâu trong app đều đi qua đây một lần duy nhất
     (đăng ký ở cấp module, không đăng ký lại mỗi lần đổi slide). */
  Notes.onChange(function () {
    if (!app) return;
    if (perm === 'yes') {
      if (tab === 'notes' || tab === 'sum') render();
      return;
    }
    if (!app.slide.img || asking) return;
    if (Notes.count(app.slide.no) > noteBaseline) fire('note');
  });

  function scheduleDwell() {
    clearDwellTimer();
    if (perm === 'yes') return;
    var targetNo = app.slide.no;
    dwellTimer = setTimeout(function () {
      dwellTimer = null;
      if (!app || app.slide.no !== targetNo) return;   // đã chuyển slide
      if (perm === 'yes' || asking) return;
      fire('dwell');
    }, DWELL_MS);
  }
  function clearDwellTimer() {
    if (dwellTimer) { clearTimeout(dwellTimer); dwellTimer = null; }
  }
  function fire(why) {
    clearDwellTimer();
    asking = true; reason = why;
    render();
  }

  function shell() {
    app.dock.innerHTML = '';
    head = Core.el('div', 'dock-head', '');
    tabs = Core.el('div', 'tabs');
    body = Core.el('div', 'dock-body');
    foot = Core.el('div', 'dock-foot');
    app.dock.append(head, tabs, body, foot);

    [['study', 'Ôn tập'], ['chat', 'Trò chuyện'],
    ['notes', 'Ghi chú gốc'], ['sum', 'Tổng hợp']].forEach(function (t) {
      var b = Core.el('button', '', t[1]);
      b.dataset.tab = t[0];
      b.onclick = function () {
        if (tab === t[0]) return;
        tab = t[0];
        if (tab !== 'chat' && chat) chat.unmount();
        render();
      };
      tabs.appendChild(b);
    });
    if (!notesView) notesView = NotesView.create(app);
  }

  function setHead(title, lead) {
    head.innerHTML = '<h2>' + title + '</h2>' + (lead ? '<div class="lead">' + lead + '</div>' : '');
  }

  function render() {
    if (!app || !head) return;
    body.innerHTML = '';
    foot.innerHTML = '';

    /* Các tab CHỈ hiện sau khi đã đồng ý — trước đó không có gì để mở. */
    tabs.style.display = (perm === 'yes' && app.slide.img) ? '' : 'none';
    [].forEach.call(tabs.children, function (b) {
      b.classList.toggle('on', b.dataset.tab === tab);
    });

    if (!app.slide.img) {
      setHead('Trợ lý ôn tập');
      body.appendChild(Core.el('div', 'notice slate',
        'Trang slide này chưa có nội dung. Quay lại <b>Slide 5</b>.'));
      return;
    }

    if (perm === 'yes') {
      if (tab !== 'chat') app.captureOff();
      if (tab === 'chat') return renderChat();
      if (tab === 'notes') return notesView.mountRaw(body, foot);
      if (tab === 'sum') return notesView.mountSummary(body, foot);
      return renderStudy();
    }

    app.captureOff();
    if (asking) return renderAsking();
    return renderWaiting();
  }

  /* ================= AI chủ động hỏi ================= */
  function renderAsking() {
    var line = reason === 'dwell' ? 'Bạn đã ở lại slide này một lúc rồi.'
      : reason === 'note' ? 'Mình thấy bạn vừa ghi chú cho slide này.'
        : 'Bạn vừa bấm hỏi mình.';
    setHead('AI muốn hỏi bạn', line);

    var c = Core.el('div', 'card',
      '<h3>Bạn có cần trợ giúp với slide này không?</h3>' +
      '<div class="tx">Nếu cần, mình sẽ đọc nội dung slide để <b>tóm tắt</b> và ' +
      '<b>soạn câu hỏi ôn tập</b>, và bạn mở được cả mục <b>trò chuyện</b> lẫn ' +
      '<b>tổng hợp ghi chú</b> của bạn. Nếu chưa cần, mình sẽ lại im lặng — ' +
      'nhưng hễ bạn ghi chú thêm gì, mình sẽ hỏi lại.</div>');
    body.appendChild(c);

    if (!window.AI || !AI.on()) {
      body.appendChild(AI.offNotice('Tính năng AI đang tắt — cần API key để dùng thật.', render));
    }

    var yes = Core.el('button', 'btn pri sm', '✓ Có, giúp mình với');
    var no = Core.el('button', 'btn sm', '✕ Chưa cần, cảm ơn');
    yes.onclick = function () { perm = 'yes'; asking = false; fetchStudy(); };
    no.onclick = function () {
      perm = 'no'; asking = false;
      noteBaseline = Notes.count(app.slide.no);
      render();
    };
    foot.append(yes, no);
  }

  /* ================= Đang im lặng chờ (chưa từng hỏi, hoặc vừa từ chối) ================= */
  function renderWaiting() {
    var justDeclined = (perm === 'no');
    setHead(justDeclined ? 'Được, mình sẽ không làm phiền' : 'AI đang quan sát, chưa làm gì cả');

    var box = Core.el('div', 'waitbox',
      '<div class="wemoji">👀</div>' +
      '<div class="wtitle">' + (justDeclined ? 'Mình vẫn ở đây nếu cần' : 'Chưa đọc slide, chưa làm gì') + '</div>' +
      '<div class="wsub">Nếu bạn <b>ở lại khoảng 10 giây</b> ở slide này, hoặc <b>ghi một ghi chú</b> ' +
      'cho slide này, mình sẽ chủ động hỏi bạn có cần trợ giúp không.</div>');

    var ask = Core.el('button', 'btn pri sm', '🙋 Hỏi mình ngay, khỏi chờ');
    ask.style.marginTop = '11px';
    ask.onclick = function () { fire('manual'); };
    box.appendChild(ask);
    body.appendChild(box);

    /* Hỏi nhanh một câu mà không cần AI đọc slide — vẫn giữ như bản trước */
    body.appendChild(Core.el('div', 'seclabel', 'Hoặc hỏi nhanh một câu (AI không đọc slide)'));
    var ta = Core.el('textarea', 'ed');
    ta.placeholder = 'Gõ thắc mắc của bạn rồi bấm Hỏi AI...';
    ta.value = askText;
    ta.oninput = function () { askText = ta.value; };
    body.appendChild(ta);

    var send = Core.el('button', 'btn sm', 'Hỏi AI');
    send.style.marginTop = '9px';
    send.onclick = function () {
      if (!ta.value.trim()) { ta.focus(); return; }
      if (!window.AI || !AI.on()) { askAns = { err: 'Chưa kết nối API key.' }; render(); return; }
      askText = ta.value.trim();
      askBusy = true; askAns = null; render();
      AI.call({
        maxTokens: 4000,
        system: 'Bạn là trợ giảng. Trả lời ngắn gọn, rõ ràng, bằng tiếng Việt. ' +
          'Bạn KHÔNG được xem nội dung slide của người học — nếu câu hỏi cần thông tin ' +
          'cụ thể trong slide đó, hãy nói thẳng là bạn cần họ cho phép đọc slide.',
        user: askText
      }).then(function (t) { askBusy = false; askAns = { text: t }; render(); })
        .catch(function (e) { askBusy = false; askAns = { err: e.message }; render(); });
    };
    body.appendChild(send);

    if (askBusy) body.appendChild(AI.loading('AI đang trả lời...'));
    else if (askAns) {
      body.appendChild(Core.el('div', askAns.err ? 'notice amber' : 'card',
        askAns.err ? ('⚠️ ' + esc(askAns.err))
          : ('<h3>Trả lời <span class="aitag">CHỈ DỰA TRÊN CÂU HỎI CỦA BẠN</span></h3>' +
            '<div class="tx">' + esc(askAns.text).replace(/\n/g, '<br>') + '</div>')));
    }
  }

  /* ================= Đã đồng ý — gọi AI ================= */
  function fetchStudy() {
    if (!window.AI || !AI.on()) { err = 'Chưa kết nối API key.'; render(); return; }
    busy = true; err = null; data = null; qi = 0; answers = [];
    render();

    AI.call({
      maxTokens: 8000,
      schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          questions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                q: { type: 'string' },
                options: { type: 'array', items: { type: 'string' } },
                correct: { type: 'integer' },
                explain: { type: 'string' }
              },
              required: ['q', 'options', 'correct', 'explain'],
              additionalProperties: false
            }
          }
        },
        required: ['summary', 'questions'],
        additionalProperties: false
      },
      system:
        'Bạn là trợ giảng cho sinh viên Việt Nam. Trả lời hoàn toàn bằng tiếng Việt. ' +
        'Dựa DUY NHẤT vào nội dung slide được cung cấp, hãy: ' +
        '(1) viết "summary" tóm tắt slide trong 3–5 câu, dễ hiểu, không thêm kiến thức ngoài slide; ' +
        '(2) soạn đúng 4 câu hỏi trắc nghiệm ôn tập trong "questions", mỗi câu 3 phương án, ' +
        '"correct" là chỉ số (bắt đầu từ 0) của phương án đúng, ' +
        '"explain" giải thích ngắn vì sao đáp án đó đúng và vì sao các phương án còn lại sai — ' +
        'viết phần explain sao cho người chọn sai đọc vào là biết mình hiểu lệch chỗ nào.',
      user: 'Nội dung slide:\n' + app.slide.content
    }).then(function (out) {
      busy = false;
      out.questions = (out.questions || []).slice(0, 4);
      data = out;
      render();
    }).catch(function (e) {
      busy = false; err = e.message; render();
    });
  }

  /* ================= Đã đồng ý — hiển thị ================= */
  function renderStudy() {
    setHead('Tóm tắt & câu hỏi ôn tập', 'AI đã đọc nội dung slide sau khi bạn đồng ý.');

    if (busy) { body.appendChild(AI.loading('AI đang đọc slide và soạn câu hỏi...')); return; }

    if (err) {
      body.appendChild(Core.el('div', 'notice amber', '⚠️ ' + err));
      var again = Core.el('button', 'btn sm', 'Thử lại');
      again.onclick = fetchStudy;
      foot.append(again, revokeBtn());
      return;
    }
    if (!data) return;

    var s = Core.el('div', 'card sumcard',
      '<h3>📄 Tóm tắt slide <span class="aitag">AI VIẾT</span></h3>' +
      '<div class="tx">' + esc(data.summary).replace(/\n/g, '<br>') + '</div>');
    body.appendChild(s);

    if (!data.questions.length) { foot.appendChild(revokeBtn()); return; }

    body.appendChild(Core.el('div', 'seclabel',
      'Câu hỏi ôn tập <span class="count">' + (qi + 1) + '/' + data.questions.length + '</span>'));

    var item = data.questions[qi];
    var picked = answers[qi];
    var c = Core.el('div', 'card', '<h3>Câu ' + (qi + 1) + '. ' + esc(item.q) + '</h3>');

    item.options.forEach(function (t, j) {
      var b = Core.el('button', 'opt', esc(t));
      if (picked != null) {
        b.disabled = true;
        if (j === item.correct) b.classList.add('right');
        if (j === picked && picked !== item.correct) b.classList.add('wrong');
      } else {
        b.onclick = function () { answers[qi] = j; render(); };
      }
      c.appendChild(b);
    });

    if (picked != null) {
      var right = picked === item.correct;
      c.appendChild(Core.el('div', 'verdict ' + (right ? 'ok' : 'no'),
        right ? '✓ Bạn chọn đúng.' : '✗ Bạn chọn sai — bạn đã chọn: "' + esc(item.options[picked]) + '"'));
      c.appendChild(Core.el('div', 'explain', '<b>Vì sao:</b> ' + esc(item.explain)));
    }
    body.appendChild(c);

    var prev = Core.el('button', 'btn sm', '‹ Câu trước');
    prev.disabled = qi === 0;
    prev.onclick = function () { qi--; render(); };
    foot.appendChild(prev);

    if (qi < data.questions.length - 1) {
      var next = Core.el('button', 'btn sm pri', 'Câu tiếp ›');
      next.disabled = picked == null;
      next.onclick = function () { qi++; render(); };
      foot.appendChild(next);
    } else if (answers.filter(function (x) { return x != null; }).length === data.questions.length) {
      var n = 0;
      data.questions.forEach(function (q, i) { if (answers[i] === q.correct) n++; });
      foot.appendChild(Core.el('span', n === data.questions.length ? 'ok' : 'muted',
        'Kết quả: đúng ' + n + '/' + data.questions.length));
    }

    var redo = Core.el('button', 'btn sm', '↻ Soạn lại');
    redo.onclick = fetchStudy;
    foot.appendChild(redo);
    foot.appendChild(revokeBtn());
  }

  /* ===== Trò chuyện thời gian thực — chỉ mở được sau khi đã đồng ý ===== */
  function renderChat() {
    setHead('Trò chuyện với AI',
      'AI nhớ mạch hội thoại. Bấm 📷 để khoanh một vùng slide đính kèm vào câu hỏi.');
    if (!chat) chat = Chat.create(app, { context: app.slide.content });
    chat.mount(body, foot);
  }

  /* Thu hồi: xoá những gì AI đã tạo, quay về trạng thái im lặng chờ */
  function revokeBtn() {
    var b = Core.el('button', 'btn sm danger', 'Thu hồi — về lại im lặng');
    b.onclick = function () {
      perm = 'no'; tab = 'study';
      if (chat) { chat.reset(); chat = null; }
      data = null; qi = 0; answers = [];
      noteBaseline = Notes.count(app.slide.no);
      app.captureOff();
      render();
    };
    return b;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
    });
  }
})();
