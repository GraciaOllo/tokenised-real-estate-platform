import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
EyeIcon,
PlusIcon,
MagnifyingGlassIcon,
ChevronLeftIcon,
ChevronRightIcon,
UserIcon,
HomeIcon,
CurrencyDollarIcon,
CalendarIcon,
XCircleIcon,
} from '@heroicons/react/24/outline';
import { tenantsAPI, usersAPI, propertiesAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface Tenant {
id?: string;
_id?: string;
userId: string;
propertyId?: string;
leaseStartDate: string;
leaseEndDate: string;
monthlyRent: number;
depositAmount: number;
status: string;
user?: {
name: string;
email: string;
};
property?: {
title: string;
location: string;
};
}

const TenantManagement: React.FC = () => {
const [tenants, setTenants] = useState<Tenant[]>([]);
const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [currentPage, setCurrentPage] = useState(1);
const [searchTerm, setSearchTerm] = useState('');
const [statusFilter, setStatusFilter] = useState('all');
const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
const [showTenantModal, setShowTenantModal] = useState(false);
const [users, setUsers] = useState<any[]>([]);
const [properties, setProperties] = useState<any[]>([]);

const tenantsPerPage = 10;

useEffect(() => {
loadTenants();
loadUsers();
loadProperties();
}, []);

useEffect(() => {
filterTenants();
}, [tenants, searchTerm, statusFilter]);

const loadTenants = async () => {
try {
    setIsLoading(true);
    const data = await tenantsAPI.getAll();
    
    // Enrich tenant data with user and property info
    const enrichedTenants = await Promise.all(data.map(async (tenant: any) => {
    const user = await usersAPI.getById(tenant.userId);
    let property = null;
    if (tenant.propertyId) {
        property = await propertiesAPI.getById(tenant.propertyId);
    }
    return {
        ...tenant,
        user,
        property
    };
    }));
    
    setTenants(enrichedTenants);
} catch (error) {
    console.error('Error loading tenants:', error);
    toast.error('Failed to load tenants');
} finally {
    setIsLoading(false);
}
};

const loadUsers = async () => {
try {
    const data = await usersAPI.getAll();
    setUsers(data);
} catch (error) {
    console.error('Error loading users:', error);
    toast.error('Failed to load users');
}
};

const loadProperties = async () => {
try {
    const data = await propertiesAPI.getAll();
    setProperties(data);
} catch (error) {
    console.error('Error loading properties:', error);
    toast.error('Failed to load properties');
}
};

const filterTenants = () => {
let filtered = tenants;

if (searchTerm) {
    filtered = filtered.filter(tenant =>
    (tenant.user?.name && tenant.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (tenant.user?.email && tenant.user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (tenant.property?.title && tenant.property.title.toLowerCase().includes(searchTerm.toLowerCase()))
    );
}

if (statusFilter !== 'all') {
    filtered = filtered.filter(tenant => tenant.status === statusFilter);
}

setFilteredTenants(filtered);
setCurrentPage(1);
};

const getStatusColor = (status: string) => {
switch (status) {
    case 'active':
    return 'bg-green-100 text-green-800';
    case 'inactive':
    return 'bg-yellow-100 text-yellow-800';
    case 'terminated':
    return 'bg-red-100 text-red-800';
    default:
    return 'bg-gray-100 text-gray-800';
}
};

const totalPages = Math.ceil(filteredTenants.length / tenantsPerPage);
const startIndex = (currentPage - 1) * tenantsPerPage;
const endIndex = startIndex + tenantsPerPage;
const currentTenants = filteredTenants.slice(startIndex, endIndex);

if (isLoading) {
return (
    <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
    </div>
);
}

return (
<div className="max-w-7xl mx-auto p-6 space-y-8 bg-gradient-to-br from-emerald-50 to-white rounded-2xl shadow-lg font-montserrat">
    {/* Header */}
    <div className="flex items-center justify-between">
    <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tenant Management</h1>
        <p className="text-gray-600 mt-2">Manage your tenants and their properties</p>
    </div>
    <button
        onClick={() => setShowTenantModal(true)}
        className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-md"
    >
        <PlusIcon className="w-5 h-5" />
        <span>Add Tenant</span>
    </button>
    </div>

    {/* Filters */}
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-gray-200">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Search Tenants</label>
        <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-3.5 w-5 h-5 text-emerald-500" />
            <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/50"
            placeholder="Search by name, email, or property..."
            />
        </div>
        </div>
        
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
        <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/50"
        >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="terminated">Terminated</option>
        </select>
        </div>

        <div className="flex items-end">
        <div className="text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredTenants.length)} of {filteredTenants.length} tenants
        </div>
        </div>
    </div>
    </div>

    {/* Tenants Table */}
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="overflow-x-auto">
        <table className="w-full">
        <thead className="bg-emerald-50 border-b border-gray-200">
            <tr>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Tenant</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Property</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Lease Period</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Rent</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
            {currentTenants.map((tenant) => (
            <motion.tr
                key={tenant.id || tenant._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-emerald-50 transition-colors"
            >
                <td className="px-6 py-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                    <p className="font-medium text-gray-900">{tenant.user?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">{tenant.user?.email || 'No email'}</p>
                    </div>
                </div>
                </td>
                <td className="px-6 py-4">
                <div className="flex items-center">
                    <HomeIcon className="w-4 h-4 text-emerald-500 mr-2" />
                    <span className="text-sm text-gray-900">
                    {tenant.property?.title || 'Not assigned'}
                    </span>
                </div>
                {tenant.property?.location && (
                    <p className="text-xs text-gray-500 mt-1">{tenant.property.location}</p>
                )}
                </td>
                <td className="px-6 py-4">
                <div className="flex items-center">
                    <CalendarIcon className="w-4 h-4 text-emerald-500 mr-2" />
                    <span className="text-sm text-gray-900">
                    {new Date(tenant.leaseStartDate).toLocaleDateString()} - {new Date(tenant.leaseEndDate).toLocaleDateString()}
                    </span>
                </div>
                </td>
                <td className="px-6 py-4">
                <div className="flex items-center">
                    <CurrencyDollarIcon className="w-4 h-4 text-yellow-600 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                    {tenant.monthlyRent?.toLocaleString() || 0} FCFA
                    </span>
                </div>
                </td>
                <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tenant.status)}`}>
                    {tenant.status}
                </span>
                </td>
                <td className="px-6 py-4">
                <div className="flex items-center space-x-2">
                    <button
                    onClick={() => {
                        setSelectedTenant(tenant);
                        setShowTenantModal(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Details"
                    >
                    <EyeIcon className="w-4 h-4" />
                    </button>
                </div>
                </td>
            </motion.tr>
            ))}
        </tbody>
        </table>
    </div>

    {/* Pagination */}
    {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center space-x-2">
            <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2 text-emerald-500 hover:text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
            <ChevronLeftIcon className="w-5 h-5" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded text-sm font-medium ${
                currentPage === page
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-600 hover:bg-emerald-100'
                }`}
            >
                {page}
            </button>
            ))}
            
            <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-2 text-emerald-500 hover:text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
            <ChevronRightIcon className="w-5 h-5" />
            </button>
        </div>
        </div>
    )}
    </div>

    {/* Tenant Modal */}
    {showTenantModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
            {selectedTenant ? 'Tenant Details' : 'Add New Tenant'}
            </h3>
            <button
            onClick={() => {
                setShowTenantModal(false);
                setSelectedTenant(null);
            }}
            className="text-gray-400 hover:text-gray-600"
            >
            <XCircleIcon className="w-6 h-6" />
            </button>
        </div>
        <div className="p-6">
            {selectedTenant ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Tenant Information</h4>
                <div className="space-y-4">
                    <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="text-gray-900 font-medium">{selectedTenant.user?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="text-gray-900">{selectedTenant.user?.email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTenant.status)}`}>
                        {selectedTenant.status}
                    </span>
                    </div>
                </div>
                </div>
                <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Lease Information</h4>
                <div className="space-y-4">
                    <div className="flex justify-between">
                    <span className="text-gray-600">Property:</span>
                    <span className="text-gray-900">{selectedTenant.property?.title || 'Not assigned'}</span>
                    </div>
                    <div className="flex justify-between">
                    <span className="text-gray-600">Lease Start:</span>
                    <span className="text-gray-900">{new Date(selectedTenant.leaseStartDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                    <span className="text-gray-600">Lease End:</span>
                    <span className="text-gray-900">{new Date(selectedTenant.leaseEndDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Rent:</span>
                    <span className="text-gray-900 font-medium">{selectedTenant.monthlyRent?.toLocaleString() || 0} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                    <span className="text-gray-600">Deposit:</span>
                    <span className="text-gray-900 font-medium">{selectedTenant.depositAmount?.toLocaleString() || 0} FCFA</span>
                    </div>
                </div>
                </div>
            </div>
            ) : (
            <div className="text-center py-12">
                <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Tenant details will appear here</p>
            </div>
            )}
        </div>
        </div>
    </div>
    )}
</div>
);
};

export default TenantManagement;