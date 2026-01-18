import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requireAdmin = false, allowedRoles = [] }) => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    // Check if user is logged in
    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    // Check if admin access is required (Legacy support)
    if (requireAdmin) {
        const userData = JSON.parse(user);
        if (userData.role !== "Admin") {
            return <Navigate to="/" replace />;
        }
    }

    // Check against allowedRoles list
    if (allowedRoles && allowedRoles.length > 0) {
        const userData = JSON.parse(user);
        if (!allowedRoles.includes(userData.role)) {
            return <Navigate to="/" replace />; // Or forbidden page
        }
    }

    return children;
};

export default ProtectedRoute;
