import React from "react";
import PageShell from "../components/PageShell.jsx";
import { Link } from "react-router-dom";

export default function Cookies() {
  return (
    <PageShell
      title="쿠키·광고(AdSense) 안내"
      sidebarTitle="LEGAL"
      sidebarLinks={[
        { to: "/privacy", label: "개인정보처리방침" },
        { to: "/terms", label: "이용약관" },
        { to: "/disclaimer", label: "면책" },
        { to: "/contact", label: "문의" },
      ]}
    >
      <article className="content-body policy-body">
        <p>
          마인드픽Q는 자체적으로 쿠키를 이용해 회원을 식별하거나 행동을 추적하지 않습니다.
          다만, 광고 제공을 위해 <b>Google AdSense</b> 같은 제3자 광고 파트너가 쿠키 또는
          유사 기술(기기 식별자 등)을 사용할 수 있습니다.
        </p>

        <h3>1. 당사가 사용하는 저장소</h3>
        <ul>
          <li>
            <b>sessionStorage</b>: 스크롤 위치/카테고리 등 UX 편의를 위해 사용(브라우저 탭
            종료 시 삭제)
          </li>
          <li>쿠키/로컬스토리지는 기본적으로 사용하지 않습니다.</li>
        </ul>

        <h3>2. 광고 파트너가 사용할 수 있는 정보</h3>
        <ul>
          <li>페이지 방문 정보(URL, 시간, 대략적 위치 등)</li>
          <li>브라우저/기기 정보(UA, OS, 화면 크기 등)</li>
          <li>쿠키 또는 광고 식별자(지역/설정/규정에 따라 다름)</li>
        </ul>

        <h3>3. 사용자가 할 수 있는 설정</h3>
        <ul>
          <li>브라우저에서 쿠키/사이트 데이터 관리(차단/삭제)</li>
          <li>Google 광고 설정에서 맞춤형 광고 관리</li>
          <li>추적 방지/개인정보 보호 모드 사용</li>
        </ul>

        <div className="content-callout">
          <b>더 자세한 내용</b>
          광고/쿠키 관련 상세 고지는 <Link to="/privacy">개인정보처리방침</Link>을 참고해
          주세요.
        </div>
      </article>
    </PageShell>
  );
}
