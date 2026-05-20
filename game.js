// ハートちゃんサロン ゲームロジック

// ===== カラーパレット（共通30色） =====
const PALETTE = [
  { hex: '#FFFFFF', name: 'しろ' },
  { hex: '#F5F0E8', name: 'クリーム' },
  { hex: '#FFEE99', name: 'ペールイエロー' },
  { hex: '#FFD700', name: 'ゴールド' },
  { hex: '#FFA500', name: 'オレンジ' },
  { hex: '#FF6347', name: 'トマトレッド' },
  { hex: '#FF1493', name: 'ディープピンク' },
  { hex: '#FF69B4', name: 'ホットピンク' },
  { hex: '#FF6699', name: 'ローズ' },
  { hex: '#FFB6C1', name: 'ライトピンク' },
  { hex: '#FFE4F1', name: 'ペールピンク' },
  { hex: '#FF7F7F', name: 'コーラル' },
  { hex: '#C71585', name: 'ベリー' },
  { hex: '#8B0000', name: 'ダークレッド' },
  { hex: '#8B4513', name: 'ブラウン' },
  { hex: '#D2691E', name: 'キャラメル' },
  { hex: '#DAA520', name: 'ハニー' },
  { hex: '#556B2F', name: 'オリーブ' },
  { hex: '#50C878', name: 'グリーン' },
  { hex: '#A8E6CF', name: 'ミント' },
  { hex: '#40E0D0', name: 'ターコイズ' },
  { hex: '#87CEEB', name: 'スカイブルー' },
  { hex: '#1E90FF', name: 'ブルー' },
  { hex: '#4B0082', name: 'インディゴ' },
  { hex: '#9370DB', name: 'パープル' },
  { hex: '#DDB6FF', name: 'ペールパープル' },
  { hex: '#C8A2DD', name: 'ラベンダー' },
  { hex: '#C0C0C0', name: 'シルバー' },
  { hex: '#888888', name: 'グレー' },
  { hex: '#000000', name: 'ブラック' },
];

// ===== ゲーム状態 =====
const STATE = {
  screen: 'title',      // title | select | game | finish
  selectedGirl: null,
  step: 0,
  makeup: makeupDefaults(),
  muted: false,
};

const STEPS = ['hair', 'skincare', 'cheek', 'lip', 'eyeshadow', 'contact', 'shoeShape', 'shoeColor'];

// メイクアップの初期状態
function makeupDefaults() {
  return {
    hairColor: null,        // null = キャラの元の色
    skincareOn: false,
    cheekColor: '#FF9999',
    cheekOn: false,
    lipColor: '#FF6B8A',
    lipOn: false,
    eyeshadowColor: '#CC88EE',
    eyeshadowOn: false,
    contactColor: '#87CEEB',
    contactOn: false,
    shoeShape: null,        // null = キャラの元の形
    shoeColor: null,        // null = キャラの元の色
  };
}

// ===== Audio =====
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(freq, type = 'sine', dur = 0.12, gain = 0.18) {
  if (STATE.muted) return;
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.connect(g); g.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur);
  } catch(e) {}
}

function playPop() { playTone(880, 'sine', 0.1, 0.2); }
function playSwish() {
  if (STATE.muted) return;
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.connect(g); g.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.3);
    g.gain.setValueAtTime(0.08, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch(e) {}
}

function playKiran() {
  if (STATE.muted) return;
  const notes = [523, 659, 784, 1047];
  notes.forEach((f, i) => setTimeout(() => playTone(f, 'triangle', 0.15, 0.15), i * 80));
}

function playFanfare() {
  if (STATE.muted) return;
  const melody = [523, 659, 784, 1047, 784, 1047, 1175];
  melody.forEach((f, i) => setTimeout(() => playTone(f, 'triangle', 0.18, 0.18), i * 110));
}

// BGMループ
let bgmHandle = null;
function startBGM() {
  if (STATE.muted || bgmHandle) return;
  const notes = [523, 587, 659, 698, 784, 698, 659, 587];
  let i = 0;
  function tick() {
    if (!STATE.muted) playTone(notes[i % notes.length] * 2, 'triangle', 0.25, 0.06);
    i++;
    bgmHandle = setTimeout(tick, 380);
  }
  tick();
}
function stopBGM() {
  clearTimeout(bgmHandle);
  bgmHandle = null;
}

// ===== DOM ヘルパー =====
const $ = id => document.getElementById(id);

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(`${name}-screen`).classList.add('active');
  STATE.screen = name;
}

function showHeartChan(show) {
  $('heart-chan-area').classList.toggle('hidden', !show);
}

function showNav(show) {
  $('nav-area').classList.toggle('hidden', !show);
}

function showStepIndicator(show) {
  $('step-indicator').classList.toggle('hidden', !show);
}

function setSpeech(text) {
  const el = $('speech-text');
  el.textContent = text;
  const bubble = $('speech-bubble');
  bubble.style.animation = 'none';
  bubble.offsetHeight; // reflow
  bubble.style.animation = '';

  const sprite = $('heart-chan-sprite');
  sprite.classList.remove('bounce');
  sprite.offsetHeight;
  sprite.classList.add('bounce');
  setTimeout(() => sprite.classList.remove('bounce'), 500);
}

function updateStepDots() {
  document.querySelectorAll('.dot').forEach(dot => {
    const s = parseInt(dot.dataset.step);
    dot.classList.toggle('active', s === STATE.step);
    dot.classList.toggle('done', s < STATE.step);
  });
}

// ===== キャラクター表示 =====
function renderCharacter(container) {
  if (!STATE.selectedGirl) return;
  const girl = STATE.selectedGirl;
  const div = document.createElement('div');
  div.innerHTML = girl.svg;
  const svg = div.querySelector('svg');

  // 現在のメイク状態を適用
  applyMakeupToSvg(svg);
  container.innerHTML = '';
  container.appendChild(svg);
}

function applyMakeupToSvg(svg) {
  const m = STATE.makeup;

  // 髪の色（前回適用色 → 新しい色で置換、SVG再生成不要）
  ['.hair-back-group', '.hair-front-group'].forEach(sel => {
    const grp = svg.querySelector(sel);
    if (!grp) return;
    const original = (grp.dataset.hairColor || '').toUpperCase();
    const current = (grp.dataset.curColor || original).toUpperCase();
    const target  = (m.hairColor || original).toUpperCase();
    if (current === target) return;
    grp.querySelectorAll('*').forEach(el => {
      const f = (el.getAttribute('fill') || '').toUpperCase();
      const s = (el.getAttribute('stroke') || '').toUpperCase();
      if (f === current) el.setAttribute('fill', target);
      if (s === current) el.setAttribute('stroke', target);
    });
    grp.dataset.curColor = target;
  });

  // アイシャドウ
  const ey = svg.querySelector('.eyeshadow-layer');
  if (ey) {
    ey.querySelectorAll('ellipse').forEach(el => el.setAttribute('fill', m.eyeshadowColor));
    ey.style.opacity = m.eyeshadowOn ? '0.62' : '0';
    ey.style.transition = 'opacity .35s';
  }

  // ほっぺ
  const ch = svg.querySelector('.cheeks-layer');
  if (ch) {
    ch.querySelectorAll('circle').forEach(el => el.setAttribute('fill', m.cheekColor));
    ch.style.opacity = m.cheekOn ? '0.58' : '0';
    ch.style.transition = 'opacity .35s';
  }

  // くちびる
  const lip = svg.querySelector('.lips-layer');
  if (lip) {
    lip.setAttribute('fill', m.lipOn ? m.lipColor : '#FF6B8A');
    lip.style.transition = 'fill .35s';
  }

  // カラコン（虹彩の色）
  svg.querySelectorAll('.iris').forEach(iris => {
    const original = iris.dataset.originalColor;
    iris.setAttribute('fill', m.contactOn ? m.contactColor : original);
    iris.style.transition = 'fill .35s';
  });

  // 靴（形・色）
  const shoes = svg.querySelector('.shoes-group');
  if (shoes) {
    const origShape = shoes.dataset.shoeShape || 'sneaker';
    const origColor = shoes.dataset.shoeColor || '#888888';
    const shape = m.shoeShape || origShape;
    const color = m.shoeColor || origColor;
    if (shoes.dataset.curShape !== shape || shoes.dataset.curColor !== color) {
      shoes.innerHTML = buildShoesSVG(shape, color);
      shoes.dataset.curShape = shape;
      shoes.dataset.curColor = color;
    }
  }
}

function refreshCharacterInGame() {
  const wrap = $('character-wrap');
  if (!wrap) return;
  const existing = wrap.querySelector('svg');
  if (existing) {
    applyMakeupToSvg(existing);
  } else {
    renderCharacter(wrap);
  }
}

// ===== タイトル画面 =====
function initTitleScreen() {
  showHeartChan(false);
  showNav(false);
  showStepIndicator(false);

  $('start-btn').addEventListener('click', () => {
    playPop();
    startBGM();
    initSelectScreen();
    showScreen('select');
  });
}

// ===== キャラクター選択 =====
function initSelectScreen() {
  showHeartChan(true);
  showNav(false);
  showStepIndicator(false);
  setSpeech(getComment('select'));

  const grid = $('girl-grid');
  grid.innerHTML = '';

  GIRLS.forEach(girl => {
    const card = document.createElement('div');
    card.className = 'girl-card';
    card.dataset.id = girl.id;

    // 小さいサムネイルSVG（元SVGをそのまま使用）
    const thumb = document.createElement('div');
    thumb.innerHTML = girl.svg;
    const svg = thumb.querySelector('svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', 'auto');
    svg.style.maxHeight = '80px';

    card.appendChild(svg);
    const name = document.createElement('div');
    name.className = 'girl-name';
    name.textContent = girl.name;
    card.appendChild(name);

    card.addEventListener('click', () => {
      playPop();
      document.querySelectorAll('.girl-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      STATE.selectedGirl = girl;
      // 過去のメイクアップ状態をリセット（新しいキャラはすっぴん状態）
      STATE.makeup = makeupDefaults();
      STATE.step = 0;
      $('confirm-girl-btn').disabled = false;
      setSpeech('このこにするの？かわいい！♡');
    });

    grid.appendChild(card);
  });

  $('confirm-girl-btn').addEventListener('click', () => {
    if (!STATE.selectedGirl) return;
    playKiran();
    STATE.step = 0;
    initGameScreen();
    showScreen('game');
  });
}

// ===== ゲーム画面 =====
function initGameScreen() {
  showHeartChan(true);
  showNav(true);
  showStepIndicator(true);
  updateStepDots();

  // キャラクター表示
  renderCharacter($('character-wrap'));

  // ナビゲーション
  $('back-btn').onclick = () => {
    playPop();
    if (STATE.step === 0) {
      showScreen('select');
      showHeartChan(true);
      showNav(false);
      showStepIndicator(false);
    } else {
      STATE.step--;
      updateStepDots();
      renderStep();
    }
  };

  $('next-btn').onclick = () => {
    playKiran();
    if (STATE.step < STEPS.length - 1) {
      STATE.step++;
      updateStepDots();
      renderStep();
    } else {
      initFinishScreen();
      showScreen('finish');
    }
  };

  renderStep();
}

// STEPSキー → commentsキー のマッピング
const COMMENT_KEY_MAP = {
  hair: 'hair', skincare: 'skincare', cheek: 'cheek', lip: 'lip',
  eyeshadow: 'eyeshadow', contact: 'contact',
  shoeShape: 'shoeShape', shoeColor: 'shoeColor',
};

function renderStep() {
  const step = STEPS[STATE.step];
  setSpeech(getComment(COMMENT_KEY_MAP[step] || step));
  refreshCharacterInGame();

  const controls = $('controls-area');
  controls.innerHTML = '';

  if (step === 'hair')           renderHairColorStep(controls);
  else if (step === 'skincare')  renderSkincareStep(controls);
  else if (step === 'cheek')     renderColorStep(controls, 'cheek', '💗 ほっぺのいろ');
  else if (step === 'lip')       renderColorStep(controls, 'lip', '💋 くちびるのいろ');
  else if (step === 'eyeshadow') renderColorStep(controls, 'eyeshadow', '✨ アイシャドウのいろ');
  else if (step === 'contact')   renderColorStep(controls, 'contact', '👁 カラコンのいろ');
  else if (step === 'shoeShape') renderShoeShapeStep(controls);
  else if (step === 'shoeColor') renderShoeColorStep(controls);
}

// 髪色ステップ
function renderHairColorStep(container) {
  const titleEl = document.createElement('div');
  titleEl.className = 'step-title';
  titleEl.textContent = '💇 かみのいろ';
  container.appendChild(titleEl);

  const current = STATE.makeup.hairColor || (STATE.selectedGirl && STATE.selectedGirl.hairColorMain);
  container.appendChild(buildPalette(current, (hex) => {
    STATE.makeup.hairColor = hex;
    refreshCharacterInGame();
    playSwish();
  }));
}

// 靴の形ステップ
function renderShoeShapeStep(container) {
  const titleEl = document.createElement('div');
  titleEl.className = 'step-title';
  titleEl.textContent = '👟 くつのかたち';
  container.appendChild(titleEl);

  const grid = document.createElement('div');
  grid.className = 'shoe-shape-grid';

  const shapes = [
    { id:'sneaker', emoji:'👟', name:'スニーカー' },
    { id:'heel',    emoji:'👠', name:'ヒール'    },
    { id:'boots',   emoji:'🥾', name:'ブーツ'    },
  ];

  // 現在の形（未選択ならキャラのデフォルト）
  const girl = STATE.selectedGirl;
  const currentShape = STATE.makeup.shoeShape || (girl && girl.boots ? 'boots' : 'sneaker');

  shapes.forEach(sh => {
    const card = document.createElement('div');
    card.className = 'shoe-shape-card' + (sh.id === currentShape ? ' selected' : '');
    card.innerHTML = `
      <div class="shoe-shape-emoji">${sh.emoji}</div>
      <div class="shoe-shape-name">${sh.name}</div>
    `;
    card.addEventListener('click', () => {
      playPop();
      document.querySelectorAll('.shoe-shape-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      STATE.makeup.shoeShape = sh.id;
      refreshCharacterInGame();
    });
    grid.appendChild(card);
  });
  container.appendChild(grid);
}

// 靴の色ステップ
function renderShoeColorStep(container) {
  const titleEl = document.createElement('div');
  titleEl.className = 'step-title';
  titleEl.textContent = '🎨 くつのいろ';
  container.appendChild(titleEl);

  const current = STATE.makeup.shoeColor || (STATE.selectedGirl && STATE.selectedGirl.shoeColor);
  container.appendChild(buildPalette(current, (hex) => {
    STATE.makeup.shoeColor = hex;
    refreshCharacterInGame();
    playSwish();
  }));
}

// スキンケアステップ（色なし・ボトル選択でエフェクト）
function renderSkincareStep(container) {
  const title = document.createElement('div');
  title.className = 'step-title';
  title.textContent = '🫧 おはだをきれいにしよう';
  container.appendChild(title);

  const grid = document.createElement('div');
  grid.className = 'skincare-grid';

  const items = [
    { emoji: '💧', name: 'けしょうすい', color: '#AEE1FF' },
    { emoji: '🫧', name: 'クリーム',    color: '#FFE0F0' },
    { emoji: '🧴', name: 'パック',      color: '#FFCCDD' },
    { emoji: '✨', name: 'エッセンス',  color: '#FFF3BB' },
  ];

  items.forEach(it => {
    const card = document.createElement('div');
    card.className = 'skincare-card';
    card.innerHTML = `
      <div class="skincare-emoji">${it.emoji}</div>
      <div class="skincare-name">${it.name}</div>
    `;
    card.addEventListener('click', () => {
      playSwish();
      playKiran();
      STATE.makeup.skincareOn = true;
      card.classList.add('used');
      // 顔まわりのキラキラエフェクト
      launchGlitterParticles(it.color, 80);
      setSpeech('おはだがピカピカ♡きもちいい～！');
    });
    grid.appendChild(card);
  });
  container.appendChild(grid);
}

// 汎用カラーステップ
function renderColorStep(container, key, title) {
  const titleEl = document.createElement('div');
  titleEl.className = 'step-title';
  titleEl.textContent = title;
  container.appendChild(titleEl);

  const colorKey = key + 'Color';
  const onKey = key + 'On';

  // デフォルトでONにする
  if (!STATE.makeup[onKey]) {
    STATE.makeup[onKey] = true;
    refreshCharacterInGame();
  }

  // アニメーション
  playMakeupAnim(key);

  container.appendChild(buildPalette(STATE.makeup[colorKey], (hex) => {
    STATE.makeup[colorKey] = hex;
    STATE.makeup[onKey] = true;
    refreshCharacterInGame();
    playSwish();
    // ほっぺの色を選ぶたびに鏡をふわっと表示
    if (key === 'cheek') showMirrorAnim();
  }));
}

// 鏡をふわっと出して消す
function showMirrorAnim() {
  const overlay = $('mirror-overlay');
  if (!overlay) return;
  overlay.classList.remove('hidden');
  overlay.classList.remove('active');
  void overlay.offsetWidth; // reflow
  overlay.classList.add('active');
  playKiran();
  setTimeout(() => {
    overlay.classList.remove('active');
    overlay.classList.add('hidden');
  }, 1400);
}

function buildPalette(currentColor, onChange) {
  const pal = document.createElement('div');
  pal.className = 'color-palette';

  PALETTE.forEach(({ hex, name }) => {
    const sw = document.createElement('div');
    sw.className = 'color-swatch' + (hex === currentColor ? ' selected' : '');
    sw.style.background = hex;
    sw.title = name;
    if (hex === '#FFFFFF' || hex === '#F5F0E8') {
      sw.style.border = '3px solid #DDD';
    }
    sw.addEventListener('click', () => {
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
      sw.classList.add('selected');
      playPop();
      onChange(hex);
    });
    pal.appendChild(sw);
  });
  return pal;
}

// ===== メイクアニメーション =====
function playMakeupAnim(step) {
  const overlay = $('makeup-anim-overlay');
  const brush = $('brush-anim');
  overlay.classList.remove('hidden');
  brush.style.animation = 'none';
  brush.offsetHeight;

  if (step === 'skincare') {
    brush.textContent = '🫧';
    brush.style.animation = 'eyeFloat 0.8s ease-out forwards';
  } else if (step === 'cheek') {
    brush.textContent = '💗';
    brush.style.animation = 'cheekBrush 0.8s ease-out forwards';
  } else if (step === 'lip') {
    brush.textContent = '💋';
    brush.style.animation = 'lipSlide 0.7s ease-out forwards';
  } else if (step === 'eyeshadow') {
    brush.textContent = '✨';
    brush.style.animation = 'eyeFloat 0.8s ease-out forwards';
  } else if (step === 'contact') {
    brush.textContent = '👁';
    brush.style.animation = 'eyeFloat 0.8s ease-out forwards';
    launchGlitterParticles(STATE.makeup.contactColor);
  }

  setTimeout(() => overlay.classList.add('hidden'), 900);
}

// ===== グリッターパーティクル =====
function launchGlitterParticles(color, count = 60) {
  const canvas = $('glitter-canvas');
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  const ctx = canvas.getContext('2d');

  const particles = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: -20,
    vy: 1.5 + Math.random() * 3,
    vx: (Math.random() - 0.5) * 2,
    r: 3 + Math.random() * 5,
    alpha: 1,
    color,
    rot: Math.random() * Math.PI * 2,
    rotV: (Math.random() - 0.5) * 0.2,
  }));

  let frame = 0;
  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    particles.forEach(p => {
      if (p.alpha <= 0) return;
      alive = true;
      p.x += p.vx; p.y += p.vy;
      p.rot += p.rotV;
      if (p.y > canvas.height * 0.7) p.alpha -= 0.02;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      // 星形
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const b = ((i * 4 + 2) * Math.PI) / 5 - Math.PI / 2;
        ctx.lineTo(Math.cos(a) * p.r, Math.sin(a) * p.r);
        ctx.lineTo(Math.cos(b) * p.r * 0.4, Math.sin(b) * p.r * 0.4);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    frame++;
    if (alive && frame < 180) requestAnimationFrame(tick);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  tick();
}

function launchCelebration() {
  const colors = ['#FF88BB', '#FFD700', '#CC88EE', '#87CEEB', '#FF6347', '#FFB6C1'];
  const canvas = $('glitter-canvas');
  canvas.width = canvas.offsetWidth || 375;
  canvas.height = canvas.offsetHeight || 667;
  const ctx = canvas.getContext('2d');

  const petals = Array.from({ length: 80 }, () => ({
    x: Math.random() * canvas.width,
    y: -30 - Math.random() * 100,
    vy: 1 + Math.random() * 2.5,
    vx: (Math.random() - 0.5) * 1.5,
    r: 4 + Math.random() * 7,
    alpha: 1,
    color: colors[Math.floor(Math.random() * colors.length)],
    rot: Math.random() * Math.PI * 2,
    rotV: (Math.random() - 0.5) * 0.15,
    shape: Math.random() > 0.5 ? 'star' : 'heart',
  }));

  let frame = 0;
  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    petals.forEach(p => {
      if (p.alpha <= 0) return;
      alive = true;
      p.x += p.vx; p.y += p.vy;
      p.rot += p.rotV;
      if (p.y > canvas.height * 0.8) p.alpha -= 0.015;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;

      if (p.shape === 'heart') {
        const s = p.r * 0.6;
        ctx.beginPath();
        ctx.moveTo(0, s * 0.4);
        ctx.bezierCurveTo(s, -s * 0.4, s * 2, s, 0, s * 2);
        ctx.bezierCurveTo(-s * 2, s, -s, -s * 0.4, 0, s * 0.4);
        ctx.fill();
      } else {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          const b = ((i * 4 + 2) * Math.PI) / 5 - Math.PI / 2;
          ctx.lineTo(Math.cos(a) * p.r, Math.sin(a) * p.r);
          ctx.lineTo(Math.cos(b) * p.r * 0.4, Math.sin(b) * p.r * 0.4);
        }
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    });
    frame++;
    if (alive && frame < 300) requestAnimationFrame(tick);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  tick();
}

// ===== 完成画面 =====
function initFinishScreen() {
  showHeartChan(true);
  showNav(false);
  showStepIndicator(false);

  setSpeech(getComment('finish'));

  const finChar = $('finish-character');
  finChar.innerHTML = '';
  if (STATE.selectedGirl) {
    const div = document.createElement('div');
    div.innerHTML = STATE.selectedGirl.svg;
    const svg = div.querySelector('svg');
    svg.setAttribute('width', '180');
    svg.setAttribute('height', 'auto');
    applyMakeupToSvg(svg);
    finChar.appendChild(svg);
  }

  $('finish-comment').textContent = getComment('finish');

  playFanfare();
  launchCelebration();

  $('play-again-btn').onclick = () => {
    playPop();
    // 状態リセット
    STATE.selectedGirl = null;
    STATE.step = 0;
    STATE.makeup = makeupDefaults();
    initSelectScreen();
    showScreen('select');
  };
}

// ===== ミュートボタン =====
function initMuteBtn() {
  $('mute-btn').addEventListener('click', () => {
    STATE.muted = !STATE.muted;
    $('mute-btn').textContent = STATE.muted ? '🔇' : '🔊';
    if (STATE.muted) stopBGM();
    else startBGM();
  });
}

// ===== ハートちゃんSVGを読み込む =====
function initHeartChanSprite() {
  // SVGをimgタグとしてinline表示（既にCSSのbackground-imageで設定済み）
}

// ===== 起動 =====
document.addEventListener('DOMContentLoaded', () => {
  initMuteBtn();
  initHeartChanSprite();
  initTitleScreen();

  // ハートちゃんエリアにSVGを直接挿入
  fetch('assets/heart_chan.svg')
    .then(r => r.text())
    .then(svgText => {
      const sprite = $('heart-chan-sprite');
      sprite.innerHTML = svgText;
      const svg = sprite.querySelector('svg');
      if (svg) { svg.style.width = '88px'; svg.style.height = '110px'; }
    })
    .catch(() => {
      // フォールバック：CSSのbackground-imageを使用
    });
});
