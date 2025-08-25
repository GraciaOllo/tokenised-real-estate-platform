import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Upload, Plus, X, FileText, Image, DollarSign, Home, MapPin, Send, Users, TrendingUp, Bell, Settings, BarChart3, Shield, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { propertiesAPI, blockchainAPI } from '../services/api';

interface PropertyForm {
  title: string;
  location: string;
  description: string;
  valuation: number;
  tokenPrice: number;
  totalTokens: number;
  monthlyRent: number;
  expectedYield: number;
}

const AdminPanel: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);
  const [documents, setDocuments] = useState<string[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  const [properties, setProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalInvestors: 0,
    totalFundsRaised: 0,
    pendingRentDistribution: 0,
  });
  
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<PropertyForm>();

  React.useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const propertiesData = await propertiesAPI.getAll();
      // const usersData = await usersAPI.getAll(); // Uncomment when API is ready
      setProperties(propertiesData);
      
      // Mock stats - in real app, these would come from API
      setStats({
        totalProperties: propertiesData.length,
        totalInvestors: 847,
        totalFundsRaised: 12500000,
        pendingRentDistribution: 45000,
      });
    } catch (error) {
      toast.error('Failed to load admin data');
    }
  };

  const onSubmit = async (data: PropertyForm) => {
    if (!user) return;
    
    setIsDeploying(true);
    
    try {
      // Create property in database
      const propertyData = {
        ...data,
        images,
        documents,
        ownerId: user.id,
      };
      
      const createdProperty = await propertiesAPI.create(propertyData);
      
      // Deploy smart contract
      const contractResult = await blockchainAPI.deployContract(propertyData);
      
      // Update property with contract address
      await propertiesAPI.update(createdProperty.id, {
        contractAddress: contractResult.contractAddress,
      });
      
      toast.success(`Property tokenized successfully! Contract: ${contractResult.contractAddress.substring(0, 10)}...`);
      reset();
      setImages([]);
      setDocuments([]);
      loadAdminData();
    } catch (error) {
      toast.error('Failed to tokenize property');
    } finally {
      setIsDeploying(false);
    }
  };

  const distributeRent = async (propertyId: string, contractAddress: string, amount: number) => {
    try {
      const result = await blockchainAPI.distributeRent(contractAddress, amount);
      toast.success(`Rent distributed successfully! TX: ${result.transactionHash.substring(0, 10)}...`);
      loadAdminData();
    } catch (error) {
      toast.error('Failed to distribute rent');
    }
  };

  const handleUserAction = async (userId: string, action: 'activate' | 'deactivate') => {
    try {
      // await usersAPI.update(userId, { isActive: action === 'activate' });
      toast.success(`User ${action}d successfully`);
      loadAdminData();
    } catch (error) {
      toast.error(`Failed to ${action} user`);
    }
  };

  const addImage = () => {
    const imageUrl = prompt('Enter image URL:');
    if (imageUrl) {
      setImages([...images, imageUrl]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const addDocument = () => {
    const docName = prompt('Enter document name:');
    if (docName) {
      setDocuments([...documents, docName]);
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.role === 'admin' ? 'Admin Panel' : 'Property Manager'}
              </h1>
              <div className="flex items-center space-x-1 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
                <Shield className="w-4 h-4 mr-1" />
                {user?.role === 'admin' ? 'Super Admin' : 'Manager'}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name}
          </h1>
          <p className="text-emerald-100">Manage properties, users, and blockchain operations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <Home className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalProperties}</h3>
            <p className="text-gray-600 text-sm">Total Properties</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalInvestors}</h3>
            <p className="text-gray-600 text-sm">Active Investors</p>
            <div className="mt-2 flex items-center text-xs text-blue-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12% this month
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              ${(stats.totalFundsRaised / 1000000).toFixed(1)}M
            </h3>
            <p className="text-gray-600 text-sm">Funds Raised</p>
            <div className="mt-2 flex items-center text-xs text-purple-600">
              <BarChart3 className="w-3 h-3 mr-1" />
              All time
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              ${(stats.pendingRentDistribution / 1000).toFixed(0)}K
            </h3>
            <p className="text-gray-600 text-sm">Pending Distribution</p>
            <div className="mt-2 flex items-center text-xs text-orange-600">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Requires action
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {user?.role === 'admin' && (
                <>
              <button
                onClick={() => setActiveTab('create')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'create'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Create Property
              </button>
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'users'
                        ? 'border-emerald-500 text-emerald-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    User Management
                  </button>
                </>
              )}
              <button
                onClick={() => setActiveTab('manage')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'manage'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Manage Properties
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'analytics'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Analytics
              </button>
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'create' ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
              <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                <Home className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Title *
                </label>
                <input
                  {...register('title', { required: 'Property title is required' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g. Luxury Downtown Apartment"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    {...register('location', { required: 'Location is required' })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g. Manhattan, New York"
                  />
                </div>
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Detailed property description..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Financial Information */}
              <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Financial Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Valuation ($) *
                </label>
                <input
                  {...register('valuation', { 
                    required: 'Valuation is required',
                    min: { value: 1, message: 'Valuation must be positive' }
                  })}
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="850000"
                />
                {errors.valuation && (
                  <p className="text-red-500 text-sm mt-1">{errors.valuation.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token Price ($) *
                </label>
                <input
                  {...register('tokenPrice', { 
                    required: 'Token price is required',
                    min: { value: 1, message: 'Token price must be positive' }
                  })}
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="100"
                />
                {errors.tokenPrice && (
                  <p className="text-red-500 text-sm mt-1">{errors.tokenPrice.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Tokens *
                </label>
                <input
                  {...register('totalTokens', { 
                    required: 'Total tokens is required',
                    min: { value: 1, message: 'Total tokens must be positive' }
                  })}
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="8500"
                />
                {errors.totalTokens && (
                  <p className="text-red-500 text-sm mt-1">{errors.totalTokens.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Rent ($) *
                </label>
                <input
                  {...register('monthlyRent', { 
                    required: 'Monthly rent is required',
                    min: { value: 1, message: 'Monthly rent must be positive' }
                  })}
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="6000"
                />
                {errors.monthlyRent && (
                  <p className="text-red-500 text-sm mt-1">{errors.monthlyRent.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Annual Yield (%) *
                </label>
                <input
                  {...register('expectedYield', { 
                    required: 'Expected yield is required',
                    min: { value: 0, message: 'Yield must be positive' },
                    max: { value: 100, message: 'Yield cannot exceed 100%' }
                  })}
                  type="number"
                  step="0.1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="8.5"
                />
                {errors.expectedYield && (
                  <p className="text-red-500 text-sm mt-1">{errors.expectedYield.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Media & Documents */}
              <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <Upload className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Media & Documents</h2>
            </div>

            {/* Images */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Property Images
                </label>
                <button
                  type="button"
                  onClick={addImage}
                  className="flex items-center text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Image
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Property ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {images.length === 0 && (
                  <div className="col-span-full flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No images added yet</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Documents */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Property Documents
                </label>
                <button
                  type="button"
                  onClick={addDocument}
                  className="flex items-center text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Document
                </button>
              </div>
              <div className="space-y-3">
                {documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-900">{doc}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {documents.length === 0 && (
                  <div className="flex items-center justify-center h-20 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <FileText className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                      <p className="text-sm text-gray-500">No documents added yet</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isDeploying}
                className={`w-full md:w-auto px-8 py-4 rounded-lg font-semibold text-white transition-all ${
                  isDeploying
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg'
                }`}
              >
                {isDeploying ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Deploying to Blockchain...
                  </span>
                ) : (
                  'Deploy to Blockchain'
                )}
              </button>
              {!isDeploying && (
                <p className="text-sm text-gray-500 mt-3">
                  This will create smart contracts and tokenize your property
                </p>
              )}
            </div>
        </form>
            ) : (
            activeTab === 'users' && user?.role === 'admin' ? (
              /* User Management Tab */
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                  <div className="flex items-center space-x-4">
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                      <option>All Roles</option>
                      <option>Admin</option>
                      <option>Manager</option>
                      <option>Investor</option>
                      <option>Tenant</option>
                    </select>
                    <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
                      Add User
                    </button>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="grid grid-cols-5 gap-4 text-sm font-medium text-gray-700">
                      <div>User</div>
                      <div>Role</div>
                      <div>Status</div>
                      <div>Joined</div>
                      <div>Actions</div>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {/* Mock user data - replace with real data */}
                    {[
                      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'investor', status: 'active', joinDate: '2024-01-15' },
                      { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'tenant', status: 'active', joinDate: '2024-01-20' },
                      { id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: 'manager', status: 'inactive', joinDate: '2024-02-01' },
                    ].map((mockUser) => (
                      <div key={mockUser.id} className="px-6 py-4 hover:bg-gray-50">
                        <div className="grid grid-cols-5 gap-4 items-center">
                          <div>
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                                <User className="w-4 h-4 text-emerald-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{mockUser.name}</div>
                                <div className="text-sm text-gray-500">{mockUser.email}</div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                              mockUser.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                              mockUser.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                              mockUser.role === 'investor' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {mockUser.role}
                            </span>
                          </div>
                          <div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              mockUser.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {mockUser.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(mockUser.joinDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleUserAction(mockUser.id, mockUser.status === 'active' ? 'deactivate' : 'activate')}
                              className={`px-3 py-1 rounded text-xs font-medium ${
                                mockUser.status === 'active'
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              {mockUser.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200">
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : activeTab === 'analytics' ? (
              /* Analytics Tab */
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Platform Analytics</h3>
                <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
                  <p className="text-gray-500">Detailed analytics and reporting features coming soon.</p>
                </div>
              </div>
            ) : (
              /* Manage Properties Tab */
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Property Management</h3>
                
                <div className="space-y-4">
                  {properties.map((property: any) => (
                    <motion.div
                      key={property.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 rounded-xl p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <img
                            src={property.images?.[0] || 'https://images.pexels.com/photos/1642125/pexels-photo-1642125.jpeg?auto=compress&cs=tinysrgb&w=400'}
                            alt={property.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">
                              {property.title}
                            </h4>
                            <p className="text-gray-600">{property.location}</p>
                            <p className="text-sm text-gray-500">
                              Contract: {property.contractAddress?.substring(0, 10)}...
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Monthly Rent</p>
                            <p className="text-lg font-semibold text-gray-900">
                              ${property.monthlyRent?.toLocaleString()}
                            </p>
                          </div>
                          
                          <button
                            onClick={() => distributeRent(property.id, property.contractAddress, property.monthlyRent)}
                            className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                          >
                            <Send className="w-4 h-4" />
                            <span>Distribute Rent</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {properties.length === 0 && (
                    <div className="text-center py-12">
                      <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Yet</h3>
                      <p className="text-gray-500">Create your first property to get started.</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;