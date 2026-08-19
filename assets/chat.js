/* ==========================================================================
   chat.js — khung trò chuyện thời gian thực với AI, dùng cho Option B và C

   Khác với mục "Hỏi về một vùng" (mỗi lần hỏi là một lượt rời rạc, phải chụp
   vùng trước), khung này giữ nguyên mạch hội thoại: AI nhớ các lượt trước,
   và câu trả lời hiện dần từng chữ ngay khi mô hình sinh ra (streaming).

   Dùng:  var chat = Chat.create(app, { context: '...' });
          chat.mount(bodyElement, footElement);
   ========================================================================== */
(function (global) {
  'use strict';

  var MAX_TURNS = 16;        // số lượt gửi kèm làm ngữ cảnh (8 cặp hỏi–đáp)

  function create(app, cfg) {
    cfg = cfg || {};
    var msgs = [];           // [{role:'user'|'assistant', content, region?}]
    var draft = '';
    var busy = false;
    var attach = null;       // vùng slide đính kèm cho câu hỏi sắp gửi
    var host = null, footHost = null, listEl = null, inputEl = null;

    function esc(s) {
      return String(s == null ? '' : s).replace(/[&<>]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
      });
    }
    function el(t, c, h) { return Core.el(t, c, h); }
    function fmt(s) { return esc(s).replace(/\n/g, '<br>'); }

    function systemPrompt() {
      return 'Bạn là trợ giảng đang ngồi cạnh một sinh viên Việt Nam trong lúc bạn ấy ôn bài. ' +
        'Trả lời hoàn toàn bằng tiếng Việt, giọng trò chuyện tự nhiên, ngắn gọn (dưới 150 từ) ' +
        'trừ khi được yêu cầu nói kỹ hơn. Bám vào nội dung slide dưới đây; nếu phải dùng kiến ' +
        'thức ngoài slide thì nói rõ đó là phần mở rộng.\n\n' +
        '--- Nội dung slide người học đang xem ---\n' + (cfg.context || '');
    }

    /* ---------------- gửi một lượt ---------------- */
    function send() {
      var text = (inputEl ? inputEl.value : draft).trim();
      if (!text || busy) return;

      var userMsg = { role: 'user', content: text };
      if (attach) {
        userMsg.region = attach;
        userMsg.parts = app.describe(attach);
      }
      msgs.push(userMsg);
      msgs.push({ role: 'assistant', content: '' });   // bong bóng chờ điền dần
      draft = ''; attach = null; busy = true;
      app.captureOff();
      draw();

      var bubble = listEl.querySelector('.msg:last-child .mbody');
      if (bubble) bubble.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';

      /* Gói ngữ cảnh: các lượt gần đây, vùng đính kèm mô tả bằng chữ */
      var history = msgs.slice(0, -1).slice(-MAX_TURNS).map(function (m) {
        var c = m.content;
        if (m.role === 'user' && m.region) {
          c += '\n\n[Người học khoanh riêng một vùng trên slide để hỏi. Vùng đó ' +
            (m.parts && m.parts.length
              ? 'trùm lên: ' + m.parts.join('; ')
              : 'không trùm rõ lên thành phần nào') + '.]';
        }
        return { role: m.role, content: c };
      });

      var first = true;
      AI.stream({
        system: systemPrompt(),
        messages: history,
        maxTokens: 1200,
        onDelta: function (piece, full) {
          msgs[msgs.length - 1].content = full;
          if (!bubble) return;
          if (first) { bubble.innerHTML = ''; first = false; }
          bubble.innerHTML = fmt(full);
          scrollDown();
        }
      }).then(function (full) {
        busy = false;
        msgs[msgs.length - 1].content = full;
        draw();
      }).catch(function (e) {
        busy = false;
        msgs[msgs.length - 1] = { role: 'assistant', content: '', err: e.message };
        draw();
      });
    }

    function scrollDown() {
      if (host) host.scrollTop = host.scrollHeight;
    }

    /* menu sau khi khoanh đóng lại thì vẽ lại nút 📷 cho đúng trạng thái */
    global.addEventListener('capture-end', function () { draw(); });

    /* ---------------- vẽ ---------------- */
    function draw() {
      if (!host) return;
      host.innerHTML = '';
      if (footHost) footHost.innerHTML = '';

      if (!window.AI || !AI.on()) {
        host.appendChild(AI.offNotice('Cần kết nối AI mới trò chuyện được.', draw));
        return;
      }

      /* --- danh sách tin nhắn --- */
      listEl = el('div', 'chat-list');

      if (!msgs.length) {
        listEl.appendChild(el('div', 'chat-empty',
          '<div class="ce-emoji">💬</div>' +
          '<div class="ce-t">Hỏi gì cũng được</div>' +
          '<div class="ce-s">Mình đã có nội dung slide này. Cứ gõ tự nhiên như đang nhắn tin — ' +
          'câu trả lời sẽ hiện dần ngay khi mình nghĩ ra.</div>'));

        var qs = ['Giải thích lại slide này thật đơn giản',
          'Khi nào dùng RAG, khi nào dùng Finetuning?',
          'Cho mình một ví dụ thực tế đi'];
        var quick = el('div', 'chat-quick');
        qs.forEach(function (q) {
          var b = el('button', 'opt', esc(q));
          b.onclick = function () { draft = q; if (inputEl) inputEl.value = q; send(); };
          quick.appendChild(b);
        });
        listEl.appendChild(quick);
      }

      msgs.forEach(function (m, i) {
        var row = el('div', 'msg ' + m.role);
        if (m.role === 'user' && m.region) {
          var th = el('div', 'crop msg-crop');
          th.setAttribute('style', app.cropStyle(m.region, app.slide.img, 130, 90));
          th.title = (m.parts && m.parts.length) ? m.parts.join('; ') : 'Vùng đã khoanh';
          row.appendChild(th);
        }
        var b = el('div', 'mbody', m.err ? '' : fmt(m.content));
        if (m.err) {
          b.classList.add('merr');
          b.innerHTML = '⚠️ ' + esc(m.err) + ' ';
          var retry = el('button', 'btn sm', 'Gửi lại');
          retry.onclick = function () {
            var prev = msgs[i - 1];
            msgs = msgs.slice(0, i - 1);
            if (prev) { attach = prev.region || null; draft = prev.content; }
            draw();
            if (inputEl) { inputEl.value = draft; inputEl.focus(); }
          };
          b.appendChild(retry);
        }
        row.appendChild(b);
        listEl.appendChild(row);
      });

      host.appendChild(listEl);
      scrollDown();

      /* --- ô nhập, đặt ở thanh dưới cùng để luôn nhìn thấy --- */
      if (!footHost) return;
      var bar = el('div', 'chat-bar');

      if (attach) {
        var pv = el('div', 'chat-attach');
        var t2 = el('div', 'crop');
        t2.setAttribute('style', app.cropStyle(attach, app.slide.img, 60, 40));
        var lbl = el('span', '', 'Đã đính kèm vùng bạn khoanh');
        var x = el('button', 'btn sm', '✕');
        x.onclick = function () { attach = null; draw(); };
        pv.append(t2, lbl, x);
        bar.appendChild(pv);
      }

      var row2 = el('div', 'chat-row');
      inputEl = el('textarea', 'chat-input');
      inputEl.placeholder = busy ? 'AI đang trả lời...' : 'Nhắn cho AI... (Enter để gửi)';
      inputEl.value = draft;
      inputEl.disabled = busy;
      inputEl.oninput = function () { draft = inputEl.value; };
      inputEl.onkeydown = function (e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
      };

      var arming = app.capturing();
      var pin = el('button', 'btn sm ' + (arming ? 'warnb' : ''), '📷');
      pin.title = 'Đính kèm một vùng trên slide vào câu hỏi';
      pin.onclick = function () {
        if (arming) { app.captureOff(); draw(); return; }
        app.capture(function (rect) { attach = rect; draw(); },
          false, { label: 'Đính kèm vào tin nhắn' });
        draw();
      };

      var go = el('button', 'btn pri sm', busy ? '...' : 'Gửi');
      go.disabled = busy;
      go.onclick = send;

      row2.append(inputEl, pin, go);
      bar.appendChild(row2);
      footHost.appendChild(bar);

      if (!busy) setTimeout(function () { if (inputEl) inputEl.focus(); }, 30);
    }

    return {
      mount: function (bodyEl, footEl) { host = bodyEl; footHost = footEl; draw(); },
      unmount: function () { host = null; footHost = null; app.captureOff(); },
      reset: function () { msgs = []; draft = ''; attach = null; app.captureOff(); },
      count: function () { return msgs.length; }
    };
  }

  global.Chat = { create: create };
})(window);
