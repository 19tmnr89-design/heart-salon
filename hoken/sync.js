// 端末間同期モジュール（Firebase Firestore）
//
// 仕組みは kintore/sync.js と同じで、同期コード（合言葉）のSHA-256をドキュメントIDにして共有する。
// 違うのは統合の仕方で、こちらは追記型ではなく編集型のデータなので
// 「updatedAt が新しい方で丸ごと上書き」する。上書きする前に確認を出す。
//
// データ本体は localStorage["hoken-data-v1"] が唯一の出所。app.js とはイベントで連携する。

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig as bakedConfig } from "./firebase-config.js";

const STORAGE_KEY = "hoken-data-v1";
const CODE_KEY = "hoken-sync-code";
const DEVICE_KEY = "hoken-device-id";
const CFG_KEY = "hoken-fb-config";

/* -------- ユーティリティ -------- */

function getDeviceId() {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}
const deviceId = getDeviceId();

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch { return null; }
}

function timeOf(data) {
  const t = data && data.updatedAt ? Date.parse(data.updatedAt) : 0;
  return Number.isFinite(t) ? t : 0;
}

function applyRemote(remote) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
  window.dispatchEvent(new CustomEvent("hoken:remote"));
}

function effectiveConfig() {
  const pasted = localStorage.getItem(CFG_KEY);
  if (pasted) {
    try { return JSON.parse(pasted); } catch { /* fallthrough */ }
  }
  return bakedConfig;
}

function isConfigured(cfg) {
  return cfg && typeof cfg.apiKey === "string" &&
    cfg.apiKey && !cfg.apiKey.startsWith("PASTE_") &&
    cfg.projectId && !String(cfg.projectId).startsWith("PASTE_");
}

/* -------- Firebase 状態 -------- */

let db = null, auth = null, docRef = null, unsub = null;
let pushTimer = null;

function setStatus(text, cls) {
  const el = document.getElementById("sync-status");
  if (el) { el.textContent = text; el.className = "sync-status " + (cls || ""); }
}

async function ensureFirebase() {
  if (db) return true;
  const cfg = effectiveConfig();
  if (!isConfigured(cfg)) return false;
  const app = initializeApp(cfg);
  auth = getAuth(app);
  db = getFirestore(app);
  await signInAnonymously(auth);
  return true;
}

function schedulePush() {
  if (!docRef) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(pushNow, 800); // 連続変更をまとめて送る
}

async function pushNow() {
  if (!docRef) return;
  const local = loadLocal();
  if (!local) return;
  try {
    await setDoc(docRef, { payload: local, updatedAt: Date.now(), updatedBy: deviceId });
    setStatus("同期オン｜保存しました " + new Date().toLocaleTimeString("ja-JP"), "ok");
  } catch (e) {
    setStatus("同期エラー: " + (e.code || e.message), "err");
  }
}

async function connect(code) {
  code = (code || "").trim();
  if (code.length < 4) { setStatus("同期コードは4文字以上にしてください", "err"); return; }
  setStatus("接続中…", "");
  try {
    if (!(await ensureFirebase())) { setStatus("Firebase設定が未登録です", "err"); return; }
    const id = await sha256Hex("hoken:" + code);
    docRef = doc(db, "hoken", id);

    // 初回リンク: 新しい方を残す。中身が食い違うときだけ確認する。
    const snap = await getDoc(docRef);
    const local = loadLocal();
    if (snap.exists() && snap.data().payload) {
      const remote = snap.data().payload;
      const localTime = timeOf(local), remoteTime = timeOf(remote);
      const differs = JSON.stringify(local) !== JSON.stringify(remote);
      if (differs && remoteTime >= localTime) {
        const ok = confirm(
          "同期先に、この端末より新しい内容があります。\n" +
          "この端末の内容を、同期先の内容で置き換えますか？\n\n" +
          "（置き換える前に、設定タブからJSONを書き出しておくと元に戻せます）");
        if (!ok) { setStatus("同期を中止しました", "err"); docRef = null; return; }
        applyRemote(remote);
      } else if (differs) {
        await setDoc(docRef, { payload: local, updatedAt: Date.now(), updatedBy: deviceId });
      }
    } else if (local) {
      await setDoc(docRef, { payload: local, updatedAt: Date.now(), updatedBy: deviceId });
    }

    if (unsub) unsub();
    unsub = onSnapshot(docRef, snap2 => {
      if (!snap2.exists()) return;
      const data = snap2.data();
      if (data.updatedBy === deviceId) return; // 自分の書き込みは無視（ループ防止）
      if (!data.payload) return;
      applyRemote(data.payload);
      setStatus("同期オン｜他の端末から更新を受信 " + new Date().toLocaleTimeString("ja-JP"), "ok");
    }, err => setStatus("同期エラー: " + (err.code || err.message), "err"));

    localStorage.setItem(CODE_KEY, code);
    setStatus("同期オン（コード: " + code + "）｜この端末は同期されています", "ok");
    updateButtons(true);
  } catch (e) {
    setStatus("接続失敗: " + (e.code || e.message), "err");
  }
}

function disconnect() {
  if (unsub) { unsub(); unsub = null; }
  docRef = null;
  localStorage.removeItem(CODE_KEY);
  setStatus("未接続", "");
  updateButtons(false);
}

function updateButtons(connected) {
  const conn = document.getElementById("sync-connect");
  const disc = document.getElementById("sync-disconnect");
  const input = document.getElementById("sync-code");
  if (conn) conn.hidden = connected;
  if (disc) disc.hidden = !connected;
  if (input) input.disabled = connected;
}

/* -------- 画面初期化 -------- */

function initUI() {
  const cfg = effectiveConfig();
  const configured = isConfigured(cfg);

  const cfgBox = document.getElementById("sync-config-box");
  const cfgArea = document.getElementById("sync-config-input");
  const cfgSave = document.getElementById("sync-config-save");
  if (cfgBox) cfgBox.hidden = configured;

  if (cfgSave) cfgSave.addEventListener("click", () => {
    try {
      const raw = cfgArea.value.trim();
      const jsonStart = raw.indexOf("{");
      const obj = JSON.parse(raw.slice(jsonStart).replace(/;\s*$/, "").replace(/(\w+):/g, '"$1":').replace(/'/g, '"'));
      if (!obj.apiKey || !obj.projectId) throw new Error("apiKey / projectId がありません");
      localStorage.setItem(CFG_KEY, JSON.stringify(obj));
      setStatus("設定を保存しました。同期コードを入れて開始してください", "ok");
      if (cfgBox) cfgBox.hidden = true;
      db = null;
    } catch (e) {
      setStatus("設定の読み取りに失敗: " + e.message, "err");
    }
  });

  const conn = document.getElementById("sync-connect");
  const disc = document.getElementById("sync-disconnect");
  if (conn) conn.addEventListener("click", () => connect(document.getElementById("sync-code").value));
  if (disc) disc.addEventListener("click", disconnect);

  window.addEventListener("hoken:changed", schedulePush);

  const saved = localStorage.getItem(CODE_KEY);
  if (saved) {
    document.getElementById("sync-code").value = saved;
    connect(saved);
  } else {
    setStatus(configured ? "未接続" : "Firebase設定が未登録です", configured ? "" : "err");
  }
}

// 閲覧モードでも同期は動かす（受信だけできればよい）
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initUI);
} else {
  initUI();
}
