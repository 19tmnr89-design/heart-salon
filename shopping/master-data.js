// マスター食材のプリセットと、売り場の並び順。
//
// このファイルの中身は Firestore には保存しません（コード側が唯一の出所）。
// ユーザーが編集した「選び方のコツ」や、あとから追加したカスタム品目、
// 使用回数などの差分だけを Firestore の master_meta に保存し、表示時に重ねます。
// → プリセットを増やしたいときは、このファイルを編集すれば全端末に反映されます。

// 売り場を回る順番。買い物モードのグループ表示はこの順に並びます。
export const CATEGORY_ORDER = [
  "野菜",
  "きのこ",
  "果物",
  "大豆製品",
  "加工品",
  "肉",
  "魚",
  "調味料",
  "日配",
  "乳製品",
  "飲み物",
  "日用品",
  "その他"
];

// 数量の単位候補（編集モーダルのプルダウン）
export const UNIT_OPTIONS = [
  "個", "袋", "本", "パック", "束", "玉", "房", "丁", "枚", "尾", "切れ",
  "缶", "箱", "節", "杯", "セット", "g", "kg", "ml", "L"
];

// name はマスターの識別子も兼ねるため、重複しないようにしてください。
export const MASTER_PRESET = [
  /* ---------------- 野菜 ---------------- */
  { name: "オクラ", category: "野菜", unit: "袋", tip: "産毛が均一に生え、緑が濃く角がしっかりしているもの" },
  { name: "キュウリ", category: "野菜", unit: "本", tip: "トゲがチクチク痛いくらい尖っていて、太さが均一なもの" },
  { name: "トマト", category: "野菜", unit: "個", tip: "ヘタがピンと張っていて、お尻から放射状の筋が見えるもの" },
  { name: "ミニトマト", category: "野菜", unit: "パック", tip: "皮にハリがあり、ヘタが濃い緑色で枯れていないもの" },
  { name: "ナス", category: "野菜", unit: "本", tip: "トゲが鋭く、ヘタの下が白や紫に伸びていて皮にツヤがあるもの" },
  { name: "ピーマン", category: "野菜", unit: "袋", tip: "皮にハリとツヤがあり、ヘタの切り口がみずみずしいもの" },
  { name: "キャベツ", category: "野菜", unit: "玉", tip: "巻きが固く、持ったときにずっしり重いもの" },
  { name: "レタス", category: "野菜", unit: "玉", tip: "持ったときに軽めで、葉の巻きがふんわり柔らかいもの" },
  { name: "白菜", category: "野菜", unit: "個", yomi: "はくさい", tip: "葉が隙間なく詰まっていて、切り口が平らなもの" },
  { name: "ほうれん草", category: "野菜", unit: "束", yomi: "ほうれんそう", tip: "葉が濃い緑で厚みがあり、根元の赤みが強いもの" },
  { name: "小松菜", category: "野菜", unit: "束", yomi: "こまつな", tip: "葉が肉厚で鮮やかな緑色、茎が太すぎないもの" },
  { name: "チンゲン菜", category: "野菜", unit: "袋", yomi: "ちんげんさい", tip: "根元がどっしり丸く太く、葉がみずみずしいもの" },
  { name: "ブロッコリー", category: "野菜", unit: "個", tip: "つぼみが固く密集し、中央がこんもり盛り上がっているもの" },
  { name: "アスパラ", category: "野菜", unit: "束", tip: "穂先が固く締まり、茎の太さが均一でハカマが正三角形のもの" },
  { name: "ニンジン", category: "野菜", unit: "本", tip: "オレンジ色が濃く、ヘタの切り口が小さいもの" },
  { name: "タマネギ", category: "野菜", unit: "個", tip: "頭部が固く締まり、皮がしっかり乾燥してツヤがあるもの" },
  { name: "ジャガイモ", category: "野菜", unit: "個", tip: "皮にしわがなく、芽が出ていない・緑色に変色していないもの" },
  { name: "ダイコン", category: "野菜", unit: "本", tip: "白くてハリがあり、毛穴が浅くて一直線に並んでいるもの" },
  { name: "カボチャ", category: "野菜", unit: "個", tip: "ヘタが乾燥してコルク状になっており、持ったとき重いもの" },
  { name: "サツマイモ", category: "野菜", unit: "本", tip: "ふっくらと太く、皮の色が鮮やかでツヤがあるもの" },
  { name: "ごぼう", category: "野菜", unit: "本", tip: "太さが均一でひび割れがなく、土付きのもの" },
  { name: "枝豆", category: "野菜", unit: "袋", yomi: "えだまめ", tip: "さやの産毛がしっかりあり、豆の膨らみが揃っているもの" },
  { name: "とうもろこし", category: "野菜", unit: "本", tip: "皮が濃い緑色で、ヒゲが褐色〜黒褐色に熟しているもの" },
  { name: "もやし", category: "野菜", unit: "袋", tip: "茎が白く太く折れていないもの、水が出ていないもの" },
  { name: "青ネギ", category: "野菜", unit: "束", yomi: "あおねぎ", tip: "葉先までピンと伸び、緑と白の境目がはっきりしているもの" },
  { name: "小さいネギ", category: "野菜", unit: "束", yomi: "ちいさいねぎ", tip: "葉先が黄色く変色しておらず、みずみずしいもの" },
  { name: "にんにく", category: "野菜", unit: "個", tip: "粒が固く締まり、外皮が白く乾燥しているもの" },
  { name: "ミョウガ", category: "野菜", unit: "パック", tip: "赤みが鮮やかで先端が開きすぎていない、身が締まったもの" },
  { name: "サンチュ", category: "野菜", unit: "袋", tip: "葉にハリがあり、切り口が変色していないもの" },
  { name: "ベビーリーフ", category: "野菜", unit: "袋", tip: "パック内に水滴が溜まっておらず、葉先がシャキッとしているもの" },
  { name: "とうみょう", category: "野菜", unit: "パック", tip: "茎が太く真っ直ぐ伸び、葉が黄色くなっていないもの" },
  { name: "貝割れ", category: "野菜", unit: "パック", yomi: "かいわれ", tip: "葉が均一に開いており、軸がシャキッと立っているもの" },
  { name: "スプラウト", category: "野菜", unit: "パック", tip: "根元が変色しておらず、みずみずしいもの" },
  { name: "たけのこ", category: "野菜", unit: "本", tip: "小ぶりで太く、先端が黄色いもの（緑はアクが強い）" },
  { name: "生姜", category: "野菜", unit: "個", yomi: "しょうが", tip: "皮にツヤとハリがあり、切り口が乾いていないもの" },
  { name: "長ネギ", category: "野菜", unit: "本", yomi: "ながねぎ", tip: "白い部分が長く締まっていて、巻きが固いもの" },
  { name: "ニラ", category: "野菜", unit: "束", tip: "葉の幅が広く肉厚で、切り口がみずみずしいもの" },
  { name: "レンコン", category: "野菜", unit: "節", tip: "ふっくら太く、穴が小さめで切り口が変色していないもの" },
  { name: "水菜", category: "野菜", unit: "袋", yomi: "みずな", tip: "葉先までシャキッとしていて、茎が細く白いもの" },
  { name: "カット野菜", category: "野菜", unit: "袋", yomi: "かっとやさい", tip: "賞味期限を確認（袋が膨らんでいないもの）" },

  /* ---------------- きのこ ---------------- */
  { name: "しいたけ", category: "きのこ", unit: "パック", tip: "傘が開ききっておらず、肉厚で裏のヒダが白いもの" },
  { name: "えのき", category: "きのこ", unit: "袋", tip: "全体が白くハリがあり、軸が束になってしっかりしているもの" },
  { name: "ブナシメジ", category: "きのこ", unit: "パック", tip: "傘が小ぶりで開きすぎておらず、全体にハリがあるもの" },
  { name: "マイタケ", category: "きのこ", unit: "パック", tip: "カサの色が濃く、触るとパリッと折れそうなハリがあるもの" },
  { name: "エリンギ", category: "きのこ", unit: "パック", tip: "軸が太くて白く、傘が開きすぎていないもの" },
  { name: "マッシュルーム", category: "きのこ", unit: "パック", tip: "傘がしっかり閉じており、傷や変色がないもの" },
  { name: "なめこ", category: "きのこ", unit: "袋", tip: "粒が揃っていて、ぬめりに濁りがないもの" },

  /* ---------------- 果物 ---------------- */
  { name: "バナナ", category: "果物", unit: "房", tip: "房の付け根が太くしっかりしており、傷がないもの" },
  { name: "りんご", category: "果物", unit: "個", tip: "お尻が黄色みを帯び、持つとずっしり重いもの" },
  { name: "みかん", category: "果物", unit: "袋", tip: "皮が薄くヘタが小さい、扁平で色が濃いもの" },
  { name: "いちご", category: "果物", unit: "パック", tip: "ヘタが濃い緑で反り返り、粒の表面にツヤがあるもの" },
  { name: "キウイ", category: "果物", unit: "個", tip: "軽く握って全体が均一に少しへこむくらいが食べ頃" },
  { name: "ぶどう", category: "果物", unit: "房", tip: "軸が緑色で、皮に白い粉（ブルーム）がついているもの" },

  /* ---------------- 大豆製品 ---------------- */
  { name: "豆腐", category: "大豆製品", unit: "丁", yomi: "とうふ", tip: "賞味期限を確認（木綿か絹かも注意）" },
  { name: "納豆", category: "大豆製品", unit: "パック", yomi: "なっとう", tip: "賞味期限を確認（粒サイズ・タレの種類に注意）" },
  { name: "油揚げ", category: "大豆製品", unit: "袋", yomi: "あぶらあげ", tip: "色が濃すぎず、油の酸化した匂いがないもの" },
  { name: "厚揚げ", category: "大豆製品", unit: "パック", yomi: "あつあげ", tip: "角が崩れておらず、表面が乾いていないもの" },

  /* ---------------- 加工品 ---------------- */
  { name: "こんにゃく", category: "加工品", unit: "枚", tip: "板こんにゃく・しらたき等、用途を確認" },
  { name: "キムチ", category: "加工品", unit: "パック", tip: "発酵度合いや賞味期限を確認" },
  { name: "ちくわ", category: "加工品", unit: "袋", tip: "" },
  { name: "かまぼこ", category: "加工品", unit: "本", tip: "" },
  { name: "サラダチキン", category: "加工品", unit: "個", tip: "" },

  /* ---------------- 肉 ---------------- */
  { name: "鶏むね肉", category: "肉", unit: "パック", yomi: "とりむねにく", tip: "身が厚く、ピンクがかった透明感があるもの（白すぎるものは避ける）" },
  { name: "鶏もも肉", category: "肉", unit: "パック", yomi: "とりももにく", tip: "皮に毛穴のブツブツがはっきりあり、ドリップが出ていないもの" },
  { name: "鶏ささみ", category: "肉", unit: "パック", yomi: "とりささみ", tip: "身が丸みを帯びて厚く、透明感のあるピンク色のもの" },
  { name: "豚こま切れ", category: "肉", unit: "パック", yomi: "ぶたこまぎれ", tip: "赤身が淡いピンクで、脂身が白くベタついていないもの" },
  { name: "豚バラ", category: "肉", unit: "パック", yomi: "ぶたばら", tip: "赤身と脂身の層がはっきり分かれているもの" },
  { name: "豚ロース", category: "肉", unit: "パック", yomi: "ぶたろーす", tip: "赤身が明るいピンクで、脂身との境目がくっきりしているもの" },
  { name: "牛こま切れ", category: "肉", unit: "パック", yomi: "ぎゅうこまぎれ", tip: "鮮やかな赤色のもの（黒ずんだものは時間が経っている）" },
  { name: "合挽きミンチ", category: "肉", unit: "パック", yomi: "あいびきみんち", tip: "赤身部分が鮮やかで、全体が黒っぽくなっていないもの" },
  { name: "鶏ミンチ", category: "肉", unit: "パック", yomi: "とりみんち", tip: "白っぽいピンクで、水分が浮いていないもの" },
  { name: "ベーコン", category: "肉", unit: "パック", tip: "" },
  { name: "ウインナー", category: "肉", unit: "袋", tip: "" },
  { name: "ハム", category: "肉", unit: "パック", tip: "" },

  /* ---------------- 魚 ---------------- */
  { name: "鮭", category: "魚", unit: "切れ", yomi: "さけしゃけ", tip: "身の色が濃いオレンジで、皮と身の間に隙間がないもの" },
  { name: "ブリ", category: "魚", unit: "切れ", tip: "血合いが鮮やかな赤色で、身が白く締まっているもの" },
  { name: "サバ", category: "魚", unit: "切れ", tip: "皮の模様がくっきりして、身に透明感があるもの" },
  { name: "アジ", category: "魚", unit: "尾", tip: "目が澄んで、エラが鮮やかな赤色のもの" },
  { name: "サンマ", category: "魚", unit: "尾", tip: "口先が黄色く、背が青光りして太っているもの" },
  { name: "刺身", category: "魚", unit: "パック", yomi: "さしみ", tip: "ドリップが溜まっておらず、角が立っているもの" },
  { name: "エビ", category: "魚", unit: "パック", tip: "殻にハリがあり、頭と胴の境目が黒ずんでいないもの" },
  { name: "イカ", category: "魚", unit: "杯", tip: "皮が褐色で目が澄んでいるもの（白っぽいものは鮮度落ち）" },
  { name: "しらす", category: "魚", unit: "パック", tip: "" },
  { name: "ツナ缶", category: "魚", unit: "缶", yomi: "つなかん", tip: "" },

  /* ---------------- 調味料 ---------------- */
  { name: "醤油", category: "調味料", unit: "本", yomi: "しょうゆ", tip: "" },
  { name: "みりん", category: "調味料", unit: "本", tip: "" },
  { name: "料理酒", category: "調味料", unit: "本", yomi: "りょうりしゅ", tip: "" },
  { name: "砂糖", category: "調味料", unit: "袋", yomi: "さとう", tip: "" },
  { name: "塩", category: "調味料", unit: "袋", yomi: "しお", tip: "" },
  { name: "味噌", category: "調味料", unit: "パック", yomi: "みそ", tip: "" },
  { name: "酢", category: "調味料", unit: "本", yomi: "す", tip: "" },
  { name: "サラダ油", category: "調味料", unit: "本", yomi: "さらだあぶら", tip: "" },
  { name: "ごま油", category: "調味料", unit: "本", yomi: "ごまあぶら", tip: "" },
  { name: "オリーブオイル", category: "調味料", unit: "本", tip: "" },
  { name: "マヨネーズ", category: "調味料", unit: "本", tip: "" },
  { name: "ケチャップ", category: "調味料", unit: "本", tip: "" },
  { name: "ソース", category: "調味料", unit: "本", tip: "" },
  { name: "めんつゆ", category: "調味料", unit: "本", tip: "" },
  { name: "ポン酢", category: "調味料", unit: "本", yomi: "ぽんず", tip: "" },
  { name: "顆粒だし", category: "調味料", unit: "袋", yomi: "かりゅうだし", tip: "" },
  { name: "コンソメ", category: "調味料", unit: "箱", tip: "" },
  { name: "鶏がらスープの素", category: "調味料", unit: "個", yomi: "とりがらすーぷのもと", tip: "" },
  { name: "カレールー", category: "調味料", unit: "箱", tip: "" },
  { name: "片栗粉", category: "調味料", unit: "袋", yomi: "かたくりこ", tip: "" },
  { name: "小麦粉", category: "調味料", unit: "袋", yomi: "こむぎこ", tip: "" },
  { name: "パン粉", category: "調味料", unit: "袋", yomi: "ぱんこ", tip: "" },
  { name: "こしょう", category: "調味料", unit: "個", tip: "" },
  { name: "白ごま", category: "調味料", unit: "袋", yomi: "しろごま", tip: "" },

  /* ---------------- 日配 ---------------- */
  { name: "卵", category: "日配", unit: "パック", yomi: "たまご", tip: "ひび割れがないか、パックを開けて確認" },
  { name: "食パン", category: "日配", unit: "袋", yomi: "しょくぱん", tip: "枚数（4枚切/6枚切/8枚切）を確認" },
  { name: "うどん", category: "日配", unit: "袋", tip: "" },
  { name: "焼きそば麺", category: "日配", unit: "袋", yomi: "やきそばめん", tip: "" },
  { name: "中華麺", category: "日配", unit: "袋", yomi: "ちゅうかめん", tip: "" },
  { name: "パスタ", category: "日配", unit: "袋", tip: "" },
  { name: "ご飯パック", category: "日配", unit: "パック", yomi: "ごはんぱっく", tip: "" },
  { name: "餃子の皮", category: "日配", unit: "袋", yomi: "ぎょうざのかわ", tip: "" },
  { name: "米", category: "日配", unit: "袋", yomi: "こめ", tip: "" },

  /* ---------------- 乳製品 ---------------- */
  { name: "牛乳", category: "乳製品", unit: "本", yomi: "ぎゅうにゅう", tip: "賞味期限を確認（棚の奥ほど新しい）" },
  { name: "ヨーグルト", category: "乳製品", unit: "個", tip: "賞味期限を確認" },
  { name: "スライスチーズ", category: "乳製品", unit: "袋", tip: "" },
  { name: "ピザ用チーズ", category: "乳製品", unit: "袋", yomi: "ぴざようちーず", tip: "" },
  { name: "バター", category: "乳製品", unit: "箱", tip: "" },
  { name: "生クリーム", category: "乳製品", unit: "パック", yomi: "なまくりーむ", tip: "" },
  { name: "豆乳", category: "乳製品", unit: "本", yomi: "とうにゅう", tip: "" },

  /* ---------------- 飲み物 ---------------- */
  { name: "お茶", category: "飲み物", unit: "本", yomi: "おちゃ", tip: "" },
  { name: "麦茶パック", category: "飲み物", unit: "袋", yomi: "むぎちゃぱっく", tip: "" },
  { name: "水", category: "飲み物", unit: "本", yomi: "みず", tip: "" },
  { name: "炭酸水", category: "飲み物", unit: "本", yomi: "たんさんすい", tip: "" },
  { name: "ジュース", category: "飲み物", unit: "本", tip: "" },
  { name: "ビール", category: "飲み物", unit: "箱", tip: "" },
  { name: "コーヒー", category: "飲み物", unit: "袋", tip: "" },

  /* ---------------- 日用品 ---------------- */
  { name: "トイレットペーパー", category: "日用品", unit: "袋", tip: "" },
  { name: "ティッシュ", category: "日用品", unit: "箱", tip: "" },
  { name: "食器用洗剤", category: "日用品", unit: "本", yomi: "しょっきようせんざい", tip: "" },
  { name: "洗濯洗剤", category: "日用品", unit: "個", yomi: "せんたくせんざい", tip: "" },
  { name: "ゴミ袋", category: "日用品", unit: "袋", yomi: "ごみぶくろ", tip: "サイズ（30L/45L）を確認" },
  { name: "ラップ", category: "日用品", unit: "本", tip: "" },
  { name: "アルミホイル", category: "日用品", unit: "本", tip: "" },
  { name: "キッチンペーパー", category: "日用品", unit: "袋", tip: "" },
  { name: "ジップ袋", category: "日用品", unit: "箱", yomi: "じっぷぶくろ", tip: "" }
];
