import React from "react";
import PageShell from "../components/PageShell.jsx";
import { Link } from "react-router-dom";

export default function FAQ() {
  return (
    <PageShell
      title="자주 묻는 질문(FAQ)"
      sidebarTitle="HELP"
      sidebarLinks={[
        { to: "/", label: "테스트 홈" },
        { to: "/articles", label: "가이드·칼럼" },
        { to: "/about", label: "소개" },
        { to: "/contact", label: "문의" },
        { to: "/privacy", label: "개인정보처리방침" },
      ]}
    >
      <article className="content-body">
        <h3>Q. 테스트 결과가 ‘맞다/틀리다’로 느껴져요.</h3>
        <p>
          유형테스트는 ‘성향’을 단순화한 모델이에요. 결과를 정답처럼 받아들이기보다는
          <b>“내가 요즘 어떤 상태인지”</b>를 돌아보는 체크리스트로 활용해 주세요.
        </p>

        <h3>Q. 개인정보를 수집하나요?</h3>
        <p>
          회원가입/로그인/서버 저장이 없고, 응답은 브라우저에서만 처리됩니다. 자세한 내용은
          <Link to="/privacy"> 개인정보처리방침</Link>을 확인해 주세요.
        </p>

        <h3>Q. 광고(AdSense)는 왜 나오나요?</h3>
        <p>
          콘텐츠 제작·서버/도메인 운영 비용을 충당하기 위한 최소한의 수익 모델입니다. 지역
          규정 및 사용자 설정에 따라 맞춤형/비맞춤형 광고가 표시될 수 있어요.
        </p>

        <h3>Q. 결과 페이지를 공유해도 괜찮나요?</h3>
        <p>
          네. 다만, 타인의 민감한 개인정보(실명/연락처/주소 등)가 노출되지 않도록 주의해
          주세요.
        </p>

        <h3>Q. 테스트가 로딩되지 않아요.</h3>
        <ul>
          <li>브라우저 새로고침 후 다시 시도</li>
          <li>광고 차단/추적 차단 확장 기능을 잠시 꺼보기</li>
          <li>모바일 데이터/와이파이 전환</li>
        </ul>

        <h3>Q. 새로운 테스트/칼럼을 추가해 달라고 요청할 수 있나요?</h3>
        <p>
          가능해요. <Link to="/contact">문의하기</Link>로 주제와 원하는 방향을 보내주세요.
        </p>
      </article>
    </PageShell>
  );
}
