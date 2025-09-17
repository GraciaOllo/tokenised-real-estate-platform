import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
children: React.ReactNode;
allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
const { isAuthenticated, user, isLoading } = useAuth();
const location = useLocation();

if (isLoading) {
return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
    </div>
);
}

if (!isAuthenticated) {
return <Navigate to="/login" state={{ from: location }} replace />;
}

if (allowedRoles && user && !allowedRoles.includes(user.role)) {
return <Navigate to="/" replace />;
}

return <>{children}</>;
};

export default ProtectedRoute;