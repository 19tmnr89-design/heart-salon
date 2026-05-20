// 髪型20種のSVGデータ
// back: 頭の後ろ（顔の下に描画）
// front: 前髪など（顔の上に描画）
// icon: 選択アイコン用（50×70 viewBox）

// 頭の基準: cx=100, cy=84, r=62  (200×340 SVG)

const HAIRSTYLES = [
  {
    id: 1,
    name: 'ショートストレート',
    back: `<path d="M 42 84 Q 42 28 100 22 Q 158 28 158 84 Q 158 110 154 138 L 46 138 Q 42 110 42 84 Z"/>`,
    front: `<path d="M 42 84 Q 44 46 100 30 Q 156 46 158 84 Q 148 58 100 54 Q 52 58 42 84 Z"/>
<path d="M 44 86 Q 56 50 84 40 L 80 66 Z"/>
<path d="M 156 86 Q 144 50 116 40 L 120 66 Z"/>`,
    icon: `<ellipse cx="25" cy="32" rx="20" ry="22" fill="currentColor"/>
<rect x="5" y="32" width="40" height="22" rx="0" fill="currentColor"/>
<rect x="5" y="46" width="40" height="8" rx="3" fill="currentColor"/>`,
  },
  {
    id: 2,
    name: 'ショートウェーブ',
    back: `<path d="M 42 84 Q 42 28 100 22 Q 158 28 158 84 Q 158 110 154 138 L 46 138 Q 42 110 42 84 Z"/>`,
    front: `<path d="M 42 86 Q 45 48 100 32 Q 155 48 158 86 Q 148 60 100 56 Q 52 60 42 86 Z"/>
<path d="M 44 88 Q 52 56 76 44 Q 64 50 62 68 Z"/>
<path d="M 156 88 Q 148 56 124 44 Q 136 50 138 68 Z"/>
<path d="M 62 88 Q 70 60 88 52 Q 78 58 78 72 Z"/>
<path d="M 138 88 Q 130 60 112 52 Q 122 58 122 72 Z"/>`,
    icon: `<ellipse cx="25" cy="32" rx="20" ry="22" fill="currentColor"/>
<path d="M 5 46 Q 12 52 19 46 Q 26 52 33 46 Q 40 52 45 46 L 45 54 Q 40 60 33 54 Q 26 60 19 54 Q 12 60 5 54 Z" fill="currentColor"/>`,
  },
  {
    id: 3,
    name: 'ボブ（あごライン）',
    back: `<path d="M 36 84 Q 36 22 100 18 Q 164 22 164 84 Q 164 130 160 150 Q 140 165 100 166 Q 60 165 40 150 Q 36 130 36 84 Z"/>`,
    front: `<path d="M 38 86 Q 42 46 100 30 Q 158 46 162 86 Q 150 60 100 56 Q 50 60 38 86 Z"/>
<path d="M 40 88 Q 50 52 78 40 L 74 66 Z"/>
<path d="M 160 88 Q 150 52 122 40 L 126 66 Z"/>`,
    icon: `<ellipse cx="25" cy="28" rx="20" ry="22" fill="currentColor"/>
<rect x="5" y="28" width="40" height="30" rx="3" fill="currentColor"/>`,
  },
  {
    id: 4,
    name: 'ウェーブボブ',
    back: `<path d="M 36 84 Q 36 22 100 18 Q 164 22 164 84 Q 164 128 156 148 Q 136 165 100 166 Q 64 165 44 148 Q 36 128 36 84 Z"/>`,
    front: `<path d="M 38 86 Q 42 46 100 30 Q 158 46 162 86 Q 150 60 100 56 Q 50 60 38 86 Z"/>
<path d="M 38 150 Q 50 156 62 150 Q 74 156 86 150 Q 92 160 100 162 Q 108 160 114 150 Q 126 156 138 150 Q 150 156 162 150" stroke="currentColor" stroke-width="6" fill="none"/>`,
    icon: `<ellipse cx="25" cy="28" rx="20" ry="22" fill="currentColor"/>
<path d="M 5 48 Q 12 56 19 48 Q 26 56 33 48 Q 40 56 45 48 L 45 58 Q 38 64 33 56 Q 26 64 19 56 Q 12 64 5 58 Z" fill="currentColor"/>`,
  },
  {
    id: 5,
    name: 'ミディアムストレート',
    back: `<path d="M 38 84 Q 38 22 100 18 Q 162 22 162 84 L 162 190 Q 148 210 100 212 Q 52 210 38 190 Z"/>`,
    front: `<path d="M 40 86 Q 44 46 100 30 Q 156 46 160 86 Q 148 60 100 56 Q 52 60 40 86 Z"/>
<path d="M 42 88 Q 54 52 82 40 L 78 68 Z"/>
<path d="M 158 88 Q 146 52 118 40 L 122 68 Z"/>`,
    icon: `<ellipse cx="25" cy="25" rx="20" ry="20" fill="currentColor"/>
<rect x="5" y="25" width="12" height="40" rx="4" fill="currentColor"/>
<rect x="33" y="25" width="12" height="40" rx="4" fill="currentColor"/>`,
  },
  {
    id: 6,
    name: 'ミディアムウェーブ',
    back: `<path d="M 38 84 Q 38 22 100 18 Q 162 22 162 84 L 158 190 Q 144 210 100 212 Q 56 210 42 190 Z"/>`,
    front: `<path d="M 40 86 Q 44 46 100 30 Q 156 46 160 86 Q 148 60 100 56 Q 52 60 40 86 Z"/>
<path d="M 40 170 Q 50 176 60 168 Q 70 176 80 168"/>
<path d="M 160 170 Q 150 176 140 168 Q 130 176 120 168"/>`,
    icon: `<ellipse cx="25" cy="25" rx="20" ry="20" fill="currentColor"/>
<path d="M 5 42 Q 11 50 17 42 L 17 65 Q 11 58 5 65 Z" fill="currentColor"/>
<path d="M 33 42 Q 39 50 45 42 L 45 65 Q 39 58 33 65 Z" fill="currentColor"/>`,
  },
  {
    id: 7,
    name: 'ロングストレート',
    back: `<path d="M 36 84 Q 36 20 100 16 Q 164 20 164 84 L 164 260 Q 148 275 100 276 Q 52 275 36 260 Z"/>`,
    front: `<path d="M 38 86 Q 42 44 100 28 Q 158 44 162 86 Q 148 58 100 54 Q 52 58 38 86 Z"/>
<path d="M 40 88 Q 52 50 80 38 L 76 68 Z"/>
<path d="M 160 88 Q 148 50 120 38 L 124 68 Z"/>`,
    icon: `<ellipse cx="25" cy="20" rx="20" ry="18" fill="currentColor"/>
<rect x="5" y="20" width="12" height="48" rx="4" fill="currentColor"/>
<rect x="33" y="20" width="12" height="48" rx="4" fill="currentColor"/>`,
  },
  {
    id: 8,
    name: 'ロングウェーブ',
    back: `<path d="M 36 84 Q 36 20 100 16 Q 164 20 164 84 L 160 258 Q 144 274 100 275 Q 56 274 40 258 Z"/>`,
    front: `<path d="M 38 86 Q 42 44 100 28 Q 158 44 162 86 Q 148 58 100 54 Q 52 58 38 86 Z"/>
<path d="M 38 200 Q 46 210 54 202 Q 62 210 70 202 Q 76 210 84 202"/>
<path d="M 162 200 Q 154 210 146 202 Q 138 210 130 202 Q 124 210 116 202"/>`,
    icon: `<ellipse cx="25" cy="20" rx="20" ry="18" fill="currentColor"/>
<path d="M 5 38 Q 11 46 17 38 L 17 68 Q 11 60 5 68 Z" fill="currentColor"/>
<path d="M 33 38 Q 39 46 45 38 L 45 68 Q 39 60 33 68 Z" fill="currentColor"/>`,
  },
  {
    id: 9,
    name: 'ツインテール（低め）',
    back: `<path d="M 42 84 Q 42 28 100 22 Q 158 28 158 84 Q 158 110 154 138 L 46 138 Q 42 110 42 84 Z"/>
<path d="M 42 128 Q 28 140 22 168 Q 20 185 30 188 Q 40 192 46 175 Q 52 158 50 138"/>
<path d="M 158 128 Q 172 140 178 168 Q 180 185 170 188 Q 160 192 154 175 Q 148 158 150 138"/>`,
    front: `<path d="M 44 86 Q 48 50 100 32 Q 152 50 156 86 Q 146 62 100 58 Q 54 62 44 86 Z"/>`,
    icon: `<ellipse cx="25" cy="28" rx="18" ry="20" fill="currentColor"/>
<ellipse cx="8" cy="52" rx="7" ry="14" fill="currentColor" transform="rotate(-15 8 52)"/>
<ellipse cx="42" cy="52" rx="7" ry="14" fill="currentColor" transform="rotate(15 42 52)"/>`,
  },
  {
    id: 10,
    name: 'ツインテール（高め）',
    back: `<path d="M 42 84 Q 42 28 100 22 Q 158 28 158 84 Q 158 110 154 138 L 46 138 Q 42 110 42 84 Z"/>
<path d="M 48 46 Q 30 30 18 50 Q 10 70 20 85 Q 30 98 42 88"/>
<path d="M 152 46 Q 170 30 182 50 Q 190 70 180 85 Q 170 98 158 88"/>`,
    front: `<path d="M 44 86 Q 48 50 100 32 Q 152 50 156 86 Q 146 62 100 58 Q 54 62 44 86 Z"/>
<circle cx="52" cy="44" r="8" fill="currentColor"/>
<circle cx="148" cy="44" r="8" fill="currentColor"/>`,
    icon: `<ellipse cx="25" cy="32" rx="18" ry="20" fill="currentColor"/>
<ellipse cx="8" cy="18" rx="6" ry="16" fill="currentColor" transform="rotate(-20 8 18)"/>
<ellipse cx="42" cy="18" rx="6" ry="16" fill="currentColor" transform="rotate(20 42 18)"/>`,
  },
  {
    id: 11,
    name: 'ポニーテール',
    back: `<path d="M 42 84 Q 42 28 100 22 Q 158 28 158 84 Q 158 110 154 138 L 46 138 Q 42 110 42 84 Z"/>
<path d="M 94 24 Q 92 20 100 18 Q 108 20 106 24 Q 110 24 116 30 Q 122 50 118 80 Q 114 110 108 140 Q 104 168 100 180 Q 96 168 92 140 Q 86 110 82 80 Q 78 50 84 30 Q 90 24 94 24 Z"/>`,
    front: `<path d="M 44 86 Q 48 50 100 32 Q 152 50 156 86 Q 146 62 100 58 Q 54 62 44 86 Z"/>
<ellipse cx="100" cy="26" rx="10" ry="7" fill="currentColor"/>`,
    icon: `<ellipse cx="25" cy="28" rx="18" ry="20" fill="currentColor"/>
<ellipse cx="25" cy="6" rx="8" ry="6" fill="currentColor"/>
<rect x="22" y="6" width="6" height="38" rx="3" fill="currentColor"/>`,
  },
  {
    id: 12,
    name: '高いお団子',
    back: `<path d="M 42 84 Q 42 28 100 22 Q 158 28 158 84 Q 158 110 154 138 L 46 138 Q 42 110 42 84 Z"/>`,
    front: `<path d="M 44 86 Q 48 50 100 32 Q 152 50 156 86 Q 146 62 100 58 Q 54 62 44 86 Z"/>
<circle cx="100" cy="14" r="18" fill="currentColor"/>
<path d="M 82 28 Q 86 18 100 14 Q 114 18 118 28" stroke="currentColor" stroke-width="4" fill="none"/>`,
    icon: `<circle cx="25" cy="14" r="12" fill="currentColor"/>
<ellipse cx="25" cy="32" rx="18" ry="20" fill="currentColor"/>`,
  },
  {
    id: 13,
    name: '低いお団子',
    back: `<path d="M 42 84 Q 42 28 100 22 Q 158 28 158 84 Q 158 110 154 138 L 46 138 Q 42 110 42 84 Z"/>
<circle cx="100" cy="150" r="18" fill="currentColor"/>`,
    front: `<path d="M 44 86 Q 48 50 100 32 Q 152 50 156 86 Q 146 62 100 58 Q 54 62 44 86 Z"/>`,
    icon: `<ellipse cx="25" cy="28" rx="18" ry="20" fill="currentColor"/>
<circle cx="25" cy="58" r="12" fill="currentColor"/>`,
  },
  {
    id: 14,
    name: 'ハーフアップ',
    back: `<path d="M 38 84 Q 38 22 100 18 Q 162 22 162 84 L 162 185 Q 148 200 100 202 Q 52 200 38 185 Z"/>`,
    front: `<path d="M 40 86 Q 44 46 100 30 Q 156 46 160 86 Q 148 60 100 56 Q 52 60 40 86 Z"/>
<circle cx="100" cy="56" r="8" fill="currentColor"/>
<path d="M 88 56 Q 94 48 100 46 Q 106 48 112 56" stroke="currentColor" stroke-width="3" fill="none"/>`,
    icon: `<ellipse cx="25" cy="25" rx="20" ry="20" fill="currentColor"/>
<ellipse cx="25" cy="12" rx="10" ry="8" fill="currentColor" opacity="0.7"/>
<rect x="13" y="25" width="24" height="30" rx="4" fill="currentColor"/>`,
  },
  {
    id: 15,
    name: '編み込みポニー',
    back: `<path d="M 42 84 Q 42 28 100 22 Q 158 28 158 84 Q 158 110 154 138 L 46 138 Q 42 110 42 84 Z"/>
<path d="M 100 26 Q 96 28 94 36 Q 104 40 106 36 Q 104 44 94 46 Q 104 50 106 46 Q 104 54 94 56 Q 104 60 106 56 Q 104 68 100 76 Q 96 68 94 56 Q 104 52 106 46 Z" opacity="0.7"/>`,
    front: `<path d="M 44 86 Q 48 50 100 32 Q 152 50 156 86 Q 146 62 100 58 Q 54 62 44 86 Z"/>
<ellipse cx="100" cy="28" rx="10" ry="7" fill="currentColor"/>`,
    icon: `<ellipse cx="25" cy="28" rx="18" ry="20" fill="currentColor"/>
<ellipse cx="25" cy="6" rx="8" ry="6" fill="currentColor"/>
<path d="M 22 10 Q 25 16 28 10 Q 25 20 22 26 Q 25 20 28 26 Q 25 36 22 42 Q 25 36 28 42" stroke="currentColor" stroke-width="3" fill="none"/>`,
  },
  {
    id: 16,
    name: 'ショートツンツン',
    back: `<path d="M 44 84 Q 44 30 100 24 Q 156 30 156 84 Q 156 108 152 136 L 48 136 Q 44 108 44 84 Z"/>`,
    front: `<path d="M 100 22 Q 85 14 76 8 Q 80 18 78 28"/>
<path d="M 100 22 Q 92 12 88 6 Q 90 16 88 26"/>
<path d="M 100 22 Q 100 10 100 4 Q 100 14 100 24"/>
<path d="M 100 22 Q 108 12 112 6 Q 110 16 112 26"/>
<path d="M 100 22 Q 115 14 124 8 Q 120 18 122 28"/>
<path d="M 44 86 Q 48 52 100 34 Q 152 52 156 86 Q 144 64 100 60 Q 56 64 44 86 Z"/>`,
    icon: `<ellipse cx="25" cy="32" rx="18" ry="20" fill="currentColor"/>
<line x1="15" y1="16" x2="12" y2="4" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
<line x1="20" y1="14" x2="18" y2="2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
<line x1="25" y1="13" x2="25" y2="1" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
<line x1="30" y1="14" x2="32" y2="2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
<line x1="35" y1="16" x2="38" y2="4" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>`,
  },
  {
    id: 17,
    name: 'ふんわりショート',
    back: `<path d="M 36 84 Q 34 24 100 18 Q 166 24 164 84 Q 164 112 158 138 L 42 138 Q 36 112 36 84 Z"/>`,
    front: `<path d="M 36 88 Q 36 46 100 28 Q 164 46 164 88 Q 152 60 100 54 Q 48 60 36 88 Z"/>
<ellipse cx="40" cy="100" rx="14" ry="10" fill="currentColor"/>
<ellipse cx="160" cy="100" rx="14" ry="10" fill="currentColor"/>
<ellipse cx="50" cy="78" rx="12" ry="10" fill="currentColor"/>
<ellipse cx="150" cy="78" rx="12" ry="10" fill="currentColor"/>`,
    icon: `<ellipse cx="25" cy="32" rx="22" ry="22" fill="currentColor"/>
<ellipse cx="8" cy="38" rx="9" ry="7" fill="currentColor"/>
<ellipse cx="42" cy="38" rx="9" ry="7" fill="currentColor"/>`,
  },
  {
    id: 18,
    name: 'サイドアップ',
    back: `<path d="M 42 84 Q 42 28 100 22 Q 158 28 158 84 Q 158 130 154 148 Q 130 165 100 166 Q 70 165 48 148 Q 42 130 42 84 Z"/>`,
    front: `<path d="M 44 86 Q 48 50 100 32 Q 152 50 156 86 Q 144 62 100 58 Q 56 62 44 86 Z"/>
<path d="M 136 48 Q 148 36 158 40 Q 166 44 164 58 Q 158 68 148 62 Q 144 58 148 50 Z" fill="currentColor"/>
<circle cx="140" cy="46" r="7" fill="currentColor"/>`,
    icon: `<ellipse cx="25" cy="32" rx="18" ry="22" fill="currentColor"/>
<ellipse cx="42" cy="18" rx="10" ry="14" fill="currentColor" transform="rotate(20 42 18)"/>`,
  },
  {
    id: 19,
    name: 'ロングツインブレイド',
    back: `<path d="M 42 84 Q 42 28 100 22 Q 158 28 158 84 Q 158 110 154 138 L 46 138 Q 42 110 42 84 Z"/>
<path d="M 46 130 Q 42 160 38 200 Q 36 230 38 255 Q 42 260 48 255 Q 52 230 50 200 Q 50 170 54 140"/>
<path d="M 154 130 Q 158 160 162 200 Q 164 230 162 255 Q 158 260 152 255 Q 148 230 150 200 Q 150 170 146 140"/>`,
    front: `<path d="M 44 86 Q 48 50 100 32 Q 152 50 156 86 Q 144 62 100 58 Q 56 62 44 86 Z"/>`,
    icon: `<ellipse cx="25" cy="22" rx="18" ry="18" fill="currentColor"/>
<path d="M 8 40 Q 10 52 8 64 Q 10 52 12 64 Q 10 52 8 40 Z" fill="currentColor"/>
<path d="M 42 40 Q 44 52 42 64 Q 44 52 46 64 Q 44 52 42 40 Z" fill="currentColor"/>
<rect x="6" y="40" width="8" height="26" rx="3" fill="currentColor"/>
<rect x="36" y="40" width="8" height="26" rx="3" fill="currentColor"/>`,
  },
  {
    id: 20,
    name: 'くせっ毛ふわふわ',
    back: `<path d="M 30 84 Q 28 22 100 14 Q 172 22 170 84 Q 170 118 164 144 L 36 144 Q 30 118 30 84 Z"/>
<ellipse cx="30" cy="70" rx="16" ry="12" fill="currentColor"/>
<ellipse cx="170" cy="70" rx="16" ry="12" fill="currentColor"/>
<ellipse cx="36" cy="46" rx="14" ry="12" fill="currentColor"/>
<ellipse cx="164" cy="46" rx="14" ry="12" fill="currentColor"/>
<ellipse cx="66" cy="18" rx="16" ry="12" fill="currentColor"/>
<ellipse cx="134" cy="18" rx="16" ry="12" fill="currentColor"/>
<ellipse cx="100" cy="14" rx="18" ry="12" fill="currentColor"/>`,
    front: `<path d="M 32 88 Q 34 48 100 30 Q 166 48 168 88 Q 154 62 100 56 Q 46 62 32 88 Z"/>
<ellipse cx="40" cy="78" rx="12" ry="10" fill="currentColor"/>
<ellipse cx="160" cy="78" rx="12" ry="10" fill="currentColor"/>`,
    icon: `<ellipse cx="25" cy="32" rx="22" ry="22" fill="currentColor"/>
<ellipse cx="7" cy="26" rx="8" ry="6" fill="currentColor"/>
<ellipse cx="43" cy="26" rx="8" ry="6" fill="currentColor"/>
<ellipse cx="14" cy="14" rx="8" ry="6" fill="currentColor"/>
<ellipse cx="36" cy="14" rx="8" ry="6" fill="currentColor"/>
<ellipse cx="25" cy="10" rx="10" ry="6" fill="currentColor"/>`,
  },
];
