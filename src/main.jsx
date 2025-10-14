import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Quiz from "./pages/Quiz.jsx";
import Result from "./pages/Result.jsx";
import "./styles.css";
import Privacy from "./pages/Privacy.jsx"; // ← 추가

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/privacy" element={<Privacy />} /> {/* ← 추가 */}
        <Route path="/" element={<Home />} />
        <Route path="/:slug" element={<Quiz />} />
        <Route path="/:slug/result/:type" element={<Result />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
