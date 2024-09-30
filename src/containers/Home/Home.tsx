import { useState, useEffect } from "react";
import "./Home.css";
import { useTranslation } from "react-i18next";
// @ts-ignore
import { Link } from "react-router-dom";

import { useUserStore } from "@root/store/userStore";


export default function HomepageSection() {
	const { t, i18n } = useTranslation();
	const lang = i18n.language;
	const [currentSlide, setCurrentSlide] = useState(0);
	const [primaryColor, setPrimaryColor] = useState("#77828F");
	const [secondaryColor, setSecondaryColor] = useState("#B7C1CA");
	const [showBackToTop, setShowBackToTop] = useState(false);

	const { user } = useUserStore();

	// Array of images
	const slides = [
		{ src: "./images/image-slider/SignBridgeBanner1.png", alt: "First Slide" },
		{ src: "./images/image-slider/SignBridgeBanner2.png", alt: "Second Slide" },
		{ src: "./images/image-slider/SignBridgeBanner3.png", alt: "Third Slide" },
	];

	// Function to handle next slide
	const nextSlide = () => {
		setCurrentSlide(currentSlide === slides.length - 1 ? 0 : currentSlide + 1);
	};

	// Automatically move to the next slide
	useEffect(() => {
		const interval = setInterval(nextSlide, 3000);
		return () => clearInterval(interval);
	}, [currentSlide]);

	// Handle user role-based color change
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

	// Function to handle scroll event and toggle visibility of back to top button
	const handleScroll = () => {
		if (window.scrollY > 50) {
			setShowBackToTop(true);
		} else {
			setShowBackToTop(false);
		}
	};

	// Scroll to the top of the page
	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: "smooth", // This provides a smooth scrolling effect
		});
	};

	// Add scroll event listener when component mounts
	useEffect(() => {
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// Intersection Observer for fade-in effect
	useEffect(() => {
		const options = {
			threshold: 0.5,
		};

		const handleIntersection = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.classList.add("in-view");
					observer.unobserve(entry.target);
				}
			});
		};

		const observer = new IntersectionObserver(handleIntersection, options);

		const elements = document.querySelectorAll(".fade-in");
		elements.forEach(element => observer.observe(element));

		return () => {
			if (elements.length) {
				elements.forEach(element => observer.unobserve(element));
			}
		};
	}, []);

	return (
		<div>
			{/* For the image slider */}
			<div className="slider-container">
				<div className="slider">
					<img src={slides[currentSlide].src} alt={slides[currentSlide].alt} className="slider-image" />
					<div className="dot-container">
						{slides.map((slide, index) => (
							<span
								key={index}
								className={`dot ${index === currentSlide ? "active" : ""}`}
								onClick={() => setCurrentSlide(index)}></span>
						))}
					</div>
				</div>
			</div>

			{/* For the available modules section */}
			<section className="available-module-section" id="available-module-section">
				<h1 className="heading" style={{ background: secondaryColor }}>
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
				<div className="available-module-container">
					<div className="avail-module-box fade-in">
						<div className="avail-module-image">
							<img src="/images/available-module/library.png" alt="Library" />
							<div className="avail-module-text">
								<Link to="/library" className="cart-btn">
									{t("library")}
								</Link>
							</div>
						</div>
					</div>

					<div className="avail-module-box fade-in">
						<div className="avail-module-image">
							<img src="/images/available-module/communication.png" alt="Communication" />
							<div className="avail-module-text">
								<Link to="/communication" className="cart-btn">
									{t("communication")}
								</Link>
							</div>
						</div>
					</div>

					<div className="avail-module-box fade-in">
						<div className="avail-module-image">
							<img src="/images/available-module/education.png" alt="Education" />
							<div className="avail-module-text">
								<Link to="/education" className="cart-btn">
									{t("education")}
								</Link>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* For the about section */}
			<section className="about" id="about">
				<h1 className="heading fade-in" style={{ background: secondaryColor }}>
					{t("about")} <span style={{ color: primaryColor }}>Neuon AI</span>
				</h1>
				<div className="row fade-in">
					<div className="video-container">
						<img src="/images/company.png" alt="Company" />
					</div>
					<div className="content">
						<p>{t("about_description1")}</p>
						<p>{t("about_description2")}</p>
					</div>
				</div>
			</section>

			{/* YouTube Section */}
			<section className="youtube-video fade-in">
				<h1 className="heading" style={{ background: secondaryColor }} id="ytvideo">
					{" "}
					<span style={{ color: primaryColor }}> YouTube </span> Video{" "}
				</h1>
				<iframe
					src="https://www.youtube.com/embed/JOgJXtbcdC0?si=Znzc4PlcHQBE_bbS"
					title="YouTube video player"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
			</section>

			{/* Location Section */}
			<section className="location fade-in">
				<h1 className="heading" style={{ background: secondaryColor }} id="gmap_canvas">
					{t("location")}
				</h1>
				<div className="mapouter">
					<div className="gmap_canvas">
						<iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15953.835287675945!2d110.4059977!3d1.4957629!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31fba1332943cb13%3A0x9050a3791464b11a!2sNEUON%20AI!5e0!3m2!1sen!2smy!4v1710735767635!5m2!1sen!2smy"></iframe>
					</div>
				</div>
			</section>

			{/* Back to top button */}
			{showBackToTop && (
				<button className="back-to-top-button" onClick={scrollToTop}>
					<i className="fa-solid fa-arrow-up"></i>
				</button>
			)}
		</div>
	);
}
