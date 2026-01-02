import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

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

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Notify navbar to update
    window.dispatchEvent(new Event("auth-change"));

    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo">🎟 Ticket Broker</Link>

        <nav className="nav-links">
          <Link to="/events">Events</Link>

          {!user && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn-primary">Register</Link>
            </>
          )}

          {user && (
            <div className="user-menu">
              <div className="user-trigger" onClick={() => setOpen(!open)}>
                <div className="avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="username">{user.name}</span>
              </div>

              {open && (
                <div className="dropdown">
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
