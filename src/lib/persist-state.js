/**
 * persist-state.js (v2)
 * - Keeps list scroll position and selected category when navigating to detail and back.
 * - Call PersistState.initList({ key, linkSelector, categorySelector }).
 */
(function () {
  const SS = window.sessionStorage;
  const KEY_SCROLL = (k) => `ps:${k}:scroll`;
  const KEY_CAT = (k) => `ps:${k}:category`;

  function restoreScroll(k) {
    const y = SS.getItem(KEY_SCROLL(k));
    if (y !== null) {
      requestAnimationFrame(() => window.scrollTo(0, parseInt(y, 10)));
    }
  }
  function saveScroll(k) {
    SS.setItem(KEY_SCROLL(k), String(window.scrollY || 0));
  }
  function restoreCategory(k, categorySelector) {
    const val = SS.getItem(KEY_CAT(k));
    if (!val || !categorySelector) return;
    const el = document.querySelector(categorySelector);
    if (!el) return;
    if (el.tagName === 'SELECT') {
      el.value = val;
      el.dispatchEvent(new Event('change'));
    } else {
      const radio = el.querySelector(`input[type="radio"][value="${val}"]`);
      if (radio) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change'));
      }
    }
  }
  function watchCategory(k, categorySelector) {
    const el = document.querySelector(categorySelector);
    if (!el) return;
    if (el.tagName === 'SELECT') {
      el.addEventListener('change', () => {
        SS.setItem(KEY_CAT(k), el.value);
      });
    } else {
      el.addEventListener('change', (e) => {
        const t = e.target;
        if (t && t.type === 'radio') {
          SS.setItem(KEY_CAT(k), t.value);
        }
      });
    }
  }

  window.PersistState = {
    initList: function (opts) {
      const key = opts && opts.key ? opts.key : 'list';
      const linkSel = (opts && opts.linkSelector) || 'a';
      const catSel = opts && opts.categorySelector;
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
      document.addEventListener('DOMContentLoaded', () => {
        restoreCategory(key, catSel);
        restoreScroll(key);
        watchCategory(key, catSel);
      });
      window.addEventListener('beforeunload', () => saveScroll(key));
      document.addEventListener('click', (e) => {
        const a = e.target.closest(linkSel);
        if (a) saveScroll(key);
      });
      window.addEventListener('pageshow', (e) => {
        if (e.persisted) {
          restoreCategory(key, catSel);
          restoreScroll(key);
        }
      });
    }
  };
})();
