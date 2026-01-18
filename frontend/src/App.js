import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Event from "./pages/Event";
import BookTicket from "./pages/BookTicket";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Verify from "./pages/Verify";
import Payment from "./pages/Payment";
import AdminDashboard from "./pages/AdminDashboard";
import StaffDashboard from "./pages/StaffDashboard"; // ✅ Import StaffDashboard
import Profile from "./pages/Profile";
import "./animations.css"; // Global animations

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Dashboard />} />
        <Route path="/events/:id" element={<Event />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/book/:id" element={<BookTicket />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />

        {/* Protected Admin Route - Requires Admin Role */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Staff Route - Requires Staff Role */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={["Staff", "Admin"]}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected User Route - Requires Login */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
