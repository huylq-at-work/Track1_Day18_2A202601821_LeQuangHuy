/* ==========================================================================
   notesview.js — hai khối UI dùng chung cho Option B và Option C:

     .mountRaw(body, foot)     "Ghi chú gốc"  — đúng những gì bạn tự viết,
                                AI không đụng vào, có sửa/xoá từng mẩu.
     .mountSummary(body, foot) "Tổng hợp"     — AI sắp xếp lại ghi chú của
                                bạn thành có cấu trúc (không bịa thêm ý mới).

   Mỗi lần NotesView.create(app) tạo một bản instance riêng, có ô nhớ kết
   quả tổng hợp lần gần nhất (sum/sumBusy/sumErr/sumBase) và mẩu đang sửa
   (editNote) — nên B và C giữ trạng thái độc lập dù cùng đọc một kho
   Notes chung.
   ========================================================================== */
(function (global) {
  'use strict';

  function create(app) {
    var editNote = null;
    var sum = null, sumBusy = false, sumErr = null, sumBase = -1;

    function esc(s) {
      return String(s == null ? '' : s).replace(/[&<>]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
      });
    }
    function el(t, c, h) { return Core.el(t, c, h); }

    /* ================= Ghi chú gốc ================= */
    function mountRaw(body, foot) {
      body.innerHTML = ''; if (foot) foot.innerHTML = '';
      var groups = Notes.grouped();
      var total = Notes.count();

      body.appendChild(el('div', 'notice slate',
        '📝 Đây là <b>ghi chú thô do chính bạn viết</b> — AI không đụng vào. ' +
        'Bôi/khoanh một vùng trên slide rồi chọn <b>“Lưu vào ghi chú của tôi”</b>, ' +
        'hoặc gõ thẳng ở nút 📝 góc dưới trái.'));

      if (!total) {
        body.appendChild(el('div', 'empty',
          'Chưa có mẩu ghi chú nào.<br>Thử khoanh một vùng trên slide để lưu mẩu đầu tiên.'));
        return;
      }

      groups.forEach(function (g) {
        body.appendChild(el('div', 'seclabel',
          'Slide ' + g.no + ' <span class="count">' + g.notes.length + '</span>'));

        g.notes.forEach(function (n) {
          var c = el('div', 'notecard');
          if (n.rect) {
            var img = Core.imgOf(g.no);
            if (img) {
              var th = el('div', 'crop');
              th.setAttribute('style', Core.cropStyle(n.rect, img, 104, 74));
              if (n.parts && n.parts.length) th.title = n.parts.join('; ');
              c.appendChild(th);
            }
          }
          var main = el('div', 'ncontent');

          if (editNote === n.id) {
            var ta = el('textarea', 'ed');
            ta.maxLength = Notes.MAX_LEN;
            ta.value = n.text;
            ta.oninput = function () { Notes.update(n.id, ta.value); };
            main.appendChild(ta);
            var done = el('button', 'btn sm pri', '✓ Xong');
            done.style.marginTop = '8px';
            done.onclick = function () { editNote = null; mountRaw(body, foot); };
            main.appendChild(done);
            setTimeout(function () { ta.focus(); }, 30);
          } else {
            main.innerHTML = '<div class="nhead"><span class="ntime">' + n.time + '</span></div>' +
              '<div class="ntext' + (n.text ? '' : ' none') + '">' +
              (n.text ? esc(n.text) : '(chỉ lưu vùng, chưa viết chữ)') + '</div>';
            var acts = el('div', 'acts');
            var e1 = el('button', 'btn sm', '✎ Sửa');
            e1.onclick = function () { editNote = n.id; mountRaw(body, foot); };
            var d1 = el('button', 'btn sm danger', '🗑 Xóa');
            d1.onclick = function () { Notes.remove(n.id); mountRaw(body, foot); };
            acts.append(e1, d1);
            main.appendChild(acts);
          }
          c.appendChild(main);
          body.appendChild(c);
        });
      });

      if (foot) {
        foot.appendChild(el('span', 'muted', 'Tổng cộng ' + total + ' mẩu.'));
      }
    }

    /* ================= Tổng hợp ================= */
    function fetchSum(body, foot) {
      var total = Notes.count();
      if (!window.AI || !AI.on() || !total) { mountSummary(body, foot); return; }
      sumBusy = true; sumErr = null;
      mountSummary(body, foot);

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
          'Dưới đây là các mẩu ghi chú THÔ do chính người học tự viết khi xem bài giảng. ' +
          'Nhiệm vụ: sắp xếp lại chúng cho có cấu trúc, KHÔNG bịa thêm kiến thức mới. ' +
          '"overview": 2–3 câu nói xem người học đang tập trung vào những gì. ' +
          '"groups": gom các mẩu cùng chủ đề thành nhóm, mỗi nhóm có "title" ngắn và ' +
          '"points" là các gạch đầu dòng viết lại cho gọn, rõ, giữ đúng ý người học. ' +
          '"unclear": những chỗ ghi chú cho thấy người học còn lấn cấn hoặc ghi dở dang, ' +
          'nêu thành câu ngắn để họ biết cần ôn lại chỗ nào.',
        user: 'Ghi chú của người học:\n\n' + Notes.asText()
      }).then(function (out) {
        sumBusy = false; sum = out; sumBase = total;
        mountSummary(body, foot);
      }).catch(function (e) {
        sumBusy = false; sumErr = e.message;
        mountSummary(body, foot);
      });
    }

    function mountSummary(body, foot) {
      body.innerHTML = ''; if (foot) foot.innerHTML = '';
      var total = Notes.count();

      if (!total) {
        body.appendChild(el('div', 'empty',
          'Chưa có ghi chú nào để tổng hợp.<br>Ghi vài mẩu ở tab <b>Ghi chú gốc</b> trước đã.'));
        return;
      }
      if (!window.AI || !AI.on()) {
        body.appendChild(AI.offNotice('Cần kết nối AI mới tổng hợp được.',
          function () { fetchSum(body, foot); }));
        return;
      }
      if (sumBusy) { body.appendChild(AI.loading('AI đang sắp xếp lại ghi chú của bạn...')); return; }
      if (sumErr) {
        body.appendChild(el('div', 'notice amber', '⚠️ ' + esc(sumErr)));
        var again = el('button', 'btn sm', 'Thử lại');
        again.onclick = function () { fetchSum(body, foot); };
        body.appendChild(again);
        return;
      }
      if (!sum) {
        body.appendChild(el('div', 'notice slate',
          '🧩 Bạn đang có <b>' + total + ' mẩu ghi chú</b>. AI có thể gom chúng lại thành ' +
          'các nhóm chủ đề và chỉ ra chỗ bạn còn lấn cấn.'));
        var go = el('button', 'btn pri sm', 'Tổng hợp ' + total + ' mẩu ghi chú');
        go.onclick = function () { fetchSum(body, foot); };
        body.appendChild(go);
        return;
      }

      if (sumBase !== total) {
        body.appendChild(el('div', 'notice amber',
          '⚠️ Ghi chú đã thay đổi sau lần tổng hợp gần nhất (' + sumBase + ' → ' + total + ' mẩu).'));
      }
      body.appendChild(el('div', 'notice slate',
        '🧩 AI chỉ <b>sắp xếp lại ghi chú của bạn</b>, không thêm kiến thức mới.'));

      body.appendChild(el('div', 'card sumcard',
        '<h3>Bạn đang tập trung vào gì</h3><div class="tx">' + esc(sum.overview) + '</div>'));

      (sum.groups || []).forEach(function (g) {
        var c = el('div', 'card', '<h3>' + esc(g.title) + '</h3>');
        var ul = el('ul', 'plist');
        (g.points || []).forEach(function (p) { ul.appendChild(el('li', '', esc(p))); });
        c.appendChild(ul);
        body.appendChild(c);
      });

      if ((sum.unclear || []).length) {
        body.appendChild(el('div', 'seclabel', 'Chỗ bạn còn lấn cấn'));
        var c2 = el('div', 'card');
        c2.style.borderLeft = '4px solid #f2b544';
        var ul2 = el('ul', 'plist');
        sum.unclear.forEach(function (p) { ul2.appendChild(el('li', '', esc(p))); });
        c2.appendChild(ul2);
        body.appendChild(c2);
      }

      if (foot) {
        var redo = el('button', 'btn sm', '↻ Tổng hợp lại');
        redo.onclick = function () { fetchSum(body, foot); };
        foot.appendChild(redo);
        foot.appendChild(el('span', 'muted', 'Dựa trên ' + sumBase + ' mẩu ghi chú.'));
      }
    }

    return {
      mountRaw: mountRaw,
      mountSummary: mountSummary,
      unmount: function () { editNote = null; }
    };
  }

  global.NotesView = { create: create };
})(window);
