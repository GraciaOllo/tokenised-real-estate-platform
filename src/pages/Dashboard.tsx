import React from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import AdminDashboard from './admin/AdminDashboard';
import ManagerDashboard from './manager/ManagerDashboard';
import InvestorDashboard from './investor/InvestorDashboard';
import TenantDashboard from './TenantDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'manager':
        return <ManagerDashboard />;
      case 'investor':
        return <InvestorDashboard />;
      case 'tenant':
        return <TenantDashboard />;
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Green</h2>
            <p className="text-gray-600">Your dashboard is being prepared...</p>
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      {renderDashboard()}
    </DashboardLayout>
  );
};

export default Dashboard;