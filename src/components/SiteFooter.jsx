import React from "react";
import { Link } from "react-router-dom";

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="site-footer__links">
        <Link to="/" className="site-footer__link">
          홈
        </Link>
        <Link to="/articles" className="site-footer__link">
          가이드·칼럼
        </Link>
        <Link to="/faq" className="site-footer__link">
          FAQ
        </Link>
        <Link to="/about" className="site-footer__link">
          소개
        </Link>
        <Link to="/contact" className="site-footer__link">
          문의
        </Link>
        <Link to="/terms" className="site-footer__link">
          이용약관
        </Link>
        <Link to="/privacy" className="site-footer__link">
          개인정보처리방침
        </Link>
        <Link to="/cookies" className="site-footer__link">
          쿠키·광고
        </Link>
        <Link to="/disclaimer" className="site-footer__link">
          면책
        </Link>
        <Link to="/site-map" className="site-footer__link">
          사이트맵
        </Link>
        <a className="site-footer__link" href="/rss.xml">
          RSS
        </a>
      </div>

      <div className="site-footer__meta">
        <div>© {year} 마인드픽Q. All rights reserved.</div>
        <div className="site-footer__muted">
          테스트/칼럼은 재미·자기이해 목적의 참고 자료이며, 의학·진단·치료를 대체하지
          않습니다.
        </div>
      </div>
    </footer>
  );
}
