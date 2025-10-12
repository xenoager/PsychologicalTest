import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * HomeButton — "홈으로" 버튼이 브라우저 '이전'과 동일하게 동작하도록 함.
 * - 우선 window.history.back() 시도
 * - 히스토리가 없으면 안전하게 "/"로 이동 (replace)
 * - 복원 플래그를 세팅하여 Home에서 스크롤/카테고리 복원이 보장되도록 처리
 */
export default function HomeButton({ children = "홈으로", className, onClick, ...rest }) {
  const navigate = useNavigate();

  const handleClick = React.useCallback((e) => {
    try {
      // 홈 복귀 시 스크롤/카테고리 복원 트리거
      sessionStorage.setItem("ps:quiz-list:need", "1");
    } catch {}
    if (onClick) onClick(e);
    if (e && typeof e.preventDefault === "function") e.preventDefault();

    try {
      if (window.history.length > 1) {
        // 기존 히스토리가 있으면 Back
        window.history.back();
      } else {
        // 히스토리가 없으면 홈으로 대체
        navigate("/", { replace: true });
      }
    } catch {
      navigate("/", { replace: true });
    }
  }, [navigate, onClick]);

  return (
    <button type="button" className={className} onClick={handleClick} {...rest}>
      {children}
    </button>
  );
}
