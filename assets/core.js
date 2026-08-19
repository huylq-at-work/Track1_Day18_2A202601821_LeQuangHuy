/* ==========================================================================
   core.js — phần dùng chung của 3 prototype (proA / proB / proC)

   Gồm: dữ liệu ghi chú mẫu, khung màn hình 1 trang (không cuộn),
        thu/phóng slide 0.8x–1.5x, chuyển trang slide,
        và engine kéo–thả tự viết bằng Pointer Events.

   Lưu ý: dùng script thường (không phải ES module) để mở được trực tiếp
   bằng file:// mà không vướng CORS.
   ========================================================================== */
(function (global) {
  'use strict';

  /* ---------- 1. Dữ liệu slide + ghi chú mẫu ----------
     Ba mẩu ghi chú giả lập, neo vào đúng ba vùng trên ảnh template.png.
     Toạ độ tính theo % so với khung ảnh (1038 x 584). */
  var RATIO = 1038 / 584;

  var SLIDES = [
    { no: 4, img: null, title: 'Trang trước đó' },
    {
      no: 5, img: 'template.png',
      title: 'Vì sao Day 07 quan trọng với AI Product?',
      /* Nội dung chữ trên slide — đây là thứ gửi cho AI đọc (không gửi ảnh). */
      content:
        'Tiêu đề slide: "Vì sao Day 07 quan trọng với AI Product?"\n' +
        'Nhãn phía trên sơ đồ: "Khi LLM/VLM không có sẵn câu trả lời"\n' +
        'Luồng chính (mũi tên trái sang phải): Câu hỏi → LLM/VLM → Câu trả lời\n' +
        'Có một mũi tên đi từ khối "Data" hướng lên khối "LLM/VLM".\n' +
        'Ba khối cùng đổ vào "Data", mỗi khối kèm một chú thích ngắn:\n' +
        '  - In-Context — chú thích: "Dữ liệu ngắn"\n' +
        '  - RAG — chú thích: "Corpus lớn" (khối này được tô nổi bật màu đỏ)\n' +
        '  - Finetuning — chú thích: "Cần style riêng"\n' +
        'Dòng chữ nghiêng cuối slide: "Day 07 tập trung vào nhánh RAG: đưa đúng dữ liệu ' +
        'vào agent thay vì phải đổi model."\n' +
        'Chân slide: AICB · Ngày 7 · Tuần 1 · slide 5/38',
      /* Bản đồ vị trí từng thành phần trên slide (theo % của ảnh).
         Dùng để biết người học vừa khoanh trúng những phần nào — nhờ đó
         câu hỏi gửi cho AI nói được "vùng này chứa ô RAG và chú thích
         Corpus lớn" thay vì chỉ đưa mấy con số toạ độ. */
      regions: [
        { r: { l: 2, t: 1, w: 60, h: 8 }, t: 'Tiêu đề slide: "Vì sao Day 07 quan trọng với AI Product?"' },
        { r: { l: 30, t: 15.5, w: 40, h: 6.5 }, t: 'Nhãn phía trên sơ đồ: "Khi LLM/VLM không có sẵn câu trả lời"' },
        { r: { l: 16.7, t: 23, w: 15.5, h: 10 }, t: 'Ô "Câu hỏi" — điểm bắt đầu của luồng chính' },
        { r: { l: 41.8, t: 23, w: 15.4, h: 10 }, t: 'Ô "LLM/VLM" — ở giữa luồng chính' },
        { r: { l: 66.9, t: 23, w: 15.4, h: 10 }, t: 'Ô "Câu trả lời" — điểm cuối của luồng chính' },
        { r: { l: 41.8, t: 43, w: 15.4, h: 10.4 }, t: 'Ô "Data" — có mũi tên đi lên khối LLM/VLM' },
        { r: { l: 16.7, t: 63, w: 15.5, h: 10.4 }, t: 'Ô "In-Context"' },
        { r: { l: 16.7, t: 74.5, w: 15.5, h: 5 }, t: 'Chú thích dưới In-Context: "Dữ liệu ngắn"' },
        { r: { l: 41.8, t: 63, w: 15.4, h: 10.4 }, t: 'Ô "RAG" (được tô nổi bật màu đỏ)' },
        { r: { l: 41.8, t: 74.5, w: 15.4, h: 5 }, t: 'Chú thích dưới RAG: "Corpus lớn"' },
        { r: { l: 66.9, t: 63, w: 15.4, h: 10.4 }, t: 'Ô "Finetuning"' },
        { r: { l: 66.9, t: 74.5, w: 15.4, h: 5 }, t: 'Chú thích dưới Finetuning: "Cần style riêng"' },
        { r: { l: 14, t: 83, w: 72, h: 6 }, t: 'Dòng chữ nghiêng cuối slide: "Day 07 tập trung vào nhánh RAG: đưa đúng dữ liệu vào agent thay vì phải đổi model."' },
        { r: { l: 0, t: 94, w: 100, h: 6 }, t: 'Thanh chân slide: Giảng viên (VinUni) · AICB · Ngày 7 · Tuần 1 · 5/38' }
      ],
      notes: [
        {
          id: 1, kind: 'Bôi vàng',
          text: '"Khi LLM/VLM <b>không có sẵn</b> câu trả lời"',
          plain: 'Khi LLM/VLM không có sẵn câu trả lời',
          meta: 'Bôi vàng · vùng tiêu đề sơ đồ · ghi lúc 20:14',
          rect: { l: 30.3, t: 15.5, w: 39.5, h: 6.5 }
        },
        {
          id: 2, kind: 'Ghi chú tay',
          text: '"RAG = đưa đúng dữ liệu vào agent thay vì phải đổi model"',
          plain: 'RAG = đưa đúng dữ liệu vào agent thay vì đổi model',
          meta: 'Ghi chú tay · ô RAG · ghi lúc 20:19',
          rect: { l: 41.5, t: 62.8, w: 15.5, h: 10 }
        },
        {
          id: 3, kind: 'Chưa hiểu',
          text: '⚠️ "Chưa hiểu: khi nào dùng In-Context, khi nào RAG, khi nào Finetuning?"',
          plain: 'Chưa hiểu: khi nào dùng In-Context / RAG / Finetuning?',
          meta: 'Ảnh chụp + đánh dấu chưa hiểu · hàng dưới cùng · ghi lúc 20:26',
          rect: { l: 16.5, t: 61.5, w: 66, h: 18 }
        }
      ]
    },
    { no: 6, img: null, title: 'Trang tiếp theo' }
  ];

  var TOTAL_SLIDES = 38;   // tổng số trang của bài giảng (chỉ để hiển thị)
  var START = 1;           // vị trí Slide 5 trong mảng SLIDES

  var ZOOM_MIN = 0.8, ZOOM_MAX = 1.5, ZOOM_STEP = 0.1;

  /* ---------- 2. Tiện ích nhỏ ---------- */
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function pct(r) {
    return 'left:' + r.l + '%;top:' + r.t + '%;width:' + r.w + '%;height:' + r.h + '%;';
  }
  function round1(v) { return Math.round(v * 10) / 10; }
  function clamp100(v) { return Math.max(0, Math.min(100, v)); }

  /* Cắt một vùng của ảnh slide bằng CSS background (không dùng canvas,
     nên vẫn chạy khi mở bằng file://). Trả về chuỗi style cho thẻ .crop */
  var IMG_W = 1038, IMG_H = 584;
  function cropStyle(rect, src, maxW, maxH) {
    var cw = rect.w / 100 * IMG_W, ch = rect.h / 100 * IMG_H;
    var s = Math.min(maxW / cw, maxH / ch);
    var tw = Math.max(28, cw * s), th = Math.max(20, ch * s);
    var px = rect.w >= 100 ? 0 : (rect.l / (100 - rect.w)) * 100;
    var py = rect.h >= 100 ? 0 : (rect.t / (100 - rect.h)) * 100;
    return 'width:' + Math.round(tw) + 'px;height:' + Math.round(th) + 'px;' +
      'background-image:url(' + src + ');' +
      'background-size:' + (10000 / rect.w) + '% ' + (10000 / rect.h) + '%;' +
      'background-position:' + px + '% ' + py + '%;';
  }

  /* Vùng vừa khoanh đè lên những thành phần nào của slide? */
  function describeRect(slide, rect) {
    var hits = (slide.regions || []).filter(function (g) {
      var ox = Math.min(rect.l + rect.w, g.r.l + g.r.w) - Math.max(rect.l, g.r.l);
      var oy = Math.min(rect.t + rect.h, g.r.t + g.r.h) - Math.max(rect.t, g.r.t);
      if (ox <= 0 || oy <= 0) return false;
      /* tính là "trúng" khi phủ được ít nhất 25% diện tích thành phần đó */
      return (ox * oy) / (g.r.w * g.r.h) >= 0.25;
    }).map(function (g) { return g.t; });
    return hits;
  }

  /* ---------- 3. Engine kéo–thả (Pointer Events + rAF) ----------
     Mượt hơn HTML5 drag-and-drop: ghost bám sát con trỏ theo transform,
     vùng thả bắt bằng elementFromPoint nên chạy cả trên chuột lẫn cảm ứng. */
  function draggable(node, getPayload) {
    node.style.touchAction = 'none';
    node.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      if (node.classList.contains('used')) return;
      e.preventDefault();

      var payload = getPayload();
      var ghost = el('div', 'drag-ghost', payload.label);
      document.body.appendChild(ghost);
      document.body.classList.add('dragging');

      var x = e.clientX, y = e.clientY, raf = null, zone = null, moved = false;

      function paint() {
        raf = null;
        ghost.style.transform = 'translate(' + x + 'px,' + y + 'px) translate(-50%,-150%)';
        var under = document.elementFromPoint(x, y);
        var z = under ? under.closest('[data-drop]') : null;
        if (z !== zone) {
          if (zone) zone.classList.remove('over');
          zone = z;
          if (zone) zone.classList.add('over');
        }
      }
      function onMove(ev) {
        x = ev.clientX; y = ev.clientY; moved = true;
        if (!raf) raf = requestAnimationFrame(paint);
      }
      function onUp() {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        if (raf) cancelAnimationFrame(raf);
        ghost.remove();
        document.body.classList.remove('dragging');
        if (zone) {
          zone.classList.remove('over');
          zone.dispatchEvent(new CustomEvent('notedrop', { detail: payload, bubbles: true }));
        } else if (!moved && payload.onClick) {
          payload.onClick();
        }
      }
      paint();
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    });
  }

  /* ---------- 4. Dựng khung màn hình ---------- */
  function init(cfg) {
    var app = el('div', 'app');
    document.body.style.setProperty('--brand', cfg.brand || '#6b5cf6');

    /* ===== thanh trên ===== */
    var top = el('div', 'topbar');
    top.append(
      el('div', '', '<div class="ttl">' + cfg.title + '</div><div class="sub">' + cfg.subtitle + '</div>'),
      el('div', 'sp')
    );

    var sw = el('div', 'switch');
    ['A', 'B', 'C'].forEach(function (k) {
      var a = el('a', k === cfg.option ? 'cur' : '', 'Option ' + k);
      a.href = 'pro' + k + '.html';
      sw.appendChild(a);
    });
    top.appendChild(sw);

    /* ===== thân ===== */
    var main = el('div', 'main');
    var stage = el('div', 'stage');
    var canvas = el('div', 'canvas');
    var hint = el('div', 'hint', cfg.hint || '');

    /* hàng công cụ nhỏ dưới slide: zoom + số trang */
    var bar = el('div', 'stagebar');
    var pgLabel = el('span', 'pglabel');
    var zOut = el('button', 'iconbtn', '−');
    var zLabel = el('span', 'zoomlabel', '100%');
    var zIn = el('button', 'iconbtn', '+');
    var zFit = el('button', 'iconbtn wide', '⤢ Vừa màn hình');
    var zoomBox = el('div', 'zoombox');
    zoomBox.append(zOut, zLabel, zIn);
    bar.append(pgLabel, el('div', 'sp'), zoomBox, zFit);

    /* hàng dưới cùng: chuyển trang slide */
    var navRow = el('div', 'lessonnav');
    var prev = el('button', 'btn nav-prev', '‹  Slide trước');
    var next = el('button', 'btn pri nav-next', 'Slide tiếp theo  ›');
    navRow.append(prev, el('div', 'sp'), next);

    stage.append(canvas, hint, bar, el('div', 'hr'), navRow);

    var dock = el('div', 'dock');
    main.append(stage, dock);
    app.append(top, main);
    document.getElementById('app').replaceWith(app);

    /* ===== nút cấu hình API key ===== */
    var keyBtn = el('button', 'iconbtn wide keybtn', '');
    function paintKey() {
      var m = global.AI ? global.AI.mode() : 'off';
      keyBtn.innerHTML = m === 'env' ? '🔑 AI: key từ .env'
        : (m === 'local' ? '🔑 AI: key trong trình duyệt' : '🔑 Kết nối AI');
      keyBtn.classList.toggle('ok', m !== 'off');
      keyBtn.title = m === 'env'
        ? 'API key đang được đọc từ file .env qua serve.py'
        : 'Bấm để xem cách kết nối API key';
    }
    keyBtn.onclick = function () {
      global.AI.openSettings(function () { paintKey(); if (cfg.onKey) cfg.onKey(); });
    };
    /* ai.js dò server bất đồng bộ — dò xong thì cập nhật lại nút và panel */
    global.addEventListener('ai-mode', function () {
      paintKey();
      if (cfg.onKey) cfg.onKey();
    });
    paintKey();
    top.insertBefore(keyBtn, sw);

    /* ===== nút ẩn/hiện panel phải ===== */
    var toggle = el('button', 'iconbtn panel-toggle', '⊟');
    toggle.title = 'Ẩn / hiện panel bên phải';
    toggle.onclick = function () {
      main.classList.toggle('wide');
      toggle.textContent = main.classList.contains('wide') ? '⊞' : '⊟';
      requestAnimationFrame(fit);
    };
    top.insertBefore(toggle, sw);

    /* ===== trạng thái ===== */
    var idx = START, zoom = 1;
    var capCb = null, capSticky = false, capOpts = {};   // ai đang chờ nhận vùng khoanh

    var api = {
      stage: stage, canvas: canvas, dock: dock,
      el: el, pct: pct, draggable: draggable,
      slide: null, wrap: null, zones: {}, pins: {},
      zoom: function () { return zoom; },
      lit: function (n, ms) {
        var z = api.zones[n];
        if (!z) return;
        z.classList.add('lit');
        setTimeout(function () { z.classList.remove('lit'); }, ms || 1300);
      },
      mark: function (n, on) {
        var z = api.zones[n];
        if (z) z.classList.toggle('show', on !== false);
      },
      markAll: function (on) {
        Object.keys(api.zones).forEach(function (k) { api.mark(k, on); });
      },

      /* --- khoanh vùng trên slide ---
         capture(cb)        : bật một lượt khoanh, xong tự tắt
         capture(cb, true)  : bật thường trực (Option A dùng kiểu này)
         captureOff()       : tắt                                        */
      capture: function (cb, sticky, opts) {
        capCb = cb; capSticky = !!sticky; capOpts = opts || {};
        if (api.cap) api.cap.classList.add('armed');
        if (api.hintBadge) api.hintBadge.style.display = sticky ? 'none' : '';
      },
      captureOff: function () {
        capCb = null; capSticky = false;
        if (api.cap) api.cap.classList.remove('armed');
        if (api.hintBadge) api.hintBadge.style.display = 'none';
      },
      capturing: function () { return !!capCb; },
      cropStyle: cropStyle,
      describe: function (rect) { return describeRect(api.slide, rect); }
    };

    /* Bắt thao tác kéo chuột để khoanh vùng — dùng chung cho cả A, B, C. */
    function bindCapture(layer, wrap) {
      layer.addEventListener('pointerdown', function (e) {
        if (e.button !== 0 || !capCb) return;
        e.preventDefault();
        layer.setPointerCapture(e.pointerId);

        var box = wrap.getBoundingClientRect();
        var x0 = clamp100((e.clientX - box.left) / box.width * 100);
        var y0 = clamp100((e.clientY - box.top) / box.height * 100);
        var mq = el('div', 'marquee');
        layer.appendChild(mq);
        var rect = { l: x0, t: y0, w: 0, h: 0 };

        function onMove(ev) {
          var x1 = clamp100((ev.clientX - box.left) / box.width * 100);
          var y1 = clamp100((ev.clientY - box.top) / box.height * 100);
          rect.l = Math.min(x0, x1); rect.t = Math.min(y0, y1);
          rect.w = Math.abs(x1 - x0); rect.h = Math.abs(y1 - y0);
          mq.setAttribute('style', pct(rect));
        }
        function onUp() {
          layer.removeEventListener('pointermove', onMove);
          layer.removeEventListener('pointerup', onUp);
          if (rect.w < 3 || rect.h < 3) { mq.remove(); return; }   // bấm nhầm, bỏ qua

          var r = { l: round1(rect.l), t: round1(rect.t), w: round1(rect.w), h: round1(rect.h) };
          var cb = capCb, opts = capOpts;

          /* Kiểu bật thường trực (Option A) đi thẳng vào việc, không chèn menu */
          if (capSticky || opts.menu === false) {
            mq.remove();
            cb(r);
            return;
          }
          api.captureOff();
          showMenu(layer, mq, r, cb, opts);
        }
        layer.addEventListener('pointermove', onMove);
        layer.addEventListener('pointerup', onUp);
      });
    }

    /* Menu nhỏ hiện ngay cạnh vùng vừa bôi/khoanh, cho chọn làm gì với nó. */
    function showMenu(layer, mq, rect, cb, opts) {
      var m = el('div', 'capmenu');
      var below = rect.t + rect.h < 72;
      m.style.left = Math.min(Math.max(rect.l, 1), 62) + '%';
      m.style.top = below ? (rect.t + rect.h + 1.5) + '%' : 'auto';
      m.style.bottom = below ? 'auto' : (100 - rect.t + 1.5) + '%';

      function close() {
        m.remove(); mq.remove();
        global.dispatchEvent(new CustomEvent('capture-end'));
      }

      var b1 = el('button', 'cm-item pri', '💬 ' + (opts.label || 'Dùng vùng này'));
      b1.onclick = function () { close(); cb(rect); };
      m.appendChild(b1);

      if (global.Notes) {
        var b2 = el('button', 'cm-item', '📝 Lưu vào ghi chú của tôi');
        b2.onclick = function () {
          close();
          global.dispatchEvent(new CustomEvent('note-capture', {
            detail: { no: api.slide.no, rect: rect, parts: describeRect(api.slide, rect) }
          }));
        };
        m.appendChild(b2);
      }

      var b3 = el('button', 'cm-item ghost', '✕ Bỏ');
      b3.onclick = close;
      m.appendChild(b3);

      layer.parentNode.appendChild(m);

      /* bấm ra ngoài thì đóng */
      setTimeout(function () {
        function away(ev) {
          if (m.contains(ev.target)) return;
          document.removeEventListener('pointerdown', away, true);
          close();
        }
        document.addEventListener('pointerdown', away, true);
      }, 0);
    }

    /* ===== thu phóng =====
       Tính bề rộng "vừa khung" rồi nhân với hệ số zoom. Khi vượt khung,
       vùng canvas tự cuộn để rê xem từng phần — trang chính vẫn không cuộn. */
    function fit() {
      var wrap = canvas.querySelector('.slidewrap');
      if (!wrap) return;
      var w = canvas.clientWidth - 8;
      var h = canvas.clientHeight - 8;
      var base = Math.min(w, h * RATIO);
      wrap.style.setProperty('--base', base + 'px');
      wrap.style.setProperty('--zoom', zoom);
    }
    function setZoom(v) {
      zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, round1(v)));
      zLabel.textContent = Math.round(zoom * 100) + '%';
      zOut.disabled = zoom <= ZOOM_MIN;
      zIn.disabled = zoom >= ZOOM_MAX;
      fit();
    }
    zOut.onclick = function () { setZoom(zoom - ZOOM_STEP); };
    zIn.onclick = function () { setZoom(zoom + ZOOM_STEP); };
    zFit.onclick = function () { setZoom(1); canvas.scrollTo(0, 0); };

    /* Ctrl + lăn chuột trên slide cũng thu phóng được */
    canvas.addEventListener('wheel', function (e) {
      if (!e.ctrlKey) return;
      e.preventDefault();
      setZoom(zoom + (e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP));
    }, { passive: false });

    window.addEventListener('resize', fit);

    /* ===== vẽ slide ===== */
    function drawSlide() {
      var s = SLIDES[idx];
      api.slide = s;
      api.wrap = null;
      api.zones = {}; api.pins = {};
      canvas.innerHTML = '';
      pgLabel.textContent = 'Slide ' + s.no + ' / ' + TOTAL_SLIDES;
      prev.disabled = idx === 0;
      next.disabled = idx === SLIDES.length - 1;

      var hasImg = !!s.img;
      zOut.disabled = zIn.disabled = zFit.disabled = !hasImg;

      if (!hasImg) {
        canvas.appendChild(el('div', 'blank',
          '<div><b>Slide ' + s.no + ' — ' + s.title + '</b><br>' +
          'Prototype chỉ dựng dữ liệu ghi chú cho <b>Slide 5</b>.<br>' +
          'Bấm ' + (idx === 0 ? '"Slide tiếp theo"' : '"Slide trước"') + ' để quay lại slide đang ôn.</div>'));
        hint.style.display = 'none';
        cfg.onSlide && cfg.onSlide(s, api);
        announce(s);
        return;
      }
      hint.style.display = cfg.hint ? '' : 'none';

      var wrap = el('div', 'slidewrap');
      var img = el('img');
      img.src = s.img;
      img.alt = s.title;
      img.addEventListener('load', fit);
      wrap.appendChild(img);
      api.wrap = wrap;

      /* cfg.pins === false: không vẽ sẵn vùng đánh dấu — dành cho Option A,
         nơi người dùng tự khoanh vùng muốn chụp. */
      if (cfg.pins !== false) s.notes.forEach(function (n) {
        var z = el('div', 'zone');
        z.setAttribute('style', pct(n.rect));
        z.dataset.note = n.id;
        wrap.appendChild(z);
        api.zones[n.id] = z;

        var p = el('div', 'pin', n.id + '<span class="tip"><b>' + n.kind + '</b><br>' +
          n.plain + '<br><i style="opacity:.75">' + n.meta + '</i></span>');
        p.style.left = n.rect.l + '%';
        p.style.top = n.rect.t + '%';
        p.addEventListener('click', function () { api.lit(n.id); });
        wrap.appendChild(p);
        api.pins[n.id] = p;
      });

      /* lớp khoanh vùng + nhãn nhắc, luôn có sẵn nhưng chỉ ăn chuột khi được bật */
      var cap = el('div', 'capture-layer');
      wrap.appendChild(cap);
      api.cap = cap;
      bindCapture(cap, wrap);

      var badge = el('div', 'caphint', '✛ Kéo chuột để khoanh vùng bạn muốn hỏi');
      badge.style.display = 'none';
      wrap.appendChild(badge);
      api.hintBadge = badge;
      if (capCb) { cap.classList.add('armed'); if (!capSticky) badge.style.display = ''; }

      canvas.appendChild(wrap);
      setZoom(zoom);
      cfg.onSlide && cfg.onSlide(s, api);
      announce(s);
    }

    /* Báo cho các thành phần ngoài (góc ghi chú cá nhân) biết đang ở slide nào */
    function announce(s) {
      global.CURRENT_SLIDE = s.no;
      global.dispatchEvent(new CustomEvent('slide-change', { detail: { no: s.no } }));
    }

    /* Cho phép nơi khác yêu cầu nhảy tới một slide cụ thể */
    global.addEventListener('goto-slide', function (e) {
      var no = e.detail && e.detail.no;
      for (var i = 0; i < SLIDES.length; i++) {
        if (SLIDES[i].no === no) { idx = i; drawSlide(); return; }
      }
    });

    prev.onclick = function () { if (idx > 0) { idx--; drawSlide(); } };
    next.onclick = function () { if (idx < SLIDES.length - 1) { idx++; drawSlide(); } };

    drawSlide();
    requestAnimationFrame(fit);
    return api;
  }

  /* Ảnh của một slide theo số trang — để nơi khác (notepad) cắt được ảnh vùng */
  function imgOf(no) {
    for (var i = 0; i < SLIDES.length; i++) {
      if (String(SLIDES[i].no) === String(no)) return SLIDES[i].img;
    }
    return null;
  }

  global.Core = {
    init: init, el: el, pct: pct, draggable: draggable, SLIDES: SLIDES,
    cropStyle: cropStyle, describeRect: describeRect, imgOf: imgOf
  };
})(window);
