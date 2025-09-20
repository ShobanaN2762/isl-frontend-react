import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Header() {
  const { user, logout } = useAuth();

  return (
    <header
      className="bg-navy shadow-lg sticky-top"
      style={{
        "--bs-bg-opacity": 0.8,
        backdropFilter: "blur(8px)",
        zIndex: 1040,
      }}
    >
      <nav className="navbar navbar-expand-lg navbar-dark container py-2">
        <Link
          className="navbar-brand d-flex align-items-center gap-2"
          to="/dashboard"
        >
          <i className="fa-solid fa-hands-asl-interpreting text-coral fs-3"></i>
          <span className="fs-4 fw-bold">Signify</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMenu"
          aria-controls="navbarMenu"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className="collapse navbar-collapse justify-content-between"
          id="navbarMenu"
        >
          {user ? (
            <>
              <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-lg-3">
                <li className="nav-item">
                  <NavLink to="/dashboard" className="nav-link">
                    Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/learn" className="nav-link">
                    Learn
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/translate" className="nav-link">
                    Translate
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/profile" className="nav-link">
                    Profile
                  </NavLink>
                </li>
              </ul>
              <div className="d-flex align-items-center gap-3">
                <span className="navbar-text text-light small d-none d-lg-block">
                  Welcome, {user.name || "User"}
                </span>
                <button onClick={logout} className="btn btn-coral btn-sm">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="ms-auto">
              {/* Maybe add Login/Register buttons here in the future */}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;
