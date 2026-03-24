import { NavLink, Route, Routes } from "react-router-dom";
import PortfolioPage from "./pages/PortfolioPage";
import AdminPage from "./pages/AdminPage";
import { withBaseUrl } from "./utils/url";

export default function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <img src={withBaseUrl("assets/icons/brand/brand-icon-32.png")} alt="Brand" className="brand-logo" />
          <span>Portfolio Platform</span>
        </div>
        <nav className="topnav">
          <NavLink to="/" end>
            Portfolio
          </NavLink>
          <NavLink to="/admin">Admin</NavLink>
        </nav>
      </header>

      <main className="page-wrap">
        <Routes>
          <Route path="/" element={<PortfolioPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
    </div>
  );
}
