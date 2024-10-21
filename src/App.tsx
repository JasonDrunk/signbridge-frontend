import "./App.css";
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState, Suspense } from "react";
import toast, { Toaster } from "react-hot-toast";
import i18n from "i18next";
import { useTranslation, initReactI18next } from "react-i18next";
import resources from "./i18n";

import { COLOR_ROLE_ACCESS } from "./constants/account.constant";
import { useThemeStore } from "@root/store/theme";
// @ts-ignore
import { auth } from "../firebase";
import { User } from "firebase/auth";
import { GetUserByEmail } from "@root/services/account.service";

import { useUserStore } from "@root/store/userStore";
import useNetworkStatus from "@root/hook/useNetworkStatus";
import axios from "axios";

i18n.use(initReactI18next).init({
    resources,
    lng: "en",
    fallbackLng: "en",
});

// Lazy-loaded components
const Navbar = React.lazy(() => import("./containers/Navbar/Navbar"));
const Footer = React.lazy(() => import("./containers/Footer/Footer"));
const Home = React.lazy(() => import("./containers/Home/Home"));
const Library = React.lazy(() => import("./containers/Library/Library"));
const Communication = React.lazy(() => import("./containers/Communication/Communication"));
const Education = React.lazy(() => import("./containers/Education/Education"));
const DataCollectionPublic = React.lazy(() => import("./containers/DataCollection/Public/DataCollectionPublic"));
const DatasetReviewAdmin = React.lazy(() => import("./containers/DataCollection/Admin/DatasetReviewAdmin"));
const DatasetReviewSE = React.lazy(() => import("./containers/DataCollection/SignExpert/DatasetReviewSE/DatasetReviewSE"));
const DatasetCollectionSE = React.lazy(() => import("./containers/DataCollection/SignExpert/DatasetCollection/DatasetCollectionSE"));
const Feedback = React.lazy(() => import("./containers/Feedback/Feedback"));
const Faq = React.lazy(() => import("./containers/Faq/Faq"));
const Notification = React.lazy(() => import("./containers/Notification/Notification"));
const Login = React.lazy(() => import("./containers/Login/Login"));
const SignUp = React.lazy(() => import("./containers/SignUp/SignUp"));
const ForgotPassword = React.lazy(() => import("./containers/Login/ForgotPwd/ForgotPassword"));
const ResetPassword = React.lazy(() => import("./containers/Login/ResetPwd/ResetPassword"));
const HomeLayout = React.lazy(() => import("./HomeLayout"));
const ForgotResetPasswordLayout = React.lazy(() => import("./ForgotResetPasswordLayout"));
const GuessTheWord = React.lazy(() => import("./containers/Education/Game/GuessTheWord"));
const DoTheSign = React.lazy(() => import("./containers/Education/Game/DoTheSign"));
const FeedbackAdmin = React.lazy(() => import("./containers/Feedback/Admin/FeedbackAdmin"));
const FeedbackSuccess = React.lazy(() => import("./containers/Feedback/FeedbackSuccess"));
const FaqAdmin = React.lazy(() => import("./containers/Faq/Admin/FaqAdmin"));
const ProfilePage = React.lazy(() => import("./containers/ProfilePage/ProfilePage"));
const LibraryAdmin = React.lazy(() => import("./containers/Library/Admin/LibraryAdmin"));
const References = React.lazy(() => import("./containers/References/References"));
const PageNotFound = React.lazy(() => import("./containers/PageNotFound/PageNotFound"));
const InternalServerError = React.lazy(() => import("./containers/InternalServerError/InternalServerError"));

function App() {
    const { isOnline } = useNetworkStatus();
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { color, updateColors } = useThemeStore();
    const [loading, setLoading] = useState(true);
    const { user, setUser, removeUser } = useUserStore();

    useEffect(() => {
        axios.interceptors.response.use(
            response => response,
            error => {
                if (error.response && error.response.status === 401) {
                    toast.error("Unauthorized");
                }
                return Promise.reject(error);
            }
        );
    }, []);

    useEffect(() => {
        const unsubcribe = auth.onAuthStateChanged(async (user: User | null) => {
            if (user && user.emailVerified) {
                const result = await GetUserByEmail(user.email, user);
                setUser(result.data);
                if (result.data.role_access === "admin") {
                    updateColors(COLOR_ROLE_ACCESS.admin.color);
                } else if (result.data.role_access === "signexpert") {
                    updateColors(COLOR_ROLE_ACCESS.signexpert.color);
                } else {
                    updateColors(COLOR_ROLE_ACCESS.public.color);
                }
            } else {
                updateColors(COLOR_ROLE_ACCESS.public.color);
                removeUser();
            }
            setLoading(false);
        });

        return () => {
            unsubcribe();
        };
    }, []);

    // useEffect(() => {
    //     console.log(user);
    // }, [user]);

    const [feedbackComponent, setFeedbackComponent] = useState<React.ReactNode>();
    useEffect(() => {
        switch (user?.role_access) {
            case "admin":
                setFeedbackComponent(<FeedbackAdmin />);
                break;
            case "signexpert":
                setFeedbackComponent(<Feedback />);
                break;
            default:
                setFeedbackComponent(<Feedback />);
                break;
        }
    }, [user?.role_access, location.pathname]);

    const [faqComponent, setFaqComponent] = useState<React.ReactNode>(<Faq />);
    useEffect(() => {
        switch (user?.role_access) {
            case "admin":
                setFaqComponent(<FaqAdmin />);
                break;
            case "signexpert":
                setFaqComponent(<Faq />);
                break;
            default:
                setFaqComponent(<Faq />);
                break;
        }
    }, [user?.role_access, location.pathname]);

    const [datasetComponent, setDatasetComponent] = useState<React.ReactNode>(<DataCollectionPublic />);
    const [datasetReviewComponent, setDatasetReviewComponent] = useState<React.ReactNode>();
    useEffect(() => {
        switch (user?.role_access) {
            case "admin":
                setDatasetComponent(<DatasetReviewAdmin />);
                break;
            case "signexpert":
                setDatasetComponent(<DatasetCollectionSE />);
                setDatasetReviewComponent(<DatasetReviewSE />);
                break;
            default:
                setDatasetComponent(<DataCollectionPublic />);
                break;
        }
    }, [user?.role_access, location.pathname]);

    const [libraryComponent, setLibraryComponent] = useState<React.ReactNode>();
    useEffect(() => {
        switch (user?.role_access) {
            case "admin":
                setLibraryComponent(<LibraryAdmin />);
                break;
            case "signexpert":
                setLibraryComponent(<Library />);
                break;
            default:
                setLibraryComponent(<Library />);
                break;
        }
    }, [user?.role_access, location.pathname]);

    useEffect(() => {
        if (location.pathname !== "/education" && location.pathname !== "/guess-the-word" && location.pathname !== "/do-the-sign") {
            const localVolumeValue = localStorage.getItem("volumeValue");
            if (localVolumeValue) {
                localStorage.setItem("volumeValue", "100");
            }
        }

        if (location.pathname !== "/guess-the-word") {
            sessionStorage.removeItem("guessLives");
            sessionStorage.removeItem("guessCurrentLevel");
            sessionStorage.removeItem("guessQuestionList");
            sessionStorage.removeItem("guessScore");
        }

        if (location.pathname !== "/do-the-sign") {
            sessionStorage.removeItem("doTheSignLives");
            sessionStorage.removeItem("doTheSignCurrentLevel");
            sessionStorage.removeItem("doTheSignScore");
            sessionStorage.removeItem("doTheSignHintUsedCount");
            sessionStorage.removeItem("animationKeyword");
        }
    }, [location.pathname]);

    useEffect(() => {
        if (!loading) {
            if (location.pathname === "/notifications") {
                if (!user?.role_access) {
                    toast.error(t("unauthorized_access"));
                    navigate("/login");
                }
            }
        }
    }, [user?.role_access, location.pathname, loading, navigate]);

    useEffect(() => {
        if (!loading) {
            if (location.pathname === "/profile") {
                if (!user?.role_access) {
                    toast.error(t("unauthorized_access"));
                    navigate("/login");
                }
            }
        }
    }, [user?.role_access, location.pathname, loading, navigate]);

    return (
        <>
            <Toaster />
            {loading ? (
                <div className="loading_wrapper">
                    <div className="loading_circle"></div>
                    <div className="loading_circle"></div>
                    <div className="loading_circle"></div>
                    <div className="loading_shadow"></div>
                    <div className="loading_shadow"></div>
                    <div className="loading_shadow"></div>
                    <span>Loading</span>
                </div>
            ) : (
                <Suspense fallback={<div>Loading...</div>}>
                    {isOnline ? (
                        <Routes>
                            <Route path="*" element={<PageNotFound />} />
                            <Route element={<HomeLayout />}>
                                <Route path="/" element={<Home />} />
                                <Route path="/library" element={<Library />} />
                                <Route path="/communication" element={<Communication />} />
                                <Route path="/education" element={<Education />} />
                                <Route path="/dataset-collection" element={<DataCollectionPublic />} />
                                {/* Add more routes here */}
                            </Route>
                            <Route element={<ForgotResetPasswordLayout />}>
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                <Route path="/reset-password" element={<ResetPassword />} />
                            </Route>
                        </Routes>
                    ) : (
                        <>
                            <Navbar />
                            <div className="page-container">
                                <InternalServerError />
                            </div>
                            <Footer />
                        </>
                    )}
                </Suspense>
            )}
        </>
    );
}

export default App;
