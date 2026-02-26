import React from "react";
import PageShell from "../components/PageShell.jsx";

export default function Terms() {
  const today = "2026-02-25";
  return (
    <PageShell
      title="이용약관"
      sidebarTitle="LEGAL"
      sidebarLinks={[
        { to: "/", label: "홈" },
        { to: "/privacy", label: "개인정보처리방침" },
        { to: "/cookies", label: "쿠키·광고" },
        { to: "/disclaimer", label: "면책" },
        { to: "/contact", label: "문의" },
      ]}
    >
      <article className="content-body policy-body">
        <p>
          <b>시행일자:</b> {today}
        </p>

        <h3>1. 목적</h3>
        <p>
          본 약관은 마인드픽Q(이하 “서비스”)가 제공하는 유형테스트, 가이드·칼럼 및 관련
          부가 기능의 이용 조건과 운영자 및 이용자의 권리·의무를 규정합니다.
        </p>

        <h3>2. 서비스의 성격</h3>
        <ul>
          <li>
            본 서비스의 테스트·칼럼은 재미와 자기이해를 돕기 위한 정보이며, 의학적 진단이나
            치료를 대체하지 않습니다.
          </li>
          <li>
            서비스는 회원가입 없이 이용할 수 있으며, 응답/결과는 브라우저에서 처리됩니다.
          </li>
        </ul>

        <h3>3. 광고 및 외부 링크</h3>
        <ul>
          <li>
            서비스는 운영을 위해 광고(예: Google AdSense)를 게재할 수 있습니다.
          </li>
          <li>
            서비스 내 외부 링크(예: 후원/제휴 링크)는 외부 사이트로 연결되며, 외부 사이트의
            정책·서비스 품질은 당사가 통제하지 않습니다.
          </li>
        </ul>

        <h3>4. 금지행위</h3>
        <ul>
          <li>서비스의 정상 운영을 방해하는 행위(과도한 트래픽 유발 등)</li>
          <li>콘텐츠 무단 복제/전송/상업적 재판매</li>
          <li>타인의 권리 침해(명예훼손, 저작권 침해 등)</li>
        </ul>

        <h3>5. 저작권</h3>
        <p>
          서비스에 게시된 UI, 문구, 테스트/칼럼 콘텐츠(운영자 작성분)의 저작권은 운영자에
          귀속됩니다. 인용 시 출처를 표시하고, 상업적 이용은 사전 협의가 필요합니다.
        </p>

        <h3>6. 면책</h3>
        <p>
          운영자는 천재지변, 통신 장애, 제3자 서비스 장애 등 불가항력 사유로 인한 서비스
          제공 중단에 대해 책임을 지지 않습니다. 또한 테스트 결과에 근거한 이용자의 의사결정
          및 그 결과에 대해 책임을 지지 않습니다.
        </p>

        <h3>7. 약관 변경</h3>
        <p>
          법령 및 서비스 정책 변경에 따라 약관은 개정될 수 있으며, 개정 시 서비스 내 공지로
          안내합니다.
        </p>
      </article>
    </PageShell>
  );
}
