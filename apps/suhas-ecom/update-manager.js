(() => {
  if (!("serviceWorker" in navigator)) return;
  let registration;
  let banner;
  let reloading = false;
  const showUpdate = () => {
    if (banner || !registration || !registration.waiting) return;
    banner = document.createElement("aside");
    banner.setAttribute("role", "status");
    banner.style.cssText = "position:fixed;z-index:99999;left:12px;right:12px;bottom:calc(14px + env(safe-area-inset-bottom));max-width:520px;margin:auto;padding:14px 16px;border-radius:14px;background:#102c55;color:#fff;box-shadow:0 8px 30px #0004;font:14px Arial,sans-serif;display:flex;align-items:center;gap:12px;justify-content:space-between";
    banner.innerHTML = '<span>SUHAS MAX update available</span><button type="button" style="border:0;border-radius:9px;padding:10px 14px;background:#ffd21f;color:#102c55;font-weight:700">Update now</button>';
    banner.querySelector("button").addEventListener("click", () => {
      registration.waiting?.postMessage({ type: "SKIP_WAITING" });
    });
    document.body.appendChild(banner);
    if ("Notification" in window && Notification.permission === "granted") {
      registration.showNotification("SUHAS MAX update available", {
        body: "Tap Update now in the app to install the latest version.",
        icon: "./logo.png",
        tag: "suhasmax-update"
      }).catch(() => {});
    }
  };
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  });
  window.addEventListener("load", async () => {
    try {
      registration = await navigator.serviceWorker.register("./sw.js", { scope: "./" });
      if (registration.waiting) showUpdate();
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) showUpdate();
        });
      });
      setInterval(() => registration.update().catch(() => {}), 60 * 60 * 1000);
    } catch (_) {}
  });
})();
