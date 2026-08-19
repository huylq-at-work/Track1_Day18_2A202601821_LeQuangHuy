/* ==========================================================================
   notepad.js — góc ghi chú cá nhân ở đáy trái màn hình

   Mỗi slide giữ một danh sách ghi chú riêng (kho chung nằm ở notes.js).
   Mỗi mẩu tối đa 200 ký tự, có thể kèm vùng ảnh đã bôi/khoanh trên slide:
   khoanh xong chọn "Lưu vào ghi chú của tôi" thì mẩu mới hiện ra sẵn ở đây,
   chỉ việc gõ nội dung.

   Nút bấm luôn ở góc dưới bên trái và không đè lên nội dung nào — hàng nút
   chuyển slide đã chừa sẵn chỗ bằng padding-left.
   ========================================================================== */
(function () {
  'use strict';

  var root, panel, titleEl, listEl, otherEl, addTa, addBox, cnt, btn;
  var slideNo = null;
  var pendingRect = null;      // vùng vừa khoanh, chờ gõ nội dung
  var editingId = null;

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
    });
  }
  function crop(rect, w, h, no) {
    var img = Core.imgOf(no == null ? slideNo : no) || 'template.png';
    return Core.cropStyle(rect, img, w, h);
  }

  function open(force) {
    root.classList.add('open');
    draw();
    if (force !== false) setTimeout(function () { addTa && addTa.focus(); }, 50);
  }

  /* ---------- vẽ ---------- */
  function draw() {
    var mine = Notes.list(slideNo);
    var total = Notes.count();

    btn.classList.toggle('has', total > 0);
    btn.title = total ? 'Ghi chú cá nhân — ' + total + ' mẩu' : 'Ghi chú cá nhân';
    titleEl.innerHTML = 'Ghi chú của bạn — <b>Slide ' + slideNo + '</b>' +
      (mine.length ? ' <span class="np-n">' + mine.length + '</span>' : '');

    /* --- ô thêm mẩu mới --- */
    addBox.innerHTML = '';
    if (pendingRect) {
      var pv = el('div', 'np-cap');
      var th = el('div', 'crop');
      th.setAttribute('style', crop(pendingRect, 74, 48));
      var lb = el('span', '', 'Vùng bạn vừa chọn');
      var rm = el('button', 'np-x', '✕');
      rm.onclick = function () { pendingRect = null; draw(); };
      pv.append(th, lb, rm);
      addBox.appendChild(pv);
    }
    addTa = document.createElement('textarea');
    addTa.maxLength = Notes.MAX_LEN;
    addTa.placeholder = pendingRect
      ? 'Bạn ghi gì về vùng này? (tối đa ' + Notes.MAX_LEN + ' ký tự)'
      : 'Ghi nhanh điều bạn nghĩ về slide này...';
    addTa.oninput = function () { paintCount(); };
    addTa.onkeydown = function (e) {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); save(); }
    };
    addBox.appendChild(addTa);

    var row = el('div', 'np-foot');
    cnt = el('span', 'np-count', '');
    var gap = el('span', ''); gap.style.flex = '1';
    var ok = el('button', 'btn sm pri', pendingRect ? 'Lưu kèm vùng' : 'Thêm ghi chú');
    ok.onclick = save;
    row.append(cnt, gap, ok);
    addBox.appendChild(row);
    paintCount();

    /* --- danh sách mẩu của slide này --- */
    listEl.innerHTML = '';
    if (!mine.length) {
      listEl.appendChild(el('div', 'np-none', 'Chưa có mẩu nào cho slide này.'));
    } else {
      mine.forEach(function (n) {
        var card = el('div', 'np-note' + (editingId === n.id ? ' editing' : ''));
        if (n.rect) {
          var t2 = el('div', 'crop');
          t2.setAttribute('style', crop(n.rect, 66, 44));
          if (n.parts && n.parts.length) t2.title = n.parts.join('; ');
          card.appendChild(t2);
        }
        var main = el('div', 'np-body');

        if (editingId === n.id) {
          var ed = document.createElement('textarea');
          ed.maxLength = Notes.MAX_LEN;
          ed.value = n.text;
          ed.oninput = function () { Notes.update(n.id, ed.value); };
          main.appendChild(ed);
          var done = el('button', 'btn sm pri', '✓ Xong');
          done.onclick = function () { editingId = null; draw(); };
          main.appendChild(done);
          setTimeout(function () { ed.focus(); }, 30);
        } else {
          main.appendChild(el('div', 'np-txt' + (n.text ? '' : ' none'),
            n.text ? esc(n.text) : '(chỉ lưu vùng, chưa viết chữ)'));
          main.appendChild(el('div', 'np-time', n.time));
          var acts = el('div', 'np-acts');
          var e1 = el('button', 'np-mini', '✎');
          e1.title = 'Sửa';
          e1.onclick = function () { editingId = n.id; draw(); };
          var d1 = el('button', 'np-mini danger', '🗑');
          d1.title = 'Xóa';
          d1.onclick = function () { Notes.remove(n.id); draw(); };
          acts.append(e1, d1);
          main.appendChild(acts);
        }
        card.appendChild(main);
        listEl.appendChild(card);
      });
    }

    /* --- các slide khác --- */
    otherEl.innerHTML = '';
    var others = Notes.grouped().filter(function (g) { return String(g.no) !== String(slideNo); });
    if (others.length) {
      otherEl.appendChild(el('div', 'np-lbl', 'Slide khác bạn đã ghi (' + others.length + ')'));
      others.forEach(function (g) {
        var b = el('button', 'np-item',
          '<b>Slide ' + g.no + '</b><span>' + esc(g.notes[0].text || '(chỉ có vùng ảnh)') +
          (g.notes.length > 1 ? ' · +' + (g.notes.length - 1) : '') + '</span>');
        b.title = 'Mở Slide ' + g.no;
        b.onclick = function () {
          window.dispatchEvent(new CustomEvent('goto-slide', { detail: { no: Number(g.no) } }));
        };
        otherEl.appendChild(b);
      });
    }
  }

  function paintCount() {
    if (!cnt || !addTa) return;
    var n = addTa.value.length;
    cnt.textContent = n + '/' + Notes.MAX_LEN;
    cnt.className = n >= Notes.MAX_LEN ? 'np-count full' : 'np-count';
  }

  function save() {
    var t = addTa.value.trim();
    if (!t && !pendingRect) { addTa.focus(); return; }
    Notes.add(slideNo, { text: t, rect: pendingRect, parts: pendingRect && pendingRect._parts });
    pendingRect = null;
    draw();
    setTimeout(function () { addTa && addTa.focus(); }, 30);
  }

  function switchTo(no) {
    slideNo = no;
    pendingRect = null;
    editingId = null;
    if (listEl) draw();
  }

  /* ---------- dựng ---------- */
  function build() {
    root = el('div', 'notepad');
    panel = el('div', 'np-panel');

    var head = el('div', 'np-head');
    titleEl = el('div', 'np-title', '');
    var x = el('button', 'np-x', '✕');
    x.title = 'Đóng';
    x.onclick = function () { root.classList.remove('open'); };
    head.append(titleEl, x);
    panel.appendChild(head);

    addBox = el('div', 'np-add');
    listEl = el('div', 'np-list');
    otherEl = el('div', 'np-other');
    panel.append(addBox, listEl, otherEl);

    btn = el('button', 'np-btn', '<span>📝</span>');
    btn.onclick = function () {
      if (root.classList.contains('open')) root.classList.remove('open');
      else open();
    };

    root.append(panel, btn);
    document.body.appendChild(root);

    switchTo(window.CURRENT_SLIDE != null ? window.CURRENT_SLIDE : 0);
    window.addEventListener('slide-change', function (e) { switchTo(e.detail.no); });

    /* Khoanh vùng trên slide rồi chọn "Lưu vào ghi chú của tôi" */
    window.addEventListener('note-capture', function (e) {
      slideNo = e.detail.no;
      pendingRect = e.detail.rect;
      if (e.detail.parts) pendingRect._parts = e.detail.parts;
      open();
    });

    /* Không vẽ lại khi đang gõ dở trong ô sửa, kẻo mất con trỏ */
    Notes.onChange(function () {
      if (root.classList.contains('open') && !editingId) draw();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
