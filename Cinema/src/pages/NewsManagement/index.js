import React, { useEffect, useState } from "react";
import { DataGrid } from "@material-ui/data-grid";
import { Button } from "@material-ui/core";
import newsApi from "../../api/newsApi";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4003";

function getAccessToken() {
  const normalize = (t = "") => String(t).replace(/^Bearer\s+/i, "").trim();

  // 1) các key hay gặp
  const directKeys = [
    "accessToken",
    "ACCESS_TOKEN",
    "token",
    "TOKEN",
    "jwt",
    "JWT",
    "Authorization",
    "AUTHORIZATION",
  ];

  for (const k of directKeys) {
    const v = localStorage.getItem(k);
    if (v) return normalize(v);
  }

  // 2) các object hay lưu (userLogin, user, userInfo, currentUser...)
  const objectKeys = [
    "userLogin",
    "USER_LOGIN",
    "USER",
    "user",
    "userInfo",
    "USER_INFO",
    "currentUser",
    "CURRENT_USER",
  ];

  for (const k of objectKeys) {
    const raw = localStorage.getItem(k);
    if (!raw) continue;
    try {
      const obj = JSON.parse(raw);
      const token =
        obj?.accessToken ||
        obj?.token ||
        obj?.user?.accessToken ||
        obj?.user?.token ||
        obj?.data?.accessToken ||
        obj?.data?.token;
      if (token) return normalize(token);
    } catch {}
  }

  // 3) redux-persist: persist:root (rất hay gặp)
  const persistRoot = localStorage.getItem("persist:root");
  if (persistRoot) {
    try {
      const rootObj = JSON.parse(persistRoot);

      // thử quét từng slice trong root
      for (const sliceKey of Object.keys(rootObj)) {
        const sliceRaw = rootObj[sliceKey];
        if (!sliceRaw) continue;

        // sliceRaw thường là JSON string
        try {
          const sliceObj = JSON.parse(sliceRaw);
          const token =
            sliceObj?.accessToken ||
            sliceObj?.token ||
            sliceObj?.user?.accessToken ||
            sliceObj?.user?.token ||
            sliceObj?.data?.accessToken ||
            sliceObj?.data?.token;
          if (token) return normalize(token);
        } catch {}
      }
    } catch {}
  }

  return "";
}


async function adminDeleteNewsBySlug(slug) {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Không tìm thấy accessToken trong localStorage");
  }

  const url = `${API_BASE}/api/QuanLyTinTuc/Admin/XoaTinTuc?slug=${encodeURIComponent(slug)}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || "Xoá thất bại");
  }
  return data;
}

export default function NewsManagement() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingSlug, setDeletingSlug] = useState("");

  const fetchNews = async () => {
    try {
      setLoading(true);

      const res = await newsApi.adminList({
        status: "ALL",
        category: "ALL",
        page: 1,
        pageSize: 20,
        q: "",
      });

      // ✅ ăn cả 2 trường hợp: axios trả {data:...} hoặc interceptor trả thẳng data
      const data = res?.data ?? res;

      const items = data?.items ?? [];
      setRows(items.map((x) => ({ ...x, id: x.id })));
    } catch (err) {
      console.log("NEWS LIST error =", err);
      alert("Không tải được danh sách tin tức - kiểm tra token hoặc API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleDelete = async (row) => {
    const slug = row?.slug;
    if (!slug) {
      alert("Thiếu slug để xoá");
      return;
    }

    const ok = window.confirm(`Bạn chắc chắn muốn xoá tin: "${row.title}" ?`);
    if (!ok) return;

    try {
      setDeletingSlug(slug);

      await adminDeleteNewsBySlug(slug);

      // ✅ update UI ngay (đỡ phải đợi fetch)
      setRows((prev) => prev.filter((x) => x.slug !== slug));

      // ✅ nếu muốn chắc chắn sync DB (tuỳ chọn)
      // await fetchNews();

      alert("Xoá tin tức thành công!");
    } catch (e) {
      alert(e?.message || "Xoá thất bại");
    } finally {
      setDeletingSlug("");
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "title", headerName: "Tiêu đề", width: 320 },
    { field: "slug", headerName: "Slug", width: 200 },
    { field: "category", headerName: "Category", width: 120 },
    { field: "status", headerName: "Status", width: 120 },
    { field: "viewCount", headerName: "Views", width: 90 },
    {
      field: "thumbnailUrl",
      headerName: "Ảnh",
      width: 140,
      renderCell: (params) => {
        const src = params.row.thumbnailUrl || params.row.coverUrl;
        return src ? (
          <img
            alt="thumb"
            src={src}
            style={{ width: 110, height: 60, objectFit: "cover", borderRadius: 6 }}
          />
        ) : null;
      },
    },
    {
      field: "actions",
      headerName: "Thao tác",
      width: 250,
      sortable: false,
      renderCell: (params) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            size="small"
            variant="outlined"
            color="primary"
            onClick={() => window.location.assign(`/admin/news/edit/${params.row.slug}`)}
          >
            Sửa
          </Button>

          <Button
            size="small"
            variant="outlined"
            color="secondary"
            disabled={deletingSlug === params.row.slug}
            onClick={() => handleDelete(params.row)}
          >
            {deletingSlug === params.row.slug ? "Đang xoá..." : "Xoá"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ height: 650, width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <h2>Quản lý Tin tức</h2>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.assign("/admin/news/add")}
        >
          + Thêm tin
        </Button>
      </div>

      <DataGrid rows={rows} columns={columns} loading={loading} getRowId={(row) => row.id} />
    </div>
  );
}
