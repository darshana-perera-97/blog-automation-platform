import * as ReactRouterDom from "react-router-dom";
import { isAdminAuthenticated } from "../lib/adminAuth";

const { Navigate } = ReactRouterDom;

function AdminProtectedRoute({ children }) {
  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

export default AdminProtectedRoute;
