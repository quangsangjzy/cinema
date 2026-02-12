// src/pages/Newspage/index.js
import React, { useEffect, useMemo, useState } from "react";
import Slider from "react-slick";
import "./news.css";

// Nếu dự án bạn đã import slick css ở nơi khác rồi thì có thể xoá 2 dòng dưới để khỏi import trùng
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4003";

const CATEGORY_LABEL = {
  PROMO: "KHUYẾN MÃI",
  SIDELINE: "BÊN LỀ",
  EVENT: "SỰ KIỆN",
  RECRUIT: "TUYỂN DỤNG",
};

function PromoArrow({ className = "", onClick, direction = "prev" }) {
  // react-slick tự truyền className có "slick-disabled" -> CSS của bạn đã xử lý .promo-arrow.slick-disabled
  return (
    <button
      type="button"
      className={`promo-arrow ${direction} ${className}`}
      onClick={onClick}
      aria-label={direction === "prev" ? "Previous" : "Next"}
    >
      {direction === "prev" ? "‹" : "›"}
    </button>
  );
}

function safeImgSrc(item) {
  // Ưu tiên coverUrl, fallback thumbnailUrl
  return item?.coverUrl || item?.thumbnailUrl || "";
}

function NewsCard({ item, size = "mini" }) {
  if (!item) return null;

  // ✅ FIX: dùng /tintuc/:slug
  const href = item.slug ? `/tintuc/${item.slug}` : "#";
  const tag = CATEGORY_LABEL[item.category] || item.category || "TIN TỨC";

  return (
    <a className={`promo-card ${size}`} href={href}>
      <div className="promo-image-wrap">
        <span className="promo-tag">{tag}</span>
        <img
          className="promo-image"
          src={safeImgSrc(item)}
          alt={item.title || "tin-tuc"}
          onError={(e) => {
            // giữ layout + background grey của CSS, không vỡ UI
            e.currentTarget.style.display = "none";
          }}
        />
      </div>
      <h3 className="promo-title">{item.title}</h3>
    </a>
  );
}

export default function NewsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [home, setHome] = useState({
    featuredPromos: [],
    promoCarousel: [],
    sideline: {
      featured: null,
      rightTop: [],
      carousel: [],
    },
  });

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${API_BASE}/api/QuanLyTinTuc/LayTinTucTrangChu`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (!alive) return;

        setHome({
          featuredPromos: Array.isArray(data?.featuredPromos) ? data.featuredPromos : [],
          promoCarousel: Array.isArray(data?.promoCarousel) ? data.promoCarousel : [],
          sideline: {
            featured: data?.sideline?.featured || null,
            rightTop: Array.isArray(data?.sideline?.rightTop) ? data.sideline.rightTop : [],
            carousel: Array.isArray(data?.sideline?.carousel) ? data.sideline.carousel : [],
          },
        });
      } catch (e) {
        if (!alive) return;
        setError("Không tải được tin tức. Kiểm tra backend (4003) và API /LayTinTucTrangChu.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const featured = home.featuredPromos || [];
  const promoCarousel = home.promoCarousel || [];
  const sideline = home.sideline || {};
  const sidelineFeatured = sideline.featured || null;
  const sidelineRightTop = sideline.rightTop || [];
  const sidelineCarouselAll = sideline.carousel || [];

  // Tránh lặp tin: không hiển thị lại bài đã dùng ở khối Tin bên lề (ảnh lớn + 2 ảnh nhỏ)
  const sidelineCarouselUnique = useMemo(() => {
    const used = new Set();
    if (sidelineFeatured?.slug) used.add(String(sidelineFeatured.slug));
    (sidelineRightTop || []).forEach((x) => x?.slug && used.add(String(x.slug)));

    const out = [];
    const seen = new Set();
    (sidelineCarouselAll || []).forEach((item) => {
      const slug = item?.slug ? String(item.slug) : "";
      const key = slug || (item?.id ? String(item.id) : "");
      if (!key) return;
      if (slug && used.has(slug)) return;
      if (seen.has(key)) return;
      seen.add(key);
      out.push(item);
    });

    return out;
  }, [sidelineFeatured, sidelineRightTop, sidelineCarouselAll]);
  const promoSliderSettings = useMemo(
    () => ({
      dots: false,
      infinite: promoCarousel.length > 4,
      speed: 450,
      slidesToShow: 4,
      slidesToScroll: 1,
      arrows: true,
      prevArrow: <PromoArrow direction="prev" />,
      nextArrow: <PromoArrow direction="next" />,
      responsive: [
        { breakpoint: 1100, settings: { slidesToShow: 3 } },
        { breakpoint: 900, settings: { slidesToShow: 2 } },
        { breakpoint: 600, settings: { slidesToShow: 1 } },
      ],
    }),
    [promoCarousel.length]
  );

  const sidelineSliderSettings = useMemo(
    () => ({
      dots: false,
      infinite: sidelineCarouselUnique.length > 5,
      speed: 450,
      slidesToShow: 5,
      slidesToScroll: 1,
      arrows: true,
      prevArrow: <PromoArrow direction="prev" />,
      nextArrow: <PromoArrow direction="next" />,
      responsive: [
        { breakpoint: 1100, settings: { slidesToShow: 4 } },
        { breakpoint: 900, settings: { slidesToShow: 3 } },
        { breakpoint: 600, settings: { slidesToShow: 2 } },
      ],
    }),
    [sidelineCarouselUnique.length]
  );

  // Layout: 1 card lớn + 2 card nhỏ (đúng grid CSS)
  const bigPromo = featured?.[0] || null;
  const smallPromo1 = featured?.[1] || null;
  const smallPromo2 = featured?.[2] || null;

  return (
    <div className="news-page">
      <div className="news-container">
        <div className="news-header">
          <h2 className="news-heading">Tin tức</h2>
          <button
            className="news-more"
            type="button"
            onClick={() => {
              // ✅ Nếu bạn có trang danh sách tin riêng thì điều hướng về /tintuc
              window.location.href = "/tintuc";
            }}
          >
            Xem thêm
          </button>
        </div>

        {error ? (
          <div style={{ padding: 12, borderRadius: 10, background: "#fff3f3", color: "#b00020" }}>
            {error}
          </div>
        ) : null}

        {/* GRID giống CSS bạn làm */}
        <div className="news-grid">
          <div className="news-left">
            {loading ? (
              <div style={{ padding: 10 }}>Đang tải...</div>
            ) : (
              <NewsCard item={bigPromo} size="large" />
            )}
          </div>

          <div className="news-right">
            {loading ? (
              <>
                <div style={{ padding: 10 }}>Đang tải...</div>
                <div style={{ padding: 10 }}>Đang tải...</div>
              </>
            ) : (
              <>
                <NewsCard item={smallPromo1} size="small" />
                <NewsCard item={smallPromo2} size="small" />
              </>
            )}
          </div>
        </div>

        {/* CAROUSEL PROMO */}
        <div className="news-carousel">
          {loading ? (
            <div style={{ padding: 10 }}>Đang tải...</div>
          ) : promoCarousel.length === 0 ? (
            <div style={{ padding: 10 }}>Chưa có bài viết.</div>
          ) : (
            <Slider {...promoSliderSettings}>
              {promoCarousel.map((item) => (
                <div className="news-slick-item" key={item.id || item.slug}>
                  <NewsCard item={item} size="mini" />
                </div>
              ))}
            </Slider>
          )}
        </div>

        {/* ===== TIN BÊN LỀ ===== */}
        <div className="sideline-block">
          <div className="news-header" style={{ marginTop: 8 }}>
            <h2 className="news-heading">Tin bên lề</h2>
          </div>

          <div className="sideline-grid">
            <div className="sideline-left">
              {loading ? (
                <div style={{ padding: 10 }}>Đang tải...</div>
              ) : sidelineFeatured ? (
                <a
                  className="side-featured"
                  // ✅ FIX: dùng /tintuc/:slug
                  href={sidelineFeatured.slug ? `/tintuc/${sidelineFeatured.slug}` : "#"}
                >
                  <div className="side-featured-img">
                    <img
                      src={safeImgSrc(sidelineFeatured)}
                      alt={sidelineFeatured.title || "sideline-featured"}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <div className="side-featured-overlay">
                      <div className="side-featured-title">{sidelineFeatured.title}</div>
                    </div>
                  </div>
                </a>
              ) : (
                <div style={{ padding: 10 }}>Chưa có tin bên lề.</div>
              )}
            </div>

            <div className="sideline-right">
              {loading ? (
                <>
                  <div style={{ padding: 10 }}>Đang tải...</div>
                  <div style={{ padding: 10 }}>Đang tải...</div>
                </>
              ) : (
                sidelineRightTop.map((item) => (
                  <a
                    className="side-small"
                    // ✅ FIX: dùng /tintuc/:slug
                    href={item.slug ? `/tintuc/${item.slug}` : "#"}
                    key={item.id || item.slug}
                  >
                    <div className="side-small-img">
                      <img
                        src={safeImgSrc(item)}
                        alt={item.title || "sideline"}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                    <div className="side-small-title">{item.title}</div>
                  </a>
                ))
              )}
            </div>
          </div>

          <div className="sideline-carousel">
            {loading ? (
              <div style={{ padding: 10 }}>Đang tải...</div>
            ) : sidelineCarouselUnique.length === 0 ? (
              <div style={{ padding: 10 }}>Chưa có bài viết.</div>
            ) : (
              <Slider {...sidelineSliderSettings}>
                {sidelineCarouselUnique.map((item) => (
                  <div className="news-slick-item" key={item.id || item.slug}>
                    <a
                      className="side-mini"
                      // ✅ FIX: dùng /tintuc/:slug
                      href={item.slug ? `/tintuc/${item.slug}` : "#"}
                    >
                      <div className="side-mini-img">
                        <img
                          src={safeImgSrc(item)}
                          alt={item.title || "sideline-mini"}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                      <div className="side-mini-title">{item.title}</div>
                    </a>
                  </div>
                ))}
              </Slider>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
