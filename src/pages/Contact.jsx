import React from "react";
import PageShell from "../components/PageShell.jsx";

export default function Contact() {
  return (
    <PageShell
      title="문의하기"
      sidebarTitle="CONTACT"
      sidebarLinks={[
        { to: "/", label: "테스트 홈" },
        { to: "/articles", label: "가이드·칼럼" },
        { to: "/faq", label: "FAQ" },
        { to: "/about", label: "소개" },
        { to: "/privacy", label: "개인정보처리방침" },
      ]}
    >
      <article className="content-body">
        <p>
          서비스 관련 문의는 아래 채널로 연락해 주세요. 가능하면 <b>페이지 주소(URL)</b>와
          함께 증상을 적어주시면 확인이 빨라요.
        </p>

        <h3>연락처</h3>
        <ul>
          <li>
            이메일: <a href="mailto:xenoager@naver.com">xenoager@naver.com</a>
          </li>
          <li>
            커피챗/후원: <a href="https://buymeacoffee.com/mindpickq">Buy Me a Coffee</a>
          </li>
        </ul>

        <h3>자주 오는 문의</h3>
        <ul>
          <li>테스트 결과가 마음에 들지 않아요 → FAQ에서 해석 팁을 확인해 주세요.</li>
          <li>페이지가 하얗게 떠요/버튼이 안 눌려요 → 브라우저 새로고침 후 재시도</li>
          <li>
            광고가 너무 많아요 → 광고는 콘텐츠 운영을 위한 최소한의 수익 모델이며, 비맞춤형
            광고가 표시될 수 있습니다.
          </li>
        </ul>

        <div className="content-callout">
          <b>콘텐츠 제안 환영</b>
          “이 주제의 테스트/칼럼이 있으면 좋겠다” 같은 아이디어도 편하게 보내주세요.
        </div>
      </article>
    </PageShell>
  );
}
