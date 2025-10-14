import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useParams,
} from "react-router-dom";
import { useEffect, useRef } from "react";
import Home from "./pages/Home.jsx";
import Quiz from "./pages/Quiz.jsx";
import Result from "./pages/Result.jsx";
import "./styles.css";
import Privacy from "./pages/Privacy.jsx";

/**
 * 전역 라우트 감시:
 * - 홈('/')에서 상세로 이동하는 순간: 스크롤Y 저장 + 복원 플래그 on
 * - 홈('/')으로 돌아오면: 복원은 Home.jsx에서 '목록 렌더 완료 후' 실행
 * - 브라우저 기본 스크롤 복원은 끈다.
 */
function ScrollKeeper() {
  const location = useLocation();
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  }, []);

  useEffect(() => {
    const from = prevPath.current;
    const to = location.pathname;

    // 홈에서 떠날 때: 현재 스크롤 저장 + 복원 필요 플래그 설정
    if (from === "/" && to !== "/") {
      try {
        sessionStorage.setItem(
          "ps:quiz-list:scroll",
          String(window.scrollY || 0)
        );
        sessionStorage.setItem("ps:quiz-list:need", "1");
      } catch {}
    }

    prevPath.current = to;
  }, [location]);

  return null;
}

// 동적 슬러그 라우트 가드:
// '/:slug'로 매칭되더라도 특정 예약어는 전용 페이지로 보냅니다.
function SlugSwitch() {
  const { slug } = useParams();
  // 필요시 'about', 'terms' 등도 여기에 추가 가능
  if (slug === "privacy") {
    return <Privacy />;
  }
  return <Quiz />;
}

export default function App() {
  return (
    <>
      <ScrollKeeper />
      <Routes>
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/" element={<Home />} />
        <Route path="/:slug/result/:type" element={<Result />} />
        <Route path="/:slug" element={<SlugSwitch />} />
      </Routes>
    </>
  );
}
