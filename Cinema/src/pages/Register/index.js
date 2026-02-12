import React, { useEffect } from "react";

import { useLocation, useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import * as yup from "yup";
import { ErrorMessage, Field, Form, Formik } from "formik";
import Swal from "sweetalert2";
import "./style.css"

import { register, resetErrorLoginRegister } from "../../reducers/actions/Auth";
import logoTix from "./logo/logoTix.png";

export default function Register() {
  const { responseRegister, loadingRegister, errorRegister } = useSelector(
    (state) => state.authReducer
  );
  let location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();

  useEffect(() => {
    console.log(responseRegister);
    if (responseRegister) {
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Bạn đã đăng ký thành công",
        showConfirmButton: false,
        timer: 2000,
      });
      history.push("/login", location.state);
    }
  }, [responseRegister]);
  useEffect(() => {
    return () => {
      dispatch(resetErrorLoginRegister());
    };
  }, []);

  const phoneRegExp =
    /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;
  const signupUserSchema = yup.object().shape({
    taiKhoan: yup.string().required("*Tài khoản không được bỏ trống !"),
    matKhau: yup.string().required("*Mật khẩu không được bỏ trống !"),
    email: yup
      .string()
      .required("*Email không được bỏ trống !")
      .email("* Email không hợp lệ "),
    soDt: yup
      .string()
      .required("*Số điện thoại không được bỏ trống !")
      .matches(phoneRegExp, "Số điện thoại không hợp lệ!"),
    hoTen: yup.string().required("*Tên không được bỏ trống !"),
  });

  const handleSubmit = (user) => {
    console.log(`user`, user);
    if (!loadingRegister && !responseRegister) {
      dispatch(register(user));
    }
  };

  const handleLogin = () => {
    history.push("/login", location.state);
  };

  const bannerUrl =
    "https://movie0706.cybersoft.edu.vn/hinhanh/vi-anh-van-tin_gp09.jpg";

  return (
    <>
      <section className="ftco-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-12 col-lg-10">
              <div className="wrap d-md-flex auth-card">
                <div
                  className="auth-media"
                  style={{ backgroundImage: `url(${bannerUrl})` }}
                />
                <div className="login-wrap p-4 p-md-5 auth-body">
                  <div className="auth-header">
                    <img className="auth-logo" src={logoTix} alt="logo" />
                    <div className="auth-title-wrap">
                      <h2 className="auth-title">Đăng ký</h2>
                    </div>
                  </div>

                  <div className="auth-switch">
                    <button
                      type="button"
                      className="auth-switch-btn"
                      onClick={handleLogin}
                    >
                      Đăng nhập
                    </button>
                    <button type="button" className="auth-switch-btn active">
                      Đăng ký
                    </button>
                  </div>

                  <div>
                    <Formik
                      initialValues={{
                        taiKhoan: "",
                        matKhau: "",
                        email: "",
                        soDt: "",
                        maNhom: "GP09",
                        maLoaiNguoiDung: "KhachHang", // điền QuanTri backend cũng áp dụng KhachHang
                        hoTen: "",
                      }}
                      validationSchema={signupUserSchema} // validationSchdema:  thu vien yup nhập sai ko submit được
                      onSubmit={handleSubmit}
                    >
                      {() => (
                        <Form className="col-sm-12 col-md-10 mx-auto">
                          <div className="form-group">
                            <label>Tài khoản&nbsp;</label>
                            <ErrorMessage
                              name="taiKhoan"
                              render={(msg) => (
                                <span className="text-danger">{msg}</span>
                              )}
                            />
                            <Field
                              name="taiKhoan"
                              type="text"
                              className="form-control"
                            />
                          </div>
                          <div className="form-group">
                            <label>Mật khẩu&nbsp;</label>
                            <ErrorMessage
                              name="matKhau"
                              render={(msg) => (
                                <span className="text-danger">{msg}</span>
                              )}
                            />
                            <Field
                              name="matKhau"
                              type="password"
                              className="form-control"
                            />
                          </div>
                          <div className="form-group">
                            <label>Họ và tên&nbsp;</label>
                            <ErrorMessage
                              name="hoTen"
                              render={(msg) => (
                                <span className="text-danger">{msg}</span>
                              )}
                            />
                            <Field
                              name="hoTen"
                              type="text"
                              className="form-control"
                            />
                          </div>

                          <div className="form-group">
                            <label>Email&nbsp;</label>
                            <ErrorMessage
                              name="email"
                              render={(msg) => (
                                <span className="text-danger">{msg}</span>
                              )}
                            />
                            <Field
                              name="email"
                              type="email"
                              className="form-control"
                            />
                          </div>
                          <div className="form-group">
                            <label>Số điện thoại&nbsp;</label>
                            <ErrorMessage
                              name="soDt"
                              render={(msg) => (
                                <span className="text-danger">{msg}</span>
                              )}
                            />
                            <Field
                              name="soDt"
                              type="text"
                              className="form-control"
                            />
                          </div>
                      
                          <div className="text-center">
                            <button
                            className="btn btn-success mt-3 container auth-primary"
                              type="submit"
                              disabled={loadingRegister}
                            >
                              Đăng Ký
                            </button>

                            <div className="auth-footer" style={{ justifyContent: "center" }}>
                              <span>Đã có tài khoản?</span>
                              <button type="button" className="auth-link" onClick={handleLogin}>
                                Đăng nhập
                              </button>
                            </div>

                            {errorRegister && (
                              <div className="alert alert-danger">
                                <span>{errorRegister}</span>
                              </div>
                            )}
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
