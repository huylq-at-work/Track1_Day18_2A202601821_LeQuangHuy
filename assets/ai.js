/* ==========================================================================
   ai.js — cầu nối tới OpenAI Chat Completions API (mặc định model gpt-4o)

   Hai chế độ, tự dò khi trang tải:

   1. CHẾ ĐỘ .env (khuyên dùng) — chạy `python serve.py`, key nằm trong file
      .env ở phía server. Trang web gọi sang /api/chat cùng origin; API key
      KHÔNG bao giờ đi xuống trình duyệt và cũng không dính lỗi CORS.

   2. CHẾ ĐỘ dán tay — nếu không chạy serve.py, vẫn có thể dán key vào hộp
      thoại 🔑; key lưu trong localStorage của máy và trình duyệt gọi thẳng
      api.openai.com. Mở bằng file:// sẽ bị chặn CORS.
   ========================================================================== */
(function (global) {
  'use strict';

  var STORE = 'vlearn_openai_key';
  var URL_API = 'https://api.openai.com/v1/chat/completions';
  var URL_PROXY = 'api/chat';
  var URL_STATUS = 'api/status';
  var MODEL = 'gpt-4o';

  var server = null;        // null = chưa dò xong | false = không có | {model}

  function getKey() { try { return localStorage.getItem(STORE) || ''; } catch (e) { return ''; } }
  function setKey(v) { try { localStorage.setItem(STORE, v.trim()); } catch (e) { } }
  function clearKey() { try { localStorage.removeItem(STORE); } catch (e) { } }

  function on() { return !!server || !!getKey(); }
  function mode() { return server ? 'env' : (getKey() ? 'local' : 'off'); }
  function model() { return (server && server.model) || MODEL; }

  /* ---------- dò xem serve.py có đang chạy và .env đã có key chưa ---------- */
  function probe() {
    if (!/^https?:$/.test(location.protocol)) { server = false; return Promise.resolve(); }
    return fetch(URL_STATUS, { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { server = (d && d.ready) ? d : false; })
      .catch(function () { server = false; });
  }
  probe().then(function () {
    global.dispatchEvent(new CustomEvent('ai-mode'));
  });

  /* ---------- gọi API ---------- */
  function request(opts) {
    var body = {
      model: model(),
      max_tokens: opts.maxTokens || 2000,
      temperature: opts.temperature == null ? 0.4 : opts.temperature,
      messages: [
        { role: 'system', content: opts.system || '' },
        { role: 'user', content: opts.user }
      ]
    };
    /* Structured Outputs: ép mô hình trả về đúng JSON theo schema */
    if (opts.schema) {
      body.response_format = {
        type: 'json_schema',
        json_schema: { name: opts.name || 'ket_qua', strict: true, schema: opts.schema }
      };
    }

    var url, headers;
    if (server) {
      url = URL_PROXY;
      headers = { 'content-type': 'application/json' };   // key do serve.py gắn
    } else {
      url = URL_API;
      headers = {
        'content-type': 'application/json',
        'authorization': 'Bearer ' + getKey()
      };
    }

    return fetch(url, { method: 'POST', headers: headers, body: JSON.stringify(body) })
      .then(function (res) {
        return res.json().catch(function () { return {}; })
          .then(function (data) { return { ok: res.ok, status: res.status, data: data }; });
      });
  }

  function call(opts) {
    var start = server === null ? probe() : Promise.resolve();

    return start.then(function () {
      if (!on()) throw new Error('Chưa có API key. Tạo file .env rồi chạy serve.py, ' +
        'hoặc dán key ở nút 🔑.');
      return request(opts);
    }).then(function (r) {
      if (!r.ok) {
        var msg = (r.data && r.data.error && r.data.error.message) || ('Lỗi HTTP ' + r.status);
        if (r.status === 401) msg = 'API key không hợp lệ hoặc đã bị thu hồi.';
        if (r.status === 429) msg = 'Đã chạm giới hạn tần suất hoặc hết hạn mức — thử lại sau.';
        throw new Error(msg);
      }
      var choice = (r.data.choices || [])[0];
      if (!choice) throw new Error('Không nhận được nội dung trả về.');
      if (choice.finish_reason === 'content_filter') {
        throw new Error('Nội dung bị bộ lọc của OpenAI chặn.');
      }
      var msgObj = choice.message || {};
      if (msgObj.refusal) throw new Error('Mô hình từ chối trả lời: ' + msgObj.refusal);

      var text = (msgObj.content || '').trim();
      if (!text) throw new Error('Không nhận được nội dung trả về.');
      if (!opts.schema) return text;

      try {
        return JSON.parse(text.replace(/^```(?:json)?|```$/g, '').trim());
      } catch (e) {
        throw new Error('Nội dung trả về không đúng định dạng JSON.');
      }
    }).catch(function (e) {
      if (e instanceof TypeError) {      // fetch ném TypeError khi CORS/mất mạng
        throw new Error('Không gọi được API. Cách gọn nhất: tạo file .env từ .env.example, ' +
          'chạy "python serve.py" rồi mở qua http://localhost:8000.');
      }
      throw e;
    });
  }

  /* ---------- gọi API kiểu streaming (trò chuyện thời gian thực) ----------
     opts: { system, messages:[{role,content}], maxTokens, onDelta(text) }
     Trả về Promise<toàn bộ câu trả lời>. */
  function streamCall(opts) {
    var start = server === null ? probe() : Promise.resolve();

    return start.then(function () {
      if (!on()) throw new Error('Chưa có API key. Tạo file .env rồi chạy serve.py, ' +
        'hoặc dán key ở nút 🔑.');

      var msgs = [];
      if (opts.system) msgs.push({ role: 'system', content: opts.system });
      msgs = msgs.concat(opts.messages || []);

      var body = {
        model: model(),
        max_tokens: opts.maxTokens || 1200,
        temperature: opts.temperature == null ? 0.5 : opts.temperature,
        stream: true,
        messages: msgs
      };

      var url, headers;
      if (server) {
        url = URL_PROXY;
        headers = { 'content-type': 'application/json' };
      } else {
        url = URL_API;
        headers = { 'content-type': 'application/json', 'authorization': 'Bearer ' + getKey() };
      }
      return fetch(url, { method: 'POST', headers: headers, body: JSON.stringify(body) });
    }).then(function (res) {
      if (!res.ok) {
        return res.json().catch(function () { return {}; }).then(function (d) {
          var msg = (d.error && d.error.message) || ('Lỗi HTTP ' + res.status);
          if (res.status === 401) msg = 'API key không hợp lệ hoặc đã bị thu hồi.';
          if (res.status === 429) msg = 'Đã chạm giới hạn tần suất hoặc hết hạn mức — thử lại sau.';
          throw new Error(msg);
        });
      }
      if (!res.body) throw new Error('Trình duyệt không hỗ trợ đọc luồng dữ liệu.');

      var reader = res.body.getReader();
      var dec = new TextDecoder('utf-8');
      var buf = '', full = '';

      function pump() {
        return reader.read().then(function (r) {
          if (r.done) return full;
          buf += dec.decode(r.value, { stream: true });

          var lines = buf.split('\n');
          buf = lines.pop();                       // dòng cuối có thể còn dở
          lines.forEach(function (line) {
            line = line.trim();
            if (!line || line.indexOf('data:') !== 0) return;
            var raw = line.slice(5).trim();
            if (raw === '[DONE]') return;
            try {
              var j = JSON.parse(raw);
              var ch = (j.choices || [])[0];
              if (!ch) return;
              var piece = ch.delta && ch.delta.content;
              if (piece) { full += piece; if (opts.onDelta) opts.onDelta(piece, full); }
            } catch (e) { /* mẩu JSON chưa trọn vẹn — bỏ qua */ }
          });
          return pump();
        });
      }

      return pump().then(function (text) {
        if (!text) throw new Error('Không nhận được nội dung trả về.');
        return text;
      });
    }).catch(function (e) {
      if (e instanceof TypeError) {
        throw new Error('Không gọi được API. Tạo file .env từ .env.example, ' +
          'chạy "python serve.py" rồi mở qua http://localhost:8000.');
      }
      throw e;
    });
  }

  /* ---------- hộp thoại trạng thái / dán key dự phòng ---------- */
  function openSettings(onDone) {
    var m = mode();
    var envBlock = m === 'env'
      ? '<div class="mstate ok">✓ Đang lấy API key từ file <code>.env</code> qua <code>serve.py</code>.<br>' +
      'Key nằm ở phía server, trình duyệt không hề thấy key. Model: <code>' + model() + '</code>.</div>'
      : '<div class="mstate">Chưa thấy <code>serve.py</code> đang chạy (hoặc <code>.env</code> chưa có key).<br>' +
      'Cách khuyên dùng:<br>' +
      '<code>copy .env.example .env</code> → dán <code>OPENAI_API_KEY</code> vào <code>.env</code> → ' +
      '<code>python serve.py</code> → mở <code>http://localhost:8000/proA.html</code></div>';

    var bd = document.createElement('div');
    bd.className = 'modal-bd';
    bd.innerHTML =
      '<div class="modal">' +
      '<h3>Kết nối OpenAI API</h3>' + envBlock +
      '<p class="mnote small"><b>Cách dự phòng</b> (kém an toàn hơn — key nằm trong ' +
      'localStorage của trình duyệt): dán trực tiếp vào ô dưới. Chỉ dùng khi không chạy được serve.py.</p>' +
      '<input type="password" class="mkey" placeholder="sk-..." autocomplete="off">' +
      '<div class="mrow">' +
      '<button class="btn sm mclear">Xóa key trong trình duyệt</button>' +
      '<span style="flex:1"></span>' +
      '<button class="btn sm mcancel">Đóng</button>' +
      '<button class="btn sm pri msave">Lưu</button>' +
      '</div></div>';

    var input = bd.querySelector('.mkey');
    input.value = getKey();
    if (m === 'env') input.placeholder = 'Không cần — đang dùng key từ .env';

    function close() {
      bd.remove();
      global.dispatchEvent(new CustomEvent('ai-mode'));
      if (onDone) onDone();
    }
    bd.querySelector('.mcancel').onclick = close;
    bd.querySelector('.msave').onclick = function () {
      if (input.value.trim()) setKey(input.value); else clearKey();
      close();
    };
    bd.querySelector('.mclear').onclick = function () { clearKey(); input.value = ''; };
    bd.onclick = function (e) { if (e.target === bd) close(); };
    document.body.appendChild(bd);
  }

  /* ---------- khối dùng chung khi AI chưa bật ---------- */
  function offNotice(text, onDone) {
    var box = document.createElement('div');
    box.className = 'notice slate';
    box.innerHTML = '🔌 ' + (text || 'Tính năng AI đang tắt.') +
      '<br><span class="muted">Tạo file <code>.env</code> từ <code>.env.example</code> ' +
      'rồi chạy <code>python serve.py</code>.</span> ';
    var b = document.createElement('button');
    b.className = 'btn sm';
    b.style.marginTop = '9px';
    b.textContent = 'Xem hướng dẫn kết nối';
    b.onclick = function () { openSettings(onDone); };
    box.appendChild(b);
    return box;
  }

  function loading(text) {
    var d = document.createElement('div');
    d.className = 'ai-loading';
    d.innerHTML = '<span class="spin"></span>' + (text || 'AI đang xử lý...');
    return d;
  }

  global.AI = {
    MODEL: MODEL, model: model, mode: mode,
    on: on, getKey: getKey, setKey: setKey, clearKey: clearKey,
    call: call, stream: streamCall,
    openSettings: openSettings, offNotice: offNotice, loading: loading
  };
})(window);
