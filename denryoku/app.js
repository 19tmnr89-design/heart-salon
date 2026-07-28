/* 電力論述トレーナー */
(function () {
  'use strict';

  var DATA = window.QUESTION_DATA;
  var STORE_KEY = 'denryoku-ronjutsu-v1';

  /* ---------------- 学習記録 ---------------- */
  var record = load();

  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }
  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(record));
    } catch (e) { /* 保存できなくても動作は継続 */ }
  }
  function statusOf(id) {
    return record[id] ? record[id].s : null;
  }
  function setStatus(id, s) {
    var prev = record[id] || { n: 0 };
    record[id] = { s: s, n: prev.n + 1, t: Date.now() };
    save();
  }

  /* ---------------- 状態 ---------------- */
  var state = {
    field: DATA.fields[0].id,
    category: 'all',
    mode: 'all',
    deck: [],
    index: 0,
    revealed: false,
    search: ''
  };

  /* ---------------- ユーティリティ ---------------- */
  function $(sel) { return document.querySelector(sel); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function inline(s) {
    return esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  }
  /* 「■」始まりの行を小見出し、空行を段落区切りとして描画 */
  function rich(text) {
    var lines = String(text).split('\n');
    var html = '';
    var buf = [];
    function flush() {
      if (buf.length) { html += '<p>' + buf.join('<br>') + '</p>'; buf = []; }
    }
    lines.forEach(function (line) {
      if (line.trim() === '') { flush(); return; }
      if (line.charAt(0) === '■') { flush(); html += '<h4>' + inline(line.slice(1)) + '</h4>'; return; }
      buf.push(inline(line));
    });
    flush();
    return html;
  }
  function levelLabel(lv) {
    return lv >= 3 ? '応用' : lv === 2 ? '標準' : '基本';
  }
  var STATUS_LABEL = { ok: '書けた', vague: 'あいまい', ng: '書けない' };

  /* ---------------- 出題対象の抽出 ---------------- */
  function questionsOfField(field) {
    return DATA.questions.filter(function (q) { return q.field === field; });
  }
  function buildDeck() {
    var list = questionsOfField(state.field);
    if (state.category !== 'all') {
      list = list.filter(function (q) { return q.category === state.category; });
    }
    if (state.mode === 'unseen') {
      list = list.filter(function (q) { return !statusOf(q.id); });
    } else if (state.mode === 'review') {
      list = list.filter(function (q) {
        var s = statusOf(q.id);
        return s === 'ng' || s === 'vague';
      });
    }
    state.deck = list;
    if (state.index >= list.length) state.index = 0;
    if (state.index < 0) state.index = 0;
  }
  function shuffleDeck() {
    for (var i = state.deck.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = state.deck[i]; state.deck[i] = state.deck[j]; state.deck[j] = t;
    }
    state.index = 0;
    state.revealed = false;
  }

  /* ---------------- 出題タブの描画 ---------------- */
  function renderFieldChips() {
    var html = DATA.fields.map(function (f) {
      var n = questionsOfField(f.id).length;
      var cls = 'chip' + (f.id === state.field ? ' active' : '');
      var label = f.icon + ' ' + f.label + (n ? '' : '（準備中）');
      return '<button class="' + cls + '" data-field="' + esc(f.id) + '">' + esc(label) + '</button>';
    }).join('');
    $('#field-chips').innerHTML = html;
  }

  function renderCategoryChips() {
    var field = DATA.fields.filter(function (f) { return f.id === state.field; })[0];
    var cats = (field && field.categories) || [];
    var all = questionsOfField(state.field);
    var html = '<button class="chip' + (state.category === 'all' ? ' active' : '') +
               '" data-cat="all">すべて（' + all.length + '）</button>';
    html += cats.map(function (c) {
      var n = all.filter(function (q) { return q.category === c; }).length;
      var cls = 'chip' + (c === state.category ? ' active' : '') + (n === 0 ? ' disabled' : '');
      return '<button class="' + cls + '" data-cat="' + esc(c) + '">' + esc(c) + '（' + n + '）</button>';
    }).join('');
    $('#category-chips').innerHTML = html;
  }

  function renderQuiz() {
    renderFieldChips();
    renderCategoryChips();

    $('#mode-chips').querySelectorAll('.chip').forEach(function (b) {
      b.classList.toggle('active', b.dataset.mode === state.mode);
    });

    buildDeck();
    $('#filter-count').textContent = state.deck.length + ' 問';

    var area = $('#quiz-area');
    var nav = $('#quiz-nav');
    var prog = $('#quiz-progress');

    if (state.deck.length === 0) {
      prog.hidden = true;
      nav.hidden = true;
      area.innerHTML = '<div class="empty">' + emptyMessage() + '</div>';
      return;
    }

    prog.hidden = false;
    nav.hidden = false;
    var pct = ((state.index + 1) / state.deck.length) * 100;
    $('#quiz-progress-fill').style.width = pct + '%';
    $('#quiz-progress-text').textContent = (state.index + 1) + ' / ' + state.deck.length;

    $('#btn-prev').disabled = state.index === 0;
    $('#btn-next').disabled = state.index >= state.deck.length - 1;

    area.innerHTML = questionCardHTML(state.deck[state.index]);
  }

  function emptyMessage() {
    var n = questionsOfField(state.field).length;
    if (n === 0) {
      return state.field + '分野の問題は準備中です。<br>questions.js に追加すると、そのまま出題されます。';
    }
    if (state.mode === 'unseen') return '未学習の問題はありません。<br>「すべて」に切り替えて復習しましょう。';
    if (state.mode === 'review') return '要復習の問題はありません。<br>この範囲はひと通り書けています。';
    return '条件に合う問題がありません。';
  }

  function questionCardHTML(q) {
    var st = statusOf(q.id);
    var html = '';
    html += '<div class="qcard">';

    html += '<div class="qcard-head">';
    html += '<div class="qmeta">';
    html += '<span class="tag">' + esc(q.field) + '</span>';
    html += '<span class="tag cat">' + esc(q.category) + '</span>';
    html += '<span class="tag lv">' + levelLabel(q.level) + '</span>';
    if (st) html += '<span class="tag st-' + st + '">' + STATUS_LABEL[st] + '</span>';
    html += '</div>';
    html += '<div class="qtitle">' + esc(q.title) + '</div>';
    html += '</div>';

    html += '<div class="qbody">';
    html += '<div class="qlabel">問題</div>';
    html += '<div class="qtext">' + esc(q.question) + '</div>';
    html += '</div>';

    if (!state.revealed) {
      html += '<div class="reveal-wrap">';
      html += '<button class="btn-reveal" id="btn-reveal">解答・解説を見る</button>';
      html += '</div>';
    } else {
      html += '<div class="answer-block">';

      html += '<div class="answer-sec kw"><h3>🔑 押さえるキーワード</h3><div class="kw-list">';
      html += q.keywords.map(function (k) { return '<span class="kw">' + esc(k) + '</span>'; }).join('');
      html += '</div></div>';

      html += '<div class="answer-sec ans"><h3>✍️ 模範解答</h3><div class="rich">' + rich(q.answer) + '</div></div>';
      html += '<div class="answer-sec exp"><h3>💡 解説・書き方のポイント</h3><div class="rich">' + rich(q.explanation) + '</div></div>';

      html += '<div class="grade-sec">';
      html += '<div class="qlabel">自己採点</div>';
      html += '<div class="grade-row">';
      html += '<button class="grade-btn ok' + (st === 'ok' ? ' on' : '') + '" data-grade="ok">○ 書けた</button>';
      html += '<button class="grade-btn vague' + (st === 'vague' ? ' on' : '') + '" data-grade="vague">△ あいまい</button>';
      html += '<button class="grade-btn ng' + (st === 'ng' ? ' on' : '') + '" data-grade="ng">× 書けない</button>';
      html += '</div></div>';

      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  /* ---------------- 一覧タブ ---------------- */
  function renderList() {
    var kw = state.search.trim().toLowerCase();
    var list = DATA.questions.filter(function (q) {
      if (!kw) return true;
      var hay = [q.title, q.question, q.category, q.field, q.keywords.join(' '), q.answer, q.explanation]
                  .join(' ').toLowerCase();
      return hay.indexOf(kw) >= 0;
    });

    var area = $('#list-area');
    if (list.length === 0) {
      area.innerHTML = '<div class="empty">該当する問題がありません。</div>';
      return;
    }

    var groups = {};
    var order = [];
    list.forEach(function (q) {
      var key = q.field + ' / ' + q.category;
      if (!groups[key]) { groups[key] = []; order.push(key); }
      groups[key].push(q);
    });

    var html = '';
    order.forEach(function (key) {
      html += '<div class="list-group-title">' + esc(key) + '（' + groups[key].length + '）</div>';
      groups[key].forEach(function (q) {
        var st = statusOf(q.id);
        html += '<div class="list-item" data-id="' + esc(q.id) + '">';
        html += '<span class="dot' + (st ? ' ' + st : '') + '"></span>';
        html += '<span class="li-main">';
        html += '<span class="li-title">' + esc(q.title) + '</span>';
        html += '<span class="li-sub">' + levelLabel(q.level) +
                (st ? '・' + STATUS_LABEL[st] : '・未学習') + '</span>';
        html += '</span>';
        html += '<span class="li-arrow">›</span>';
        html += '</div>';
      });
    });

    html += '<div class="section-note">' +
      '問題をタップすると、その問題から出題タブで学習できます。<br>' +
      '検索は問題文だけでなく、模範解答と解説の本文も対象になります。</div>';

    area.innerHTML = html;
  }

  /* ---------------- 進捗タブ ---------------- */
  function renderStats() {
    var all = DATA.questions;
    var counts = { ok: 0, vague: 0, ng: 0, none: 0 };
    all.forEach(function (q) {
      var s = statusOf(q.id);
      counts[s || 'none']++;
    });

    var html = '';
    html += '<div class="stat-cards">';
    html += '<div class="stat-card ok"><div class="num">' + counts.ok + '</div><div class="lbl">○ 書けた</div></div>';
    html += '<div class="stat-card vague"><div class="num">' + counts.vague + '</div><div class="lbl">△ あいまい</div></div>';
    html += '<div class="stat-card ng"><div class="num">' + counts.ng + '</div><div class="lbl">× 書けない</div></div>';
    html += '</div>';

    var done = counts.ok + counts.vague + counts.ng;
    html += '<div class="cat-stat">';
    html += '<div class="cat-stat-head"><span>全体</span><span class="rate">' +
            done + ' / ' + all.length + ' 問　習得率 ' +
            (all.length ? Math.round((counts.ok / all.length) * 100) : 0) + '%</span></div>';
    html += stackHTML(counts, all.length);
    html += '</div>';

    // 分野・細目ごと
    DATA.fields.forEach(function (f) {
      var fq = questionsOfField(f.id);
      if (fq.length === 0) return;
      html += '<div class="list-group-title">' + esc(f.icon + ' ' + f.label) + '</div>';
      f.categories.forEach(function (c) {
        var cq = fq.filter(function (q) { return q.category === c; });
        if (cq.length === 0) return;
        var cc = { ok: 0, vague: 0, ng: 0, none: 0 };
        cq.forEach(function (q) { cc[statusOf(q.id) || 'none']++; });
        html += '<div class="cat-stat">';
        html += '<div class="cat-stat-head"><span>' + esc(c) + '</span><span class="rate">' +
                cc.ok + ' / ' + cq.length + '</span></div>';
        html += stackHTML(cc, cq.length);
        html += '</div>';
      });
    });

    html += '<div class="section-note">' +
      '「△ あいまい」「× 書けない」を付けた問題は、出題タブの<b>要復習</b>で絞り込めます。<br>' +
      '記録はこの端末のブラウザ（localStorage）に保存されます。</div>';

    $('#stats-area').innerHTML = html;
  }

  function stackHTML(c, total) {
    if (!total) return '<div class="stack"></div>';
    function w(n) { return (n / total * 100) + '%'; }
    return '<div class="stack">' +
      '<i class="s-ok" style="width:' + w(c.ok) + '"></i>' +
      '<i class="s-vague" style="width:' + w(c.vague) + '"></i>' +
      '<i class="s-ng" style="width:' + w(c.ng) + '"></i>' +
      '</div>';
  }

  /* ---------------- タブ切替 ---------------- */
  function switchTab(name) {
    document.querySelectorAll('.tab-panel').forEach(function (p) {
      p.classList.toggle('active', p.id === 'tab-' + name);
    });
    document.querySelectorAll('.tab-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.tab === name);
    });
    if (name === 'quiz') renderQuiz();
    if (name === 'list') renderList();
    if (name === 'stats') renderStats();
    window.scrollTo(0, 0);
  }

  /* ---------------- イベント ---------------- */
  document.querySelectorAll('.tab-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { switchTab(btn.dataset.tab); });
  });

  $('#field-chips').addEventListener('click', function (e) {
    var b = e.target.closest('.chip');
    if (!b) return;
    state.field = b.dataset.field;
    state.category = 'all';
    state.index = 0;
    state.revealed = false;
    renderQuiz();
  });

  $('#category-chips').addEventListener('click', function (e) {
    var b = e.target.closest('.chip');
    if (!b) return;
    state.category = b.dataset.cat;
    state.index = 0;
    state.revealed = false;
    renderQuiz();
  });

  $('#mode-chips').addEventListener('click', function (e) {
    var b = e.target.closest('.chip');
    if (!b) return;
    state.mode = b.dataset.mode;
    state.index = 0;
    state.revealed = false;
    renderQuiz();
  });

  $('#btn-shuffle').addEventListener('click', function () {
    buildDeck();
    shuffleDeck();
    renderQuiz();
  });

  $('#quiz-area').addEventListener('click', function (e) {
    if (e.target.closest('#btn-reveal')) {
      state.revealed = true;
      renderQuiz();
      return;
    }
    var g = e.target.closest('.grade-btn');
    if (g) {
      var q = state.deck[state.index];
      if (!q) return;
      setStatus(q.id, g.dataset.grade);
      renderQuiz();
    }
  });

  $('#btn-prev').addEventListener('click', function () {
    if (state.index > 0) {
      state.index--;
      state.revealed = false;
      renderQuiz();
      window.scrollTo(0, 0);
    }
  });

  $('#btn-next').addEventListener('click', function () {
    if (state.index < state.deck.length - 1) {
      state.index++;
      state.revealed = false;
      renderQuiz();
      window.scrollTo(0, 0);
    }
  });

  $('#search-box').addEventListener('input', function (e) {
    state.search = e.target.value;
    renderList();
  });

  $('#list-area').addEventListener('click', function (e) {
    var item = e.target.closest('.list-item');
    if (!item) return;
    var id = item.dataset.id;
    var q = DATA.questions.filter(function (x) { return x.id === id; })[0];
    if (!q) return;
    state.field = q.field;
    state.category = q.category;
    state.mode = 'all';
    state.revealed = false;
    buildDeck();
    var idx = state.deck.findIndex(function (x) { return x.id === id; });
    state.index = idx >= 0 ? idx : 0;
    switchTab('quiz');
  });

  $('#btn-reset').addEventListener('click', function () {
    if (!confirm('すべての学習記録を削除します。よろしいですか？')) return;
    record = {};
    save();
    renderStats();
  });

  /* ---------------- 起動 ---------------- */
  renderQuiz();
})();
