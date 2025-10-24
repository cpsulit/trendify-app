import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Plus,
  User,
  LogOut,
  Menu,
  X,
  Search,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { showToast } from "../utils/helpers";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      showToast("Signed out successfully", "success");
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      showToast("Error signing out. Please try again.", "error");
    }
  };

  const getLinkStyle = (path) => ({
    ...styles.navLink,
    color: location.pathname === path ? "var(--primary)" : "#374151",
    background:
      location.pathname === path ? "rgba(37,99,235,0.1)" : "transparent",
  });

  return (
    <nav style={styles.navbar}>
      {/* Accent Bar */}
      <div
        style={{
          height: "3px",
          background:
            "linear-gradient(90deg, #3b82f6, #9333ea, #ec4899, #facc15)",
        }}
      ></div>

      <div style={styles.container}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <span
            style={{
              fontWeight: 800,
              fontSize: "1.5rem",
              background:
                "linear-gradient(90deg, #3b82f6, #9333ea, #ec4899, #facc15)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Trendify
          </span>
        </Link>

        {/* Search Bar (desktop only) */}
        <div
          className="hidden md:flex items-center rounded-full px-3 py-1.5 w-72"
          style={{
            background: "#f3f4f6",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            borderRadius: "9999px",
            padding: "6px 12px",
            flex: 1,
            maxWidth: "280px",
          }}
        >
          <Search size={18} color="#6b7280" />
          <input
            type="text"
            placeholder="Search trends..."
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "black",
              width: "100%",
            }}
          />
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={styles.menuButton}
          className="menu-toggle"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Navigation Links */}
        <div
          className={`nav-links ${menuOpen ? "open" : ""}`}
          style={{
            ...styles.navLinks,
            ...(menuOpen
              ? styles.navLinksMobileOpen
              : styles.navLinksMobileClosed),
          }}
        >
          <Link to="/" style={getLinkStyle("/")}>
            <Home size={20} />
            <span>Home</span>
          </Link>

          {user ? (
            <>
              <Link to="/create" style={getLinkStyle("/create")}>
                <Plus size={20} />
                <span>Create</span>
              </Link>
              <Link to="/my-posts" style={getLinkStyle("/my-posts")}>
                <User size={20} />
                <span>My Posts</span>
              </Link>
              <button onClick={handleSignOut} style={styles.signOutBtn}>
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={getLinkStyle("/login")}>
                Login
              </Link>
              <Link to="/signup" style={styles.signupButton}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 768px) {
          .menu-toggle {
            display: block !important;
          }
          .nav-links {
            display: none;
            flex-direction: column;
            align-items: flex-start;
            position: absolute;
            top: 80px;
            right: 0;
            width: 230px;
            padding: 1rem;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            border-radius: 0 0 8px 8px;
            z-index: 999;
            background: white;
          }
          .nav-links.open {
            display: flex;
          }
        }
      `}</style>
    </nav>
  );
};

const styles = {
  navbar: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "rgba(255, 255, 255, 0.85)",
    borderBottom: "1px solid rgba(0,0,0,0.05)",
    backdropFilter: "blur(12px)",
    transition: "all 0.3s ease",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 1rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "70px",
    gap: "1rem",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
    fontWeight: 700,
  },
  menuButton: {
    background: "none",
    border: "none",
    display: "none",
    cursor: "pointer",
    color: "black",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    transition: "all 0.3s ease",
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: 500,
    transition: "all 0.3s ease",
    color: "#374151",
  },
  signupButton: {
    padding: "0.5rem 1.5rem",
    borderRadius: "8px",
    fontWeight: 600,
    color: "white",
    background: "var(--primary)",
    border: "none",
    transition: "all 0.3s ease",
    textDecoration: "none",
  },
  signOutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontWeight: 500,
    borderRadius: "8px",
    padding: "0.5rem 1rem",
    color: "#374151",
    transition: "all 0.3s ease",
  },
  navLinksMobileOpen: {
    display: "flex",
  },
  navLinksMobileClosed: {
    display: "flex",
  },
};

export default Navbar;
