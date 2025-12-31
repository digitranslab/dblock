import { AuthContext } from "@/contexts/authContext";
import { CustomNavigate } from "@/customization/components/custom-navigate";
import { LoadingPage } from "@/pages/LoadingPage";
import useAuthStore from "@/stores/authStore";
import { useContext } from "react";

export const ProtectedAdminRoute = ({ children }) => {
  const { userData } = useContext(AuthContext);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const autoLogin = useAuthStore((state) => state.autoLogin);
  const isAdmin = useAuthStore((state) => state.isAdmin);

  if (!isAuthenticated) {
    return <LoadingPage />;
  } else if (isAdmin || !autoLogin) {
    // Allow access if user is admin OR if autoLogin is disabled (manual login required)
    return children;
  } else {
    return <CustomNavigate to="/" replace />;
  }
};
