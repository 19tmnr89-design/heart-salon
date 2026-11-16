// 買い物リストは /life-log/shopping.html に移動した。
// この場所に登録済みの古い Service Worker を片付けるためだけのファイル：
// 自分のキャッシュを消し、登録を解除し、開いている画面を読み込み直す（→ 転送ページへ）。
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    // キャッシュはオリジン単位で共有なので、life-log 側（shopping-v6 以降）は消さない
    await Promise.all(keys.filter((k) => /^shopping-v[1-5]$/.test(k)).map((k) => caches.delete(k)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: "window" });
    clients.forEach((c) => c.navigate(c.url));
  })());
});
