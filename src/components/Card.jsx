import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { assetUrl } from "../utils/asset.js";

/**
 * Card.jsx (v2) — 클릭 직전 스크롤 저장 (카테고리/검색 키 동시 저장)
 */
export default function Card({ item, activeCat, q }) {
  const nav = useNavigate();
  const location = useLocation();
  const cover = item.image || item.thumbnail || item.thumb || item.cover || null;

  function buildSearch(c, query) {
    const parts = [];
    if (c && c !== "전체") parts.push("cat=" + encodeURIComponent(c));
    if (query) parts.push("q=" + encodeURIComponent(query));
    return parts.join("&");
  }

  function handleClick() {
    try {
      const y = window.scrollY || window.pageYOffset || 0;
      const runtimeKey = location.pathname + location.search;  // 현재 URL 기준
      const stateKey = "/" + (buildSearch(activeCat, q) ? "?" + buildSearch(activeCat, q) : "");
      const stateKeyNoQ = "/" + (buildSearch(activeCat, "") ? "?" + buildSearch(activeCat, "") : "");
      const keys = Array.from(new Set([runtimeKey, stateKey, stateKeyNoQ, "/"]));
      const now = String(Date.now());
      for (const k of keys) {
        sessionStorage.setItem("scroll-pos:" + k, String(y));
        sessionStorage.setItem("scroll-pos-ts:" + k, now);
      }
      sessionStorage.setItem("ps:quiz-list:need", "1");
      // 선택 카테고리 보존
      if (activeCat) sessionStorage.setItem("last-cat:/", activeCat);
    } catch {}
    nav("/" + item.slug);
  }

  return (
    <div className="card" role="button" onClick={handleClick}>
      <div
        className="thumb"
        style={{
          position: "relative",
          overflow: "hidden",
          background: "#0f131b",
          backgroundImage: cover ? `url(${assetUrl(cover)})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: 16,
        }}
        aria-label={item.title}
      />
      <div className="meta">
        <div className="title">{item.title}</div>
        {item.subtitle && <div className="sub">{item.subtitle}</div>}
      </div>
      <div className="footer">
        <span className="badge">{item.category}</span>
        {item.author && <span className="badge">by {item.author}</span>}
        <div style={{ flex: 1 }} />
        <button className="btn">시작</button>
      </div>
    </div>
  );
}
