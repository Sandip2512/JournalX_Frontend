import { Dashboard } from "@/components/dashboard/Dashboard";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import UserLayout from "@/components/layout/UserLayout";

const Index = () => {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <UserLayout>
      <Dashboard />
    </UserLayout>
  );
};

export default Index;
