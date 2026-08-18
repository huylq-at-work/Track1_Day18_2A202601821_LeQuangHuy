/* ==========================================================================
   core.js — phần dùng chung của 3 prototype (proA / proB / proC)

   Gồm: dữ liệu ghi chú mẫu, khung màn hình 1 trang (không cuộn),
        bộ chuyển trang slide, và engine kéo–thả tự viết bằng Pointer Events.

   Lưu ý: dùng script thường (không phải ES module) để mở được trực tiếp
   bằng file:// mà không vướng CORS.
   ========================================================================== */
(function (global) {
  'use strict';

  /* ---------- 1. Dữ liệu slide + ghi chú mẫu ----------
     Ba mẩu ghi chú giả lập, neo vào đúng ba vùng trên ảnh template.png.
     Toạ độ tính theo % so với khung ảnh (1038 x 584). */
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

  var TOTAL_SLIDES = 38;          // số trang của bài giảng (chỉ để hiển thị)
  var START = 1;                  // chỉ số slide 5 trong mảng SLIDES

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
    document.body.style.setProperty('--brand', cfg.brand || '#1e3a8a');

    /* -- thanh trên -- */
    var top = el('div', 'topbar');
    var titleBox = el('div', '', '<div class="ttl">' + cfg.title + '</div>' +
      '<div class="sub">' + cfg.subtitle + '</div>');
    var nav = el('div', 'nav');
    var prev = el('button', '', '◀');
    var page = el('span', 'pg');
    var next = el('button', '', '▶');
    nav.append(prev, page, next);

    var sw = el('div', 'switch');
    ['A', 'B', 'C'].forEach(function (k) {
      var a = el('a', k === cfg.option ? 'cur' : '', 'Option ' + k);
      a.href = 'pro' + k + '.html';
      sw.appendChild(a);
    });

    top.append(titleBox, el('div', 'sp'), nav, sw);

    /* -- thân -- */
    var main = el('div', 'main');
    var stage = el('div', 'stage');
    var dock = el('div', 'dock');
    main.append(stage, dock);
    app.append(top, main);
    document.getElementById('app').replaceWith(app);

    /* -- trạng thái slide -- */
    var idx = START;
    var api = {
      stage: stage, dock: dock, el: el, pct: pct, draggable: draggable,
      slide: null, zones: {}, pins: {},
      /* nháy sáng vùng ghi chú số n trên slide */
      lit: function (n, ms) {
        var z = api.zones[n];
        if (!z) return;
        z.classList.add('lit');
        setTimeout(function () { z.classList.remove('lit'); }, ms || 1300);
      },
      /* bật/tắt khung vàng của một vùng */
      mark: function (n, on) {
        var z = api.zones[n];
        if (z) z.classList.toggle('show', on !== false);
      },
      markAll: function (on) {
        Object.keys(api.zones).forEach(function (k) { api.mark(k, on); });
      }
    };

    function drawSlide() {
      var s = SLIDES[idx];
      api.slide = s;
      api.zones = {}; api.pins = {};
      stage.innerHTML = '';
      page.textContent = 'Slide ' + s.no + '/' + TOTAL_SLIDES;
      prev.disabled = idx === 0;
      next.disabled = idx === SLIDES.length - 1;

      if (!s.img) {
        stage.appendChild(el('div', 'blank',
          '<div><b>Slide ' + s.no + ' — ' + s.title + '</b><br>' +
          'Prototype chỉ dựng dữ liệu ghi chú cho <b>Slide 5</b>.<br>' +
          'Bấm ' + (idx === 0 ? '▶' : '◀') + ' để quay lại slide đang ôn.</div>'));
        cfg.onSlide && cfg.onSlide(s, api);
        return;
      }

      var wrap = el('div', 'slidewrap');
      var img = el('img');
      img.src = s.img;
      img.alt = s.title;
      wrap.appendChild(img);

      s.notes.forEach(function (n) {
        var z = el('div', 'zone');
        z.setAttribute('style', pct(n.rect));
        z.dataset.note = n.id;
        wrap.appendChild(z);
        api.zones[n.id] = z;

        var p = el('div', 'pin', n.id + '<span class="tip"><b>' + n.kind + '</b><br>' +
          n.plain + '<br><i style="opacity:.7">' + n.meta + '</i></span>');
        p.style.left = n.rect.l + '%';
        p.style.top = n.rect.t + '%';
        p.addEventListener('click', function () { api.lit(n.id); });
        wrap.appendChild(p);
        api.pins[n.id] = p;
      });

      stage.appendChild(wrap);
      if (cfg.hint) stage.appendChild(el('div', 'hint', cfg.hint));
      cfg.onSlide && cfg.onSlide(s, api);
    }

    prev.onclick = function () { if (idx > 0) { idx--; drawSlide(); } };
    next.onclick = function () { if (idx < SLIDES.length - 1) { idx++; drawSlide(); } };

    drawSlide();
    return api;
  }

  global.Core = { init: init, el: el, pct: pct, draggable: draggable, SLIDES: SLIDES };
})(window);
