import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Wallet, Save, Edit, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
const { user } = useAuth();
const [isEditing, setIsEditing] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [formData, setFormData] = useState({
name: user?.name || '',
email: user?.email || '',
phone: user?.phone || '',
walletAddress: user?.walletAddress || '',
});

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
setFormData({
    ...formData,
    [e.target.name]: e.target.value,
});
};

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
if (!user) return;

setIsLoading(true);
try {
    await usersAPI.update(user.id, formData);
    toast.success('Profile updated successfully!');
    setIsEditing(false);
    
    // Update user context
    const updatedUser = { ...user, ...formData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    window.location.reload(); // Refresh to update context
} catch (error) {
    toast.error('Failed to update profile');
} finally {
    setIsLoading(false);
}
};

const handleCancel = () => {
setFormData({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    walletAddress: user?.walletAddress || '',
});
setIsEditing(false);
};

return (
<div className="space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
    <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
    </div>
    {!isEditing && (
        <button
        onClick={() => setIsEditing(true)}
        className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
        <Edit className="w-4 h-4" />
        <span>Edit Profile</span>
        </button>
    )}
    </div>

    {/* Profile Card */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
    <div className="p-8">
        {/* Avatar Section */}
        <div className="flex items-center space-x-6 mb-8">
        <div className="relative">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center">
            <span className="text-emerald-600 font-bold text-2xl">
                {user?.name?.charAt(0).toUpperCase()}
            </span>
            </div>
            {isEditing && (
            <button className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2 rounded-full hover:bg-emerald-700 transition-colors">
                <Camera className="w-4 h-4" />
            </button>
            )}
        </div>
        <div>
            <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-gray-600 capitalize">{user?.role}</p>
            <div className="flex items-center mt-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                user?.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
                {user?.isActive ? 'Active' : 'Inactive'}
            </span>
            </div>
        </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
            </label>
            <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                }`}
                required
                />
            </div>
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
            </label>
            <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                }`}
                required
                />
            </div>
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
            </label>
            <div className="relative">
                <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                }`}
                />
            </div>
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Wallet Address
            </label>
            <div className="relative">
                <Wallet className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                type="text"
                name="walletAddress"
                value={formData.walletAddress}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                }`}
                placeholder="0x..."
                />
            </div>
            </div>
        </div>

        {/* Account Information */}
        <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
                </label>
                <input
                type="text"
                value={user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                Member Since
                </label>
                <input
                type="text"
                value={new Date().toLocaleDateString()}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                />
            </div>
            </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
                Cancel
            </button>
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                isLoading
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
            >
                {isLoading ? (
                <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Saving...</span>
                </>
                ) : (
                <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                </>
                )}
            </motion.button>
            </div>
        )}
        </form>
    </div>
    </div>

    {/* Security Section */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
    <div className="space-y-4">
        <button className="w-full md:w-auto bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors">
        Change Password
        </button>
        <button className="w-full md:w-auto bg-red-100 text-red-700 px-6 py-2 rounded-lg hover:bg-red-200 transition-colors ml-0 md:ml-4">
        Delete Account
        </button>
    </div>
    </div>
</div>
);
};

export default Profile;