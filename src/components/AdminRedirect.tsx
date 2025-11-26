import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import Index from "@/pages/Index";

const AdminRedirect = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdmin();

  useEffect(() => {
    if (!authLoading && !adminLoading && user) {
      if (isAdmin) {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  // Show Index page for unauthenticated users
  if (!authLoading && !user) {
    return <Index />;
  }

  // Show loading state while checking authentication and role
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
};

export default AdminRedirect;
