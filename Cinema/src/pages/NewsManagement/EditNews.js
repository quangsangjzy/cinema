import React, { useEffect, useState } from "react";
import { Button, MenuItem, Select, TextField } from "@material-ui/core";
import { useSnackbar } from "notistack";
import { useHistory, useParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import uploadApi from "../../api/uploadApi";

export default function EditNews() {
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();
  const { slug } = useParams(); // route: /admin/news/edit/:slug

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "PROMO",
    status: "DRAFT",
    isFeatured: 0,
    pinOrder: 0,
    thumbnailUrl: "",
    coverUrl: "",
  });

  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const onChange = (key) => (e) => {
    const value = e?.target?.type === "number" ? Number(e.target.value) : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Fetch admin detail by slug
  useEffect(() => {
    let alive = true;
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get("/QuanLyTinTuc/Admin/LayChiTietTinTuc", {
          params: { slug },
        });
        const data = res?.data?.data || res?.data;
        if (!data) throw new Error("EMPTY");
        if (!alive) return;

        setForm({
          title: data.title || "",
          excerpt: data.excerpt || "",
          content: data.content || "",
          category: data.category || "PROMO",
          status: data.status || "DRAFT",
          isFeatured: Number(data.isFeatured || 0),
          pinOrder: Number(data.pinOrder ?? 0),
          thumbnailUrl: data.thumbnailUrl || "",
          coverUrl: data.coverUrl || "",
        });
      } catch (err) {
        console.error(err);
        enqueueSnackbar("Không tìm thấy bài viết", { variant: "error" });
        history.replace("/admin/news");
      } finally {
        if (alive) setLoading(false);
      }
    };
    fetchDetail();
    return () => { alive = false; };
  }, [slug, enqueueSnackbar, history]);

  // Upload thumbnail
  const uploadThumb = async (file) => {
    try {
      setUploadingThumb(true);
      const res = await uploadApi.uploadTinTucImage(file);
      const url = res?.url || res?.data?.url;
      if (!url) throw new Error("No URL returned");
      setForm((prev) => ({ ...prev, thumbnailUrl: url }));
      enqueueSnackbar("Tải ảnh thumbnail thành công", { variant: "success" });
    } catch (e) {
      console.error(e);
      enqueueSnackbar("Tải ảnh thumbnail thất bại", { variant: "error" });
    } finally {
      setUploadingThumb(false);
    }
  };

  // Upload cover
  const uploadCover = async (file) => {
    try {
      setUploadingCover(true);
      const res = await uploadApi.uploadTinTucImage(file);
      const url = res?.url || res?.data?.url;
      if (!url) throw new Error("No URL returned");
      setForm((prev) => ({ ...prev, coverUrl: url }));
      enqueueSnackbar("Tải ảnh cover thành công", { variant: "success" });
    } catch (e) {
      console.error(e);
      enqueueSnackbar("Tải ảnh cover thất bại", { variant: "error" });
    } finally {
      setUploadingCover(false);
    }
  };

  const validate = () => {
    if (!form.title?.trim()) return enqueueSnackbar("Vui lòng nhập tiêu đề", { variant: "warning" });
    if (!["PROMO","SIDELINE","EVENT","RECRUIT"].includes(form.category))
      return enqueueSnackbar("Danh mục không hợp lệ", { variant: "warning" });
    if (!["DRAFT","PUBLISHED","HIDDEN"].includes(form.status))
      return enqueueSnackbar("Trạng thái không hợp lệ", { variant: "warning" });
    return true;
  };

  const submit = async () => {
    if (validate() !== true) return;
    try {
      setSaving(true);
      await axiosClient.put("/QuanLyTinTuc/Admin/CapNhatTinTuc", form, { params: { slug } });
      enqueueSnackbar("Cập nhật thành công", { variant: "success" });
      history.push("/admin/news");
    } catch (e) {
      console.error(e);
      enqueueSnackbar("Cập nhật thất bại", { variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Đang tải chi tiết...</div>;

  return (
    <div style={{ maxWidth: 900 }}>
      <h2>Sửa tin tức</h2>

      <div style={{ display: "grid", gap: 12 }}>
        <TextField label="Tiêu đề" variant="outlined" value={form.title} onChange={onChange("title")} />
        <TextField label="Mô tả ngắn" variant="outlined" multiline rows={2} value={form.excerpt} onChange={onChange("excerpt")} />
        <TextField label="Nội dung (HTML hoặc text)" variant="outlined" multiline rows={10} value={form.content} onChange={onChange("content")} />

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ width: 200 }}>
            <div style={{ fontWeight: 600 }}>Danh mục</div>
            <Select fullWidth variant="outlined" value={form.category} onChange={onChange("category")}>
              <MenuItem value="PROMO">PROMO</MenuItem>
              <MenuItem value="SIDELINE">SIDELINE</MenuItem>
              <MenuItem value="EVENT">EVENT</MenuItem>
              <MenuItem value="RECRUIT">RECRUIT</MenuItem>
            </Select>
          </div>

          <div style={{ width: 200 }}>
            <div style={{ fontWeight: 600 }}>Trạng thái</div>
            <Select fullWidth variant="outlined" value={form.status} onChange={onChange("status")}>
              <MenuItem value="DRAFT">DRAFT</MenuItem>
              <MenuItem value="PUBLISHED">PUBLISHED</MenuItem>
              <MenuItem value="HIDDEN">HIDDEN</MenuItem>
            </Select>
          </div>

          <div style={{ width: 200 }}>
            <div style={{ fontWeight: 600 }}>Nổi bật</div>
            <Select
              fullWidth
              variant="outlined"
              value={Number(form.isFeatured)}
              onChange={(e) => setForm((prev) => ({ ...prev, isFeatured: Number(e.target.value) }))}
            >
              <MenuItem value={0}>Không</MenuItem>
              <MenuItem value={1}>Có</MenuItem>
            </Select>
          </div>

          <div style={{ width: 200 }}>
            <TextField type="number" label="Pin order" variant="outlined" value={form.pinOrder ?? 0} onChange={onChange("pinOrder")} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 24 }}>
          <div>
            <div style={{ fontWeight: 600 }}>Thumbnail</div>
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadThumb(e.target.files[0])} disabled={uploadingThumb} />
            {form.thumbnailUrl && (
              <div style={{ marginTop: 8 }}>
                <img alt="thumbnail" src={form.thumbnailUrl} style={{ width: 240, height: 160, objectFit: "cover", borderRadius: 8 }} />
              </div>
            )}
          </div>

          <div>
            <div style={{ fontWeight: 600 }}>Cover</div>
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])} disabled={uploadingCover} />
            {form.coverUrl && (
              <div style={{ marginTop: 8 }}>
                <img alt="cover" src={form.coverUrl} style={{ width: 420, height: 200, objectFit: "cover", borderRadius: 8 }} />
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <Button variant="contained" color="primary" onClick={submit} disabled={uploadingThumb || uploadingCover || saving}>
            Lưu
          </Button>
          <Button variant="outlined" onClick={() => history.push("/admin/news")}>
            Huỷ
          </Button>
        </div>
      </div>
    </div>
  );
}
