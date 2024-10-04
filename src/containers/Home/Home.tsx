import { useState, useEffect } from "react";
import style from "./Home.module.css";
import { useTranslation } from "react-i18next";
// @ts-ignore
import { Link } from "react-router-dom";
import EditDialog from "./EditDialog";

import { useUserStore } from "@root/store/userStore";

export default function HomepageSection() {
    const { t, i18n } = useTranslation();
    const lang = i18n.language;
    const [currentSlide, setCurrentSlide] = useState(0);
    const [primaryColor, setPrimaryColor] = useState("#77828F");
    const [secondaryColor, setSecondaryColor] = useState("#B7C1CA");
    const [showBackToTop, setShowBackToTop] = useState(false);

    const { user } = useUserStore();

    const slides = [
        { src: "./images/image-slider/SignBridgeBanner1.png", alt: "First Slide" },
        { src: "./images/image-slider/SignBridgeBanner2.png", alt: "Second Slide" },
        { src: "./images/image-slider/SignBridgeBanner3.png", alt: "Third Slide" },
    ];

    const nextSlide = () => {
        setCurrentSlide(currentSlide === slides.length - 1 ? 0 : currentSlide + 1);
    };

    useEffect(() => {
        const interval = setInterval(nextSlide, 3000);
        return () => clearInterval(interval);
    }, [currentSlide]);

    useEffect(() => {
        if (user) {
            if (user.role_access === "admin") {
                setPrimaryColor("#FFFFFF");
                setSecondaryColor("#A4825E");
            } else if (user.role_access === "signexpert") {
                setPrimaryColor("#FFFFFF");
                setSecondaryColor("#C6C6C6");
            } else {
                setPrimaryColor("#77828F");
                setSecondaryColor("#D3DEE8");
            }
        }
    }, []);

    const handleScroll = () => {
        if (window.scrollY > 50) {
            setShowBackToTop(true);
        } else {
            setShowBackToTop(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const options = {
            threshold: 0.5,
        };

        const handleIntersection = (entries: any[], observer: { unobserve: (arg0: any) => void }) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(style.in_view); // Use the CSS module class
                    observer.unobserve(entry.target);
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersection, options);

        const elements = document.querySelectorAll(`.${style.fade_in}`); // Use the module class
        elements.forEach(element => observer.observe(element));

        return () => {
            if (elements.length) {
                elements.forEach(element => observer.unobserve(element));
            }
        };
    }, []);

    return (
        <div className={style.container}>
            {/* Check the role_access is admin, then display this button */}
            {user && user.role_access === "admin" && <EditDialog />}
            {/* For the image slider */}
            <div className={style.slider_container}>
                <div className={style.slider}>
                    <img src={slides[currentSlide].src} alt={slides[currentSlide].alt} className={style.slider_image} />
                    <div className={style.dot_container}>
                        {slides.map((slide, index) => (
                            <span key={index} className={index === currentSlide ? `${style.dot} ${style.active}` : style.dot} onClick={() => setCurrentSlide(index)}></span>
                        ))}
                    </div>
                </div>
            </div>

            {/* For the available modules section */}
            <section className={style.available_module_section} id="available_module_section">
                <h1 className={style.heading} style={{ background: secondaryColor }}>
                    {lang === "en" ? (
                        <>
                            <span style={{ color: primaryColor }}>{t("available")}</span> {t("module")}
                        </>
                    ) : (
                        <>
                            <span style={{ color: primaryColor }}>{t("module")}</span> {t("available")}
                        </>
                    )}
                </h1>
                <div className={style.available_module_container}>
                    <div className={`${style.avail_module_box} ${style.fade_in}`}>
                        <div className={style.avail_module_image}>
                            <img src="/images/available-module/library.png" alt="Library" />
                            <div className={style.avail_module_text}>
                                <Link to="/library" className={style.cart_btn}>
                                    {t("library")}
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className={`${style.avail_module_box} ${style.fade_in}`}>
                        <div className={style.avail_module_image}>
                            <img src="/images/available-module/communication.png" alt="Communication" />
                            <div className={style.avail_module_text}>
                                <Link to="/communication" className={style.cart_btn}>
                                    {t("communication")}
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className={`${style.avail_module_box} ${style.fade_in}`}>
                        <div className={style.avail_module_image}>
                            <img src="/images/available-module/education.png" alt="Education" />
                            <div className={style.avail_module_text}>
                                <Link to="/education" className={style.cart_btn}>
                                    {t("education")}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* For the about section */}
            <section className={style.about} id="about">
                <h1 className={`${style.heading} ${style.fade_in}`} style={{ background: secondaryColor }}>
                    {t("about")} <span style={{ color: primaryColor }}>Neuon AI</span>
                </h1>
                <div className={`${style.row} ${style.fade_in}`}>
                    <div className={style.video_container}>
                        <img src="/images/company.png" alt="Company" />
                    </div>
                    <div className={style.content}>
                        <p>{t("about_description1")}</p>
                        <p>{t("about_description2")}</p>
                    </div>
                </div>
            </section>

            {/* YouTube Section */}
            <section className={`${style.youtube_video} ${style.fade_in}`}>
                <h1 className={style.heading} style={{ background: secondaryColor }} id="ytvideo">
                    {" "}
                    <span style={{ color: primaryColor }}> YouTube </span> Video{" "}
                </h1>
                <iframe src="https://www.youtube.com/embed/JOgJXtbcdC0?si=Znzc4PlcHQBE_bbS" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
            </section>

            {/* Location Section */}
            <section className={`${style.location} ${style.fade_in}`}>
                <h1 className={style.heading} style={{ background: secondaryColor }} id="gmap_canvas">
                    {t("location")}
                </h1>
                <div className={style.mapouter}>
                    <div className="gmap_canvas">
                        <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15953.835287675945!2d110.4059977!3d1.4957629!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31fba1332943cb13%3A0x9050a3791464b11a!2sNEUON%20AI!5e0!3m2!1sen!2smy!4v1710735767635!5m2!1sen!2smy"></iframe>
                    </div>
                </div>
            </section>

            {/* Back to top button */}
            {showBackToTop && (
                <div className={style.back_to_top_button} onClick={scrollToTop}>
                    <i className="fa-solid fa-arrow-up"></i>
                </div>
            )}
        </div>
    );
}
