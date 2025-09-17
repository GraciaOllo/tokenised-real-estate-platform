import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserGroupIcon, 
  BuildingOfficeIcon, 
  ChartBarIcon, 
  BanknotesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { propertiesAPI, usersAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    pendingProperties: 0,
    totalInvestment: 0,
  });
  const [pendingProperties, setPendingProperties] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load properties and users data
      const [properties, users] = await Promise.all([
        propertiesAPI.getAll(),
        usersAPI.getAll()
      ]);

      const pendingProps = properties.filter(p => p.status === 'pending');
      
      setStats({
        totalUsers: users.length,
        totalProperties: properties.length,
        pendingProperties: pendingProps.length,
        totalInvestment: properties.reduce((sum, p) => sum + (p.valuation || 0), 0),
      });

      setPendingProperties(pendingProps.slice(0, 5));
      setRecentUsers(users.slice(-5).reverse());
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePropertyAction = async (propertyId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      const status = action === 'approve' ? 'approved' : 'rejected';
      await propertiesAPI.update(propertyId, { 
        status,
        ...(reason && { rejectionReason: reason })
      });
      
      toast.success(`Property ${action}d successfully`);
      loadDashboardData();
    } catch (error) {
      toast.error(`Failed to ${action} property`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}</h1>
        <p className="text-emerald-100">Here's what's happening on your platform today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <UserGroupIcon className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.totalUsers}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <BuildingOfficeIcon className="w-8 h-8 text-emerald-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.totalProperties}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Total Properties</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <ClockIcon className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.pendingProperties}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Pending Approvals</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <BanknotesIcon className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">
              {(stats.totalInvestment / 1000000).toFixed(1)}M
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Total Investment (XAF)</h3>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Properties */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Pending Property Approvals</h2>
            <a 
              href="/admin/properties/propertyDetail" 
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              View All Properties →
            </a>
          </div>
          <div className="divide-y divide-gray-200">
            {pendingProperties.length > 0 ? (
              pendingProperties.map((property: any) => (
                <div key={property._id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{property.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{property.location}</p>
                      <p className="text-sm text-gray-600 mt-2">
                        Valuation: {property.valuation?.toLocaleString()} XAF
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handlePropertyAction(property._id, 'approve')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Approve"
                      >
                        <CheckCircleIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Rejection reason (optional):');
                          handlePropertyAction(property._id, 'reject', reason || undefined);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Reject"
                      >
                        <XCircleIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                No pending properties
              </div>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Users</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentUsers.length > 0 ? (
              recentUsers.map((user: any) => (
                <div key={user.id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-emerald-600 font-medium text-sm">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                    user.role === 'investor' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                No recent users
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;