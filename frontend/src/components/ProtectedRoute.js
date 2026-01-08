import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    // Check if user is logged in
    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    // Check if admin access is required
    if (requireAdmin) {
        const userData = JSON.parse(user);
        if (userData.role !== "Admin") {
            return <Navigate to="/" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
