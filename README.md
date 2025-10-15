# Quiz — **Static Edition (No Server)**

서버 없이 **정적 호스팅**(Netlify, GitHub Pages 등)만으로 구동되는 스모어 스타일 유형테스트입니다.

- 모든 데이터는 `public/quizzes/*.json`으로 제공
- 채점 로직은 **브라우저(클라이언트)**에서 수행
- 공유용 **OG 메타 태그 페이지**는 결과별로 **정적 HTML**을 미리 만들어 제공합니다: `public/share/:slug/:resultId/index.html`

## 실행

```bash
cd web
npm install
npm run dev   # 개발 서버
npm run build # 정적 산출물 dist/ 생성
```

## 배포

`web/dist` 폴더를 Netlify, Vercel(Static), GitHub Pages 등에 업로드하면 끝입니다.

## 구성

```
web/
  public/
    quizzes/tinyping.json           # 퀴즈 정의
    share/tinyping/*/index.html     # 결과별 OG 페이지(정적)
    og-default.png                  # 기본 OG 이미지
  src/
    lib/engine.js                   # MBTI 엔진
    pages/Quiz.jsx, Result.jsx      # 페이지
    components/Progress.jsx         # 컴포넌트
    styles.css, main.jsx, App.jsx
  index.html
```

https://bold-jenn-kaionos-0733c85c.koyeb.app/

RSS.xml 만들기

node scripts\indexnow\setup-key.mjs

curl "https://searchadvisor.naver.com/indexnow?url=https://mindpickq.com/&key=319a8909b8fabce6a18179e2fc8840f2&keyLocation=https://mindpickq.com/319a8909b8fabce6a18179e2fc8840f2.txt"

set INDEXNOW_KEY=319a8909b8fabce6a18179e2fc8840f2
set SITE_ORIGIN=https://mindpickq.com
node scripts\indexnow\ping-bulk.mjs --verbose

node scripts\indexnow\setup-key.mjs --key 319a8909b8fabce6a18179e2fc8840f2 --out public\indexnow
npm run build & (배포)

node scripts\indexnow\ping-bulk.mjs ^
--site https://mindpickq.com ^
--key 319a8909b8fabce6a18179e2fc8840f2 ^
--key-location https://mindpickq.com/indexnow/319a8909b8fabce6a18179e2fc8840f2.txt ^
--endpoints https://searchadvisor.naver.com/indexnow ^
--verbose
