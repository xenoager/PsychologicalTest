import React from "react";
import PageShell from "../components/PageShell.jsx";

export default function Disclaimer() {
  return (
    <PageShell
      title="면책조항(Disclaimer)"
      sidebarTitle="LEGAL"
      sidebarLinks={[
        { to: "/", label: "홈" },
        { to: "/terms", label: "이용약관" },
        { to: "/privacy", label: "개인정보처리방침" },
        { to: "/cookies", label: "쿠키·광고" },
        { to: "/contact", label: "문의" },
      ]}
    >
      <article className="content-body policy-body">
        <h3>1. 정보 제공 목적</h3>
        <p>
          마인드픽Q의 테스트/칼럼은 재미와 자기이해를 돕기 위한 정보 제공 목적으로
          제작되었습니다.
        </p>

        <h3>2. 의료·전문 상담 대체 불가</h3>
        <p>
          본 서비스는 의학적 진단, 치료, 전문 상담(심리상담/법률/재무 등)을 대체하지
          않습니다. 심각한 불안/우울/수면 문제 등으로 일상 기능에 어려움이 있다면
          전문가(의사/상담사)와 상의하세요.
        </p>

        <h3>3. 결과 해석의 한계</h3>
        <ul>
          <li>문항은 제한된 상황을 가정하여 단순화되어 있습니다.</li>
          <li>응답 당시 기분/컨디션에 따라 결과가 달라질 수 있습니다.</li>
          <li>
            결과는 “라벨”이 아니라, 행동/감정 패턴을 점검하는 참고 포인트로 활용하는 것을
            권장합니다.
          </li>
        </ul>

        <h3>4. 외부 링크</h3>
        <p>
          서비스 내 외부 링크로 이동한 이후의 콘텐츠/상품/정책은 각 제공자의 책임 하에
          운영됩니다.
        </p>
      </article>
    </PageShell>
  );
}
