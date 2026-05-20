// ===== 10人の女の子キャラクター =====
// 髪はキャラクターごとに固定（選択なし）
// 顔は楕円形・自然な肌色

// 花飾りSVGパーツ
function makeFlower(type, cx, cy, color) {
  switch (type) {
    case 'sunflower':
      return [0,40,80,120,160,200,240,280,320].map(a =>
        `<ellipse cx="${cx}" cy="${cy-15}" rx="5" ry="9" fill="#FFD700" transform="rotate(${a} ${cx} ${cy})"/>`
      ).join('') +
      `<circle cx="${cx}" cy="${cy}" r="10" fill="#7B3F00"/>
       <circle cx="${cx}" cy="${cy}" r="6"  fill="#5C2E00"/>`;
    case 'rose':
      return `<circle cx="${cx}" cy="${cy}"   r="11" fill="${color}"/>
       <circle cx="${cx-5}" cy="${cy-4}" r="7"  fill="${color}" opacity="0.85"/>
       <circle cx="${cx+5}" cy="${cy-4}" r="7"  fill="${color}" opacity="0.75"/>
       <circle cx="${cx}"   cy="${cy-8}" r="5"  fill="${color}" opacity="0.9"/>
       <circle cx="${cx}"   cy="${cy}"   r="4"  fill="#AA1133" opacity="0.35"/>`;
    case 'cherry':
      return [0,60,120,180,240,300].map(a =>
        `<ellipse cx="${cx}" cy="${cy-9}" rx="5" ry="7" fill="${color}" transform="rotate(${a} ${cx} ${cy})"/>`
      ).join('') + `<circle cx="${cx}" cy="${cy}" r="5" fill="white" opacity="0.6"/>`;
    case 'tulip':
      return `<path d="M${cx} ${cy+12} Q${cx-13} ${cy-2} ${cx-8} ${cy-16} Q${cx} ${cy-11} ${cx+8} ${cy-16} Q${cx+13} ${cy-2} ${cx} ${cy+12}Z" fill="${color}"/>
       <line x1="${cx}" y1="${cy+12}" x2="${cx}" y2="${cy+24}" stroke="#44AA44" stroke-width="2.5" stroke-linecap="round"/>
       <path d="M${cx} ${cy+18} Q${cx+9} ${cy+14} ${cx+10} ${cy+8}" fill="none" stroke="#44AA44" stroke-width="2"/>`;
    case 'daisy':
      return [0,45,90,135,180,225,270,315].map(a =>
        `<ellipse cx="${cx}" cy="${cy-10}" rx="4" ry="7.5" fill="white" stroke="#DDD" stroke-width="0.5" transform="rotate(${a} ${cx} ${cy})"/>`
      ).join('') +
      `<circle cx="${cx}" cy="${cy}" r="7" fill="${color}"/>`;
    case 'lavender':
      return `${[-8,-4,0,4,8].map((ox,i) =>
        `<ellipse cx="${cx+ox}" cy="${cy-8+Math.abs(ox)/2}" rx="3.5" ry="5.5" fill="${color}" opacity="${0.7+i*0.06}"/>`
      ).join('')}
       <line x1="${cx}" y1="${cy+2}" x2="${cx}" y2="${cy+20}" stroke="#66AA66" stroke-width="2.5" stroke-linecap="round"/>
       <path d="M${cx} ${cy+10} Q${cx+8} ${cy+6} ${cx+9} ${cy}"   fill="none" stroke="#66AA66" stroke-width="1.5"/>
       <path d="M${cx} ${cy+14} Q${cx-8} ${cy+10} ${cx-9} ${cy+4}" fill="none" stroke="#66AA66" stroke-width="1.5"/>`;
    case 'fern':
      return `<path d="M${cx} ${cy+12} Q${cx} ${cy-8} ${cx} ${cy-20}" stroke="${color}" stroke-width="2.5" fill="none"/>
       <path d="M${cx} ${cy+4}  Q${cx+12} ${cy-2}  ${cx+14} ${cy-12}" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round"/>
       <path d="M${cx} ${cy}    Q${cx-12} ${cy-6}  ${cx-14} ${cy-16}" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round"/>
       <path d="M${cx} ${cy-6}  Q${cx+10} ${cy-10} ${cx+11} ${cy-18}" stroke="${color}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
       <path d="M${cx} ${cy-10} Q${cx-10} ${cy-14} ${cx-11} ${cy-20}" stroke="${color}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
    case 'mixed':
      return ['#FF88CC','#FFCC44','#88CCFF','#AAFFAA','#FF6699'].map((c,i) =>
        `<ellipse cx="${cx}" cy="${cy-11}" rx="5" ry="8" fill="${c}" transform="rotate(${i*72} ${cx} ${cy})"/>`
      ).join('') + `<circle cx="${cx}" cy="${cy}" r="6" fill="#FFEECC"/>`;
    default:
      return [0,60,120,180,240,300].map(a =>
        `<ellipse cx="${cx}" cy="${cy-10}" rx="5" ry="8" fill="${color}" transform="rotate(${a} ${cx} ${cy})"/>`
      ).join('') + `<circle cx="${cx}" cy="${cy}" r="5" fill="white" opacity="0.9"/>`;
  }
}

// ---- 靴の形SVGを生成 ----
// shape: 'sneaker' | 'heel' | 'boots'
function buildShoesSVG(shape, color) {
  // 暗くした色（縁取り・ディテール用）
  function darken(hex, amt) {
    const m = (hex || '').match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!m) return '#333333';
    const f = (i) => Math.round(parseInt(m[i], 16) * amt).toString(16).padStart(2, '0');
    return `#${f(1)}${f(2)}${f(3)}`;
  }
  const dark   = darken(color, 0.7);
  const darker = darken(color, 0.5);

  function oneShoe(cx, isLeft) {
    // out: つま先が向く方向（外側）。-1=左外、+1=右外
    const out = isLeft ? -1 : 1;

    if (shape === 'heel') {
      // パンプス（3/4視点）：とがったつま先が外向き、細いヒールがかかと下
      return `
        <!-- 足の甲（ティアドロップ） -->
        <path d="
          M ${cx + out*22} 330
          Q ${cx + out*20} 322 ${cx + out*8} 320
          L ${cx + out*-10} 320
          Q ${cx + out*-18} 324 ${cx + out*-16} 334
          Q ${cx + out*-8} 340 ${cx + out*8} 340
          Q ${cx + out*20} 338 ${cx + out*22} 330 Z
        " fill="${color}"/>
        <!-- 履き口の影 -->
        <ellipse cx="${cx + out*-3}" cy="324" rx="10" ry="3" fill="${darker}" opacity="0.55"/>
        <!-- 細いヒール（かかと真下） -->
        <rect x="${cx + out*-15}" y="335" width="3.5" height="13" rx="1" fill="${dark}"/>
        <!-- ハイライト（つま先のツヤ） -->
        <path d="M ${cx + out*15} 326 Q ${cx + out*18} 327 ${cx + out*19} 330"
              stroke="white" stroke-width="1.6" fill="none" opacity="0.55" stroke-linecap="round"/>
      `;
    }

    if (shape === 'boots') {
      // ロングブーツ：シャフト＋カフ＋甲＋ソール＋ベルト
      return `
        <!-- シャフト -->
        <rect x="${cx-14}" y="296" width="28" height="30" rx="5" fill="${color}"/>
        <!-- カフ（折り返し） -->
        <rect x="${cx-15}" y="293" width="30" height="6" rx="3" fill="${dark}"/>
        <!-- 足の甲 -->
        <path d="
          M ${cx-14} 324
          Q ${cx-23} 328 ${cx-23} 336
          Q ${cx-22} 340 ${cx-14} 340
          L ${cx+14} 340
          Q ${cx+22} 340 ${cx+23} 336
          Q ${cx+23} 328 ${cx+14} 324 Z
        " fill="${color}"/>
        <!-- ソール -->
        <rect x="${cx-23}" y="338" width="46" height="3" rx="1" fill="${darker}"/>
        <!-- ベルト＆バックル -->
        <rect x="${cx-13}" y="307" width="26" height="3" fill="${dark}"/>
        <circle cx="${cx-9}" cy="308.5" r="1.8" fill="${darker}"/>
        <circle cx="${cx+9}" cy="308.5" r="1.8" fill="${darker}"/>
        <!-- ハイライト -->
        <rect x="${cx-12}" y="302" width="2.5" height="20" rx="1" fill="white" opacity="0.18"/>
      `;
    }

    // スニーカー：丸みのある甲＋白ソール＋トウキャップ＋舌＋シューレース＋サイドストライプ
    return `
      <!-- 甲（丸いやや台形） -->
      <path d="
        M ${cx-22} 322
        Q ${cx-25} 332 ${cx-22} 338
        Q ${cx-15} 341 ${cx} 341
        Q ${cx+15} 341 ${cx+22} 338
        Q ${cx+25} 332 ${cx+22} 322
        Q ${cx+12} 318 ${cx} 318
        Q ${cx-12} 318 ${cx-22} 322 Z
      " fill="${color}"/>
      <!-- 白いソール（厚め） -->
      <rect x="${cx-23}" y="336" width="46" height="6" rx="2.5" fill="white"/>
      <rect x="${cx-23}" y="340" width="46" height="2" rx="1" fill="${darker}" opacity="0.35"/>
      <!-- トウキャップ（つま先白） -->
      <path d="
        M ${cx-19} 334
        Q ${cx-19} 338 ${cx-12} 338
        L ${cx+12} 338
        Q ${cx+19} 338 ${cx+19} 334 Z
      " fill="white" opacity="0.85"/>
      <!-- 舌（タン） -->
      <path d="M ${cx-7} 320 Q ${cx} 316 ${cx+7} 320 L ${cx+7} 332 L ${cx-7} 332 Z" fill="white" opacity="0.6"/>
      <!-- シューレース（3本） -->
      <line x1="${cx-6}" y1="322" x2="${cx+6}" y2="322" stroke="${dark}" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="${cx-6}" y1="326" x2="${cx+6}" y2="326" stroke="${dark}" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="${cx-6}" y1="330" x2="${cx+6}" y2="330" stroke="${dark}" stroke-width="1.4" stroke-linecap="round"/>
      <!-- サイドストライプ（スウッシュ風） -->
      <path d="M ${cx + out*-22} 332 Q ${cx + out*-12} 327 ${cx + out*-2} 332"
            stroke="white" stroke-width="2" fill="none" opacity="0.75" stroke-linecap="round"/>
    `;
  }
  return oneShoe(76, true) + oneShoe(124, false);
}

// ---- キャラクターSVG生成 ----
// 顔は楕円形（自然な形）・肌色は自然な色
function buildGirlSVG(c) {
  const freckles = c.freckles ? `
    <circle cx="68"  cy="93" r="2.5" fill="#B87A50" opacity="0.55"/>
    <circle cx="76"  cy="98" r="2"   fill="#B87A50" opacity="0.45"/>
    <circle cx="84"  cy="95" r="2"   fill="#B87A50" opacity="0.4"/>
    <circle cx="116" cy="93" r="2.5" fill="#B87A50" opacity="0.55"/>
    <circle cx="124" cy="98" r="2"   fill="#B87A50" opacity="0.45"/>
    <circle cx="132" cy="95" r="2"   fill="#B87A50" opacity="0.4"/>` : '';

  const [p0, p1, p2] = c.patchColors;

  const initialShape = c.boots ? 'boots' : 'sneaker';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 340" width="200" height="340">

  <!-- ===== 髪（後ろ）固定 ===== -->
  <g class="hair-back-group" data-hair-color="${c.hairColorMain}">
    ${c.hairBack}
  </g>

  <!-- 足/ズボン -->
  <rect x="66"  y="264" width="20" height="62" rx="8" fill="${c.pantColor}"/>
  <rect x="114" y="264" width="20" height="62" rx="8" fill="${c.pantColor}"/>

  <!-- 靴（形・色を後から差し替え可能） -->
  <g class="shoes-group" data-shoe-color="${c.shoeColor}" data-shoe-shape="${initialShape}">
    ${buildShoesSVG(initialShape, c.shoeColor)}
  </g>

  <!-- スカート（パッチワーク3色） -->
  <path d="M 50 208 Q 46 268 62 272 L 138 272 Q 154 268 150 208 Z" fill="${p0}"/>
  <path d="M 76 208 L 76 272 L 100 272 L 100 208 Z" fill="${p1}" opacity="0.72"/>
  <path d="M 100 208 L 100 272 L 124 272 L 124 208 Z" fill="${p2}" opacity="0.72"/>
  <line x1="50"  y1="240" x2="150" y2="240" stroke="white" stroke-width="1.4" opacity="0.5"/>
  <line x1="76"  y1="208" x2="76"  y2="272" stroke="white" stroke-width="1.2" opacity="0.45"/>
  <line x1="100" y1="208" x2="100" y2="272" stroke="white" stroke-width="1.2" opacity="0.45"/>
  <line x1="124" y1="208" x2="124" y2="272" stroke="white" stroke-width="1.2" opacity="0.45"/>

  <!-- ジャケット（外側パネル） -->
  <path d="M 60 165 Q 38 176 32 208 Q 32 220 50 222 Q 66 220 72 208 Q 70 182 64 168 Z" fill="${c.jacketColor}"/>
  <path d="M 140 165 Q 162 176 168 208 Q 168 220 150 222 Q 134 220 128 208 Q 130 182 136 168 Z" fill="${c.jacketColor}"/>

  <!-- ドレストップ -->
  <path d="M 66 165 Q 58 176 56 208 L 144 208 Q 142 176 134 165 Q 118 174 100 172 Q 82 174 66 165 Z" fill="${c.dressColor}"/>

  <!-- 花飾り -->
  ${makeFlower(c.flowerType, 100, 191, c.flowerColor)}

  <!-- 腕（ジャケット） -->
  <path d="M 62 168 Q 36 180 30 210 L 48 214 Q 54 194 66 182 Z" fill="${c.jacketDark}"/>
  <ellipse cx="33" cy="214" rx="12" ry="11" fill="${c.skinColor}"/>
  <path d="M 138 168 Q 164 180 170 210 L 152 214 Q 146 194 134 182 Z" fill="${c.jacketDark}"/>
  <ellipse cx="167" cy="214" rx="12" ry="11" fill="${c.skinColor}"/>

  <!-- 首 -->
  <rect x="88" y="144" width="24" height="24" rx="5" fill="${c.skinColor}"/>

  <!-- 頭（楕円形・自然な顔） -->
  <ellipse cx="100" cy="86" rx="53" ry="62" fill="${c.skinColor}"/>

  <!-- ★アイシャドウレイヤー（透明→メイクで表示） -->
  <g class="eyeshadow-layer" opacity="0">
    <ellipse cx="80"  cy="74" rx="18" ry="10" fill="#FF88CC"/>
    <ellipse cx="120" cy="74" rx="18" ry="10" fill="#FF88CC"/>
  </g>

  <!-- 目（白目） -->
  <ellipse cx="80"  cy="82" rx="13" ry="13" fill="white"/>
  <ellipse cx="120" cy="82" rx="13" ry="13" fill="white"/>
  <!-- 虹彩（カラコンで色変更可能） -->
  <circle class="iris" data-original-color="${c.eyeColor}" cx="80"  cy="84" r="8.5" fill="${c.eyeColor}"/>
  <circle class="iris" data-original-color="${c.eyeColor}" cx="120" cy="84" r="8.5" fill="${c.eyeColor}"/>
  <!-- 瞳孔 -->
  <circle cx="80"  cy="85" r="5"   fill="#16103A"/>
  <circle cx="120" cy="85" r="5"   fill="#16103A"/>
  <!-- ハイライト -->
  <circle cx="77"  cy="79" r="3.2" fill="white"/>
  <circle cx="117" cy="79" r="3.2" fill="white"/>
  <circle cx="78"  cy="88" r="1.8" fill="white" opacity="0.65"/>
  <circle cx="118" cy="88" r="1.8" fill="white" opacity="0.65"/>
  <!-- まつ毛 -->
  <path d="M 67 76 Q 80 68 93 76" stroke="#222" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M 107 76 Q 120 68 133 76" stroke="#222" stroke-width="2.5" fill="none" stroke-linecap="round"/>

  <!-- そばかす -->
  ${freckles}

  <!-- 鼻 -->
  <path d="M 97 98 Q 100 103 103 98" stroke="#C08060" stroke-width="1.5" fill="none" stroke-linecap="round"/>

  <!-- ★ほっぺレイヤー（透明→メイクで表示） -->
  <g class="cheeks-layer" opacity="0">
    <circle cx="63"  cy="100" r="16" fill="#FF9999"/>
    <circle cx="137" cy="100" r="16" fill="#FF9999"/>
  </g>

  <!-- ★くちびるレイヤー -->
  <path class="lips-layer" d="M 88 113 Q 100 123 112 113 Q 108 119 100 121 Q 92 119 88 113 Z" fill="#E8607A"/>
  <path d="M 88 113 Q 100 123 112 113" stroke="#D04060" stroke-width="1" fill="none" stroke-linecap="round"/>

  <!-- ===== 髪（前・前髪）固定 ===== -->
  <g class="hair-front-group" data-hair-color="${c.hairColorMain}">
    ${c.hairFront}
  </g>

  <!-- ★グリッターオーバーレイ -->
  <g class="glitter-overlay"></g>
</svg>`;
}

// ===== 10人の設定 =====
// 頭: cx=100,cy=86,rx=53,ry=62 / 耳レベル: y=86 / 頭頂: y=24

const GIRLS_CONFIG = [
  // 1. さくら ── 白銀のロングストレート
  {
    id:1, name:'さくら', hairColorMain:'#C8C4D8',
    skinColor:'#FDDCC0', eyeColor:'#5566AA',
    jacketColor:'#4477CC', jacketDark:'#2255AA',
    dressColor:'#88CC44', flowerColor:'#FF88AA', flowerType:'generic',
    pantColor:'#9AAABB', patchColors:['#FFB0C8','#AADEFF','#FFE8AA'],
    shoeColor:'#7788AA', freckles:false, boots:false,
    hairBack:`
      <!-- ロングの後ろ髪 -->
      <path d="M 47 86 Q 48 26 100 20 Q 152 26 153 86 L 156 218 Q 146 240 100 242 Q 54 240 44 218 Z" fill="#C8C4D8"/>`,
    hairFront:`
      <!-- トップキャップ -->
      <path d="M 47 86 Q 50 44 100 30 Q 150 44 153 86 Q 143 60 100 56 Q 57 60 47 86 Z" fill="#C8C4D8"/>
      <!-- ストレート前髪（短め） -->
      <rect x="53" y="56" width="94" height="8" rx="4" fill="#C8C4D8"/>
      <!-- 前に垂れるサイドストランド（左） -->
      <path d="M 49 88 Q 43 130 45 170 L 55 168 Q 55 128 59 90 Z" fill="#C8C4D8"/>
      <!-- 前に垂れるサイドストランド（右） -->
      <path d="M 151 88 Q 157 130 155 170 L 145 168 Q 145 128 141 90 Z" fill="#C8C4D8"/>`,
  },

  // 2. ひまり ── 黒のショートヘア＋ひまわりヘアクリップ
  {
    id:2, name:'ひまり', hairColorMain:'#1A1010',
    skinColor:'#80471C', eyeColor:'#3A1A08',
    jacketColor:'#EE7700', jacketDark:'#BB5500',
    dressColor:'#DDAA00', flowerColor:'#FFD700', flowerType:'sunflower',
    pantColor:'#6B3A14', patchColors:['#DDAA44','#BB7722','#EEC050'],
    shoeColor:'#AA4400', freckles:false, boots:false,
    hairBack:`
      <path d="M 47 86 Q 48 26 100 20 Q 152 26 153 86 L 153 148 L 47 148 Z" fill="#1A1010"/>`,
    hairFront:`
      <path d="M 47 86 Q 50 46 100 32 Q 150 46 153 86 Q 143 62 100 58 Q 57 62 47 86 Z" fill="#1A1010"/>
      <!-- 前髪ライン（短め） -->
      <rect x="54" y="58" width="92" height="6" rx="3" fill="#1A1010"/>
      <!-- サイド（左） -->
      <path d="M 49 88 L 46 128 L 54 126 L 57 90 Z" fill="#1A1010"/>
      <!-- サイド（右） -->
      <path d="M 151 88 L 154 128 L 146 126 L 143 90 Z" fill="#1A1010"/>
      <!-- ひまわりヘアクリップ -->
      ${makeFlower('sunflower', 138, 52, '#FFD700')}`,
  },

  // 3. ゆき ── 赤毛ミディアム・そばかす
  {
    id:3, name:'ゆき', hairColorMain:'#BB3300',
    skinColor:'#F5C8A4', eyeColor:'#5A3020',
    jacketColor:'#882222', jacketDark:'#661111',
    dressColor:'#336644', flowerColor:'#CC2244', flowerType:'rose',
    pantColor:'#445533', patchColors:['#556B2F','#8B7355','#6B8E23'],
    shoeColor:'#334422', freckles:true, boots:false,
    hairBack:`
      <path d="M 45 86 Q 46 24 100 18 Q 154 24 155 86 L 158 182 Q 148 202 100 204 Q 52 202 42 182 Z" fill="#BB3300"/>`,
    hairFront:`
      <path d="M 45 86 Q 48 44 100 30 Q 152 44 155 86 Q 145 60 100 56 Q 55 60 45 86 Z" fill="#BB3300"/>
      <!-- ゆるいサイドパート前髪 -->
      <path d="M 50 60 Q 52 54 72 52 L 74 72 Q 60 68 53 72 Z" fill="#BB3300"/>
      <rect x="72" y="52" width="82" height="22" rx="11" fill="#BB3300"/>
      <!-- サイド（左） -->
      <path d="M 46 88 Q 40 118 42 158 L 52 155 Q 52 118 56 90 Z" fill="#BB3300"/>
      <!-- サイド（右） -->
      <path d="M 154 88 Q 160 118 158 158 L 148 155 Q 148 118 144 90 Z" fill="#BB3300"/>`,
  },

  // 4. あかり ── 黒のポニーテール
  {
    id:4, name:'あかり', hairColorMain:'#1A1010',
    skinColor:'#FFE4CC', eyeColor:'#3A1A50',
    jacketColor:'#FFAACC', jacketDark:'#EE88AA',
    dressColor:'#FFB6C1', flowerColor:'#FF88BB', flowerType:'cherry',
    pantColor:'#FFD8EE', patchColors:['#FFD0E8','#FFB8D8','#FFECF4'],
    shoeColor:'#EE99BB', freckles:false, boots:false,
    hairBack:`
      <!-- 後ろのベースキャップ -->
      <path d="M 47 86 Q 48 26 100 20 Q 152 26 153 86 L 153 144 L 47 144 Z" fill="#1A1010"/>
      <!-- ポニーテールの尻尾 -->
      <path d="M 86 26 Q 84 22 100 18 Q 116 22 114 26 Q 120 30 126 44 Q 132 64 128 96 Q 124 126 116 156 Q 110 176 100 184 Q 90 176 84 156 Q 76 126 72 96 Q 68 64 74 44 Q 80 30 86 26 Z" fill="#1A1010"/>`,
    hairFront:`
      <path d="M 47 86 Q 50 48 100 34 Q 150 48 153 86 Q 143 64 100 60 Q 57 64 47 86 Z" fill="#1A1010"/>
      <!-- 前髪（短め） -->
      <rect x="54" y="58" width="92" height="6" rx="3" fill="#1A1010"/>
      <!-- 髪留め -->
      <ellipse cx="100" cy="28" rx="11" ry="8" fill="#1A1010"/>
      <ellipse cx="100" cy="28" rx="7" ry="5" fill="#333355"/>`,
  },

  // 5. なな ── ゴールドのツインテール
  {
    id:5, name:'なな', hairColorMain:'#FFD700',
    skinColor:'#FFE8CC', eyeColor:'#2A2888',
    jacketColor:'#8844BB', jacketDark:'#6622AA',
    dressColor:'#FF88AA', flowerColor:'#FF4488', flowerType:'tulip',
    pantColor:'#FFAACC', patchColors:['#FF88CC','#FFAAFF','#FFCCEE'],
    shoeColor:'#CCAA00', freckles:false, boots:false,
    hairBack:`
      <path d="M 47 86 Q 48 26 100 20 Q 152 26 153 86 L 153 138 L 47 138 Z" fill="#FFD700"/>`,
    hairFront:`
      <path d="M 47 86 Q 50 46 100 32 Q 150 46 153 86 Q 143 64 100 60 Q 57 64 47 86 Z" fill="#FFD700"/>
      <!-- 前髪（短め） -->
      <rect x="54" y="58" width="92" height="6" rx="3" fill="#FFD700"/>
      <!-- 左ツインテール -->
      <path d="M 47 120 Q 36 140 30 172 Q 26 198 32 214 Q 38 222 46 214 Q 52 198 52 174 Q 54 150 57 124 Z" fill="#FFD700"/>
      <!-- 右ツインテール -->
      <path d="M 153 120 Q 164 140 170 172 Q 174 198 168 214 Q 162 222 154 214 Q 148 198 148 174 Q 146 150 143 124 Z" fill="#FFD700"/>
      <!-- 左ヘアゴム -->
      <circle cx="50" cy="120" r="7" fill="#FF4488"/>
      <circle cx="50" cy="120" r="4" fill="#FF88CC"/>
      <!-- 右ヘアゴム -->
      <circle cx="150" cy="120" r="7" fill="#FF4488"/>
      <circle cx="150" cy="120" r="4" fill="#FF88CC"/>`,
  },

  // 6. ここ ── 茶色の三つ編み・そばかす
  {
    id:6, name:'ここ', hairColorMain:'#7A3C10',
    skinColor:'#F5C8A4', eyeColor:'#44380A',
    jacketColor:'#F0EAC8', jacketDark:'#DDD8A8',
    dressColor:'#FFD700', flowerColor:'#FFD700', flowerType:'daisy',
    pantColor:'#FFD040', patchColors:['#FFE060','#FFCC30','#FFEE98'],
    shoeColor:'#BBAA00', freckles:true, boots:false,
    hairBack:`
      <path d="M 47 86 Q 48 26 100 20 Q 152 26 153 86 L 153 138 L 47 138 Z" fill="#7A3C10"/>`,
    hairFront:`
      <path d="M 47 86 Q 50 46 100 32 Q 150 46 153 86 Q 143 64 100 60 Q 57 64 47 86 Z" fill="#7A3C10"/>
      <!-- 前髪（短め） -->
      <rect x="54" y="58" width="92" height="6" rx="3" fill="#7A3C10"/>
      <!-- 右サイドの三つ編み -->
      <path d="M 150 136 Q 156 158 150 178 Q 144 198 150 218 Q 156 238 150 255" stroke="#7A3C10" stroke-width="15" fill="none" stroke-linecap="round"/>
      <path d="M 150 136 Q 144 158 150 178 Q 156 198 150 218 Q 144 238 148 255" stroke="#5A2C08" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.55"/>
      <!-- 先端リボン -->
      <ellipse cx="150" cy="256" rx="8" ry="5" fill="#FFD700"/>`,
  },

  // 7. みく ── 黒のツインブレイド
  {
    id:7, name:'みく', hairColorMain:'#1A1010',
    skinColor:'#8C5428', eyeColor:'#2A1040',
    jacketColor:'#7755CC', jacketDark:'#5533BB',
    dressColor:'#CCAAFF', flowerColor:'#9966AA', flowerType:'lavender',
    pantColor:'#AAAACC', patchColors:['#BBAADD','#AABBCC','#CCBBEE'],
    shoeColor:'#7788AA', freckles:false, boots:false,
    hairBack:`
      <path d="M 47 86 Q 48 26 100 20 Q 152 26 153 86 L 153 136 L 47 136 Z" fill="#1A1010"/>`,
    hairFront:`
      <path d="M 47 86 Q 50 46 100 32 Q 150 46 153 86 Q 143 64 100 60 Q 57 64 47 86 Z" fill="#1A1010"/>
      <!-- 前髪（短め） -->
      <rect x="54" y="58" width="92" height="6" rx="3" fill="#1A1010"/>
      <!-- 左三つ編み -->
      <path d="M 50 134 Q 44 156 50 176 Q 56 196 50 216 Q 44 232 48 248" stroke="#1A1010" stroke-width="15" fill="none" stroke-linecap="round"/>
      <path d="M 50 134 Q 56 156 50 176 Q 44 196 50 216 Q 56 232 52 248" stroke="#333344" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.5"/>
      <!-- 右三つ編み -->
      <path d="M 150 134 Q 156 156 150 176 Q 144 196 150 216 Q 156 232 152 248" stroke="#1A1010" stroke-width="15" fill="none" stroke-linecap="round"/>
      <path d="M 150 134 Q 144 156 150 176 Q 156 196 150 216 Q 144 232 148 248" stroke="#333344" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.5"/>`,
  },

  // 8. りん ── 濃い茶のミディアムストレート
  {
    id:8, name:'りん', hairColorMain:'#2A1808',
    skinColor:'#C07840', eyeColor:'#2A1608',
    jacketColor:'#336633', jacketDark:'#224422',
    dressColor:'#44AA66', flowerColor:'#227744', flowerType:'fern',
    pantColor:'#4A6040', patchColors:['#448844','#6A7844','#558855'],
    shoeColor:'#334422', freckles:false, boots:false,
    hairBack:`
      <path d="M 44 86 Q 46 24 100 18 Q 154 24 156 86 L 158 180 Q 148 200 100 202 Q 52 200 42 180 Z" fill="#2A1808"/>`,
    hairFront:`
      <path d="M 44 86 Q 48 44 100 30 Q 152 44 156 86 Q 146 60 100 56 Q 54 60 44 86 Z" fill="#2A1808"/>
      <!-- ストレート前髪（短め） -->
      <rect x="52" y="56" width="96" height="8" rx="4" fill="#2A1808"/>
      <!-- サイドストランド（左） -->
      <path d="M 46 88 Q 40 118 42 160 L 52 158 Q 52 120 56 90 Z" fill="#2A1808"/>
      <!-- サイドストランド（右） -->
      <path d="M 154 88 Q 160 118 158 160 L 148 158 Q 148 120 144 90 Z" fill="#2A1808"/>`,
  },

  // 9. はな ── クリームのウェービー＋花の冠
  {
    id:9, name:'はな', hairColorMain:'#DDD8C8',
    skinColor:'#FDDCC0', eyeColor:'#5544AA',
    jacketColor:'#FFAA44', jacketDark:'#EE8822',
    dressColor:'#FFF8E8', flowerColor:'#FF88CC', flowerType:'mixed',
    pantColor:'#FFCCDD', patchColors:['#FFDDAA','#AADEFC','#FFBBEE'],
    shoeColor:'#4488CC', freckles:false, boots:false,
    hairBack:`
      <path d="M 44 86 Q 46 24 100 18 Q 154 24 156 86 L 160 188 Q 150 208 100 210 Q 50 208 40 188 Z" fill="#DDD8C8"/>`,
    hairFront:`
      <path d="M 44 86 Q 48 44 100 30 Q 152 44 156 86 Q 146 60 100 56 Q 54 60 44 86 Z" fill="#DDD8C8"/>
      <!-- 前髪（短め） -->
      <rect x="52" y="56" width="96" height="8" rx="4" fill="#DDD8C8"/>
      <!-- ウェービーサイド（左） -->
      <path d="M 44 88 Q 36 118 40 152 Q 44 168 38 186 L 48 184 Q 52 168 48 152 Q 44 120 52 90 Z" fill="#DDD8C8"/>
      <!-- ウェービーサイド（右） -->
      <path d="M 156 88 Q 164 118 160 152 Q 156 168 162 186 L 152 184 Q 148 168 152 152 Q 156 120 148 90 Z" fill="#DDD8C8"/>
      <!-- 花の冠 -->
      <path d="M 42 70 Q 44 50 100 44 Q 156 50 158 70" stroke="#88CC44" stroke-width="3" fill="none"/>
      <circle cx="60"  cy="56" r="9" fill="#FF88CC"/><circle cx="60"  cy="56" r="5" fill="#FFE0AA"/>
      <circle cx="76"  cy="46" r="9" fill="#FFCC44"/><circle cx="76"  cy="46" r="5" fill="#FFE0AA"/>
      <circle cx="100" cy="44" r="9" fill="#FF6699"/><circle cx="100" cy="44" r="5" fill="#FFE0AA"/>
      <circle cx="124" cy="46" r="9" fill="#88CCFF"/><circle cx="124" cy="46" r="5" fill="#FFE0AA"/>
      <circle cx="140" cy="56" r="9" fill="#AAEE88"/><circle cx="140" cy="56" r="5" fill="#FFE0AA"/>`,
  },

  // 10. まい ── 黒のツインブレイド＋白ニット帽
  {
    id:10, name:'まい', hairColorMain:'#1A1808',
    skinColor:'#CC8848', eyeColor:'#3A2010',
    jacketColor:'#F0ECD8', jacketDark:'#DDD8C0',
    dressColor:'#FFCC44', flowerColor:'#FF88CC', flowerType:'generic',
    pantColor:'#888899', patchColors:['#AADDAA','#FFE0AA','#AACCEE'],
    shoeColor:'#7A5030', freckles:false, boots:true,
    hairBack:`
      <path d="M 47 86 Q 48 26 100 20 Q 152 26 153 86 L 153 134 L 47 134 Z" fill="#1A1808"/>`,
    hairFront:`
      <!-- 三つ編み（左） -->
      <path d="M 50 132 Q 44 154 50 174 Q 56 194 50 214 Q 44 230 48 246" stroke="#1A1808" stroke-width="15" fill="none" stroke-linecap="round"/>
      <path d="M 50 132 Q 56 154 50 174 Q 44 194 50 214 Q 56 230 52 246" stroke="#333322" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.5"/>
      <!-- 三つ編み（右） -->
      <path d="M 150 132 Q 156 154 150 174 Q 144 194 150 214 Q 156 230 152 246" stroke="#1A1808" stroke-width="15" fill="none" stroke-linecap="round"/>
      <path d="M 150 132 Q 144 154 150 174 Q 156 194 150 214 Q 144 230 148 246" stroke="#333322" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.5"/>
      <!-- ニット帽（ドームとつばを一体で塗りつぶし） -->
      <path d="M 36 42 Q 38 20 100 14 Q 162 20 164 42 Z" fill="#F0ECD8"/>
      <rect x="34" y="40" width="132" height="24" rx="12" fill="#F0ECD8"/>
      <!-- ポンポン -->
      <circle cx="100" cy="14" r="14" fill="#F0ECD8"/>
      <circle cx="100" cy="14" r="9"  fill="#E8E4D0"/>
      <!-- 帽子の花 -->
      <circle cx="120" cy="52" r="8" fill="#FF88CC"/>
      <circle cx="120" cy="52" r="4.5" fill="#FFE0AA"/>`,
  },
];

// 10人のキャラクターを生成
const GIRLS = GIRLS_CONFIG.map(cfg => ({
  ...cfg,
  svg: buildGirlSVG(cfg),
}));
