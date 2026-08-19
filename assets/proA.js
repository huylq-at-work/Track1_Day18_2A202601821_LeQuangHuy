/* ==========================================================================
   proA.js — Option A: NGƯỜI DÙNG TỰ LÀM HẾT (Lê Quang Huy phụ trách)

   AI không sinh ra một chữ nào. Người học:
     1. tự rê chuột khoanh vùng bất kỳ trên slide để "chụp" lại,
     2. tự gõ ghi chú cho ảnh vừa chụp — lưu vào lịch sử, tối đa 10 mẩu,
     3. sửa / xóa lại mẩu ghi chú cũ bất cứ lúc nào,
     4. kéo mẩu ghi chú vào khung mẫu và tự viết phần tổng hợp.
   Hệ thống chỉ cắt ảnh, cất giữ, tự lưu và cho hoàn tác.
   ========================================================================== */
(function () {
  'use strict';

  var MAX_NOTES = 10;

  var FRAMES = [
    { key: 'tomtat', title: 'Khung 1 — Tóm tắt ý chính', sub: 'Kéo mẩu ghi chú vào đây rồi tự viết lại ý bạn hiểu.', ph: 'Tự gõ phần tóm tắt của bạn...' },
    { key: 'giaithich', title: 'Khung 2 — Giải thích chỗ chưa hiểu', sub: 'Kéo mẩu bạn đánh dấu chưa hiểu vào đây rồi tự viết cách hiểu.', ph: 'Tự gõ lời giải thích của bạn...' },
    { key: 'cauhoi', title: 'Khung 3 — Câu hỏi tự kiểm tra', sub: 'Kéo mẩu ghi chú vào đây rồi tự đặt câu hỏi cho chính mình.', ph: 'Tự đặt câu hỏi ôn tập...' }
  ];

  /* state.notes = lịch sử ảnh chụp + ghi chú; state.frames = 3 khung tổng hợp */
  var state = { notes: [], frames: {} };
  FRAMES.forEach(function (f) { state.frames[f.key] = { notes: [], text: '' }; });

  var seq = 0;                 // số thứ tự hiển thị của mẩu ghi chú
  var editingId = null;        // mẩu đang ở chế độ sửa
  var pending = null;          // vùng vừa khoanh, chờ gõ ghi chú
  var past = [], future = [];
  var tab = 'work';            // 'work' = khu chụp & 3 khung mẫu | 'sum' = AI tổng hợp
  var sum = null, sumBusy = false, sumErr = null, sumBase = -1;
  var app, body, foot, saveEl, undoBtn, redoBtn, layer;

  Core.init({
    option: 'A',
    brand: '#1e3a8a',
    pins: false,                // Option A không khoanh sẵn vùng nào cả
    title: 'Option A — Người dùng tự làm hết',
    subtitle: 'Lê Quang Huy phụ trách · AI không viết nội dung mới, chỉ hỏi vặn và sắp xếp lại chữ bạn đã viết',
    hint: 'Rê chuột khoanh bất kỳ vùng nào trên slide để chụp lại — mỗi lần chụp là một mẩu ghi chú mới (tối đa ' + MAX_NOTES + ').',
    onSlide: function (slide, a) {
      app = a;
      if (!slide.img) { renderEmpty(); return; }
      if (tab === 'work') buildCaptureLayer();
      renderAll();
    },
    onKey: function () {
      if (!app) return;
      app.slide.img ? renderAll() : renderEmpty();
    }
  });

  /* ======================================================================
     0. AI đặt câu hỏi phản biện cho mẩu ghi chú vừa viết
        AI KHÔNG viết hộ nội dung — chỉ hỏi lại để người học tự làm rõ.
     ====================================================================== */
  function askCritique(note) {
    if (!window.AI || !AI.on()) return;
    note.ai = { state: 'loading' };
    renderAll();

    AI.call({
      maxTokens: 4000,
      schema: {
        type: 'object',
        properties: { question: { type: 'string' } },
        required: ['question'],
        additionalProperties: false
      },
      system:
        'Bạn là người bạn học khó tính, đang giúp một sinh viên Việt Nam ôn bài. ' +
        'Sinh viên vừa chụp một vùng trên slide và tự viết ghi chú cho nó. ' +
        'Nhiệm vụ của bạn: đặt ĐÚNG MỘT câu hỏi phản biện ngắn (dưới 30 từ, tiếng Việt) ' +
        'buộc bạn ấy phải nói rõ hơn mình đang muốn hiểu gì hoặc chỗ nào còn mơ hồ. ' +
        'TUYỆT ĐỐI KHÔNG giải thích hộ, không tóm tắt hộ, không đưa đáp án. Chỉ hỏi.',
      user:
        'Nội dung slide đang học:\n' + (app.slide.content || '') +
        '\n\nVùng sinh viên chụp lại (theo % của ảnh slide): ' +
        'trái ' + note.rect.l + '%, trên ' + note.rect.t + '%, ' +
        'rộng ' + note.rect.w + '%, cao ' + note.rect.h + '%.' +
        '\n\nGhi chú sinh viên tự viết: "' + (note.text || '(chưa viết gì)') + '"'
    }).then(function (out) {
      note.ai = { state: 'done', q: out.question };
      renderAll();
    }).catch(function (e) {
      note.ai = { state: 'error', msg: e.message };
      renderAll();
    });
  }

  /* ======================================================================
     1. Khoanh vùng trên slide — dùng cơ chế chung trong core.js,
        bật thường trực vì Option A lấy việc chụp làm thao tác chính.
     ====================================================================== */
  function buildCaptureLayer() {
    layer = app.cap;
    app.capture(function (rect) {
      if (state.notes.length >= MAX_NOTES) { renderAll(true); return; }
      pending = rect;
      editingId = null;
      renderAll();
    }, true);
  }

  /* vẽ lại khung viền của các mẩu đã lưu, ngay trên slide */
  function drawSavedRects() {
    if (!layer) return;
    [].forEach.call(app.wrap.querySelectorAll('.savedrect'), function (n) { n.remove(); });
    state.notes.forEach(function (n) {
      var r = Core.el('div', 'savedrect', '<span class="rn">' + n.no + '</span>');
      r.setAttribute('style', Core.pct(n.rect));
      r.dataset.id = n.id;
      app.wrap.insertBefore(r, layer);       // nằm dưới lớp khoanh vùng
    });
  }
  function litRect(id, on) {
    var r = app.wrap && app.wrap.querySelector('.savedrect[data-id="' + id + '"]');
    if (r) r.classList.toggle('lit', on !== false);
  }

  /* Cắt ảnh vùng đã khoanh — hàm dùng chung nằm trong core.js */
  function cropStyle(rect, maxW, maxH) {
    return app.cropStyle(rect, app.slide.img, maxW, maxH);
  }

  /* ======================================================================
     3. Panel bên phải
     ====================================================================== */
  function shell() {
    app.dock.innerHTML = '';
    var head = Core.el('div', 'dock-head', tab === 'sum'
      ? '<h2>Tổng hợp ghi chú</h2><div class="lead">AI sắp xếp lại ghi chú bạn đã viết — không thêm ý mới.</div>'
      : '<h2>Ghi chú của bạn</h2><div class="lead">Mọi chữ ở đây là do bạn gõ — AI không gợi ý gì.</div>');

    var tabsEl = Core.el('div', 'tabs');
    [['work', 'Ghi chú'], ['sum', 'Tổng hợp']].forEach(function (t) {
      var b = Core.el('button', t[0] === tab ? 'on' : '', t[1]);
      b.dataset.tab = t[0];
      b.onclick = function () {
        if (tab === t[0]) return;
        tab = t[0];
        if (tab === 'sum') { app.captureOff(); }
        else if (app.slide.img) { buildCaptureLayer(); }
        renderAll();
      };
      tabsEl.appendChild(b);
    });

    body = Core.el('div', 'dock-body');
    foot = Core.el('div', 'dock-foot');
    app.dock.append(head, tabsEl, body, foot);
  }

  function renderEmpty() {
    shell();
    if (tab === 'sum') { renderSummary(); return; }
    body.appendChild(Core.el('div', 'notice slate',
      'Trang slide này chưa mở được ảnh để chụp. Quay lại <b>Slide 5</b> để ghi chú.'));
    foot.style.display = 'none';
  }

  function renderAll(warnFull) {
    shell();
    if (tab === 'sum') { renderSummary(); return; }
    foot.style.display = '';
    drawSavedRects();

    if (warnFull) {
      body.appendChild(Core.el('div', 'notice amber',
        '⚠️ Đã đủ <b>' + MAX_NOTES + '/' + MAX_NOTES + '</b> mẩu ghi chú. Xóa bớt một mẩu cũ rồi mới chụp thêm được.'));
    }

    if (pending) renderComposer();
    renderHistory();
    renderFrames();

    undoBtn = Core.el('button', 'btn sm', '↶ Hoàn tác');
    redoBtn = Core.el('button', 'btn sm', '↷ Làm lại');
    saveEl = Core.el('span', 'ok', '✓ Đã lưu tự động');
    saveEl.style.marginLeft = 'auto';
    undoBtn.onclick = undo;
    redoBtn.onclick = redo;
    foot.append(undoBtn, redoBtn, saveEl);
    sync();
  }

  /* ======================================================================
     2b. Tổng hợp — AI sắp xếp lại ghi chú của bạn thành có cấu trúc.
         Chỉ đọc đúng phần chữ bạn tự viết trong lịch sử, không đọc slide,
         không bịa thêm ý — vẫn giữ tinh thần "AI không tự viết nội dung"
         của Option A, chỉ giúp sắp xếp lại thứ bạn đã viết ra.
     ====================================================================== */
  function notesAsText() {
    return state.notes.map(function (n) {
      return n.no + '. ' + (n.text ? n.text : '(chỉ chụp vùng, chưa viết chữ)');
    }).join('\n');
  }

  function fetchSum() {
    var total = state.notes.length;
    if (!window.AI || !AI.on() || !total) { renderAll(); return; }
    sumBusy = true; sumErr = null;
    renderAll();

    AI.call({
      maxTokens: 6000,
      schema: {
        type: 'object',
        properties: {
          overview: { type: 'string' },
          groups: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                points: { type: 'array', items: { type: 'string' } }
              },
              required: ['title', 'points'],
              additionalProperties: false
            }
          },
          unclear: { type: 'array', items: { type: 'string' } }
        },
        required: ['overview', 'groups', 'unclear'],
        additionalProperties: false
      },
      system:
        'Bạn là trợ giảng cho sinh viên Việt Nam, trả lời hoàn toàn bằng tiếng Việt. ' +
        'Dưới đây là các mẩu ghi chú THÔ do chính người học tự chụp vùng trên slide và ' +
        'tự viết. Nhiệm vụ: sắp xếp lại chúng cho có cấu trúc, KHÔNG bịa thêm kiến thức mới. ' +
        '"overview": 2–3 câu nói xem người học đang tập trung vào những gì. ' +
        '"groups": gom các mẩu cùng chủ đề thành nhóm, mỗi nhóm có "title" ngắn và ' +
        '"points" là các gạch đầu dòng viết lại cho gọn, rõ, giữ đúng ý người học. ' +
        '"unclear": những mẩu chưa viết chữ hoặc ghi chú cho thấy người học còn lấn cấn, ' +
        'nêu thành câu ngắn để họ biết cần quay lại viết rõ hơn chỗ nào.',
      user: 'Ghi chú của người học (mỗi dòng một mẩu):\n\n' + notesAsText()
    }).then(function (out) {
      sumBusy = false; sum = out; sumBase = total;
      renderAll();
    }).catch(function (e) {
      sumBusy = false; sumErr = e.message; renderAll();
    });
  }

  function renderSummary() {
    var total = state.notes.length;
    foot.style.display = '';

    if (!total) {
      body.appendChild(Core.el('div', 'empty',
        'Chưa có ghi chú nào để tổng hợp.<br>Sang tab <b>Ghi chú</b>, khoanh một vùng trên ' +
        'slide và viết vài mẩu trước đã.'));
      return;
    }
    if (!window.AI || !AI.on()) {
      body.appendChild(AI.offNotice('Cần kết nối AI mới tổng hợp được.', function () { fetchSum(); }));
      return;
    }
    if (sumBusy) { body.appendChild(AI.loading('AI đang sắp xếp lại ghi chú của bạn...')); return; }
    if (sumErr) {
      body.appendChild(Core.el('div', 'notice amber', '⚠️ ' + esc(sumErr)));
      var again = Core.el('button', 'btn sm', 'Thử lại');
      again.onclick = fetchSum;
      body.appendChild(again);
      return;
    }
    if (!sum) {
      body.appendChild(Core.el('div', 'notice slate',
        '🧩 Bạn đang có <b>' + total + ' mẩu ghi chú</b>. AI có thể gom chúng lại thành ' +
        'các nhóm chủ đề và chỉ ra chỗ bạn còn lấn cấn — không thêm ý nào ngoài thứ bạn đã viết.'));
      var go = Core.el('button', 'btn pri sm', 'Tổng hợp ' + total + ' mẩu ghi chú');
      go.onclick = fetchSum;
      body.appendChild(go);
      return;
    }

    if (sumBase !== total) {
      body.appendChild(Core.el('div', 'notice amber',
        '⚠️ Ghi chú đã thay đổi sau lần tổng hợp gần nhất (' + sumBase + ' → ' + total + ' mẩu).'));
    }
    body.appendChild(Core.el('div', 'notice slate',
      '🧩 AI chỉ <b>sắp xếp lại ghi chú của bạn</b>, không thêm kiến thức mới.'));

    body.appendChild(Core.el('div', 'card sumcard',
      '<h3>Bạn đang tập trung vào gì</h3><div class="tx">' + esc(sum.overview) + '</div>'));

    (sum.groups || []).forEach(function (g) {
      var c = Core.el('div', 'card', '<h3>' + esc(g.title) + '</h3>');
      var ul = Core.el('ul', 'plist');
      (g.points || []).forEach(function (p) { ul.appendChild(Core.el('li', '', esc(p))); });
      c.appendChild(ul);
      body.appendChild(c);
    });

    if ((sum.unclear || []).length) {
      body.appendChild(Core.el('div', 'seclabel', 'Chỗ bạn còn lấn cấn'));
      var c2 = Core.el('div', 'card');
      c2.style.borderLeft = '4px solid #f2b544';
      var ul2 = Core.el('ul', 'plist');
      sum.unclear.forEach(function (p) { ul2.appendChild(Core.el('li', '', esc(p))); });
      c2.appendChild(ul2);
      body.appendChild(c2);
    }

    var redo = Core.el('button', 'btn sm', '↻ Tổng hợp lại');
    redo.onclick = fetchSum;
    foot.appendChild(redo);
    foot.appendChild(Core.el('span', 'muted', 'Dựa trên ' + sumBase + ' mẩu ghi chú.'));
  }

  /* ---------- 3a. Ô soạn ghi chú cho vùng vừa chụp ---------- */
  function renderComposer() {
    var box = Core.el('div', 'composer');
    box.innerHTML = '<div class="ctitle">📷 Vùng bạn vừa chụp — viết ghi chú cho nó</div>';

    var row = Core.el('div', 'crow');
    var thumb = Core.el('div', 'crop');
    thumb.setAttribute('style', cropStyle(pending, 130, 110));
    row.appendChild(thumb);
    box.appendChild(row);

    var ta = Core.el('textarea', 'ed');
    ta.placeholder = 'Bạn hiểu gì / thắc mắc gì ở chỗ này? (tự gõ)';
    box.appendChild(ta);

    var acts = Core.el('div', 'acts');
    var ok = Core.el('button', 'btn pri sm', 'Lưu vào ghi chú');
    var no = Core.el('button', 'btn sm', 'Hủy');
    ok.onclick = function () {
      push();
      seq++;
      var note = {
        id: 'n' + Date.now() + Math.random().toString(36).slice(2, 6),
        no: seq, rect: pending, text: ta.value.trim(),
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      state.notes.unshift(note);
      pending = null;
      renderAll(); saved();
      askCritique(note);            // AI hỏi vặn lại ngay sau khi lưu
    };
    no.onclick = function () { pending = null; renderAll(); };
    acts.append(ok, no);
    box.appendChild(acts);

    body.appendChild(box);
    setTimeout(function () { ta.focus(); }, 30);
  }

  /* ---------- 3b. Lịch sử ghi chú ---------- */
  function renderHistory() {
    var full = state.notes.length >= MAX_NOTES;
    body.appendChild(Core.el('div', 'seclabel',
      'Lịch sử ghi chú <span class="count' + (full ? ' full' : '') + '">' +
      state.notes.length + '/' + MAX_NOTES + '</span>'));

    if (!state.notes.length) {
      body.appendChild(Core.el('div', 'empty',
        'Chưa có mẩu nào.<br>Rê chuột khoanh một vùng trên slide để chụp mẩu đầu tiên.'));
      return;
    }

    state.notes.forEach(function (n) {
      var card = Core.el('div', 'notecard' + (editingId === n.id ? ' editing' : ''));

      var thumb = Core.el('div', 'crop grabbable');
      thumb.setAttribute('style', cropStyle(n.rect, 104, 80));
      thumb.title = 'Kéo mẩu này thả vào khung mẫu bên dưới';

      var main = Core.el('div', 'ncontent');
      main.innerHTML = '<div class="nhead"><b>Mẩu ' + n.no + '</b>' +
        '<span class="ntime">chụp lúc ' + n.time + '</span></div>';

      if (editingId === n.id) {
        var ta = Core.el('textarea', 'ed');
        ta.value = n.text;
        ta.placeholder = 'Ghi chú của bạn...';
        ta.oninput = function () { n.text = ta.value; saved(); };
        main.appendChild(ta);
        var done = Core.el('button', 'btn pri sm', '✓ Xong');
        done.onclick = function () { editingId = null; renderAll(); };
        var actsE = Core.el('div', 'acts');
        actsE.appendChild(done);
        main.appendChild(actsE);
        setTimeout(function () { ta.focus(); }, 30);
      } else {
        main.appendChild(Core.el('div', 'ntext' + (n.text ? '' : ' none'),
          n.text ? esc(n.text) : '(chưa viết ghi chú)'));
        var acts = Core.el('div', 'acts');
        var bEdit = Core.el('button', 'btn sm', '✎ Sửa');
        var bDel = Core.el('button', 'btn sm danger', '🗑 Xóa');
        bEdit.onclick = function () { push(); editingId = n.id; renderAll(); };
        bDel.onclick = function () {
          push();
          state.notes = state.notes.filter(function (x) { return x.id !== n.id; });
          FRAMES.forEach(function (f) {
            state.frames[f.key].notes = state.frames[f.key].notes
              .filter(function (x) { return x !== n.id; });
          });
          renderAll(); saved();
        };
        acts.append(bEdit, bDel);
        main.appendChild(acts);
      }

      /* --- khối câu hỏi phản biện của AI --- */
      if (n.ai) {
        if (n.ai.state === 'loading') {
          main.appendChild(AI.loading('AI đang nghĩ câu hỏi phản biện...'));
        } else if (n.ai.state === 'done') {
          var q = Core.el('div', 'aiq',
            '<div class="aiq-h">🤔 AI hỏi lại bạn</div>' +
            '<div class="aiq-b">' + esc(n.ai.q) + '</div>');
          var again = Core.el('button', 'btn sm', '↻ Hỏi câu khác');
          again.onclick = function () { askCritique(n); };
          q.appendChild(again);
          main.appendChild(q);
        } else {
          var err = Core.el('div', 'aiq err', '⚠️ ' + esc(n.ai.msg));
          var retry = Core.el('button', 'btn sm', 'Thử lại');
          retry.onclick = function () { askCritique(n); };
          err.appendChild(retry);
          main.appendChild(err);
        }
      } else if (editingId !== n.id) {
        if (window.AI && AI.on()) {
          var ask = Core.el('button', 'btn sm', '🤔 Nhờ AI hỏi vặn mẩu này');
          ask.style.marginTop = '9px';
          ask.onclick = function () { askCritique(n); };
          main.appendChild(ask);
        } else {
          main.appendChild(Core.el('div', 'aihint',
            'Bật AI ở nút 🔑 phía trên để nhận một câu hỏi phản biện cho mẩu này.'));
        }
      }

      card.append(thumb, main);
      card.onmouseenter = function () { litRect(n.id, true); };
      card.onmouseleave = function () { litRect(n.id, false); };

      /* chỉ ảnh thu nhỏ mới kéo được — để các nút bên cạnh vẫn bấm bình thường */
      app.draggable(thumb, function () {
        return { id: n.id, label: 'Mẩu ' + n.no + (n.text ? ' — ' + n.text.slice(0, 40) : '') };
      });

      body.appendChild(card);
    });
  }

  /* ---------- 3c. Ba khung mẫu ---------- */
  function renderFrames() {
    body.appendChild(Core.el('div', 'seclabel', 'Khung mẫu trống — bạn tự điền'));

    FRAMES.forEach(function (f) {
      var st = state.frames[f.key];
      var box = Core.el('div', 'frame' + (st.notes.length || st.text ? ' filled' : ''));
      box.dataset.drop = f.key;
      box.innerHTML = '<h3>' + f.title + '</h3><div class="sub">' + f.sub + '</div><div class="slot"></div>';

      var slot = box.querySelector('.slot');
      st.notes.forEach(function (id) {
        var n = byId(id);
        if (!n) return;
        var tag = Core.el('span', 'tag',
          '<b>' + n.no + '.</b> ' + (n.text ? esc(n.text.slice(0, 34)) : 'ảnh chụp') +
          ' <button title="Bỏ ra">✕</button>');
        tag.querySelector('button').onclick = function () {
          push();
          st.notes = st.notes.filter(function (x) { return x !== id; });
          renderAll(); saved();
        };
        tag.onmouseenter = function () { litRect(id, true); };
        tag.onmouseleave = function () { litRect(id, false); };
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
        if (st.notes.indexOf(id) > -1) { litRect(id, true); setTimeout(function () { litRect(id, false); }, 700); return; }
        push();
        st.notes.push(id);
        renderAll(); saved();
      });

      body.appendChild(box);
    });
  }

  function byId(id) {
    return state.notes.filter(function (n) { return n.id === id; })[0];
  }
  function esc(s) {
    return s.replace(/[&<>]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
    });
  }

  /* ======================================================================
     4. Tự lưu + hoàn tác
     ====================================================================== */
  function saved() {
    if (saveEl) saveEl.textContent = '✓ Đã lưu lúc ' + new Date().toLocaleTimeString('vi-VN');
  }
  function snap() { return JSON.stringify({ s: state, q: seq }); }
  function restore(str) {
    var o = JSON.parse(str);
    state = o.s; seq = o.q; editingId = null;
    renderAll();
  }
  function push() { past.push(snap()); future = []; sync(); }
  function sync() {
    if (!undoBtn) return;
    undoBtn.disabled = !past.length;
    redoBtn.disabled = !future.length;
  }
  function undo() { if (past.length) { future.push(snap()); restore(past.pop()); saved(); } }
  function redo() { if (future.length) { past.push(snap()); restore(future.pop()); saved(); } }
})();
