import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ChatWidget } from "@/components/chat/ChatWidget";

const ProtectedRoute = () => {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
        // Ideally, return a loading spinner here
        return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
    }

    // Only redirect non-admin users who explicitly haven't completed onboarding
    if (isAuthenticated && user && user.is_onboarding_completed === false && user.role !== 'admin') {
        if (window.location.pathname !== '/setup') {
            return <Navigate to="/setup" replace />;
        }
    }

    return isAuthenticated ? (
        <>
            <Outlet />
            <ChatWidget />
        </>
    ) : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
