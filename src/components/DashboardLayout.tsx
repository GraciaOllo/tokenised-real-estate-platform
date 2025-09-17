import React from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';

interface DashboardLayoutProps {
children: React.ReactNode;
title?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
const { isAuthenticated } = useAuth();

if (!isAuthenticated) {
return <>{children}</>;
}

return (
<div className="min-h-screen bg-gray-50">
    <Header />
    <Sidebar />
    <main className="ml-64 pt-16">
    <div className="p-8">
        {title && (
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        </div>
        )}
        {children}
    </div>
    </main>
</div>
);
};

export default DashboardLayout;