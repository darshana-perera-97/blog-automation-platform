import * as ReactRouterDom from "react-router-dom";
import { isUserAuthenticated } from "../lib/userAuth";

const { Navigate } = ReactRouterDom;

function UserProtectedRoute({ children }) {
  if (!isUserAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default UserProtectedRoute;
