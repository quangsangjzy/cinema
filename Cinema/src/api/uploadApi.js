import axiosClient from "./axiosClient";

const uploadApi = {
  uploadTinTucImage: (file) => {
    const form = new FormData();
    form.append("image", file);

    return axiosClient.post("/upload/tintuc", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default uploadApi;
