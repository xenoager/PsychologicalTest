import React from "react";
import { Link } from "react-router-dom";
import SiteFooter from "./SiteFooter.jsx";

/**
 * 공통 페이지 프레임
 * - 기존 홈/정책 페이지의 UI 톤을 그대로 따라가되, 컨텐츠 페이지를 빠르게 늘리기 위한 래퍼
 */
export default function PageShell({
  title,
  sidebarTitle = "INFO",
  sidebarLinks = [],
  children,
}) {
  const links = sidebarLinks.length
    ? sidebarLinks
    : [
        { to: "/", label: "홈" },
        { to: "/articles", label: "가이드·칼럼" },
        { to: "/faq", label: "FAQ" },
        { to: "/privacy", label: "개인정보처리방침" },
        { to: "/terms", label: "이용약관" },
      ];

  return (
    <div className="wrap">
      <div className="panel">
        <div className="header">
          <div className="logo">
            <Link to="/" className="brand">
              마인드픽Q
            </Link>
          </div>
        </div>

        <div className="grid">
          <aside className="sidebar">
            <div className="kicker">{sidebarTitle}</div>
            <nav className="category">
              {links.map((l) =>
                l.href ? (
                  <a key={l.label} className="cat" href={l.href}>
                    {l.label}
                  </a>
                ) : (
                  <Link key={l.to} to={l.to} className="cat">
                    {l.label}
                  </Link>
                )
              )}
            </nav>

            <div className="policy-under-category">
              <details>
                <summary>운영 안내(요약)</summary>
                <ul>
                  <li>퀴즈 응답은 브라우저에서만 처리됩니다.</li>
                  <li>광고(AdSense)가 쿠키/식별자를 사용할 수 있어요.</li>
                  <li>
                    테스트/칼럼은 참고 자료이며, 진단·치료를 대체하지 않습니다.
                  </li>
                </ul>
              </details>
              <Link to="/privacy" className="policy-link">
                개인정보처리방침
              </Link>
              {" · "}
              <Link to="/terms" className="policy-link">
                이용약관
              </Link>
            </div>
          </aside>

          <main className="main">
            <section className="section">
              <h2>{title}</h2>
              {children}
            </section>

            <SiteFooter />
          </main>
        </div>
      </div>
    </div>
  );
}
