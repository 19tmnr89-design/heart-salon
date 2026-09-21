/* 手元の台帳から取り込む契約データ
 *
 * 設定タブの「用意してある契約を取り込む」で追加される。
 * id が一致する契約がすでにあれば、取り込みは行わない（二重登録の防止）。
 *
 * 金額は円。分からない項目は amount を null のままにし、limitText に証券の記載を入れている。
 */

const HOKEN_PRESETS = [
  {
    id: "INS-CHUDEN-001",
    category: "tanki",
    productType: "life_support",
    insurer: "中部電力ミライズ（引受保険会社または提携事業者）",
    productName: "ささえあい 基本プラン＋携行保証プラン",
    status: "active",
    startDate: "", endDate: "", isWholeLife: false,
    premium: { amount: 3050, cycle: "monthly", payUntilAge: null },
    paymentMethod: "電気料金合算 / クレジットカード",
    coveredPersons: "契約者本人および同居の親族",
    coverages: [
      {
        kind: "service",
        group: "生活トラブルサポート",
        title: "住まいの駆けつけサービス",
        details: "水回り、鍵、ガラスの破損などの一次対応（作業時間・出張費の一定枠無料）",
        limitText: "1回あたり30分〜60分程度の無料作業（部材費・特殊作業は自己負担）",
        amount: null, deductible: 0, termYears: null, minGuaranteeYears: null,
        exclusions: [], note: "",
      },
      {
        kind: "accident",
        group: "傷害補償",
        title: "日常生活・交通事故等のケガ",
        details: "不慮の事故による死亡・後遺障害、入院・通院の定額補償",
        limitText: "要証券確認（プラン規定の限度額）",
        amount: null, deductible: 0, termYears: null, minGuaranteeYears: null,
        exclusions: [], note: "",
      },
      {
        kind: "liability",
        group: "賠償責任",
        title: "個人賠償責任補償",
        details: "日常生活で他人にケガをさせたり他人の物を壊したときの賠償",
        limitText: "最大1億円〜（示談交渉サービスの有無は要証券確認）",
        amount: 100000000, deductible: 0, termYears: null, minGuaranteeYears: null,
        exclusions: [], note: "",
      },
      {
        kind: "property",
        group: "物損・盗難補償",
        title: "携行品損害補償",
        details: "住宅外で携行している本人所有の身の回り品（カメラ、時計、衣類、バッグ等）の破損・盗難",
        limitText: "1事故あたり10万〜30万円程度（通算限度額あり）",
        amount: null, deductible: 3000, termYears: null, minGuaranteeYears: null,
        exclusions: [
          "スマートフォン・携帯電話・タブレット端末（対象外または上限別枠のケースあり）",
          "現金、有価証券、電子マネー、定期券",
          "置き忘れ、紛失",
          "消耗、経年劣化、擦り傷等の外観損傷のみ",
        ],
        note: "免責3,000円は一般的な水準としての記載。証券で要確認。",
      },
    ],
    beneficiary: "",
    storageNote: "",
    contactNote: "",
    memo: "",
    /* 重複の可能性についての覚書。画面には出していない。 */
    overlapNotes: [
      "火災保険に付帯する『個人賠償特約』『携行品特約』と補償重複の可能性あり",
      "保有クレジットカードの付帯保険（携行品損害・個人賠償）と重複の可能性あり",
      "傷害入院・通院部分は高額療養費制度・傷病手当金とカバー範囲が競合",
      "自動車保険の『日常生活賠償特約』と重複の可能性あり",
    ],
  },
];
