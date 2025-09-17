import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  BuildingOfficeIcon, 
  PlusIcon, 
  ChartBarIcon, 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { propertiesAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    approvedProperties: 0,
    pendingProperties: 0,
    rejectedProperties: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      const data = await propertiesAPI.getByOwner(user!.id);
      setProperties(data);
      
      setStats({
        totalProperties: data.length,
        approvedProperties: data.filter(p => p.status === 'approved').length,
        pendingProperties: data.filter(p => p.status === 'pending').length,
        rejectedProperties: data.filter(p => p.status === 'rejected').length,
      });
    } catch (error) {
      toast.error('Failed to load properties');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-600" />;
      case 'rejected':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      default:
        return null;
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
        <p className="text-emerald-100">Manage your properties and track their performance.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.approvedProperties}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Approved</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <ClockIcon className="w-8 h-8 text-yellow-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.pendingProperties}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Pending</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <XCircleIcon className="w-8 h-8 text-red-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.rejectedProperties}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Rejected</h3>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex space-x-4">
          <Link
            to="/manager/add-property"
            className="flex items-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add New Property</span>
          </Link>
          <Link
            to="/manager/analytics"
            className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ChartBarIcon className="w-5 h-5" />
            <span>View Analytics</span>
          </Link>
        </div>
      </div>

      {/* Properties List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">My Properties</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {properties.length > 0 ? (
            properties.map((property: any) => (
              <div key={property.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-gray-900">{property.title}</h3>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(property.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(property.status)}`}>
                          {property.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">{property.location}</p>
                    <p className="text-sm text-gray-600">
                      Valuation: {property.valuation?.toLocaleString()} XAF
                    </p>
                    {property.status === 'rejected' && property.rejectionReason && (
                      <p className="text-sm text-red-600 mt-2">
                        Rejection reason: {property.rejectionReason}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Link
                      to={`/manager/properties/${property.id}/edit`}
                      className="px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors text-sm font-medium"
                    >
                      Edit
                    </Link>
                    <Link
                      to={`/property/${property.id}`}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <BuildingOfficeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Yet</h3>
              <p className="text-gray-500 mb-6">Start by adding your first property to the platform.</p>
              <Link
                to="/manager/add-property"
                className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Add Property</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;