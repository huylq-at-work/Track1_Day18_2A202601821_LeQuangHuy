/* ==========================================================================
   notes.js — kho ghi chú cá nhân dùng chung cho cả trang

   Mỗi slide giữ một danh sách ghi chú. Mỗi mẩu có thể kèm theo vùng ảnh
   người học đã bôi/khoanh trên slide.

       { "5": [ {id, text, rect?, time}, ... ], "6": [...] }

   Ai dùng: notepad.js (góc dưới trái), menu sau khi khoanh vùng trong
   core.js, và các tab "Ghi chú gốc" / "Tổng hợp" của Option C.
   ========================================================================== */
(function (global) {
  'use strict';

  var STORE = 'vlearn_notes_v2';
  var OLD1 = 'vlearn_slide_notes';    // bản trước: mỗi slide một chuỗi
  var OLD0 = 'vlearn_quicknote';      // bản đầu: một chuỗi dùng chung
  var MAX_LEN = 200;

  var subs = [];

  function read() {
    try {
      var raw = localStorage.getItem(STORE);
      var o = raw ? JSON.parse(raw) : null;
      return (o && typeof o === 'object') ? o : {};
    } catch (e) { return {}; }
  }
  function write(o) {
    try { localStorage.setItem(STORE, JSON.stringify(o)); } catch (e) { }
    subs.forEach(function (f) { try { f(); } catch (e) { } });
  }

  /* Chuyển dữ liệu của hai bản lưu cũ sang cấu trúc danh sách */
  (function migrate() {
    var cur = read();
    if (Object.keys(cur).length) return;
    var moved = false;
    try {
      var v1 = localStorage.getItem(OLD1);
      if (v1) {
        var o = JSON.parse(v1) || {};
        Object.keys(o).forEach(function (k) {
          if (!o[k] || !String(o[k]).trim()) return;
          cur[k] = [{ id: uid(), text: String(o[k]).slice(0, MAX_LEN), time: now() }];
          moved = true;
        });
        localStorage.removeItem(OLD1);
      }
      var v0 = localStorage.getItem(OLD0);
      if (v0 && String(v0).trim()) {
        cur._orphan = [{ id: uid(), text: String(v0).slice(0, MAX_LEN), time: now() }];
        moved = true;
        localStorage.removeItem(OLD0);
      }
    } catch (e) { }
    if (moved) write(cur);
  })();

  function uid() { return 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function now() {
    return new Date().toLocaleString('vi-VN',
      { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
  }

  var api = {
    MAX_LEN: MAX_LEN,

    list: function (slideNo) { return (read()[String(slideNo)] || []).slice(); },

    /* [{no, notes:[...]}] theo thứ tự slide tăng dần */
    grouped: function () {
      var all = read();
      return Object.keys(all)
        .filter(function (k) { return all[k] && all[k].length; })
        .sort(function (a, b) { return Number(a) - Number(b); })
        .map(function (k) { return { no: k, notes: all[k] }; });
    },

    count: function (slideNo) {
      if (slideNo != null) return api.list(slideNo).length;
      var all = read(), n = 0;
      Object.keys(all).forEach(function (k) { n += (all[k] || []).length; });
      return n;
    },

    add: function (slideNo, data) {
      var all = read(), k = String(slideNo);
      var item = {
        id: uid(),
        text: String(data.text || '').slice(0, MAX_LEN),
        time: now()
      };
      if (data.rect) item.rect = data.rect;
      if (data.parts && data.parts.length) item.parts = data.parts;
      all[k] = all[k] || [];
      all[k].unshift(item);
      write(all);
      return item.id;
    },

    update: function (id, text) {
      var all = read();
      Object.keys(all).forEach(function (k) {
        all[k].forEach(function (n) {
          if (n.id === id) n.text = String(text || '').slice(0, MAX_LEN);
        });
      });
      write(all);
    },

    remove: function (id) {
      var all = read();
      Object.keys(all).forEach(function (k) {
        all[k] = all[k].filter(function (n) { return n.id !== id; });
        if (!all[k].length) delete all[k];
      });
      write(all);
    },

    find: function (id) {
      var all = read(), hit = null;
      Object.keys(all).forEach(function (k) {
        all[k].forEach(function (n) { if (n.id === id) hit = { slide: k, note: n }; });
      });
      return hit;
    },

    /* Gom toàn bộ ghi chú thành chữ, để gửi cho AI tổng hợp */
    asText: function () {
      return api.grouped().map(function (g) {
        return 'Slide ' + g.no + ':\n' + g.notes.map(function (n, i) {
          return '  ' + (i + 1) + '. ' + (n.text || '(chỉ chụp vùng, chưa viết chữ)') +
            (n.parts && n.parts.length ? '  [vùng đã khoanh gồm: ' + n.parts.join('; ') + ']' : '');
        }).join('\n');
      }).join('\n\n');
    },

    onChange: function (cb) { subs.push(cb); }
  };

  global.Notes = api;
})(window);
