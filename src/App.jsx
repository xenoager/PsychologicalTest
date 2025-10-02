import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const THEMES = {
  grape: { "--accent": "#6d28d9" },
  ocean: { "--accent": "#0284c7" },
  sunset: { "--accent": "#f97316" },
  lime: { "--accent": "#10b981" },
};

export default function App() {
  const nav = useNavigate();
  const [theme, setTheme] = useState("grape");

  function applyTheme(name) {
    setTheme(name);
    const vars = THEMES[name] || {};
    Object.entries(vars).forEach(([k, v]) =>
      document.documentElement.style.setProperty(k, v)
    );
  }

  return (
    <div className="wrap">
      <div className="panel">
        <div className="badge">STATIC</div>
        <h1 className="title">
          티니핑 MBTI 유형테스트 <small>(비공식)</small>
        </h1>
        <p className="subtitle">서버 없이도 동작하는 스모어 스타일 테스트</p>

        <div className="theme">
          {Object.keys(THEMES).map((k) => (
            <button
              key={k}
              onClick={() => applyTheme(k)}
              className={theme === k ? "active" : ""}
            >
              {k}
            </button>
          ))}
        </div>

        <div style={{ height: 12 }} />
        <div className="cta">
          <button className="btn primary" onClick={() => nav("/tinyping")}>
            테스트 시작하기
          </button>
        </div>
        <ul className="bullets">
          <li>
            데이터는 <code>public/quizzes/*.json</code>으로 관리
          </li>
          <li>채점은 브라우저에서 계산 (서버 불필요)</li>
          <li>결과별 OG 페이지를 정적으로 제공 (SNS 미리보기 대응)</li>
        </ul>
      </div>
    </div>
  );
}
