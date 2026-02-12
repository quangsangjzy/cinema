import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../news.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4003";

export default function TinTucDetails() {
  const { slug } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState({ item: null, related: [] });

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `${API_BASE}/api/QuanLyTinTuc/LayChiTietTinTuc?slug=${encodeURIComponent(slug)}`
        );
        const json = await res.json();

        if (!alive) return;

        if (!res.ok) {
          setError(json?.message || "Không tìm thấy bài viết");
          setData({ item: null, related: [] });
          return;
        }

        setData({
          item: json?.item || null,
          related: Array.isArray(json?.related) ? json.related : [],
        });
      } catch (e) {
        if (!alive) return;
        setError("Không tải được bài viết. Vui lòng thử lại.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [slug]);

  if (loading) return <div className="news-container" style={{ padding: 16 }}>Đang tải...</div>;
  if (error) return <div className="news-container" style={{ padding: 16, color: "red" }}>{error}</div>;
  if (!data.item) return null;

  const { item, related } = data;

  return (
    <div className="news-page">
      <div className="news-container">
        <div style={{ background: "#fff", borderRadius: 16, padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>{item.title}</h2>

          {item.coverUrl ? (
            <img
              src={item.coverUrl}
              alt={item.title}
              style={{
                width: "100%",
                maxHeight: 360,
                objectFit: "cover",
                borderRadius: 12,
                marginBottom: 12,
              }}
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ) : null}

          {item.excerpt ? (
            <p style={{ opacity: 0.85, marginTop: 0 }}>{item.excerpt}</p>
          ) : null}

          <div
            style={{ marginTop: 12, lineHeight: 1.7 }}
            dangerouslySetInnerHTML={{ __html: item.content || "" }}
          />
        </div>

        {related.length ? (
          <div style={{ marginTop: 18 }}>
            <h3 style={{ color: "#fff", marginBottom: 10 }}>Bài viết liên quan</h3>

            <div className="news-grid" style={{ gap: 12 }}>
              {related.map((r) => (
                <a
                  key={r.id || r.slug}
                  href={`/tintuc/${r.slug}`}
                  style={{
                    display: "block",
                    background: "#fff",
                    borderRadius: 12,
                    overflow: "hidden",
                    textDecoration: "none",
                    color: "#111",
                  }}
                >
                  {r.thumbnailUrl || r.coverUrl ? (
                    <img
                      src={r.thumbnailUrl || r.coverUrl}
                      alt={r.title}
                      style={{ width: "100%", height: 160, objectFit: "cover" }}
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : null}
                  <div style={{ padding: 10, fontWeight: 600 }}>{r.title}</div>
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
