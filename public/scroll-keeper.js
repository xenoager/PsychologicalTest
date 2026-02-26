/*! scroll-keeper.js — preserve scroll position per route (works for MPA & SPA) */
(function () {
  var KEY_PREFIX = 'scroll-pos:';
  function key() { return KEY_PREFIX + location.pathname + location.search; }

  function save() {
    try { sessionStorage.setItem(key(), String(window.scrollY || window.pageYOffset || 0)); }
    catch (e) {}
  }
  function restore() {
    try {
      var v = sessionStorage.getItem(key());
      if (v != null) {
        var y = parseInt(v, 10) || 0;
        requestAnimationFrame(function () { window.scrollTo(0, y); });
      }
    } catch (e) {}
  }
  function restoreWithRetries() {
    // Try a few times to give SPA routers time to render the new page
    var tries = 0;
    var max = 12; // ~600ms total
    var id = setInterval(function () {
      restore();
      tries += 1;
      if (tries >= max) clearInterval(id);
    }, 50);
  }

  // MPA lifecycle
  window.addEventListener('pagehide', save, { passive: true });
  window.addEventListener('beforeunload', save);

  // BFCache & initial load
  window.addEventListener('pageshow', function () { restore(); });

  // SPA (React/Vue/etc.) — patch history so we can save *and* restore across pushes
  var origPushState = history.pushState;
  history.pushState = function () {
    try { save(); } catch(e){}
    var r = origPushState.apply(this, arguments);
    // URL changed to the new route; attempt to restore its previous scroll
    restoreWithRetries();
    return r;
  };

  var origReplaceState = history.replaceState;
  history.replaceState = function () {
    try { save(); } catch(e){}
    var r = origReplaceState.apply(this, arguments);
    restoreWithRetries();
    return r;
  };

  window.addEventListener('popstate', function () {
    // Back/forward should restore as well
    setTimeout(restore, 0);
  }, { passive: true });

  // Optional: save when clicking internal links
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (!a) return;
    try {
      var url = new URL(a.getAttribute('href'), location.href);
      if (url.origin === location.origin) save();
    } catch (err) {}
  }, true);

  // Expose manual API if the app wants to control it
  window.ScrollKeeper = { save: save, restore: restore };
})();
