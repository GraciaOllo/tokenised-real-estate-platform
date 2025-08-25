import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
UserGroupIcon, 
PlusIcon, 
PencilIcon, 
TrashIcon,
EyeIcon,
ChevronLeftIcon,
ChevronRightIcon,
MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../services/api';
import { AuthUser } from '../../types';
import toast from 'react-hot-toast';

const UserManagement: React.FC = () => {
const { user } = useAuth();
const [users, setUsers] = useState<AuthUser[]>([]);
const [filteredUsers, setFilteredUsers] = useState<AuthUser[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [currentPage, setCurrentPage] = useState(1);
const [searchTerm, setSearchTerm] = useState('');
const [roleFilter, setRoleFilter] = useState('all');
const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
const [showUserModal, setShowUserModal] = useState(false);
const [modalType, setModalType] = useState<'view' | 'edit' | 'create'>('view');

const usersPerPage = 10;

useEffect(() => {
loadUsers();
}, []);

useEffect(() => {
filterUsers();
}, [users, searchTerm, roleFilter]);

const loadUsers = async () => {
try {
    setIsLoading(true);
    const data = await usersAPI.getAll();
    setUsers(data);
} catch (error) {
    toast.error('Failed to load users');
} finally {
    setIsLoading(false);
}
};

const filterUsers = () => {
let filtered = users;

if (searchTerm) {
    filtered = filtered.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
}

if (roleFilter !== 'all') {
    filtered = filtered.filter(user => user.role === roleFilter);
}

setFilteredUsers(filtered);
setCurrentPage(1);
};

const handleUserAction = async (userId: string, action: 'activate' | 'deactivate' | 'delete') => {
try {
    if (action === 'delete') {
    if (window.confirm('Are you sure you want to delete this user?')) {
        await usersAPI.delete(userId);
        toast.success('User deleted successfully');
    }
    } else if (action === 'activate') {
    await usersAPI.activate(userId);
    toast.success('User activated successfully');
    } else if (action === 'deactivate') {
    await usersAPI.deactivate(userId);
    toast.success('User deactivated successfully');
    } else {
    return;
    }
    loadUsers();
} catch (error) {
    toast.error(`Failed to ${action} user`);
}
};

const handleCreateUser = async (userData: any) => {
    try {
        await usersAPI.create({ ...userData, isActive: true });
            toast.success('User created and verified!');
            loadUsers();
            closeUserModal();
        } catch (error) {
            toast.error('Failed to create user');
        }
};

const openUserModal = (user: AuthUser | null, type: 'view' | 'edit' | 'create') => {
setSelectedUser(user);
setModalType(type);
setShowUserModal(true);
};

const closeUserModal = () => {
setSelectedUser(null);
setShowUserModal(false);
};

const getRoleColor = (role: string) => {
switch (role) {
    case 'admin':
    return 'bg-purple-100 text-purple-800';
    case 'manager':
    return 'bg-blue-100 text-blue-800';
    case 'investor':
    return 'bg-emerald-100 text-emerald-800';
    case 'tenant':
    return 'bg-gray-100 text-gray-800';
    default:
    return 'bg-gray-100 text-gray-800';
}
};

// Pagination
const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
const startIndex = (currentPage - 1) * usersPerPage;
const endIndex = startIndex + usersPerPage;
const currentUsers = filteredUsers.slice(startIndex, endIndex);

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
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600">Manage platform users and their permissions</p>
    </div>
    <button
        onClick={() => openUserModal(null, 'create')}
        className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
    >
        <PlusIcon className="w-5 h-5" />
        <span>Add User</span>
    </button>
    </div>

    {/* Filters */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
        <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Search by name or email..."
            />
        </div>
        </div>
        
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
        <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="investor">Investor</option>
            <option value="tenant">Tenant</option>
        </select>
        </div>

        <div className="flex items-end">
        <div className="text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
        </div>
        </div>
    </div>
    </div>

    {/* Users Table */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="overflow-x-auto">
        <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">User</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Role</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Joined</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
            {currentUsers.map((user) => (
            <motion.tr
                key={user._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-gray-50 transition-colors"
            >
                <td className="px-6 py-4">
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
                </td>
                <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getRoleColor(user.role)}`}>
                    {user.role}
                </span>
                </td>
                <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                {new Date().toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                <div className="flex items-center space-x-2">
                    <button
                    onClick={() => openUserModal(user, 'view')}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="View User"
                    >
                    <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                    onClick={() => openUserModal(user, 'edit')}
                    className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit User"
                    >
                    <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                    onClick={() => handleUserAction(user._id, user.isActive ? 'deactivate' : 'activate')}
                    className={`px-3 py-1 rounded text-xs font-medium ${
                        user.isActive
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                    >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                    onClick={() => handleUserAction(user._id, 'delete')}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete User"
                    >
                    <TrashIcon className="w-4 h-4" />
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
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
                {page}
            </button>
            ))}
            
            <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
            <ChevronRightIcon className="w-5 h-5" />
            </button>
        </div>
        </div>
    )}
    </div>

    {/* User Modal */}
    {showUserModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
            {modalType === 'create' ? 'Add New User' : 
                modalType === 'edit' ? 'Edit User' : 'User Details'}
            </h3>
        </div>
        <div className="p-6">
            {modalType === 'create' ? (
            <form
                className="space-y-4"
                onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const formData = new FormData(form);
                    const name = formData.get('name') as string;
                    const email = formData.get('email') as string;
                    const role = formData.get('role') as string;
                    const phone = formData.get('phone') as string;
                    const password = formData.get('password') as string; 
                    const walletAddress = formData.get('walletAddress') as string;
                    await handleCreateUser({ name, email, role, phone, password, walletAddress });
                }}
            >
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input name="name" type="text" required className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input name="email" type="email" required className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select name="role" required className="w-full px-3 py-2 border rounded-lg">
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="investor">Investor</option>
                        <option value="tenant">Tenant</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input name="phone" type="text" className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input name="password" type="password" required className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Wallet Address</label>
                    <input name="walletAddress" type="text" className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                    <button
                        type="button"
                        onClick={closeUserModal}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        Create
                    </button>
                </div>
            </form>
            ) : selectedUser && (
            <div className="space-y-4">
                <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-emerald-600 font-bold text-xl">
                    {selectedUser.name?.charAt(0).toUpperCase()}
                    </span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900">{selectedUser.name}</h4>
                <p className="text-gray-600">{selectedUser.email}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <span className="text-gray-500">Role:</span>
                    <span className="font-medium ml-2 capitalize">{selectedUser.role}</span>
                </div>
                <div>
                    <span className="text-gray-500">Status:</span>
                    <span className={`font-medium ml-2 ${selectedUser.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
                {selectedUser.phone && (
                    <div className="col-span-2">
                    <span className="text-gray-500">Phone:</span>
                    <span className="font-medium ml-2">{selectedUser.phone}</span>
                    </div>
                )}
                {selectedUser.walletAddress && (
                    <div className="col-span-2">
                    <span className="text-gray-500">Wallet:</span>
                    <span className="font-mono text-sm ml-2">{selectedUser.walletAddress}</span>
                    </div>
                )}
                </div>
            </div>
            )}
        </div>
        {modalType !== 'create' && (
        <div className="p-6 border-t border-gray-200 flex justify-end">
            <button
            onClick={closeUserModal}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
            Close
            </button>
        </div>
        )}
        </div>
    </div>
    )}
</div>
);
};

export default UserManagement;