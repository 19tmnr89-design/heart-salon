/* 電力論述トレーナー */
(function () {
  'use strict';

  var DATA = window.QUESTION_DATA;
  var STORE_KEY = 'denryoku-ronjutsu-v1';
  var LOG_MAX = 2000;      // 履歴の保持件数
  var DAY = 86400000;

  /* 復習間隔（日）。自己採点の結果に応じて次に出す時期を決める */
  var INTERVAL = { ng: 1, vague: 3, ok: 14, okRepeat: 30 };

  var STATUS_LABEL = { ok: '書けた', vague: 'あいまい', ng: '書けない' };
  var STATUS_MARK = { ok: '○', vague: '△', ng: '×' };

  /* ================= 学習記録の保存 ================= */
  /*
   * 保存形式（v2）
   *   { v:2,
   *     q:   { 問題ID: { s:評価, n:学習回数, t:最終学習日時, memo:メモ } },
   *     log: [ { i:問題ID, s:評価, t:日時 } ] }
   * 旧形式（v1、問題IDをキーにした平坦なオブジェクト）は読み込み時に変換する。
   */
  function blankStore() { return { v: 2, q: {}, log: [] }; }

  function loadStore() {
    var raw;
    try { raw = localStorage.getItem(STORE_KEY); } catch (e) { return blankStore(); }
    if (!raw) return blankStore();
    var d;
    try { d = JSON.parse(raw); } catch (e) { return blankStore(); }
    if (!d || typeof d !== 'object') return blankStore();
    if (!d.v) return migrateV1(d);
    if (!d.q || typeof d.q !== 'object') d.q = {};
    if (!Array.isArray(d.log)) d.log = [];
    return d;
  }

  function migrateV1(old) {
    var s = blankStore();
    Object.keys(old).forEach(function (id) {
      var r = old[id];
      if (r && r.s) s.q[id] = { s: r.s, n: r.n || 1, t: r.t || Date.now(), memo: '' };
    });
    return s;
  }

  var store = loadStore();

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) { /* 保存できなくても動作は継続 */ }
  }
  save(); // 旧形式で保存されていた場合はここで新形式に書き換わる

  function rec(id) { return store.q[id] || null; }
  function statusOf(id) { var r = rec(id); return (r && r.s) ? r.s : null; }
  function memoOf(id) { var r = rec(id); return (r && r.memo) ? r.memo : ''; }

  function setStatus(id, s) {
    var prev = store.q[id] || {};
    var now = Date.now();
    store.q[id] = { s: s, n: (prev.n || 0) + 1, t: now, memo: prev.memo || '' };
    store.log.push({ i: id, s: s, t: now });
    if (store.log.length > LOG_MAX) store.log = store.log.slice(-LOG_MAX);
    save();
  }

  function setMemo(id, text) {
    var prev = store.q[id] || { n: 0, t: 0 };
    prev.memo = text;
    store.q[id] = prev;
    save();
  }

  /* 次に復習する時期 */
  function dueAt(id) {
    var r = rec(id);
    if (!r || !r.s) return null;
    var days = INTERVAL[r.s];
    if (r.s === 'ok' && (r.n || 0) >= 2) days = INTERVAL.okRepeat;
    if (!days) days = 7;
    return r.t + days * DAY;
  }
  function isDue(id) {
    var d = dueAt(id);
    return d !== null && Date.now() >= d;
  }

  /* ================= 状態 ================= */
  var state = {
    field: DATA.fields[0].id,
    category: 'all',
    mode: 'all',
    deck: [],
    index: 0,
    revealed: false,
    search: ''
  };

  /* ================= ユーティリティ ================= */
  function $(sel) { return document.querySelector(sel); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function inline(s) {
    return esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  }
  /* 「■」で始まる行を小見出し、空行を段落区切りとして描画 */
  function rich(text) {
    var html = '';
    var buf = [];
    function flush() { if (buf.length) { html += '<p>' + buf.join('<br>') + '</p>'; buf = []; } }
    String(text).split('\n').forEach(function (line) {
      if (line.trim() === '') { flush(); return; }
      if (line.charAt(0) === '■') { flush(); html += '<h4>' + inline(line.slice(1)) + '</h4>'; return; }
      buf.push(inline(line));
    });
    flush();
    return html;
  }
  function pad2(n) { return n < 10 ? '0' + n : '' + n; }
  function startOfDay(ts) { var d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); }
  function dayKey(ts) {
    var d = new Date(ts);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }
  function fmtDateTime(ts) {
    var d = new Date(ts);
    return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }
  function relDays(ts) {
    var n = Math.floor((startOfDay(Date.now()) - startOfDay(ts)) / DAY);
    if (n <= 0) return '今日';
    if (n === 1) return '昨日';
    if (n < 30) return n + '日前';
    if (n < 365) return Math.floor(n / 30) + 'か月前';
    return Math.floor(n / 365) + '年前';
  }
  function levelLabel(lv) { return lv >= 3 ? '応用' : lv === 2 ? '標準' : '基本'; }
  function questionById(id) {
    for (var i = 0; i < DATA.questions.length; i++) {
      if (DATA.questions[i].id === id) return DATA.questions[i];
    }
    return null;
  }
  function questionsOfField(field) {
    return DATA.questions.filter(function (q) { return q.field === field; });
  }

  /* ================= 出題対象の抽出 ================= */
  function buildDeck() {
    var list = questionsOfField(state.field);
    if (state.category !== 'all') {
      list = list.filter(function (q) { return q.category === state.category; });
    }
    if (state.mode === 'unseen') {
      list = list.filter(function (q) { return !statusOf(q.id); });
    } else if (state.mode === 'weak') {
      list = list.filter(function (q) {
        var s = statusOf(q.id);
        return s === 'ng' || s === 'vague';
      });
    } else if (state.mode === 'due') {
      list = list.filter(function (q) { return isDue(q.id); });
      list.sort(function (a, b) { return (dueAt(a.id) || 0) - (dueAt(b.id) || 0); });
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

  /* ================= 出題タブ ================= */
  function renderFieldChips() {
    $('#field-chips').innerHTML = DATA.fields.map(function (f) {
      var n = questionsOfField(f.id).length;
      var cls = 'chip' + (f.id === state.field ? ' active' : '') + (n === 0 ? ' disabled' : '');
      return '<button class="' + cls + '" data-field="' + esc(f.id) + '">' +
             esc(f.icon + ' ' + f.label) + '</button>';
    }).join('');
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

  var MODE_HINT = {
    all: '',
    unseen: 'まだ自己採点していない問題だけを出題します。',
    weak: '「△ あいまい」「× 書けない」を付けた問題を出題します。',
    due: '自己採点の結果に応じた復習時期（×は1日後、△は3日後、○は14日後、2回目以降の○は30日後）を過ぎた問題を、期日の古い順に出題します。'
  };

  function renderQuiz() {
    renderFieldChips();
    renderCategoryChips();

    $('#mode-chips').querySelectorAll('.chip').forEach(function (b) {
      b.classList.toggle('active', b.dataset.mode === state.mode);
    });
    var hint = $('#mode-hint');
    hint.textContent = MODE_HINT[state.mode] || '';
    hint.hidden = !MODE_HINT[state.mode];

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
    $('#quiz-progress-fill').style.width = ((state.index + 1) / state.deck.length * 100) + '%';
    $('#quiz-progress-text').textContent = (state.index + 1) + ' / ' + state.deck.length;
    $('#btn-prev').disabled = state.index === 0;
    $('#btn-next').disabled = state.index >= state.deck.length - 1;

    area.innerHTML = questionCardHTML(state.deck[state.index]);
  }

  function emptyMessage() {
    if (questionsOfField(state.field).length === 0) {
      return state.field + '分野の問題は準備中です。<br>questions.js に追加すると、そのまま出題されます。';
    }
    if (state.mode === 'unseen') return '未学習の問題はありません。<br>ひと通り目を通せています。';
    if (state.mode === 'weak') return '苦手に分類された問題はありません。<br>この範囲は書けています。';
    if (state.mode === 'due') return '復習時期の来た問題はありません。<br>また日を改めて確認しましょう。';
    return '条件に合う問題がありません。';
  }

  function questionCardHTML(q) {
    var r = rec(q.id);
    var st = statusOf(q.id);
    var html = '<div class="qcard">';

    html += '<div class="qcard-head">';
    html += '<div class="qmeta">';
    html += '<span class="tag">' + esc(q.field) + '</span>';
    html += '<span class="tag cat">' + esc(q.category) + '</span>';
    html += '<span class="tag lv">' + levelLabel(q.level) + '</span>';
    if (st) html += '<span class="tag st-' + st + '">' + STATUS_MARK[st] + ' ' + STATUS_LABEL[st] + '</span>';
    html += '</div>';
    html += '<div class="qtitle">' + esc(q.title) + '</div>';
    if (r && r.t) {
      html += '<div class="qhist">前回 ' + relDays(r.t) + '・' + (r.n || 1) + '回目';
      var d = dueAt(q.id);
      if (d) html += isDue(q.id) ? '　<b class="due">復習時期</b>'
                                 : '　次の復習 ' + Math.ceil((d - Date.now()) / DAY) + '日後';
      html += '</div>';
    }
    html += '</div>';

    html += '<div class="qbody">';
    html += '<div class="qlabel">問題</div>';
    html += '<div class="qtext">' + esc(q.question) + '</div>';
    html += '</div>';

    if (!state.revealed) {
      html += '<div class="reveal-wrap"><button class="btn-reveal" id="btn-reveal">解答・解説を見る</button></div>';
    } else {
      html += '<div class="answer-block">';

      html += '<div class="answer-sec kw"><h3>🔑 押さえるキーワード</h3><div class="kw-list">';
      html += q.keywords.map(function (k) { return '<span class="kw">' + esc(k) + '</span>'; }).join('');
      html += '</div></div>';

      html += '<div class="answer-sec ans"><h3>✍️ 模範解答</h3><div class="rich">' + rich(q.answer) + '</div></div>';
      html += '<div class="answer-sec exp"><h3>💡 解説・書き方のポイント</h3><div class="rich">' + rich(q.explanation) + '</div></div>';

      html += '<div class="answer-sec memo"><h3>📝 メモ</h3>';
      html += '<textarea id="memo-box" class="memo-box" rows="3" ' +
              'placeholder="書けなかった論点、自分の答案の骨子、思い出し方など">' + esc(memoOf(q.id)) + '</textarea>';
      html += '<div class="memo-state" id="memo-state"></div>';
      html += '</div>';

      html += '<div class="grade-sec">';
      html += '<div class="qlabel">自己採点（記録されます）</div>';
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

  /* ================= 一覧タブ ================= */
  function renderList() {
    var kw = state.search.trim().toLowerCase();
    var list = DATA.questions.filter(function (q) {
      if (!kw) return true;
      return [q.title, q.question, q.category, q.field, q.keywords.join(' '), q.answer, q.explanation]
             .join(' ').toLowerCase().indexOf(kw) >= 0;
    });

    var area = $('#list-area');
    if (list.length === 0) {
      area.innerHTML = '<div class="empty">該当する問題がありません。</div>';
      return;
    }

    var groups = {}, order = [];
    list.forEach(function (q) {
      var key = q.field + ' / ' + q.category;
      if (!groups[key]) { groups[key] = []; order.push(key); }
      groups[key].push(q);
    });

    var html = '';
    order.forEach(function (key) {
      html += '<div class="list-group-title">' + esc(key) + '（' + groups[key].length + '）</div>';
      groups[key].forEach(function (q) { html += listItemHTML(q); });
    });
    html += '<div class="section-note">' +
      '問題をタップすると、その問題から出題タブで学習できます。<br>' +
      '検索は問題文だけでなく、模範解答と解説の本文も対象になります。</div>';
    area.innerHTML = html;
  }

  function listItemHTML(q) {
    var r = rec(q.id);
    var st = statusOf(q.id);
    var sub = levelLabel(q.level);
    sub += st ? '・' + STATUS_MARK[st] + STATUS_LABEL[st] : '・未学習';
    if (r && r.t) sub += '・' + relDays(r.t);
    var html = '<div class="list-item" data-id="' + esc(q.id) + '">';
    html += '<span class="dot' + (st ? ' ' + st : '') + '"></span>';
    html += '<span class="li-main">';
    html += '<span class="li-title">' + esc(q.title) +
            (memoOf(q.id) ? ' <span class="li-memo">📝</span>' : '') + '</span>';
    html += '<span class="li-sub">' + esc(sub) + '</span>';
    html += '</span><span class="li-arrow">›</span></div>';
    return html;
  }

  /* ================= 記録タブ ================= */
  function dailyCounts() {
    var m = {};
    store.log.forEach(function (e) {
      if (!e || !e.t) return;
      var k = dayKey(e.t);
      m[k] = (m[k] || 0) + 1;
    });
    return m;
  }

  function streakDays(byDay) {
    var cur = startOfDay(Date.now());
    if (!byDay[dayKey(cur)]) cur -= DAY;      // 今日まだなら昨日から数える
    var n = 0;
    while (byDay[dayKey(cur)]) { n++; cur -= DAY; }
    return n;
  }

  function renderRecord() {
    var byDay = dailyCounts();
    renderSummary(byDay);
    renderHeatmap(byDay);
    renderProgress();
    renderMemos();
    renderHistory();
  }

  function renderSummary(byDay) {
    var today = byDay[dayKey(Date.now())] || 0;
    var dueCount = DATA.questions.filter(function (q) { return isDue(q.id); }).length;
    var html = '<div class="sum-cards">';
    html += sumCard(today, '今日の学習', '問');
    html += sumCard(streakDays(byDay), '連続学習', '日');
    html += sumCard(Object.keys(byDay).length, '学習した日', '日');
    html += sumCard(store.log.length, 'のべ学習', '回');
    html += '</div>';
    if (dueCount > 0) {
      html += '<button class="due-banner" id="btn-goto-due">' +
              '🔁 復習時期の問題が <b>' + dueCount + '</b> 問あります　→ 出題する</button>';
    }
    $('#rec-summary').innerHTML = html;
  }
  function sumCard(num, label, unit) {
    return '<div class="sum-card"><div class="num">' + num +
           '<small>' + unit + '</small></div><div class="lbl">' + label + '</div></div>';
  }

  function renderHeatmap(byDay) {
    var WEEKS = 12;
    var today = startOfDay(Date.now());
    var end = today + (6 - new Date(today).getDay()) * DAY;   // その週の土曜
    var start = end - (WEEKS * 7 - 1) * DAY;

    var html = '<div class="heat-wrap"><div class="heat-grid">';
    for (var i = 0; i < WEEKS * 7; i++) {
      var ts = start + i * DAY;
      var col = Math.floor(i / 7), row = i % 7;
      var n = byDay[dayKey(ts)] || 0;
      var lv = n === 0 ? 0 : n <= 2 ? 1 : n <= 5 ? 2 : n <= 9 ? 3 : 4;
      var future = ts > today ? ' future' : '';
      html += '<i class="heat lv' + lv + future + '" style="grid-column:' + (col + 1) +
              ';grid-row:' + (row + 1) + '" title="' + dayKey(ts) + ' ' + n + '問"></i>';
    }
    html += '</div></div>';
    html += '<div class="heat-legend"><span>少</span>' +
            '<i class="heat lv0"></i><i class="heat lv1"></i><i class="heat lv2"></i>' +
            '<i class="heat lv3"></i><i class="heat lv4"></i><span>多</span></div>';
    $('#rec-heatmap').innerHTML = html;
  }

  function renderProgress() {
    var all = DATA.questions;
    var counts = { ok: 0, vague: 0, ng: 0, none: 0 };
    all.forEach(function (q) { counts[statusOf(q.id) || 'none']++; });

    var html = '<div class="stat-cards">';
    html += '<div class="stat-card ok"><div class="num">' + counts.ok + '</div><div class="lbl">○ 書けた</div></div>';
    html += '<div class="stat-card vague"><div class="num">' + counts.vague + '</div><div class="lbl">△ あいまい</div></div>';
    html += '<div class="stat-card ng"><div class="num">' + counts.ng + '</div><div class="lbl">× 書けない</div></div>';
    html += '</div>';

    var done = counts.ok + counts.vague + counts.ng;
    html += '<div class="cat-stat"><div class="cat-stat-head"><span>全体</span><span class="rate">' +
            done + ' / ' + all.length + ' 問　習得率 ' +
            (all.length ? Math.round(counts.ok / all.length * 100) : 0) + '%</span></div>' +
            stackHTML(counts, all.length) + '</div>';

    /* 分野ごとは折りたたみ。開くと細目の内訳が出る */
    DATA.fields.forEach(function (f) {
      var fq = questionsOfField(f.id);
      if (fq.length === 0) return;
      var fc = { ok: 0, vague: 0, ng: 0, none: 0 };
      fq.forEach(function (q) { fc[statusOf(q.id) || 'none']++; });

      html += '<details class="field-block"><summary>';
      html += '<div class="cat-stat-head"><span>' + esc(f.icon + ' ' + f.label) +
              '</span><span class="rate">○ ' + fc.ok + ' / ' + fq.length + '　<b>細目</b></span></div>';
      html += stackHTML(fc, fq.length);
      html += '</summary>';
      f.categories.forEach(function (c) {
        var cq = fq.filter(function (q) { return q.category === c; });
        if (cq.length === 0) return;
        var cc = { ok: 0, vague: 0, ng: 0, none: 0 };
        cq.forEach(function (q) { cc[statusOf(q.id) || 'none']++; });
        html += '<div class="cat-stat sub"><div class="cat-stat-head"><span>' + esc(c) +
                '</span><span class="rate">' + cc.ok + ' / ' + cq.length + '</span></div>' +
                stackHTML(cc, cq.length) + '</div>';
      });
      html += '</details>';
    });

    $('#rec-progress').innerHTML = html;
  }

  function stackHTML(c, total) {
    if (!total) return '<div class="stack"></div>';
    function w(n) { return (n / total * 100) + '%'; }
    return '<div class="stack">' +
      '<i class="s-ok" style="width:' + w(c.ok) + '"></i>' +
      '<i class="s-vague" style="width:' + w(c.vague) + '"></i>' +
      '<i class="s-ng" style="width:' + w(c.ng) + '"></i></div>';
  }

  var recLimit = { memo: 5, hist: 25 };

  function moreBtnHTML(kind, rest) {
    return '<button class="btn-more" data-more="' + kind + '">さらに表示（残り ' + rest + '）</button>';
  }

  function renderMemos() {
    var ids = Object.keys(store.q).filter(function (id) {
      return store.q[id] && store.q[id].memo && store.q[id].memo.trim() && questionById(id);
    });
    ids.sort(function (a, b) { return (store.q[b].t || 0) - (store.q[a].t || 0); });

    if (ids.length === 0) {
      $('#rec-memos').innerHTML =
        '<div class="empty sm">まだメモはありません。<br>解答を開いた画面の「📝 メモ」欄に書き込むと、ここに集まります。</div>';
      return;
    }
    var shown = ids.slice(0, recLimit.memo);
    var html = '';
    shown.forEach(function (id) {
      var q = questionById(id);
      html += '<div class="memo-item" data-id="' + esc(id) + '">';
      html += '<div class="memo-item-head">' + esc(q.field + '・' + q.title) + '<span>›</span></div>';
      html += '<div class="memo-item-body">' + esc(store.q[id].memo) + '</div>';
      html += '</div>';
    });
    if (ids.length > shown.length) html += moreBtnHTML('memo', ids.length - shown.length);
    $('#rec-memos').innerHTML = html;
  }

  function renderHistory() {
    var log = store.log.slice().reverse().filter(function (e) { return e && questionById(e.i); });
    if (log.length === 0) {
      $('#rec-history').innerHTML =
        '<div class="empty sm">まだ学習履歴はありません。<br>問題を自己採点すると、ここに記録されます。</div>';
      return;
    }
    var shown = log.slice(0, recLimit.hist);
    var html = '';
    var lastDay = '';
    shown.forEach(function (e) {
      var q = questionById(e.i);
      var dk = dayKey(e.t);
      if (dk !== lastDay) {
        lastDay = dk;
        html += '<div class="hist-day">' + dk.replace(/-/g, '/') + '　' + relDays(e.t) + '</div>';
      }
      html += '<div class="hist-item" data-id="' + esc(e.i) + '">';
      html += '<span class="hist-mark ' + e.s + '">' + STATUS_MARK[e.s] + '</span>';
      html += '<span class="hist-main"><span class="hist-title">' + esc(q.title) + '</span>' +
              '<span class="hist-sub">' + esc(q.field + '・' + q.category) + '</span></span>';
      html += '<span class="hist-time">' + fmtDateTime(e.t) + '</span>';
      html += '</div>';
    });
    if (log.length > shown.length) html += moreBtnHTML('hist', log.length - shown.length);
    $('#rec-history').innerHTML = html;
  }

  /* ================= 書き出し・読み込み ================= */
  function dataMsg(text, isError) {
    var el = $('#data-msg');
    el.textContent = text;
    el.className = 'data-msg' + (isError ? ' err' : ' ok');
    el.hidden = false;
  }

  function exportRecord() {
    var payload = JSON.stringify(store);
    var d = new Date();
    var name = 'denryoku-record-' + d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()) + '.json';
    try {
      var blob = new Blob([payload], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      dataMsg(name + ' を書き出しました。');
    } catch (e) {
      dataMsg('書き出しに失敗しました。ブラウザの設定をご確認ください。', true);
    }
  }

  function mergeRecord(inc) {
    if (!inc || typeof inc !== 'object') throw new Error('形式が正しくありません');
    var iq = inc.v ? inc.q : inc;
    if (!iq || typeof iq !== 'object') throw new Error('学習記録が含まれていません');

    var added = 0;
    Object.keys(iq).forEach(function (id) {
      var b = iq[id];
      if (!b || typeof b !== 'object') return;
      var a = store.q[id];
      if (!a) { store.q[id] = b; added++; return; }
      if ((b.t || 0) > (a.t || 0)) {
        if (!b.memo && a.memo) b.memo = a.memo;   // 相手にメモがなければ残す
        store.q[id] = b;
        added++;
      } else if (!a.memo && b.memo) {
        a.memo = b.memo;
      }
    });

    var seen = {}, out = [];
    store.log.concat(Array.isArray(inc.log) ? inc.log : []).forEach(function (e) {
      if (!e || !e.i || !e.t) return;
      var k = e.i + '@' + e.t;
      if (seen[k]) return;
      seen[k] = 1;
      out.push(e);
    });
    out.sort(function (x, y) { return x.t - y.t; });
    store.log = out.slice(-LOG_MAX);
    save();
    return added;
  }

  function importFile(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var added = mergeRecord(JSON.parse(reader.result));
        dataMsg('読み込みました。' + added + ' 問の記録を反映し、履歴は ' + store.log.length + ' 件になりました。');
        renderRecord();
      } catch (e) {
        dataMsg('読み込めませんでした（' + e.message + '）。書き出したJSONファイルを選んでください。', true);
      }
    };
    reader.onerror = function () { dataMsg('ファイルを読み取れませんでした。', true); };
    reader.readAsText(file);
  }

  /* ================= タブ切替 ================= */
  function switchTab(name) {
    document.querySelectorAll('.tab-panel').forEach(function (p) {
      p.classList.toggle('active', p.id === 'tab-' + name);
    });
    document.querySelectorAll('.tab-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.tab === name);
    });
    if (name === 'quiz') renderQuiz();
    if (name === 'list') renderList();
    if (name === 'record') renderRecord();
    window.scrollTo(0, 0);
  }

  /* 指定の問題を出題タブで開く */
  function openQuestion(id) {
    var q = questionById(id);
    if (!q) return;
    state.field = q.field;
    state.category = q.category;
    state.mode = 'all';
    state.revealed = false;
    buildDeck();
    var idx = -1;
    for (var i = 0; i < state.deck.length; i++) { if (state.deck[i].id === id) { idx = i; break; } }
    state.index = idx >= 0 ? idx : 0;
    switchTab('quiz');
  }

  /* ================= イベント ================= */
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

  var memoTimer = null;
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
      flushMemo();
      setStatus(q.id, g.dataset.grade);
      renderQuiz();
    }
  });

  /* メモは入力のたびに保存する（カードは再描画しないので入力は途切れない） */
  $('#quiz-area').addEventListener('input', function (e) {
    if (e.target.id !== 'memo-box') return;
    var q = state.deck[state.index];
    if (!q) return;
    var val = e.target.value;
    var state_el = $('#memo-state');
    if (state_el) state_el.textContent = '入力中…';
    clearTimeout(memoTimer);
    memoTimer = setTimeout(function () {
      setMemo(q.id, val);
      if (state_el) {
        state_el.textContent = '保存しました';
        setTimeout(function () { if (state_el) state_el.textContent = ''; }, 1500);
      }
    }, 500);
  });

  /* 画面遷移前に確実に書き込む */
  function flushMemo() {
    clearTimeout(memoTimer);
    var box = document.getElementById('memo-box');
    var q = state.deck[state.index];
    if (box && q) setMemo(q.id, box.value);
  }
  window.addEventListener('beforeunload', flushMemo);

  $('#btn-prev').addEventListener('click', function () {
    if (state.index > 0) {
      flushMemo();
      state.index--;
      state.revealed = false;
      renderQuiz();
      window.scrollTo(0, 0);
    }
  });

  $('#btn-next').addEventListener('click', function () {
    if (state.index < state.deck.length - 1) {
      flushMemo();
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
    if (item) openQuestion(item.dataset.id);
  });

  $('#rec-summary').addEventListener('click', function (e) {
    if (!e.target.closest('#btn-goto-due')) return;
    // 復習時期の問題が最も多い分野を開く
    var best = null, bestN = -1;
    DATA.fields.forEach(function (f) {
      var n = questionsOfField(f.id).filter(function (q) { return isDue(q.id); }).length;
      if (n > bestN) { bestN = n; best = f.id; }
    });
    if (best) state.field = best;
    state.category = 'all';
    state.mode = 'due';
    state.index = 0;
    state.revealed = false;
    switchTab('quiz');
  });

  $('#rec-memos').addEventListener('click', function (e) {
    if (e.target.closest('[data-more]')) { recLimit.memo += 20; renderMemos(); return; }
    var item = e.target.closest('.memo-item');
    if (item) openQuestion(item.dataset.id);
  });

  $('#rec-history').addEventListener('click', function (e) {
    if (e.target.closest('[data-more]')) { recLimit.hist += 50; renderHistory(); return; }
    var item = e.target.closest('.hist-item');
    if (item) openQuestion(item.dataset.id);
  });

  $('#btn-export').addEventListener('click', exportRecord);
  $('#btn-import').addEventListener('click', function () { $('#file-input').click(); });
  $('#file-input').addEventListener('change', function (e) {
    var f = e.target.files && e.target.files[0];
    if (f) importFile(f);
    e.target.value = '';
  });

  $('#btn-reset').addEventListener('click', function () {
    if (!confirm('自己採点・学習履歴・メモをすべて削除します。よろしいですか？\n（元に戻せません。必要なら先に書き出してください）')) return;
    store = blankStore();
    save();
    renderRecord();
    dataMsg('学習記録を削除しました。');
  });

  /* ================= 起動 ================= */
  renderQuiz();
})();
