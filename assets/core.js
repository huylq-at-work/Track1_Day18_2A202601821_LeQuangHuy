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

    var api = {
      stage: stage, canvas: canvas, dock: dock,
      el: el, pct: pct, draggable: draggable,
      slide: null, zones: {}, pins: {},
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
      }
    };

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
        return;
      }
      hint.style.display = cfg.hint ? '' : 'none';

      var wrap = el('div', 'slidewrap');
      var img = el('img');
      img.src = s.img;
      img.alt = s.title;
      img.addEventListener('load', fit);
      wrap.appendChild(img);

      s.notes.forEach(function (n) {
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

      canvas.appendChild(wrap);
      setZoom(zoom);
      cfg.onSlide && cfg.onSlide(s, api);
    }

    prev.onclick = function () { if (idx > 0) { idx--; drawSlide(); } };
    next.onclick = function () { if (idx < SLIDES.length - 1) { idx++; drawSlide(); } };

    drawSlide();
    requestAnimationFrame(fit);
    return api;
  }

  global.Core = { init: init, el: el, pct: pct, draggable: draggable, SLIDES: SLIDES };
})(window);
