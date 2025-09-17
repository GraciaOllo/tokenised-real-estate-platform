import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  CurrencyDollarIcon,
  CubeTransparentIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { propertiesAPI } from '../../services/api';
import { useChat } from '../../context/ChatContext';
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
  ownerName?: string;
  images?: string[];
}

// Status color mapping — now properly scoped
const getStatusColor = (status: string): string => {
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

// Reusable skeleton row for loading state
const SkeletonRow: React.FC = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-20"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
    </td>
    <td className="px-6 py-4">
      <div className="flex space-x-2">
        <div className="h-8 w-8 bg-gray-200 rounded"></div>
        <div className="h-8 w-8 bg-gray-200 rounded"></div>
        <div className="h-8 w-8 bg-gray-200 rounded"></div>
      </div>
    </td>
  </tr>
);

const PropertyManagement: React.FC = () => {
  const { sendMessage } = useChat();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'edit'>('view'); // Now used
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [showTokenizeModal, setShowTokenizeModal] = useState(false);
  const [tokenizeData, setTokenizeData] = useState({ ownerWalletAddress: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const propertiesPerPage = 10;

  // Load properties with error handling
  const loadProperties = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await propertiesAPI.getAll();
      setProperties(data || []);
    } catch (err) {
      console.error('Failed to load properties:', err);
      setError('Failed to load properties. Please try again.');
      toast.error('Failed to load properties');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filter properties memoized
  const filterProperties = useCallback(() => {
    let filtered = [...properties];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (property) =>
          property.title.toLowerCase().includes(term) ||
          property.location.toLowerCase().includes(term) ||
          (property.ownerName || '').toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((property) => property.status === statusFilter);
    }

    setFilteredProperties(filtered);
    setCurrentPage(1);
  }, [properties, searchTerm, statusFilter]);

  // Effects
  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  useEffect(() => {
    filterProperties();
  }, [filterProperties]);

  // Pagination
  const totalPages = useMemo(
    () => Math.ceil(filteredProperties.length / propertiesPerPage),
    [filteredProperties.length]
  );

  const startIndex = useMemo(() => (currentPage - 1) * propertiesPerPage, [currentPage]);
  const endIndex = useMemo(() => startIndex + propertiesPerPage, [startIndex]);
  const currentProperties = useMemo(
    () => filteredProperties.slice(startIndex, endIndex),
    [filteredProperties, startIndex, endIndex]
  );

  // Action handlers
  const handlePropertyAction = useCallback(
    async (propertyId: string, action: 'approve' | 'reject' | 'pending', reason?: string) => {
      if (!propertyId) return;

      try {
        setIsSubmitting(true);
        const status = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'pending';
        await propertiesAPI.update(propertyId, {
          status,
          ...(reason && { rejectionReason: reason }),
        });
        toast.success(`Property ${action}d successfully`);
        await loadProperties(); // Refresh data
      } catch (error) {
        console.error(`Failed to ${action} property:`, error);
        toast.error(`Failed to ${action} property`);
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadProperties]
  );

  const handleContactOwner = useCallback(
    async (propertyId: string, message: string) => {
      if (!message.trim()) {
        toast.error('Message cannot be empty');
        return;
      }

      if (!selectedProperty?.ownerId) {
        toast.error('Property owner not found');
        return;
      }

      try {
        setIsSubmitting(true);
        // Send message through ChatContext to the property owner
        sendMessage(selectedProperty.ownerId, message.trim());
        toast.success('Message sent to property owner');
        setShowContactModal(false);
        setContactMessage('');
      } catch (error) {
        toast.error('Failed to send message');
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedProperty, sendMessage]
  );

  const handleTokenizeProperty = useCallback(async () => {
    if (!selectedProperty) return;
    if (!tokenizeData.ownerWalletAddress.trim()) {
      toast.error('Please enter a valid wallet address');
      return;
    }

    try {
      setIsSubmitting(true);
      // Simulate tokenization API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Property tokenized successfully!');
      setShowTokenizeModal(false);
      setTokenizeData({ ownerWalletAddress: '' });
      await loadProperties(); // Refresh to show updated status
    } catch (error) {
      toast.error('Failed to tokenize property');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedProperty, tokenizeData, loadProperties]);

  // Modal close handlers
  const closeModal = useCallback(() => {
    setShowPropertyModal(false);
    setShowContactModal(false);
    setShowTokenizeModal(false);
    setSelectedProperty(null);
  }, []);

  // Keyboard event for modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeModal]);

  // Retry loading
  const handleRetry = () => {
    setError(null);
    loadProperties();
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6 flex flex-col items-center justify-center h-64 bg-red-50 rounded-2xl">
        <p className="text-red-800 mb-4">{error}</p>
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8 bg-gradient-to-br from-emerald-50 to-white rounded-2xl shadow-lg font-montserrat">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Green Property Management</h1>
          <p className="text-gray-600 mt-2">Build Wealth with Green! Approve and manage investments.</p>
        </div>
        <Link
          to="/admin/add-property"
          className="flex items-center justify-center space-x-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors shadow-md md:w-auto w-full"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Property</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-4 md:p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Properties</label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, location, or owner..."
                className="w-full pl-10 pr-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/50"
                aria-label="Search properties"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/50"
              aria-label="Filter by status"
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
              Showing {filteredProperties.length > 0 ? `${startIndex + 1}–${Math.min(endIndex, filteredProperties.length)}` : '0'} of {filteredProperties.length} properties
            </div>
          </div>
        </div>
      </div>

      {/* Properties Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-emerald-50 border-b border-gray-200">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-700 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-700 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-700 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-700 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                : currentProperties.length > 0
                ? currentProperties.map((property) => (
                    <motion.tr
                      key={property.id || property._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="hover:bg-emerald-50 transition-colors"
                    >
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <PhotoIcon className="w-5 h-5 text-emerald-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{property.title}</p>
                            <p className="text-sm text-gray-500 line-clamp-1">
                              {property.description.substring(0, 50)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center">
                          <MapPinIcon className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-900 truncate">{property.location}</span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center">
                          <UserIcon className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-900">{property.ownerName || '—'}</span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="w-4 h-4 text-yellow-600 mr-2 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-900">
                            ${property.valuation.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            property.status
                          )}`}
                        >
                          {property.status}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              setSelectedProperty(property);
                              setModalType('view');
                              setShowPropertyModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                            aria-label="View property details"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handlePropertyAction(property.id || property._id || '', 'approve')
                            }
                            disabled={isSubmitting}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Approve"
                            aria-label="Approve property"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Please provide a reason for rejection (optional):');
                              if (reason !== null) {
                                handlePropertyAction(
                                  property.id || property._id || '',
                                  'reject',
                                  reason || undefined
                                );
                              }
                            }}
                            disabled={isSubmitting}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Reject"
                            aria-label="Reject property"
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
                            aria-label="Contact property owner"
                          >
                            <EnvelopeIcon className="w-4 h-4" />
                          </button>
                          {property.status === 'approved' && (
                            <button
                              onClick={() => {
                                setSelectedProperty(property);
                                setShowTokenizeModal(true);
                              }}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Tokenize Property"
                              aria-label="Tokenize this property"
                            >
                              <CubeTransparentIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                : !isLoading && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No properties found. Try adjusting your filters.
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 md:px-6 py-4 border-t border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="text-sm text-gray-600">Page {currentPage} of {totalPages}</div>
            <div className="flex items-center space-x-1 md:space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 text-emerald-500 hover:text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed rounded"
                aria-label="Previous page"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let startPage = Math.max(1, currentPage - 2);
                let endPage = Math.min(totalPages, startPage + 4);
                if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);
                return startPage + i;
              })
                .filter((page) => page >= 1 && page <= totalPages)
                .map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-2.5 py-1 md:px-3 md:py-1.5 rounded text-xs md:text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-emerald-600 text-white'
                        : 'text-gray-600 hover:bg-emerald-100'
                    }`}
                    aria-label={`Page ${page}`}
                    aria-current={currentPage === page ? 'page' : undefined}
                  >
                    {page}
                  </button>
                ))}

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 text-emerald-500 hover:text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed rounded"
                aria-label="Next page"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {/* Property Modal */}
        {showPropertyModal && selectedProperty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Property Details</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                  aria-label="Close modal"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <img
                      src={selectedProperty.images?.[0] || '/placeholder-property.jpg'}
                      alt={selectedProperty.title}
                      className="w-full h-64 md:h-80 object-cover rounded-lg shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-property.jpg';
                      }}
                    />
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">{selectedProperty.title}</h4>
                    <p className="text-gray-600 whitespace-pre-line">{selectedProperty.description}</p>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Location:</span>
                        <span className="text-gray-900">{selectedProperty.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Valuation:</span>
                        <span className="text-yellow-600 font-semibold">
                          ${selectedProperty.valuation.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Monthly Rent:</span>
                        <span className="text-gray-900">${selectedProperty.monthlyRent.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Status:</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            selectedProperty.status
                          )}`}
                        >
                          {selectedProperty.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Owner:</span>
                        <span className="text-gray-900">{selectedProperty.ownerName || '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Contact Modal */}
        {showContactModal && selectedProperty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-md border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Contact {selectedProperty.ownerName || 'Owner'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                  aria-label="Close modal"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4 md:p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message to {selectedProperty.ownerName || 'owner'}
                  </label>
                  <textarea
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/50 resize-none"
                    rows={4}
                    placeholder="Discuss investment opportunities, ask questions, or schedule a viewing..."
                    autoFocus
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() =>
                      handleContactOwner(selectedProperty.id || selectedProperty._id || '', contactMessage)
                    }
                    disabled={isSubmitting || !contactMessage.trim()}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Tokenize Modal */}
        {showTokenizeModal && selectedProperty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-md border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Tokenize Property</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                  aria-label="Close modal"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4 md:p-6">
                <p className="text-gray-600 mb-4">
                  Tokenize <strong>{selectedProperty.title}</strong> to make it available for fractional investment.
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Owner Wallet Address
                  </label>
                  <input
                    type="text"
                    value={tokenizeData.ownerWalletAddress}
                    onChange={(e) =>
                      setTokenizeData({ ...tokenizeData, ownerWalletAddress: e.target.value })
                    }
                    className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/50"
                    placeholder="Enter wallet address (e.g., 0x...)"
                    autoFocus
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTokenizeProperty}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Processing...' : 'Tokenize'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PropertyManagement;