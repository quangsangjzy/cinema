import { Suspense } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import ModalTrailer from "./components/ModalTrailer";
import LazyLoad from "./components/LazyLoad";
import Loading from "./components/Loading";
// layout
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
// guards
import AdminRoute from "./guards/AdminRoute";
import CheckoutRoute from "./guards/CheckoutRoute";
import UserProfileRoute from "./guards/UserProfileRoute";
// page
import Homepage from "./pages/Homepage";
import MovieDetail from "./pages/MovieDetail";
import UserProfile from "./pages/UserProfile";
import BookTicket from "./pages/BookTicket";
import UsersManagement from "./pages/UsersManagement";
import MoviesManagement from "./pages/MoviesManagement";
import CreateShowtime from "./pages/CreateShowtime";
import TicketManagemnt from "./pages/TicketManagement";
import CinemaManagement from "./pages/CinemaManagement";
import MovieGerne from "./pages/MovieGerne";
import Dashboard from "./pages/Dashboard";
import TheaterComplex from "./pages/TheaterComplex";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Page404 from "./pages/Page404";
import EditShowTime from "./pages/CreateShowtime/EditShowTime";
import Invoice from "./pages/TicketManagement/invoice";
import Showtimes from "./pages/ShowTimes";
import Member from "./pages/Member"
import Newspage from "./pages/Newspage"
import Aboutus from "./pages/AboutUs"
import NewsDetail from "./pages/Newspage/Details";
import NewsManagement from "./pages/NewsManagement";
import AddNews from "./pages/NewsManagement/AddNews";
import TinTucDetails from "./pages/Newspage/Details";
import EditNews from "./pages/NewsManagement/EditNews";
import ChairManagement from "./pages/ChairManagement";
import PayOSReturn from "./pages/PayOSReturn";
import PayOSCancel from "./pages/PayOSCancel";
import UserRoute from "./guards/UserRoute"


function App() {
    return (
        <BrowserRouter>
            <Loading />
            <ModalTrailer />
            <Suspense fallback={<LazyLoad />}>
                <Switch>
                    <Route exact path={["/", "/detail/:maPhim", "/taikhoan", "/lichchieu", "/thanhvien", "/tintuc", "/tintuc/:slug", "/vechungtoi"]}>
                        <MainLayout>
                            <Route exact path="/" component={Homepage} />
                            <Route exact path="/detail/:maPhim" component={MovieDetail} />
                            <Route exact path="/lichchieu" component={Showtimes} />
                            <UserRoute exact path="/thanhvien" component={Member} />
                            <Route exact path="/tintuc/:slug" component={TinTucDetails} />
                            <Route exact path="/tintuc" component={Newspage} />
                            <Route exact path="/vechungtoi" component={Aboutus} />
                            <UserRoute exact path="/taikhoan" component={UserProfile} />
                            <Route path="/payos/return" component={PayOSReturn} />
                            <Route path="/payos/cancel" component={PayOSCancel} />
                        </MainLayout>
                    </Route>


                    <CheckoutRoute
                        exact
                        path="/datve/:maLichChieu"
                        component={BookTicket}
                    />

                    <Route
                        exact
                        path={["/admin/users", "/admin/movies", "/admin/showtimes", "/admin/films/addnew", "/admin/ticket-management", "/admin/dashboard", "/admin/theater-complex", "/admin/cinema-management", "/admin/showtimes/:maLichChieu", "/admin/movie-genre", "/admin/chair-management", "/invoice", "/admin/news", "/admin/news/add", "/admin/news/edit/:slug"]}
                    >
                        <AdminLayout>
                            <AdminRoute
                                exact
                                path="/admin/users"
                                component={UsersManagement}
                            />
                            <AdminRoute
                                exact
                                path="/admin/movies"
                                component={MoviesManagement}
                            />
                            <AdminRoute
                                exact
                                path="/admin/showtimes"
                                component={CreateShowtime}
                            />
                            <AdminRoute
                                exact
                                path="/admin/showtimes/:maLichChieu"
                                component={EditShowTime}
                            />
                            <AdminRoute
                                exact
                                path="/admin/ticket-management"
                                component={TicketManagemnt}
                            />
                            <AdminRoute
                                exact
                                path="/admin/cinema-management"
                                component={CinemaManagement}
                            />
                            <AdminRoute
                                exact
                                path="/admin/dashboard"
                                component={Dashboard}
                            />
                            <AdminRoute
                                exact
                                path="/admin/theater-complex"
                                component={TheaterComplex}
                            />
                            <AdminRoute
                                exact
                                path="/admin/movie-genre"
                                component={MovieGerne}
                            />
                            <AdminRoute
                                exact
                                path="/admin/films/addnew"
                            />
                            <AdminRoute
                                exact
                                path="/invoice"
                                component={Invoice}
                            />
                            <AdminRoute exact path="/admin/news" component={NewsManagement} />
                            <AdminRoute exact path="/admin/news/add" component={AddNews} />
                            <AdminRoute exact path="/admin/news/edit/:slug" component={EditNews} />
                            <AdminRoute exact path="/admin/chair-management" component={ChairManagement} />
                        </AdminLayout>
                    </Route>

                    <Route exact path={["/login", "/signUp"]}>
                        <MainLayout>
                            <Route exact path="/login" component={Login} />
                            <Route exact path="/signUp" component={Register} />
                        </MainLayout>
                    </Route>

                    <Route component={Page404} />
                </Switch>
            </Suspense>
        </BrowserRouter>
    );
}

export default App;
