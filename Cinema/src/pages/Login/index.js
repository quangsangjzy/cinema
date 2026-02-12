import React, { useEffect, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import * as yup from "yup";
import { ErrorMessage, Field, Form, Formik } from "formik";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";
import "./style.css";
import logoTix from "../Register/logo/logoTix.png";
import { login, resetErrorLoginRegister } from "../../reducers/actions/Auth";
import { LOADING_BACKTO_HOME } from "../../reducers/constants/Lazy";
export default function Login() {
    const { currentUser, errorLogin } = useSelector((state) => state.authReducer);
    let location = useLocation();
    const dispatch = useDispatch();
    const history = useHistory();
    const [typePassword, settypePassword] = useState("password");
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
    useEffect(() => {
        if (currentUser) {
            if (location.state === "/") {
                dispatch({ type: LOADING_BACKTO_HOME });
                setTimeout(() => {
                    history.push("/");
                }, 50);
                return undefined;
            }
            history.push(location.state);
        }
    }, [currentUser]);
    useEffect(() => {
        return () => {
            dispatch(resetErrorLoginRegister());
        };
    }, []);

    const signinUserSchema = yup.object().shape({
        taiKhoan: yup.string().required("*Tài khoản không được bỏ trống !"),
        matKhau: yup.string().required("*Mật khẩu không được bỏ trống !"),
    });

    const handleSubmit = (user) => {
        dispatch(login(user));
        // history.push("/", location.state);
    };
    const handlesignUp = () => {
        history.push("/signUp", location.state);
    };

    const handleHold = () => {
        if (!isDesktop) {
            return;
        }
        settypePassword("text");
    };
    const handleRelease = () => {
        if (!isDesktop) {
            return;
        }
        settypePassword("password");
    };
    const handleShowPassword = () => {
        if (isDesktop) {
            return;
        }
        if (typePassword === "password") {
            settypePassword("text");
        } else {
            settypePassword("password");
        }
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
                                            <h2 className="auth-title">Đăng nhập</h2>
                                            <p className="auth-subtitle">Chào mừng bạn quay lại Cinema.</p>
                                        </div>
                                    </div>

                                    <div className="auth-switch">
                                        <button type="button" className="auth-switch-btn active">
                                            Đăng nhập
                                        </button>
                                        <button
                                            type="button"
                                            className="auth-switch-btn"
                                            onClick={handlesignUp}
                                        >
                                            Đăng ký
                                        </button>
                                    </div>

                                    <div>
                                        <Formik
                                            initialValues={{
                                                taiKhoan: "",
                                                matKhau: "",
                                            }}
                                            validationSchema={signinUserSchema}
                                            onSubmit={handleSubmit}
                                        >
                                            {() => (
                                                <Form className="col-sm-12 col-md-10 mx-auto">
                                                    <div className="form-group position-relative">
                                                        <label>Tài khoản&nbsp;</label>
                                                        <ErrorMessage
                                                            name="taiKhoan"
                                                            render={(msg) => (
                                                                <small className="text-danger">{msg}</small>
                                                            )}
                                                        />
                                                        <Field
                                                            type="text"
                                                            className="form-control"
                                                            name="taiKhoan"
                                                        />
                                                    </div>

                                                    <div className="form-group position-relative">
                                                        <label>Mật khẩu&nbsp;</label>
                                                        <ErrorMessage
                                                            name="matKhau"
                                                            render={(msg) => (
                                                                <small className="text-danger">{msg}</small>
                                                            )}
                                                        />
                                                        <div className="auth-password">
                                                            <Field
                                                                type={typePassword}
                                                                className="form-control"
                                                                name="matKhau"
                                                            />
                                                            <button
                                                                type="button"
                                                                className="auth-toggle"
                                                                onMouseDown={handleHold}
                                                                onMouseUp={handleRelease}
                                                                onClick={handleShowPassword}
                                                            >
                                                                {typePassword === "password" ? "Hiện" : "Ẩn"}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="submit"
                                                        className="btn btn-success mt-3 container auth-primary"
                                                    >
                                                        Đăng nhập
                                                    </button>

                                                    <div className="auth-footer">
                                                        <span>Chưa có tài khoản?</span>
                                                        <button
                                                            type="button"
                                                            className="auth-link"
                                                            onClick={handlesignUp}
                                                        >
                                                            Đăng ký ngay
                                                        </button>
                                                    </div>

                                                    {errorLogin && (
                                                        <div className="alert alert-danger">
                                                            <span> {errorLogin}</span>
                                                        </div>
                                                    )}
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
