import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const dropdownRef = useRef(null);

  // 🌓 Theme Logic
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // 🔁 Sync user state from localStorage
  useEffect(() => {
    const syncUser = () => {
      const storedUser = localStorage.getItem("user");
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };

    syncUser();

    // Listen for login/logout changes
    window.addEventListener("storage", syncUser);
    window.addEventListener("auth-change", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("auth-change", syncUser);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Notify navbar to update
    window.dispatchEvent(new Event("auth-change"));

    setOpen(false); // Close dropdown
    navigate("/");
  };

  const isAdmin = user?.role === "Admin";
  const isStaff = user?.role === "Staff";

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to={isAdmin ? "/admin" : isStaff ? "/staff" : "/"} className="logo">🎟 Ticket Broker</Link>

        <nav className="nav-links">
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          {!isAdmin && !isStaff && <Link to="/events">Events</Link>}

          {!user && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn-primary">Register</Link>
            </>
          )}

          {user && (
            <div className="user-menu" ref={dropdownRef}>
              <div className="user-trigger" onClick={() => setOpen(!open)}>
                <div className="avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="username">{user.name}</span>
              </div>

              {open && (
                <div className="dropdown">
                  {isAdmin ? (
                    <Link to="/admin" className="dropdown-link" onClick={() => setOpen(false)}>Admin Dashboard</Link>
                  ) : isStaff ? (
                    <Link to="/staff" className="dropdown-link" onClick={() => setOpen(false)}>Staff Dashboard</Link>
                  ) : (
                    <Link to="/profile" className="dropdown-link" onClick={() => setOpen(false)}>Profile</Link>
                  )}
                  <button onClick={logout}>Logout</button>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
