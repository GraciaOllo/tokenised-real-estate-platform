import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  EnvelopeIcon,
  PhotoIcon,
  UserIcon,
  MapPinIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { propertiesAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface Property {
    id?: string;
    _id?: string;
    title: string;
    location: string;
    description: string;
    valuation: number;
    monthlyRent: number;
    status: string;
    ownerId: string;
    ownerName: string;
    images?: string[];
}

const PropertyManagement: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [modalType] = useState<'view'>('view');
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState('');

  const propertiesPerPage = 10;

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    filterProperties();
  }, [properties, searchTerm, statusFilter]);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      const data = await propertiesAPI.getAll();
      setProperties(data);
    } catch (error) {
      toast.error('Failed to load properties');
    } finally {
      setIsLoading(false);
    }
  };

  const filterProperties = () => {
    let filtered = properties;

    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(property => property.status === statusFilter);
    }

    setFilteredProperties(filtered);
    setCurrentPage(1);
  };

  const handlePropertyAction = async (propertyId: string, action: 'approve' | 'reject' | 'pending', reason?: string) => {
    try {
      const status = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'pending';
      await propertiesAPI.update(propertyId, {
        status,
        ...(reason && { rejectionReason: reason })
      });
      toast.success(`Property ${action}d successfully`);
      loadProperties();
    } catch (error) {
      toast.error(`Failed to ${action} property`);
    }
  };

  const handleContactOwner = async (_propertyId: string, message: string) => {
    try {
      toast.success('Message sent to property owner');
      setShowContactModal(false);
      setContactMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'tokenized':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);
  const startIndex = (currentPage - 1) * propertiesPerPage;
  const endIndex = startIndex + propertiesPerPage;
  const currentProperties = filteredProperties.slice(startIndex, endIndex);

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
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Green Property Management</h1>
          <p className="text-gray-600 mt-2">Build Wealth with Green! Approve and manage investments.</p>
        </div>
        <Link
          to="/admin/add-property"
          className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-md"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Property</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Properties</label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3.5 w-5 h-5 text-emerald-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/50"
                placeholder="Search by title, location, or owner..."
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
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="tokenized">Tokenized</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredProperties.length)} of {filteredProperties.length} properties
            </div>
          </div>
        </div>
      </div>

      {/* Properties Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-emerald-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Property</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Location</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Owner</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Value</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentProperties.map((property) => (
                <motion.tr
                  key={property.id || property._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-emerald-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <PhotoIcon className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{property.title}</p>
                        <p className="text-sm text-gray-500">{property.description.substring(0, 50)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <MapPinIcon className="w-4 h-4 text-emerald-500 mr-2" />
                      <span className="text-sm text-gray-900">{property.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <UserIcon className="w-4 h-4 text-emerald-500 mr-2" />
                      <span className="text-sm text-gray-900">{property.ownerName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="w-4 h-4 text-yellow-600 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        ${property.valuation.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                      {property.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedProperty(property);
                          setShowPropertyModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePropertyAction(property.id || property._id || '', 'approve')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Approve"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Rejection reason (optional):');
                          if (reason !== null) {
                            handlePropertyAction(property.id || property._id || '', 'reject', reason || undefined);
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Reject"
                      >
                        <XCircleIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProperty(property);
                          setShowContactModal(true);
                        }}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                        title="Contact Owner"
                      >
                        <EnvelopeIcon className="w-4 h-4" />
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

      {/* Property Modal */}
      {showPropertyModal && selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Property Details</h3>
              <button
                onClick={() => setShowPropertyModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedProperty.images?.[0] || '/placeholder-property.jpg'}
                    alt={selectedProperty.title}
                    className="w-full h-64 object-cover rounded-lg shadow-sm"
                  />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{selectedProperty.title}</h4>
                  <p className="text-gray-600 mb-4">{selectedProperty.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="text-gray-900">{selectedProperty.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valuation:</span>
                      <span className="text-gray-900 text-yellow-600 font-medium">${selectedProperty.valuation.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Rent:</span>
                      <span className="text-gray-900">${selectedProperty.monthlyRent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedProperty.status)}`}>
                        {selectedProperty.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Owner:</span>
                      <span className="text-gray-900">{selectedProperty.ownerName}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Contact {selectedProperty.ownerName}</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message to {selectedProperty.ownerName}
                </label>
                <textarea
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/50"
                  rows={4}
                  placeholder="Discuss investment opportunities..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowContactModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleContactOwner(selectedProperty.id || selectedProperty._id || '', contactMessage)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyManagement;