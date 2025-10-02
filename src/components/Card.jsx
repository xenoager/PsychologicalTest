import React from "react";
import { useNavigate } from "react-router-dom";
import { assetUrl } from "../utils/asset.js";

export default function Card({ item }) {
  const nav = useNavigate();
  const cover =
    item.image || item.thumbnail || item.thumb || item.cover || null;
  return (
    <div className="card" role="button" onClick={() => nav("/" + item.slug)}>
      <div
        className="thumb"
        style={{
          position: "relative",
          overflow: "hidden",
          background:
            item.gradient ||
            "linear-gradient(120deg,#1f3b8a 0%,#2d4c98 35%,#3b5ea7 70%,#5c86a3 100%)",
          borderRadius: 16,
        }}
      >
        {cover && (
          <img
            src={assetUrl(cover)}
            alt=""
            aria-hidden="true"
            loading="lazy"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 0,
            }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        )}
        {/* 절대배치는 CSS(.thumb .label)에서 처리 → 여기서는 zIndex만 */}
        <div className="label" style={{ zIndex: 1 }}>
          {item.badge || "TEST"}
        </div>
      </div>
      <div className="meta">
        <div className="title">{item.title}</div>
        <div className="sub">{item.subtitle}</div>
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
