import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ padding: 10, background: "#222" }}>
      <Link to="/" style={{ color: "white", marginRight: 10 }}>Login</Link>
      <Link to="/register" style={{ color: "white", marginRight: 10 }}>Register</Link>
      <Link to="/events" style={{ color: "white" }}>Events</Link>
    </nav>
  );
}
