import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageShell from "../components/PageShell.jsx";
import Card from "../components/Card.jsx";

function renderBlock(block, idx) {
  const t = block?.type;
  if (t === "h3") return <h3 key={idx}>{block.text}</h3>;
  if (t === "h4") return <h4 key={idx}>{block.text}</h4>;
  if (t === "p") return <p key={idx}>{block.text}</p>;
  if (t === "ul")
    return (
      <ul key={idx}>
        {(block.items || []).map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    );
  if (t === "ol")
    return (
      <ol key={idx}>
        {(block.items || []).map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ol>
    );
  if (t === "callout")
    return (
      <div key={idx} className="content-callout">
        {block.title ? <b>{block.title}</b> : null}
        {block.text ? <div>{block.text}</div> : null}
        {Array.isArray(block.items) && block.items.length ? (
          <ul>
            {block.items.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  return null;
}

export default function Article() {
  const { slug } = useParams();

  const [article, setArticle] = useState(null);
  const [index, setIndex] = useState({ items: [] });
  const [catalog, setCatalog] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [aRes, iRes, cRes] = await Promise.all([
          fetch(`/articles/${slug}.json`, { cache: "no-cache" }),
          fetch(`/articles/index.json`, { cache: "no-cache" }),
          fetch(`/catalog.json`, { cache: "no-cache" }),
        ]);

        if (!aRes.ok) throw new Error("글을 불러올 수 없습니다.");
        const a = await aRes.json();
        const i = iRes.ok ? await iRes.json() : { items: [] };
        const c = cRes.ok ? await cRes.json() : { items: [] };
        if (!alive) return;
        setArticle(a);
        setIndex({ items: Array.isArray(i.items) ? i.items : [] });
        setCatalog({ items: Array.isArray(c.items) ? c.items : [] });
        setLoading(false);
      } catch (e) {
        if (!alive) return;
        setError(e);
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug]);

  const nav = useMemo(() => {
    const list = Array.isArray(index.items) ? index.items : [];
    const pos = list.findIndex((x) => x.slug === slug);
    const prev = pos > 0 ? list[pos - 1] : null;
    const next = pos >= 0 && pos < list.length - 1 ? list[pos + 1] : null;
    return { prev, next };
  }, [index.items, slug]);

  const related = useMemo(() => {
    const slugs = Array.isArray(article?.relatedQuizzes)
      ? article.relatedQuizzes
      : [];
    if (!slugs.length) return [];
    const map = new Map((catalog.items || []).map((it) => [it.slug, it]));
    return slugs.map((s) => map.get(s)).filter(Boolean);
  }, [article, catalog.items]);

  return (
    <PageShell
      title={article?.title || "가이드·칼럼"}
      sidebarTitle="CONTENTS"
      sidebarLinks={[
        { to: "/articles", label: "목록으로" },
        { to: "/", label: "테스트 홈" },
        { to: "/faq", label: "FAQ" },
        { to: "/privacy", label: "개인정보처리방침" },
        { to: "/terms", label: "이용약관" },
      ]}
    >
      {loading ? (
        <div className="empty">불러오는 중…</div>
      ) : error ? (
        <div className="empty">{String(error?.message || "오류")}</div>
      ) : !article ? (
        <div className="empty">글이 없습니다.</div>
      ) : (
        <article className="content-body">
          {article.subtitle && <p style={{ color: "#9fb6d1" }}>{article.subtitle}</p>}

          <div className="content-meta">
            {article.category ? <span>#{article.category}</span> : null}
            {article.readingTime ? <span>· {article.readingTime}</span> : null}
            {article.date ? <span>· {article.date}</span> : null}
            {Array.isArray(article.tags) && article.tags.length ? (
              <span>
                · {article.tags.slice(0, 4).map((t) => `#${t}`).join(" ")}
              </span>
            ) : null}
          </div>

          {(article.blocks || []).map(renderBlock)}

          {related.length ? (
            <>
              <h3>관련 테스트</h3>
              <div className="cards">
                {related.map((it) => (
                  <Card key={it.slug} item={it} activeCat={it.category || "전체"} q={""} />
                ))}
              </div>
            </>
          ) : null}

          <div className="content-callout">
            <b>다음/이전 글</b>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {nav.prev ? (
                <Link to={`/articles/${nav.prev.slug}`} className="pill">
                  ← {nav.prev.title}
                </Link>
              ) : (
                <span className="pill">← 이전 글 없음</span>
              )}
              {nav.next ? (
                <Link to={`/articles/${nav.next.slug}`} className="pill">
                  {nav.next.title} →
                </Link>
              ) : (
                <span className="pill">다음 글 없음 →</span>
              )}
            </div>
          </div>
        </article>
      )}
    </PageShell>
  );
}
