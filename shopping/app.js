// 買い物リスト（夫婦でリアルタイム共有）
//
// 設計メモ:
//  - 認証なし。URL の ?room=xxxx が部屋の鍵。匿名認証で Firestore に接続する。
//  - マスター食材の本体は master-data.js（コード側）に持つ。Firestore に保存するのは
//    「編集したコツ」「カスタム品目」「使用回数」などの差分（master_meta）だけ。
//    → 読み書きが最小限で済み、プリセットの更新はファイル編集だけで全端末に反映される。
//  - オフライン永続化を有効にしているので、店内で電波が切れてもチェックは端末に残り、
//    復帰時に自動送信される。
//
// Firestore の構造:
//   shopping_lists/{roomId}
//     /items/{itemId}        … 今回買うもの
//     /master_meta/{name}    … マスターの差分・使用回数・カスタム品目
//     /history/{historyId}   … 買い物完了時のスナップショット

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  collection, doc, setDoc, deleteDoc, onSnapshot, writeBatch, query, orderBy, limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";
import { MASTER_PRESET, CATEGORY_ORDER, UNIT_OPTIONS } from "./master-data.js";

/* ==================== 定数・小道具 ==================== */

const ROOM_KEY = "shopping-room-id";
const WHO_KEY  = "shopping-who";
const MODE_KEY = "shopping-mode";
const ROOT     = "shopping_lists";

const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const CAT_RANK = new Map(CATEGORY_ORDER.map((c, i) => [c, i]));
const catRank = (c) => (CAT_RANK.has(c) ? CAT_RANK.get(c) : CATEGORY_ORDER.length);

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function randomId(len) {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789";
  const buf = new Uint8Array(len);
  crypto.getRandomValues(buf);
  return Array.from(buf, (b) => chars[b % chars.length]).join("");
}

// Firestore のドキュメントIDに使えるようにする（"/" や予約名を避ける）
function metaKey(name) {
  let k = String(name || "").trim().replace(/\//g, "／");
  if (k === "." || k === "..") k = "_" + k;
  if (/^__.*__$/.test(k)) k = "_" + k;
  return k.slice(0, 100) || "_";
}

const who = () => localStorage.getItem(WHO_KEY) || "";

// 検索用の正規化。
//  - NFKC で半角カナ（ﾄﾏﾄ）を全角に寄せる
//  - ひらがなをカタカナに寄せる（「ねぎ」で「青ネギ」が出るように）
function normKana(s) {
  return String(s ?? "").normalize("NFKC").toLowerCase()
    .replace(/[\u3041-\u3096]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60));
}

function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { el.hidden = true; }, 2600);
}

/* ==================== 部屋の決定 ==================== */

function resolveRoomId() {
  const params = new URLSearchParams(location.search);
  let id = (params.get("room") || "").trim().slice(0, 40);
  if (!id) id = (localStorage.getItem(ROOM_KEY) || "").trim();
  if (!id) id = randomId(20);
  try { localStorage.setItem(ROOM_KEY, id); } catch { /* プライベートモード等 */ }
  if (params.get("room") !== id) {
    params.set("room", id);
    history.replaceState(null, "", location.pathname + "?" + params.toString());
  }
  return id;
}

const roomId = resolveRoomId();

/* ==================== Firebase ==================== */

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

const roomRef  = doc(db, ROOT, roomId);
const itemsCol = collection(roomRef, "items");
const metaCol  = collection(roomRef, "master_meta");
const histCol  = collection(roomRef, "history");

/* ==================== 状態 ==================== */

let items = [];        // 今回のリスト
let metaDocs = [];     // master_meta
let histDocs = [];     // 履歴（新しい順）
let openCats = new Set(["野菜"]);   // 開いているカテゴリ
let searchWord = "";
let editingId = null;  // 編集モーダルで開いている品目
let undoAction = null;
let undoTimer = null;
let netCached = true, netPending = false;

/* ==================== マスターの合成 ==================== */

function effectiveMaster() {
  const map = new Map();
  for (const p of MASTER_PRESET) {
    map.set(p.name, {
      name: p.name, category: p.category, unit: p.unit || "個",
      yomi: p.yomi || "", tip: p.tip || "", isCustom: false, hidden: false, useCount: 0
    });
  }
  for (const m of metaDocs) {
    if (!m.name) continue;
    const base = map.get(m.name) || {
      name: m.name, category: "その他", unit: "個",
      yomi: "", tip: "", isCustom: true, hidden: false, useCount: 0
    };
    map.set(m.name, {
      name: m.name,
      category: m.category ?? base.category,
      unit: m.unit ?? base.unit,
      yomi: base.yomi,
      tip: m.tip ?? base.tip,
      isCustom: m.isCustom ?? base.isCustom,
      hidden: m.hidden ?? base.hidden,
      useCount: m.useCount ?? base.useCount
    });
  }
  return Array.from(map.values()).filter((m) => !m.hidden);
}

const sortItems = (arr) => arr.slice().sort((a, b) =>
  catRank(a.category) - catRank(b.category) ||
  (a.order || 0) - (b.order || 0) ||
  String(a.name).localeCompare(String(b.name), "ja"));

const qtyLabel = (it) => `${it.quantity ?? 1}${it.unit || "個"}`;

/* ==================== 書き込み ==================== */

// writeBatch は 500 件までなので分割してコミットする
async function commitOps(ops) {
  for (let i = 0; i < ops.length; i += 400) {
    const batch = writeBatch(db);
    for (const op of ops.slice(i, i + 400)) op(batch);
    await batch.commit();
  }
}

async function touchRoom() {
  try {
    await setDoc(roomRef, { updatedAt: Date.now(), createdAt: Date.now() }, { merge: true });
  } catch { /* 失敗しても本体の動作には影響しない */ }
}

async function addItem({ name, category, quantity, unit, tip }) {
  await setDoc(doc(itemsCol, randomId(16)), {
    name, category: category || "その他",
    quantity: Number(quantity) || 1, unit: unit || "個",
    tip: tip || "", isChecked: false,
    order: Date.now(), addedBy: who(), createdAt: Date.now()
  });
  touchRoom();
}

async function updateItem(id, patch) {
  await setDoc(doc(itemsCol, id), patch, { merge: true });
  touchRoom();
}

const removeItem = (id) => deleteDoc(doc(itemsCol, id));

// マスター側の差分を保存（コツの編集は次回以降にも反映される）
const saveMeta = (name, patch) =>
  setDoc(doc(metaCol, metaKey(name)), { name, ...patch }, { merge: true });

/* ==================== 操作 ==================== */

async function toggleMaster(m) {
  const found = items.find((it) => it.name === m.name);
  if (found) {
    await removeItem(found.id);
  } else {
    await addItem({ name: m.name, category: m.category, quantity: 1, unit: m.unit, tip: m.tip });
  }
}

async function setChecked(item, checked) {
  await updateItem(item.id, {
    isChecked: checked,
    checkedAt: checked ? Date.now() : null,
    checkedBy: checked ? who() : null
  });
  showUndo(
    checked ? `「${item.name}」をカゴに入れました` : `「${item.name}」を戻しました`,
    () => updateItem(item.id, {
      isChecked: !checked,
      checkedAt: !checked ? Date.now() : null,
      checkedBy: !checked ? who() : null
    })
  );
}

async function changeQty(item, delta) {
  const next = Math.min(999, Math.max(1, (Number(item.quantity) || 1) + delta));
  if (next !== item.quantity) await updateItem(item.id, { quantity: next });
}

async function completeShopping() {
  if (!items.length) return;
  if (!confirm(`買い物を完了します。\n${items.length}品を履歴に保存して、リストを空にします。\nよろしいですか？`)) return;

  const snapshot = items.map((i) => ({
    name: i.name, category: i.category,
    quantity: i.quantity ?? 1, unit: i.unit || "個", tip: i.tip || ""
  }));
  const master = new Map(effectiveMaster().map((m) => [m.name, m]));
  const names = Array.from(new Set(items.map((i) => i.name)));

  const ops = [
    (b) => b.set(doc(histCol, randomId(16)),
      { completedAt: Date.now(), by: who(), count: snapshot.length, items: snapshot }),
    ...names.map((name) => (b) => b.set(doc(metaCol, metaKey(name)),
      { name, useCount: (master.get(name)?.useCount || 0) + 1, lastUsedAt: Date.now() }, { merge: true })),
    ...items.map((i) => (b) => b.delete(doc(itemsCol, i.id)))
  ];
  await commitOps(ops);
  toast(`${snapshot.length}品を履歴に保存しました`);
  setMode("edit");
}

async function restoreLast() {
  const last = histDocs[0];
  if (!last || !Array.isArray(last.items) || !last.items.length) return;
  const exists = new Set(items.map((i) => i.name));
  const add = last.items.filter((i) => !exists.has(i.name));
  if (!add.length) { toast("前回の品目はすべてリストに入っています"); return; }

  const base = Date.now();
  await commitOps(add.map((it, idx) => (b) => b.set(doc(itemsCol, randomId(16)), {
    name: it.name, category: it.category || "その他",
    quantity: Number(it.quantity) || 1, unit: it.unit || "個",
    tip: it.tip || "", isChecked: false,
    order: base + idx, addedBy: who(), createdAt: Date.now()
  })));
  toast(`前回のリストから${add.length}品を復元しました`);
}

async function clearItems(onlyChecked) {
  const target = onlyChecked ? items.filter((i) => i.isChecked) : items;
  if (!target.length) { toast(onlyChecked ? "購入済みの品目はありません" : "リストは空です"); return; }
  const msg = onlyChecked
    ? `購入済みの${target.length}品を削除します。よろしいですか？`
    : `リストの${target.length}品をすべて削除します。\n（履歴には残りません）よろしいですか？`;
  if (!confirm(msg)) return;
  await commitOps(target.map((i) => (b) => b.delete(doc(itemsCol, i.id))));
  toast(`${target.length}品を削除しました`);
}

/* ==================== 取り消しバー ==================== */

function showUndo(text, undoFn) {
  undoAction = undoFn;
  $("#undo-text").textContent = text;
  $("#undo-bar").hidden = false;
  clearTimeout(undoTimer);
  undoTimer = setTimeout(hideUndo, 5000);
}
function hideUndo() {
  clearTimeout(undoTimer);
  undoAction = null;
  $("#undo-bar").hidden = true;
}

/* ==================== 描画 ==================== */

function render() {
  renderEdit();
  renderShop();
}

/* ---- 画面A: リスト作成 ---- */

function renderEdit() {
  const list = sortItems(items);
  $("#edit-count").textContent = String(list.length);
  $("#current-empty").hidden = list.length > 0;
  $("#btn-restore-last").hidden = histDocs.length === 0;

  $("#current-list").innerHTML = list.map((it) => {
    const meta = [it.category, it.addedBy ? `${esc(it.addedBy)}が追加` : ""].filter(Boolean).join(" ・ ");
    return `
      <li class="item-row${it.isChecked ? " is-checked" : ""}" data-id="${esc(it.id)}">
        <button class="item-main" data-act="edit" type="button">
          <span class="item-name">${esc(it.name)}${it.isChecked ? " <span class='mini-tag'>カゴ済</span>" : ""}</span>
          <span class="item-meta">${esc(meta)}</span>
          ${it.tip ? `<span class="item-tip">💡 ${esc(it.tip)}</span>` : ""}
        </button>
        <div class="qty-ctl">
          <button class="qty-btn" data-act="minus" type="button" aria-label="減らす">−</button>
          <span class="qty-val"><b>${esc(it.quantity ?? 1)}</b><small>${esc(it.unit || "個")}</small></span>
          <button class="qty-btn" data-act="plus" type="button" aria-label="増やす">＋</button>
        </div>
      </li>`;
  }).join("");

  renderMaster();
}

function renderMaster() {
  const inList = new Set(items.map((i) => i.name));
  const all = effectiveMaster();
  const word = normKana(searchWord.trim());
  const hit = word
    ? all.filter((m) => normKana(m.name).includes(word) || normKana(m.yomi).includes(word))
    : all;

  // よく買うもの（検索中は隠す）
  const freq = all.filter((m) => (m.useCount || 0) > 0)
    .sort((a, b) => (b.useCount || 0) - (a.useCount || 0)).slice(0, 12);
  const showFreq = !word && freq.length > 0;
  $("#frequent-wrap").hidden = !showFreq;
  if (showFreq) $("#frequent-chips").innerHTML = freq.map((m) => chipHtml(m, inList)).join("");

  const byCat = new Map();
  for (const m of hit) {
    if (!byCat.has(m.category)) byCat.set(m.category, []);
    byCat.get(m.category).push(m);
  }
  const cats = Array.from(byCat.keys()).sort((a, b) => catRank(a) - catRank(b));
  $("#master-empty").hidden = hit.length > 0;

  $("#master-categories").innerHTML = cats.map((cat) => {
    const open = word ? true : openCats.has(cat);
    const list = byCat.get(cat).sort((a, b) => a.name.localeCompare(b.name, "ja"));
    return `
      <details class="cat" data-cat="${esc(cat)}"${open ? " open" : ""}>
        <summary class="cat-summary">${esc(cat)} <span class="cat-count">${list.length}</span></summary>
        <div class="chip-grid">${list.map((m) => chipHtml(m, inList)).join("")}</div>
      </details>`;
  }).join("");
}

function chipHtml(m, inList) {
  const on = inList.has(m.name);
  return `<button type="button" class="chip${on ? " is-on" : ""}${m.isCustom ? " is-custom" : ""}"
    data-master="${esc(m.name)}"${m.tip ? ` title="${esc(m.tip)}"` : ""}>${esc(m.name)}${on ? " ✓" : ""}</button>`;
}

/* ---- 画面B: 買い物モード ---- */

function renderShop() {
  const list = sortItems(items);
  const todo = list.filter((i) => !i.isChecked);
  const done = list.filter((i) => i.isChecked);

  const total = list.length;
  const pct = total ? Math.round((done.length / total) * 100) : 0;
  $("#progress-text").textContent = total ? `${done.length} / ${total}品 完了` : "リストは空です";
  $("#progress-fill").style.width = pct + "%";

  $("#shop-empty").hidden = total > 0;
  $("#shop-alldone").hidden = !(total > 0 && todo.length === 0);

  // 売り場（カテゴリ）ごとにまとめる
  const groups = [];
  for (const it of todo) {
    const g = groups[groups.length - 1];
    if (g && g.cat === it.category) g.items.push(it);
    else groups.push({ cat: it.category, items: [it] });
  }
  $("#shop-todo").innerHTML = groups.map((g) => `
    <div class="shop-group">
      <h3 class="shop-cat">${esc(g.cat)}</h3>
      ${g.items.map(shopRowHtml).join("")}
    </div>`).join("");

  $("#done-wrap").hidden = done.length === 0;
  $("#done-count").textContent = String(done.length);
  $("#shop-done").innerHTML = done.map(doneRowHtml).join("");
}

function shopRowHtml(it) {
  return `
    <div class="shop-item" data-id="${esc(it.id)}">
      <div class="si-body">
        <div class="si-line">
          <span class="si-name">${esc(it.name)}</span>
          <span class="si-qty">${esc(qtyLabel(it))}</span>
        </div>
        ${it.tip ? `<button class="si-tip" data-act="tip" type="button">💡 ${esc(it.tip)}</button>` : ""}
      </div>
      <button class="si-check" data-act="check" type="button" aria-label="カゴに入れる">✓</button>
    </div>`;
}

function doneRowHtml(it) {
  return `
    <div class="shop-item is-done" data-id="${esc(it.id)}">
      <div class="si-body">
        <div class="si-line">
          <span class="si-name">${esc(it.name)}</span>
          <span class="si-qty">${esc(qtyLabel(it))}</span>
        </div>
        ${it.checkedBy ? `<span class="si-by">${esc(it.checkedBy)}が入れました</span>` : ""}
      </div>
      <button class="si-undo" data-act="uncheck" type="button">戻す</button>
    </div>`;
}

/* ==================== モード切替（端末ごとに保持） ==================== */

function measureSticky() {
  const h = $(".app-header").offsetHeight;
  const t = $(".mode-tabs").offsetHeight;
  document.documentElement.style.setProperty("--header-h", h + "px");
  document.documentElement.style.setProperty("--tabs-h", t + "px");
}

function setMode(mode) {
  try { localStorage.setItem(MODE_KEY, mode); } catch { /* noop */ }
  $("#view-edit").hidden = mode !== "edit";
  $("#view-shop").hidden = mode !== "shop";
  $$(".mode-tab").forEach((b) => b.classList.toggle("is-active", b.dataset.mode === mode));
  window.scrollTo({ top: 0 });
}

/* ==================== 品目編集モーダル ==================== */

function openItemModal(id) {
  const it = items.find((i) => i.id === id);
  if (!it) return;
  editingId = id;
  $("#mi-title").textContent = "品目の編集";
  $("#mi-name").value = it.name || "";
  $("#mi-qty").value = it.quantity ?? 1;
  $("#mi-unit").value = it.unit || "個";
  $("#mi-category").value = CATEGORY_ORDER.includes(it.category) ? it.category : "その他";
  $("#mi-tip").value = it.tip || "";
  $("#modal-item").hidden = false;
}

function closeItemModal() {
  editingId = null;
  $("#modal-item").hidden = true;
}

async function saveItemModal() {
  const id = editingId;
  if (!id) return;
  const before = items.find((i) => i.id === id);
  if (!before) { closeItemModal(); toast("この品目は削除されました"); return; }

  const name = $("#mi-name").value.trim();
  if (!name) { toast("品名を入力してください"); return; }
  const patch = {
    name,
    quantity: Math.min(999, Math.max(1, parseInt($("#mi-qty").value, 10) || 1)),
    unit: $("#mi-unit").value.trim() || "個",
    category: $("#mi-category").value,
    tip: $("#mi-tip").value.trim()
  };
  await updateItem(id, patch);

  // コツ・カテゴリ・単位の変更は次回以降のマスターにも反映する
  const known = effectiveMaster().some((m) => m.name === name);
  const changed = before.tip !== patch.tip || before.unit !== patch.unit ||
    before.category !== patch.category || before.name !== name;
  if (changed) {
    await saveMeta(name, {
      tip: patch.tip, unit: patch.unit, category: patch.category,
      ...(known ? {} : { isCustom: true })
    });
  }
  closeItemModal();
  toast("保存しました");
}

/* ==================== 設定モーダル ==================== */

function openSettings() {
  $("#share-url").value = location.origin + location.pathname + "?room=" + roomId;
  $("#room-input").value = roomId;
  $$(".who-btn").forEach((b) => b.classList.toggle("is-on", b.dataset.who === who()));
  $("#history-list").innerHTML = histDocs.length
    ? histDocs.slice(0, 10).map((h) => {
        const d = new Date(h.completedAt || 0);
        const when = `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
        const names = (h.items || []).map((i) => i.name).join("、");
        return `<div class="history-row"><b>${esc(when)}</b> <span class="history-count">${h.count ?? (h.items || []).length}品</span><br><span class="history-names">${esc(names)}</span></div>`;
      }).join("")
    : `<p class="empty-note">まだ履歴はありません。買い物モードの「買い物を完了」で保存されます。</p>`;
  $("#modal-settings").hidden = false;
}

async function copyShareUrl() {
  const url = $("#share-url").value;
  try {
    await navigator.clipboard.writeText(url);
    toast("共有リンクをコピーしました");
  } catch {
    $("#share-url").select();
    toast("コピーできませんでした。リンクを長押しでコピーしてください");
  }
}

/* ==================== 同期ステータス ==================== */

function updateSyncStatus() {
  const el = $("#sync-status");
  if (!navigator.onLine || netCached) {
    el.textContent = "📴 オフライン中（変更は端末に保存され、電波が戻ると自動送信されます）";
    el.className = "sync-status is-off";
  } else if (netPending) {
    el.textContent = "⏳ 送信中…";
    el.className = "sync-status is-pending";
  } else {
    el.textContent = "✅ 同期中";
    el.className = "sync-status is-ok";
  }
}

/* ==================== 初期化 ==================== */

function fillSelects() {
  const opts = CATEGORY_ORDER.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join("");
  $("#mi-category").innerHTML = opts;
  const fa = document.querySelector("#free-add select[name=category]");
  fa.innerHTML = opts;
  fa.value = "その他";
  $("#unit-list").innerHTML = UNIT_OPTIONS.map((u) => `<option value="${esc(u)}">`).join("");
}

function bindEvents() {
  // モードタブ
  $$(".mode-tab").forEach((b) => b.addEventListener("click", () => setMode(b.dataset.mode)));

  // 今回のリスト
  $("#current-list").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-act]");
    const row = e.target.closest(".item-row");
    if (!btn || !row) return;
    const it = items.find((i) => i.id === row.dataset.id);
    if (!it) return;
    if (btn.dataset.act === "edit") openItemModal(it.id);
    if (btn.dataset.act === "plus") changeQty(it, +1);
    if (btn.dataset.act === "minus") changeQty(it, -1);
  });

  // マスターのチップ
  const onChip = (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    const m = effectiveMaster().find((x) => x.name === chip.dataset.master);
    if (m) toggleMaster(m);
  };
  $("#master-categories").addEventListener("click", onChip);
  $("#frequent-chips").addEventListener("click", onChip);

  // カテゴリの開閉状態を覚えておく（再描画で閉じないように）
  // 検索中は全カテゴリを自動で開くので、その分は記憶しない
  $("#master-categories").addEventListener("toggle", (e) => {
    if (searchWord.trim()) return;
    const d = e.target.closest("details.cat");
    if (!d) return;
    if (d.open) openCats.add(d.dataset.cat);
    else openCats.delete(d.dataset.cat);
  }, true);

  // 検索
  $("#master-search").addEventListener("input", (e) => {
    searchWord = e.target.value;
    renderMaster();
  });

  // 自由入力の追加
  $("#free-add").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    const name = f.name.value.trim();
    if (!name) return;
    const category = f.category.value;
    const unit = f.unit.value.trim() || "個";
    const tip = f.tip.value.trim();
    const quantity = Math.min(999, Math.max(1, parseInt(f.qty.value, 10) || 1));

    await addItem({ name, category, quantity, unit, tip });
    if (f.toMaster.checked) {
      const known = effectiveMaster().some((m) => m.name === name);
      await saveMeta(name, { category, unit, tip, ...(known ? {} : { isCustom: true }) });
    }
    f.reset();
    f.qty.value = 1;
    f.unit.value = "個";
    f.category.value = category;
    f.toMaster.checked = true;
    f.name.focus();
    toast(`「${name}」を追加しました`);
  });

  $("#btn-restore-last").addEventListener("click", restoreLast);

  // 買い物モード
  $("#shop-todo").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-act]");
    const row = e.target.closest(".shop-item");
    if (!btn || !row) return;
    if (btn.dataset.act === "tip") { btn.classList.toggle("is-open"); return; }
    const it = items.find((i) => i.id === row.dataset.id);
    if (it && btn.dataset.act === "check") setChecked(it, true);
  });
  $("#shop-done").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-act=uncheck]");
    const row = e.target.closest(".shop-item");
    if (!btn || !row) return;
    const it = items.find((i) => i.id === row.dataset.id);
    if (it) setChecked(it, false);
  });

  $("#btn-complete").addEventListener("click", completeShopping);
  $("#btn-clear-checked").addEventListener("click", () => clearItems(true));
  $("#btn-clear-all").addEventListener("click", () => clearItems(false));

  // 取り消しバー
  $("#undo-btn").addEventListener("click", () => {
    const fn = undoAction;
    hideUndo();
    if (fn) fn();
  });

  // 品目編集モーダル
  $("#mi-plus").addEventListener("click", () => {
    $("#mi-qty").value = Math.min(999, (parseInt($("#mi-qty").value, 10) || 1) + 1);
  });
  $("#mi-minus").addEventListener("click", () => {
    $("#mi-qty").value = Math.max(1, (parseInt($("#mi-qty").value, 10) || 1) - 1);
  });
  $("#mi-save").addEventListener("click", saveItemModal);
  $("#mi-cancel").addEventListener("click", closeItemModal);
  $("#mi-delete").addEventListener("click", async () => {
    if (!editingId) return;
    const id = editingId;
    closeItemModal();
    await removeItem(id);
    toast("削除しました");
  });

  // 設定モーダル
  $("#btn-settings").addEventListener("click", openSettings);
  $("#st-close").addEventListener("click", () => { $("#modal-settings").hidden = true; });
  $("#btn-copy").addEventListener("click", copyShareUrl);
  $("#who-buttons").addEventListener("click", (e) => {
    const b = e.target.closest(".who-btn");
    if (!b) return;
    try { localStorage.setItem(WHO_KEY, b.dataset.who); } catch { /* noop */ }
    $$(".who-btn").forEach((x) => x.classList.toggle("is-on", x === b));
  });
  $("#btn-join").addEventListener("click", () => {
    const v = $("#room-input").value.trim();
    if (!v || v === roomId) { $("#modal-settings").hidden = true; return; }
    if (!confirm("別の部屋に切り替えます。今の画面のリストは表示されなくなります（データは残ります）。よろしいですか？")) return;
    try { localStorage.setItem(ROOM_KEY, v); } catch { /* noop */ }
    location.search = "?room=" + encodeURIComponent(v);
  });

  // モーダルの背景タップで閉じる
  $$(".modal").forEach((m) => m.addEventListener("click", (e) => {
    if (e.target.dataset.close) m.hidden = true;
    if (m.id === "modal-item" && e.target.dataset.close) editingId = null;
  }));

  addEventListener("online", updateSyncStatus);
  addEventListener("offline", updateSyncStatus);
}

function subscribe() {
  onSnapshot(itemsCol, { includeMetadataChanges: true }, (snap) => {
    items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    netCached = snap.metadata.fromCache;
    netPending = snap.metadata.hasPendingWrites;
    updateSyncStatus();
    render();
  }, (err) => {
    $("#sync-status").textContent = "⚠️ 同期エラー: " + (err.code || err.message);
    $("#sync-status").className = "sync-status is-err";
  });

  onSnapshot(metaCol, (snap) => {
    metaDocs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderEdit();
  }, () => { /* マスターが読めなくてもプリセットで動く */ });

  onSnapshot(query(histCol, orderBy("completedAt", "desc"), limit(20)), (snap) => {
    histDocs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    $("#btn-restore-last").hidden = histDocs.length === 0;
  }, () => { /* 履歴は無くても動く */ });
}

async function main() {
  window.__shoppingBooted = true;
  fillSelects();
  bindEvents();
  setMode(localStorage.getItem(MODE_KEY) || "edit");
  measureSticky();
  addEventListener("resize", measureSticky);
  render();
  updateSyncStatus();

  try {
    await signInAnonymously(auth);
  } catch (e) {
    // オフライン起動時はキャッシュで動くので、ここでは止めない
    console.warn("匿名ログインに失敗しました:", e);
  }
  subscribe();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => { /* 失敗しても通常動作する */ });
  }
}

main();
