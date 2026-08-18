/* ==========================================================================
   proA.js — Option A: NGƯỜI DÙNG TỰ LÀM HẾT (Lê Quang Huy phụ trách)

   AI không sinh ra một chữ nào. Hệ thống chỉ gom ghi chú theo slide,
   cho kéo thả vào khung mẫu và tự lưu. Toàn bộ chữ trong khung là do
   người học tự gõ. Có Hoàn tác / Làm lại thật (lưu lại từng bước).
   ========================================================================== */
(function () {
  'use strict';

  var FRAMES = [
    { key: 'tomtat', title: 'Khung 1 — Tóm tắt ý chính', sub: 'Kéo mẩu ghi chú vào đây rồi tự viết lại ý bạn hiểu.', ph: 'Tự gõ phần tóm tắt của bạn...' },
    { key: 'giaithich', title: 'Khung 2 — Giải thích chỗ chưa hiểu', sub: 'Kéo mẩu đánh dấu "chưa hiểu" vào đây rồi tự viết cách hiểu.', ph: 'Tự gõ lời giải thích của bạn...' },
    { key: 'cauhoi', title: 'Khung 3 — Câu hỏi tự kiểm tra', sub: 'Kéo mẩu ghi chú vào đây rồi tự đặt câu hỏi cho chính mình.', ph: 'Tự đặt câu hỏi ôn tập...' }
  ];

  var state = {};
  FRAMES.forEach(function (f) { state[f.key] = { notes: [], text: '' }; });

  var past = [], future = [], app, body, foot, saveEl, undoBtn, redoBtn;

  Core.init({
    option: 'A',
    brand: '#1e3a8a',
    title: 'Option A — Người dùng tự làm hết',
    subtitle: 'Lê Quang Huy phụ trách · AI không tự viết gì, chỉ gom và lưu ghi chú',
    hint: 'Kéo số 1 / 2 / 3 trên slide (hoặc mẩu ghi chú bên phải) thả vào khung mẫu — rê chuột lên số để xem nội dung.',
    onSlide: function (slide, a) {
      app = a;
      if (!slide.img) { renderEmpty(); return; }
      a.markAll(true);
      slide.notes.forEach(function (n) {
        a.pins[n.id].classList.add('grab');
        a.draggable(a.pins[n.id], function () {
          return { id: n.id, label: n.plain, onClick: function () { a.lit(n.id); } };
        });
      });
      renderDock(slide);
    }
  });

  /* ---------- dựng panel phải ---------- */
  function shell() {
    app.dock.innerHTML = '';
    var head = Core.el('div', 'dock-head',
      '<h2>Bàn làm việc của bạn</h2>' +
      '<div class="lead">Mọi chữ trong khung là do bạn gõ — AI không gợi ý gì.</div>');
    body = Core.el('div', 'dock-body');
    foot = Core.el('div', 'dock-foot');
    undoBtn = Core.el('button', 'btn sm', '↶ Hoàn tác');
    redoBtn = Core.el('button', 'btn sm', '↷ Làm lại');
    var reset = Core.el('button', 'btn sm', 'Xóa hết');
    saveEl = Core.el('span', 'ok', '✓ Đã lưu tự động');
    saveEl.style.marginLeft = 'auto';
    undoBtn.onclick = undo; redoBtn.onclick = redo;
    reset.onclick = function () {
      push();
      FRAMES.forEach(function (f) { state[f.key] = { notes: [], text: '' }; });
      draw(); saved();
    };
    foot.append(undoBtn, redoBtn, reset, saveEl);
    app.dock.append(head, body, foot);
  }

  function renderEmpty() {
    shell();
    body.appendChild(Core.el('div', 'notice slate',
      'Trang slide này chưa có ghi chú nào. Quay lại <b>Slide 5</b> để làm việc với 3 mẩu ghi chú đã lưu.'));
    foot.style.display = 'none';
  }

  function renderDock(slide) {
    shell();
    foot.style.display = '';

    body.appendChild(Core.el('div', 'notice slate',
      '📎 <b>3 mẩu ghi chú của slide này</b> — kéo sang khung mẫu bên dưới.'));

    slide.notes.forEach(function (n) {
      var chip = Core.el('div', 'note-chip',
        '<span class="n">' + n.id + '</span><span>' + n.text + '<br>' +
        '<span style="font-size:11px;color:#78716c">' + n.meta + '</span></span>');
      app.draggable(chip, function () {
        return { id: n.id, label: n.plain, onClick: function () { app.lit(n.id); } };
      });
      body.appendChild(chip);
    });

    body.appendChild(Core.el('div', 'notice slate', '📥 <b>Khung mẫu trống — bạn tự điền</b>'));
    draw();
  }

  /* ---------- vẽ lại 3 khung theo state ---------- */
  function draw() {
    document.querySelectorAll('.frame').forEach(function (n) { n.remove(); });

    FRAMES.forEach(function (f) {
      var st = state[f.key];
      var box = Core.el('div', 'frame' + (st.notes.length || st.text ? ' filled' : ''));
      box.dataset.drop = f.key;
      box.innerHTML = '<h3>' + f.title + '</h3><div class="sub">' + f.sub + '</div><div class="slot"></div>';

      var slot = box.querySelector('.slot');
      st.notes.forEach(function (id) {
        var n = noteById(id);
        var tag = Core.el('span', 'tag', '<b>' + id + '.</b> ' + n.plain + ' <button title="Bỏ ra">✕</button>');
        tag.querySelector('button').onclick = function () {
          push();
          st.notes = st.notes.filter(function (x) { return x !== id; });
          draw(); saved();
        };
        tag.onmouseenter = function () { app.lit(id, 900); };
        slot.appendChild(tag);
      });

      var ta = Core.el('textarea', 'ed');
      ta.placeholder = f.ph;
      ta.value = st.text;
      ta.onfocus = push;
      ta.oninput = function () { st.text = ta.value; saved(); };
      box.appendChild(ta);

      box.addEventListener('notedrop', function (e) {
        var id = e.detail.id;
        if (st.notes.indexOf(id) > -1) { app.lit(id, 700); return; }
        push();
        st.notes.push(id);
        draw(); saved();
        app.lit(id, 700);
      });

      body.appendChild(box);
    });

    /* pin nào đã dùng thì đổi sang màu xanh */
    Object.keys(app.pins).forEach(function (id) {
      var used = FRAMES.some(function (f) { return state[f.key].notes.indexOf(+id) > -1; });
      app.pins[id].classList.toggle('done', used);
    });
    sync();
  }

  function noteById(id) {
    return app.slide.notes.filter(function (n) { return n.id === id; })[0];
  }

  /* ---------- lưu / hoàn tác ---------- */
  function saved() {
    saveEl.textContent = '✓ Đã lưu lúc ' + new Date().toLocaleTimeString('vi-VN');
  }
  function snap() { return JSON.stringify(state); }
  function restore(s) { state = JSON.parse(s); draw(); }
  function push() { past.push(snap()); future = []; sync(); }
  function sync() {
    if (!undoBtn) return;
    undoBtn.disabled = !past.length;
    redoBtn.disabled = !future.length;
  }
  function undo() {
    if (!past.length) return;
    future.push(snap()); restore(past.pop()); saved();
  }
  function redo() {
    if (!future.length) return;
    past.push(snap()); restore(future.pop()); saved();
  }
})();
