import React from "react";
import PageShell from "../components/PageShell.jsx";

export default function About() {
  return (
    <PageShell
      title="마인드픽Q 소개"
      sidebarTitle="SERVICE"
      sidebarLinks={[
        { to: "/", label: "테스트 홈" },
        { to: "/articles", label: "가이드·칼럼" },
        { to: "/faq", label: "FAQ" },
        { to: "/contact", label: "문의" },
        { to: "/privacy", label: "개인정보처리방침" },
      ]}
    >
      <article className="content-body">
        <p>
          <b>마인드픽Q</b>는 “가볍게 해보고, 더 깊게 이해하기”를 목표로 만든 유형테스트
          포털입니다. MBTI·연애·습관·커리어·부모&육아 등 다양한 주제의 테스트를 한
          곳에서 빠르게 찾아볼 수 있도록 정리했습니다.
        </p>

        <h3>우리가 지키는 원칙</h3>
        <ul>
          <li>
            <b>개인정보 최소화</b>: 회원가입/로그인 없이, 응답은 브라우저에서만 처리합니다.
          </li>
          <li>
            <b>과도한 단정 지양</b>: 결과는 ‘성향’에 대한 참고 자료이며, 진단·치료를 대체하지
            않습니다.
          </li>
          <li>
            <b>더 읽을거리 제공</b>: 테스트 후 “왜 이런 결과가 나왔는지”를 이해할 수 있도록
            가이드·칼럼을 함께 제공합니다.
          </li>
        </ul>

        <h3>추천 이용 방법</h3>
        <ol>
          <li>관심 주제를 고르고 테스트를 진행해요.</li>
          <li>결과 페이지에서 핵심 포인트를 정리해요(메모/스크린샷 추천).</li>
          <li>
            <b>가이드·칼럼</b>에서 실전 팁(대화/습관/관계)을 확인해요.
          </li>
        </ol>

        <div className="content-callout">
          <b>운영 문의</b>
          제휴/광고/콘텐츠 제안/오류 제보는 ‘문의’ 페이지로 남겨주세요.
        </div>
      </article>
    </PageShell>
  );
}
