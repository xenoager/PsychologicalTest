import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Quiz from './pages/Quiz.jsx';
import Result from './pages/Result.jsx';
import './styles.css';

// Disable browser's default scroll restoration (we handle it)
if ('scrollRestoration' in history) {
  try { history.scrollRestoration = 'manual'; } catch {}
}

// Route-aware scroll keeper
function ScrollKeeper() {
  const loc = useLocation();
  const prevPath = useRef(loc.pathname);

  // Save current scroll for previous route (runs on every route change)
  useEffect(() => {
    const from = prevPath.current;
    const to = loc.pathname;

    // leaving home -> save Y and tell Home to restore later
    if (from === '/') {
      try {
        sessionStorage.setItem('scroll-pos:/', String(window.scrollY || 0));
        sessionStorage.setItem('ps:quiz-list:need', '1');
      } catch {}
    }
    prevPath.current = to;

    // entering home -> try to restore
    if (to === '/') {
      let tries = 0;
      const y = parseInt(sessionStorage.getItem('scroll-pos:/') || '0', 10) || 0;
      const id = setInterval(() => {
        window.scrollTo(0, y);
        tries++;
        if (tries > 12) clearInterval(id);
      }, 50);
      return () => clearInterval(id);
    }
  }, [loc.pathname, loc.search]);

  // Save on pagehide (app background or close)
  useEffect(() => {
    const save = () => {
      try { sessionStorage.setItem('scroll-pos:'+loc.pathname, String(window.scrollY || 0)); } catch {}
    };
    window.addEventListener('pagehide', save);
    window.addEventListener('beforeunload', save);
    return () => {
      window.removeEventListener('pagehide', save);
      window.removeEventListener('beforeunload', save);
    };
  }, [loc.pathname]);

  return null;
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollKeeper />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:slug" element={<Quiz />} />
        <Route path="/:slug/result/:resultId" element={<Result />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
