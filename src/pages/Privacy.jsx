// src/pages/Privacy.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Privacy() {
  const today = "2025-10-14"; // 배포 시 갱신
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
            <div className="kicker">INFO</div>
            <nav className="category">
              <Link to="/" className="cat">
                홈으로
              </Link>
              <a className="cat" href="/rss.xml">
                RSS
              </a>
            </nav>
          </aside>

          <main className="main">
            <section className="section">
              <h2>개인정보처리방침</h2>
              <article className="policy-body">
                <p>
                  <b>시행일자:</b> {today}
                </p>
                <p>
                  <b>적용 서비스:</b> 마인드픽Q(유형테스트 포털) —{" "}
                  <small>정적 웹앱</small>
                </p>
                <p>
                  <b>개인정보처리자(운영자):</b> [앱팩토리/김태선] / 연락처:
                  [xenoager@naver.com/010-3935-0033] / 주소: [경기도 부천시
                  옥길로55]
                </p>

                <h3>1. 처리 목적</h3>
                <ul>
                  <li>퀴즈 제공, 결과 산출 및 화면 표시(클라이언트 내 처리)</li>
                  <li>
                    서비스 품질 개선(비식별 통계, 페이지 뷰 등 —{" "}
                    <em>1st-party 수집 없음</em>)
                  </li>
                  <li>광고 제공 및 성과 측정(제3자: Google AdSense)</li>
                </ul>

                <h3>2. 수집 항목 · 수집 방법</h3>
                <p>
                  <b>(1) 당사 직접 수집</b>: 회원가입/로그인/서버 저장 없음.
                  퀴즈 응답/결과는 <b>브라우저 메모리</b>에서만 처리되며 서버로
                  전송하지 않습니다.
                </p>
                <p>
                  <b>(2) 자동 수집</b>: 브라우저 <code>sessionStorage</code>에
                  스크롤 위치·카테고리만 저장합니다(예: <code>ps:*</code>,{" "}
                  <code>scroll-pos:*</code>). 쿠키/로컬스토리지는 사용하지
                  않습니다.
                </p>
                <p>
                  <b>(3) 제3자(광고)</b>: Google AdSense가 광고 제공·성과 측정을
                  위해 쿠키/기기식별자, IP/UA 등 정보를 수집·사용할 수 있습니다.
                  맞춤형/비맞춤형 광고 여부는 사용자의 설정/지역 규정에 따라
                  달라질 수 있습니다.
                </p>

                <h3>3. 보유 및 이용 기간</h3>
                <ul>
                  <li>
                    <b>당사 저장 데이터</b>: 없음.
                  </li>
                  <li>
                    <b>세션 저장소</b>: 브라우저 탭 종료 시 또는 사용자가 수동
                    삭제 시 자동 삭제.
                  </li>
                  <li>
                    <b>제3자(광고)</b>: 각 파트너의 정책/설정에 따름.
                  </li>
                </ul>

                <h3>4. 제3자 제공</h3>
                <p>
                  당사는 이용자 정보를 제3자에게 제공하지 않습니다. 다만,{" "}
                  <b>광고 파트너(AdSense)</b>는 독립된 개인정보처리자로서 자체
                  정책과 책임 하에 정보를 처리합니다.
                </p>

                <h3>5. 처리의 위탁 및 국외 이전</h3>
                <table>
                  <thead>
                    <tr>
                      <th>수탁사(국가)</th>
                      <th>업무</th>
                      <th>이전 항목</th>
                      <th>보유기간</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Google LLC / Google Ireland (미국/아일랜드)</td>
                      <td>광고 제공·성과 측정(AdSense)</td>
                      <td>쿠키·기기식별자, IP/UA, 페이지 방문 정보 등</td>
                      <td>파트너 정책에 따름</td>
                    </tr>
                  </tbody>
                </table>
                <p>
                  <small>
                    ※ 국외 이전 관련 세부 고지(이전 일시/방법 등)는 운영자
                    정책에 따라 보완 가능합니다.
                  </small>
                </p>

                <h3>6. 이용자 권리와 행사 방법</h3>
                <p>
                  당사는 직접 수집한 개인정보를 보유하지 않습니다. 광고/쿠키
                  설정은 브라우저의 쿠키 설정 및 Google 광고 설정에서 관리할 수
                  있습니다. 기타 문의·요청(열람/삭제/정지 등)은 아래 연락처로
                  접수 바랍니다.
                </p>

                <h3>7. 자동수집 장치(쿠키 등) 안내</h3>
                <ul>
                  <li>
                    당사: 쿠키 미사용, <code>sessionStorage</code>만 사용(세션
                    종료 시 삭제)
                  </li>
                  <li>제3자: 광고 파트너가 쿠키·기기식별자를 사용할 수 있음</li>
                </ul>

                <h3>8. 안전성 확보 조치</h3>
                <ul>
                  <li>전송구간 암호화(HTTPS) 사용</li>
                  <li>민감정보 미수집·미저장</li>
                  <li>정적 호스팅 기반으로 서버 측 개인정보 저장 최소화</li>
                </ul>

                <h3>9. 개인정보 파기</h3>
                <p>
                  당사 보유 개인정보가 없으므로 별도 파기 대상이 없습니다. 세션
                  저장소 정보는 브라우저 종료 시 삭제됩니다.
                </p>

                <h3>10. 광고성 정보 전송</h3>
                <p>푸시/이메일 등 직접 광고 발송 기능을 운영하지 않습니다.</p>

                <h3>11. 개인정보 보호책임자</h3>
                <p>
                  성명: [김태선] / 직책: [과장] / 이메일: [xenoager@naver.com] /
                  전화: [010-3935-0033] / 주소: [경기도 부천시 옥길로55]
                </p>

                <h3>12. 고지 및 개정</h3>
                <p>
                  본 방침은 서비스/법령 변경에 따라 개정될 수 있으며, 개정 시
                  시행 7일 전부터 서비스 내 공지합니다.
                </p>
              </article>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
