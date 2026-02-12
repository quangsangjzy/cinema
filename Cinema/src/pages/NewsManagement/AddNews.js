import React, { useState } from "react";
import { Button, MenuItem, Select, TextField } from "@material-ui/core";
import { useSnackbar } from "notistack";
import { useHistory } from "react-router-dom";
import newsApi from "../../api/newsApi";
import uploadApi from "../../api/uploadApi";

export default function AddNews() {
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();

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

  const onChange = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const uploadThumb = async (file) => {
    try {
      setUploadingThumb(true);
      const res = await uploadApi.uploadTinTucImage(file);
      const data = res?.data ?? res;
      setForm((prev) => ({ ...prev, thumbnailUrl: data.url }));
      enqueueSnackbar("Upload thumbnail thành công", { variant: "success" });
    } catch (e) {
      enqueueSnackbar("Upload thumbnail thất bại", { variant: "error" });
    } finally {
      setUploadingThumb(false);
    }
  };

  const uploadCover = async (file) => {
    try {
      setUploadingCover(true);
      const res = await uploadApi.uploadTinTucImage(file);
      const data = res?.data ?? res;
      setForm((prev) => ({ ...prev, coverUrl: data.url }));
      enqueueSnackbar("Upload cover thành công", { variant: "success" });
    } catch (e) {
      enqueueSnackbar("Upload cover thất bại", { variant: "error" });
    } finally {
      setUploadingCover(false);
    }
  };

  const submit = async () => {
    if (!form.title.trim()) {
      enqueueSnackbar("Vui lòng nhập tiêu đề", { variant: "warning" });
      return;
    }
    try {
      const payload = {
        ...form,
        isFeatured: Number(form.isFeatured) ? 1 : 0,
        pinOrder: Number(form.pinOrder) || 0,
      };

      await newsApi.create(payload);
      enqueueSnackbar("Tạo tin tức thành công", { variant: "success" });

      history.push("/admin/news");
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || "Tạo tin thất bại", { variant: "error" });
    }
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <h2>Thêm tin tức</h2>

      <div style={{ display: "grid", gap: 12 }}>
        <TextField label="Tiêu đề" variant="outlined" value={form.title} onChange={onChange("title")} />
        <TextField label="Mô tả ngắn" variant="outlined" multiline rows={2} value={form.excerpt} onChange={onChange("excerpt")} />
        <TextField label="Nội dung (HTML hoặc text)" variant="outlined" multiline rows={10} value={form.content} onChange={onChange("content")} />

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 14, marginBottom: 6 }}>Category</div>
            <Select value={form.category} onChange={onChange("category")}>
              <MenuItem value="PROMO">PROMO</MenuItem>
              <MenuItem value="SIDELINE">SIDELINE</MenuItem>
              <MenuItem value="EVENT">EVENT</MenuItem>
              <MenuItem value="RECRUIT">RECRUIT</MenuItem>
            </Select>
          </div>

          <div>
            <div style={{ fontSize: 14, marginBottom: 6 }}>Status</div>
            <Select value={form.status} onChange={onChange("status")}>
              <MenuItem value="DRAFT">DRAFT</MenuItem>
              <MenuItem value="PUBLISHED">PUBLISHED</MenuItem>
              <MenuItem value="HIDDEN">HIDDEN</MenuItem>
            </Select>
          </div>

          <TextField
            label="PinOrder"
            type="number"
            variant="outlined"
            value={form.pinOrder}
            onChange={onChange("pinOrder")}
            style={{ width: 140 }}
          />
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <div>
            <div style={{ fontWeight: 600 }}>Thumbnail</div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && uploadThumb(e.target.files[0])}
              disabled={uploadingThumb}
            />
            {form.thumbnailUrl && (
              <div style={{ marginTop: 8 }}>
                <img alt="thumb" src={form.thumbnailUrl} style={{ width: 260, height: 150, objectFit: "cover", borderRadius: 8 }} />
              </div>
            )}
          </div>

          <div>
            <div style={{ fontWeight: 600 }}>Cover</div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])}
              disabled={uploadingCover}
            />
            {form.coverUrl && (
              <div style={{ marginTop: 8 }}>
                <img alt="cover" src={form.coverUrl} style={{ width: 420, height: 200, objectFit: "cover", borderRadius: 8 }} />
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <Button variant="contained" color="primary" onClick={submit} disabled={uploadingThumb || uploadingCover}>
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
