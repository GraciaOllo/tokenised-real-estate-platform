import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
BuildingOfficeIcon, 
PlusIcon, 
PencilIcon, 
EyeIcon,
CheckCircleIcon,
XCircleIcon,
ClockIcon,
TrashIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { propertiesAPI } from '../../services/api';
import { Property } from '../../types';
import toast from 'react-hot-toast';

const ManagerProperties: React.FC = () => {
const { user } = useAuth();
const [properties, setProperties] = useState<Property[]>([]);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
if (user) {
    loadProperties();
}
}, [user]);

const loadProperties = async () => {
try {
    setIsLoading(true);
    const data = await propertiesAPI.getByOwner(user!.id);
    setProperties(data);
} catch (error) {
    toast.error('Failed to load properties');
} finally {
    setIsLoading(false);
}
};

const deleteProperty = async (propertyId: string) => {
if (window.confirm('Are you sure you want to delete this property?')) {
    try {
    await propertiesAPI.delete(propertyId);
    toast.success('Property deleted successfully');
    loadProperties();
    } catch (error) {
    toast.error('Failed to delete property');
    }
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
    return <ClockIcon className="w-5 h-5 text-gray-600" />;
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

if (isLoading) {
return (
    <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
    </div>
);
}

return (
<div className="space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
    <div>
        <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
        <p className="text-gray-600">Manage your property listings and track their status</p>
    </div>
    <Link
        to="/manager/add-property"
        className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
    >
        <PlusIcon className="w-5 h-5" />
        <span>Add Property</span>
    </Link>
    </div>

    {/* Properties List */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
    <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Property Portfolio</h2>
    </div>
    
    <div className="divide-y divide-gray-200">
        {properties.length > 0 ? (
        properties.map((property) => (
            <motion.div
            key={property.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 hover:bg-gray-50 transition-colors"
            >
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                <img
                    src={property.images?.[0] || 'https://images.pexels.com/photos/1642125/pexels-photo-1642125.jpeg?auto=compress&cs=tinysrgb&w=400'}
                    alt={property.title}
                    className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{property.title}</h3>
                    <div className="flex items-center space-x-1">
                        {getStatusIcon(property.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(property.status)}`}>
                        {property.status}
                        </span>
                    </div>
                    </div>
                    <p className="text-gray-600 mb-1">{property.location}</p>
                    <p className="text-sm text-gray-500 mb-2 line-clamp-2">{property.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span className="text-gray-500">Monthly Rent:</span>
                        <span className="font-medium ml-1">{property.monthlyRent.toLocaleString()} FCFA</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Valuation:</span>
                        <span className="font-medium ml-1">{property.valuation.toLocaleString()} FCFA</span>
                    </div>
                    {property.tokenPrice && (
                        <div>
                        <span className="text-gray-500">Token Price:</span>
                        <span className="font-medium ml-1">{property.tokenPrice.toLocaleString()} FCFA</span>
                        </div>
                    )}
                    <div>
                        <span className="text-gray-500">Created:</span>
                        <span className="font-medium ml-1">{new Date(property.createdAt).toLocaleDateString()}</span>
                    </div>
                    </div>
                    {property.status === 'rejected' && property.rejectionReason && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">
                        <strong>Rejection Reason:</strong> {property.rejectionReason}
                        </p>
                    </div>
                    )}
                </div>
                </div>
                
                <div className="flex items-center space-x-2">
                <Link
                    to={`/property/${property.id}`}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="View Property"
                >
                    <EyeIcon className="w-5 h-5" />
                </Link>
                {property.status !== 'approved' && (
                    <Link
                    to={`/manager/properties/${property.id}/edit`}
                    className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Property"
                    >
                    <PencilIcon className="w-5 h-5" />
                    </Link>
                )}
                <button
                    onClick={() => deleteProperty(property.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Property"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
                </div>
            </div>
            </motion.div>
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

export default ManagerProperties;