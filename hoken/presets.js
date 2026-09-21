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
        limitText: "1事故あたり20万円（通算限度額あり）",
        amount: 200000, deductible: 3000, termYears: null, minGuaranteeYears: null,
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

  {
    id: "INS-NISSHIN-FIRE-001",
    category: "nonlife",
    productType: "fire",
    insurer: "日新火災海上保険",
    productName: "賃貸家財総合保険（マイ日新 管理契約）",
    status: "active",
    startDate: "", endDate: "", isWholeLife: false,
    /* 保険料は台帳に記載がないため未登録 */
    premium: { amount: 0, cycle: "annual", payUntilAge: null },
    paymentMethod: "クレジットカード（登録方式）",
    coveredPersons: "",
    contractTerms: {
      termType: "1年自動継続",
      renewalPeriod: "2027-08-02 16:00 〜 2028-08-02 16:00",
      clauses: [
        "初回保険料の払込みに関する特約【6Y】",
        "クレジットカードによる保険料支払に関する特約(登録方式)【2M】",
        "保険契約の自動継続に関する特約【94】",
        "賠償事故の解決に関する特約（示談交渉サービス）",
      ],
    },
    coverages: [
      {
        kind: "property",
        group: "家財補償",
        title: "家財一式（損害防止・残存物取片づけ含む）",
        details: "火災、破裂・爆発、水ぬれ、落雷、物体の飛来・落下、騒擾、風災・雹災・雪災、盗難、通貨・預貯金証書の盗難",
        limitText: "500,000円",
        amount: 500000, deductible: 0, termYears: null, minGuaranteeYears: null,
        conditions: [
          "風災・雹災・雪災は損害額20万円以上で対象",
          "盗難時の通貨は20万円、預貯金証書は200万円または家財保険金額のいずれか低い額が限度",
        ],
        exclusions: [], note: "",
      },
      {
        kind: "expense",
        group: "費用補償",
        title: "借用戸室の修理費用",
        details: "火災、破裂・爆発、水ぬれ、落雷、外部衝突、騒擾、風雹雪災、盗難により賃借住宅を修理した費用",
        limitText: "3,000,000円",
        amount: 3000000, deductible: 0, termYears: null, minGuaranteeYears: null,
        conditions: [], exclusions: [], note: "",
      },
      {
        kind: "liability",
        group: "賠償責任",
        title: "借家人賠償責任",
        details: "火災、破裂・爆発、給排水設備事故等による水ぬれで家主に対して負う法律上の損害賠償",
        limitText: "20,000,000円",
        amount: 20000000, deductible: 0, termYears: null, minGuaranteeYears: null,
        conditions: [], exclusions: [], note: "",
      },
      {
        kind: "liability",
        group: "賠償責任",
        title: "個人賠償責任（示談代行付）",
        details: "日常生活の偶然の事故で他人にケガをさせたり物を壊した賠償責任",
        limitText: "100,000,000円",
        amount: 100000000, deductible: 0, termYears: null, minGuaranteeYears: null,
        settlementService: true,
        conditions: [], exclusions: [], note: "",
      },
      {
        kind: "legal",
        group: "法務支援",
        title: "被害事故法律相談費用等",
        details: "自身が被害者となった事故における弁護士等への相談費用",
        limitText: "300,000円（年間通算）",
        amount: 300000, deductible: 0, termYears: null, minGuaranteeYears: null,
        conditions: [], exclusions: [], note: "",
      },
    ],
    beneficiary: "",
    storageNote: "",
    contactNote: "",
    memo: "",
    overlapNotes: [
      "中部電力『ささえあい』基本プランの個人賠償責任と完全に重複",
      "本火災保険には『示談交渉サービス（賠償事故の解決に関する特約）』が付帯",
      "火災保険の家財は『敷地内（室内）』限定。敷地外の持ち出し品は『ささえあい（携行保証）』がカバー",
    ],
  },
];
