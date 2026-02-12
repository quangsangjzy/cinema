import React, { useEffect, useState } from "react";
import * as memberApi from "../api/memberApi";

export default function ProfileForm({ profile = {}, onSaved = () => {} }) {
  const [form, setForm] = useState({
    name: profile.name || "",
    phone: profile.phone || "",
    birthday: profile.birthday || "",
    email: profile.email || "",
  });
  const [saving, setSaving] = useState(false);

  // Khi profile load lại thì sync form
  useEffect(() => {
    setForm({
      name: profile.name || "",
      phone: profile.phone || "",
      birthday: profile.birthday || "",
      email: profile.email || "",
    });
  }, [profile]);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      await memberApi.updateProfile(profile, form);
      alert("Đã lưu thay đổi.");
      onSaved();
    } catch (e) {
      console.error(e);
      alert("Lưu thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-form">
      <label>Họ và tên</label>
      <input name="name" value={form.name} onChange={handleChange} />

      <label>Số điện thoại</label>
      <input name="phone" value={form.phone} onChange={handleChange} />

      <label>Ngày sinh</label>
      <input name="birthday" type="date" value={form.birthday} onChange={handleChange} />

      <label>Email</label>
      <input name="email" value={form.email} onChange={handleChange} />

      <button onClick={save} disabled={saving}>{saving ? "Đang lưu..." : "Lưu thay đổi"}</button>
    </div>
  );
}
