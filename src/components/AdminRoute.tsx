import { Navigate } from "react-router-dom";
import { useProfileAccess } from "@/hooks/useProfileAccess";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { data: profile, isLoading } = useProfileAccess();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!profile?.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
