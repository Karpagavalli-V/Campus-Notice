import { Navigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/unauthorized" />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" />;
  }

  return <MainLayout userRole={role}>{children}</MainLayout>;
}

export default ProtectedRoute;
