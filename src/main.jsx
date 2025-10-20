import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Quiz from "./pages/Quiz.jsx";
import Result from "./pages/Result.jsx";
import "./styles.css";
import Privacy from "./pages/Privacy.jsx"; // ← 추가

// SPA 라우트 변경 시 수동 page_view 전송
function AnalyticsListener() {
  const location = useLocation();
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "page_view", {
          page_title: document.title,
          page_location: window.location.href,
          page_path: location.pathname + location.search + location.hash,
          // 개발 모드에서 DebugView에 잘 보이도록
          debug_mode: import.meta.env.DEV ? true : undefined,
        });
      }
    } catch (e) {}
  }, [location.pathname, location.search, location.hash]);
  return null;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AnalyticsListener />
      <Routes>
        <Route path="/privacy" element={<Privacy />} /> {/* ← 추가 */}
        <Route path="/" element={<Home />} />
        <Route path="/:slug" element={<Quiz />} />
        <Route path="/:slug/result/:type" element={<Result />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
