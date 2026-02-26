import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Quiz from "./pages/Quiz.jsx";
import Result from "./pages/Result.jsx";
import "./styles.css";
import Privacy from "./pages/Privacy.jsx";

// 신규 컨텐츠/안내 페이지
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Terms from "./pages/Terms.jsx";
import FAQ from "./pages/FAQ.jsx";
import Cookies from "./pages/Cookies.jsx";
import Disclaimer from "./pages/Disclaimer.jsx";
import Articles from "./pages/Articles.jsx";
import Article from "./pages/Article.jsx";
import SiteMapPage from "./pages/SiteMapPage.jsx";
import CategoryPage from "./pages/CategoryPage.jsx";
import TagPage from "./pages/TagPage.jsx";

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
        {/* 정책/안내 */}
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/disclaimer" element={<Disclaimer />} />

        {/* 서비스 */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/site-map" element={<SiteMapPage />} />

        {/* 컨텐츠 */}
        <Route path="/articles" element={<Articles />} />
        <Route path="/articles/:slug" element={<Article />} />

        {/* 탐색 */}
        <Route path="/category/:name" element={<CategoryPage />} />
        <Route path="/tag/:tag" element={<TagPage />} />

        <Route path="/" element={<Home />} />
        <Route path="/:slug" element={<Quiz />} />
        <Route path="/:slug/result/:type" element={<Result />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
