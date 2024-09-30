// DefaultLayout.js
import Navbar from "./containers/Navbar/Navbar";
import Footer from "./containers/Footer/Footer";
import { Outlet } from "react-router-dom";

const DefaultLayout = () => (
	<>
		<Navbar />
			<div className="page-container">
				<Outlet />
			</div>
		<Footer />
	</>
);

export default DefaultLayout;
