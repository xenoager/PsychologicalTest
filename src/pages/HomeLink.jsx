import React from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * HomeLink — <Link> 스타일을 유지하면서 '이전'처럼 동작하는 컴포넌트
 * - 클릭을 가로채 Back을 먼저 시도, 실패 시 "/"로 이동
 * - 스타일/접근성 면에서 a요소가 필요할 때 사용
 */
export default function HomeLink({ children = "홈으로", className, onClick, ...rest }) {
  const navigate = useNavigate();

  const handleClick = React.useCallback((e) => {
    try {
      sessionStorage.setItem("ps:quiz-list:need", "1");
    } catch {}
    if (onClick) onClick(e);
    if (e && typeof e.preventDefault === "function") e.preventDefault();

    try {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        navigate("/", { replace: true });
      }
    } catch {
      navigate("/", { replace: true });
    }
  }, [navigate, onClick]);

  // href="/"는 접근성/우클릭/롱프레스 복사 등을 위해 유지
  return (
    <Link to="/" className={className} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
