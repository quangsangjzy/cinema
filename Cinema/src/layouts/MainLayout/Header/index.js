import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { scroller } from "react-scroll";
import { LOGOUT } from "../../../reducers/constants/Auth";
import { LOADING_BACKTO_HOME } from "../../../reducers/constants/Lazy";
import { getMovieList } from "../../../reducers/actions/Movie";
import { getTheaters } from "../../../reducers/actions/Theater";
import "./style.css";

const headMenu = [
    { nameLink: "Lịch chiếu", id: "lichchieu" },
    { nameLink: "Cụm rạp", id: "cumrap" },
    { nameLink: "Tin tức", id: "tintuc" },
    { nameLink: "Ứng dụng", id: "ungdung" },
];

export default function Header() {
    const { currentUser } = useSelector((state) => state.authReducer);
    const { isLoadingBackToHome } = useSelector((state) => state.lazyReducer);
    const dispatch = useDispatch();
    let location = useLocation();
    const history = useHistory();
    const [openDrawer, setOpenDrawer] = useState(false);

    // nếu đang mở drawer mà chuyển sang màn hình lớn thì phải tự đóng lại
    useEffect(() => {
        if (window.innerWidth >= 768 && openDrawer) {
            setOpenDrawer(false);
        }
    }, [openDrawer]);

    useEffect(() => {
        // clicklink > push to home > scrollTo after loading
        if (!isLoadingBackToHome) {
            setTimeout(() => {
                scroller.scrollTo(location.state, {
                    duration: 800,
                    smooth: "easeInOutQuart",
                });
            }, 200);
        }
    }, [isLoadingBackToHome]);

    const handleLogout = () => {
        setOpenDrawer(false);
        dispatch({ type: LOGOUT });
    };

    const handleLogin = () => {
        history.push("/login", location.pathname); // truyền kèm location.pathname để đăng nhập xong quay lại
    };

    const handleRegister = () => {
        history.push("/signUp", location.pathname);
    };

    const handleClickLogo = () => {
        if (location.pathname === "/") {
            dispatch(getMovieList());
            dispatch(getTheaters());
            return;
        }
        dispatch({ type: LOADING_BACKTO_HOME });
        setTimeout(() => {
            history.push("/", "");
        }, 50);
    };

    const handleClickLink = (id) => {
        setOpenDrawer(false);
        if (location.pathname === "/") {
            scroller.scrollTo(id, {
                duration: 800,
                smooth: "easeInOutQuart",
            });
        } else {
            dispatch({ type: LOADING_BACKTO_HOME });
            setTimeout(() => {
                history.push("/", id);
            }, 50);
        }
    };

    const handleUser = () => {
        history.push("/taikhoan");
        setOpenDrawer(false);
    };

    const handleDrawerOpen = () => {
        setOpenDrawer(true);
    };

    const handleDrawerClose = () => {
        setOpenDrawer(false);
    };

    const toggleMenu = () => {
        setOpenDrawer(!openDrawer);
    };

    const closeMenu = () => {
        setOpenDrawer(false);
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">

                {/* Logo bên trái */}
                <a className="navbar-brand" href="/" onClick={handleClickLogo}>
                    <img src={process.env.PUBLIC_URL + "/img/logo.png"} alt="logo" style={{ height: 70 }} />
                </a>

                {/* Hamburger CHỈ cho mobile/tablet */}
                <button className="navbar-toggler d-lg-none" type="button" onClick={toggleMenu}>
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* ===== DESKTOP (LG+) ===== */}
                {/* Menu Ở GIỮA */}
                <div className="d-none d-lg-flex flex-grow-1 justify-content-center">
                    <ul className="navbar-nav">
                        {headMenu.map((link) => (
                            <li className="nav-item px-2" key={link.id}>
                                <a className="nav-link btn text" onClick={() => handleClickLink(link.id)}>
                                    {link.nameLink}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Auth BÊN PHẢI */}
                <div className="d-none d-lg-flex align-items-center">
                    {!currentUser ? (
                        <>
                            <button className="btn btn-warning mr-2" onClick={handleLogin}>Đăng nhập</button>
                            <button className="btn btn-success" onClick={handleRegister}>Đăng ký</button>
                        </>
                    ) : (
                        <>
                            <button className="btn btn-outline-light mr-2" onClick={handleUser}>
                                Profiles - {currentUser.hoTen}
                            </button>
                            <button className="btn btn-danger" onClick={handleLogout}>Đăng xuất</button>
                        </>
                    )}
                </div>

                {/* ===== MOBILE/TABLET (collapse) ===== */}
                <div className={`collapse navbar-collapse d-lg-none ${openDrawer ? "show" : ""}`}>
                    <ul className="navbar-nav w-100">
                        {headMenu.map((link) => (
                            <li className="nav-item" key={link.id}>
                                <a className="nav-link" onClick={() => handleClickLink(link.id)}>
                                    {link.nameLink}
                                </a>
                            </li>
                        ))}

                        <li className="nav-item mt-2">
                            {!currentUser ? (
                                <>
                                    <button className="btn btn-warning btn-block mb-2" onClick={handleLogin}>Đăng nhập</button>
                                    <button className="btn btn-success btn-block" onClick={handleRegister}>Đăng ký</button>
                                </>
                            ) : (
                                <>
                                    <button className="btn btn-outline-light btn-block mb-2" onClick={handleUser}>
                                        Profiles - {currentUser.hoTen}
                                    </button>
                                    <button className="btn btn-danger btn-block" onClick={handleLogout}>Đăng xuất</button>
                                </>
                            )}
                        </li>
                    </ul>
                </div>

            </div>
        </nav>
    );

}