import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    MapPin,
    Search,
    Star,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Home,
    DollarSign,
    BarChart2,
} from 'lucide-react';
import { propertiesAPI, chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PropertyCard from '../components/PropertyCard';
import Chat from '../components/Chat';
import toast from 'react-hot-toast';

// Inline Property interface
interface Property {
    id?: string;
    _id?: string;
    title: string;
    location: string;
    description: string;
    valuation: number;
    tokenPrice: number;
    totalTokens: number;
    monthlyRent: number;
    expectedYield: number;
    images?: string[];
    documents?: string[];
    ownerId: string;
    ownerName?: string;
    availableTokens?: number;
    status: string;
    rejectionReason?: string;
}

const Properties: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const [properties, setProperties] = useState<Property[]>([]);
    const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [locationFilter, setLocationFilter] = useState('all');
    const [priceRange, setPriceRange] = useState('all');
    const [sortBy, setSortBy] = useState('yield-desc');
    const [currentPage, setCurrentPage] = useState(1);
    const propertiesPerPage = 15; // 15 properties per page
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [chatReceiverId, setChatReceiverId] = useState<string | null>(null);

    useEffect(() => {
        loadProperties();
    }, []);

    useEffect(() => {
        filterAndSortProperties();
    }, [properties, searchTerm, locationFilter, priceRange, sortBy]);

    const loadProperties = async () => {
        try {
            setIsLoading(true);
            const data = await propertiesAPI.getAll();
            console.log('Properties data:', data);
            setProperties(data);
        } catch (error) {
            console.error('Error loading properties:', error);
            toast.error('Failed to load properties');
        } finally {
            setIsLoading(false);
        }
    };

    const filterAndSortProperties = () => {
        let filtered = properties;

        if (searchTerm) {
            filtered = filtered.filter(
                (property) =>
                    property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    property.location?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (locationFilter !== 'all') {
            filtered = filtered.filter((property) =>
                property.location?.toLowerCase().includes(locationFilter.toLowerCase())
            );
        }

        if (priceRange !== 'all') {
            const [min, max] = priceRange.split('-').map(Number);
            filtered = filtered.filter((property) => {
                const rent = property.monthlyRent || 0;
                return max ? rent >= min && rent <= max : rent >= min;
            });
        }

        filtered = [...filtered].sort((a, b) => {
            if (sortBy === 'yield-desc') return b.expectedYield - a.expectedYield;
            if (sortBy === 'yield-asc') return a.expectedYield - b.expectedYield;
            if (sortBy === 'rent-desc') return b.monthlyRent - a.monthlyRent;
            if (sortBy === 'rent-asc') return a.monthlyRent - b.monthlyRent;
            if (sortBy === 'valuation-desc') return b.valuation - a.valuation;
            if (sortBy === 'valuation-asc') return a.valuation - b.valuation;
            return 0;
        });

        setFilteredProperties(filtered);
        setCurrentPage(1);
    };

    const handleContactOwner = async (property: Property) => {
        if (!isAuthenticated) {
            toast.error('Please login to contact property owner');
            return;
        }
        try {
            const response = await chatAPI.getOrCreateConversation({
                userId1: user!.id,
                userId2: property.ownerId,
            });
            setActiveConversationId(response._id || response.id);
            setChatReceiverId(property.ownerId);
            setIsChatOpen(true);
        } catch {
            toast.error('Failed to open chat');
        }
    };

    // Pagination logic
    const indexOfLastProperty = currentPage * propertiesPerPage;
    const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
    const currentProperties = filteredProperties.slice(indexOfFirstProperty, indexOfLastProperty);
    const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mb-4 mx-auto" />
                    <p className="text-base text-gray-600 font-medium">Loading Premium Properties...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 font-montserrat">
            {/* Header */}
            <header className="bg-white shadow-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-lg flex items-center justify-center shadow-md">
                            <Home className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Green</h1>
                    </Link>
                    <nav className="flex items-center space-x-4">
                        {!isAuthenticated ? (
                            <>
                                <Link to="/login" className="text-gray-600 hover:text-emerald-500 font-medium transition-colors duration-200 text-sm">
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-gradient-to-r from-emerald-400 to-emerald-500 text-white px-4 py-1.5 rounded-lg font-medium hover:from-emerald-500 hover:to-emerald-600 transition-all duration-200 shadow-md text-sm"
                                >
                                    Start Investing
                                </Link>
                            </>
                        ) : (
                            <Link
                                to="/dashboard"
                                className="bg-gradient-to-r from-emerald-400 to-emerald-500 text-white px-4 py-1.5 rounded-lg font-medium hover:from-emerald-500 hover:to-emerald-600 transition-all duration-200 shadow-md text-sm"
                            >
                                Dashboard
                            </Link>
                        )}
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight tracking-tight">
                        Your Gateway to Real Estate Wealth
                    </h2>
                    <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-6">
                        Invest in high-yield properties or rent premium homes in Cameroon with ease and confidence.
                    </p>
                    <Link
                        to={isAuthenticated ? "/dashboard" : "/register"}
                        className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white font-medium rounded-lg hover:from-emerald-500 hover:to-emerald-600 transition-all duration-200 shadow-md text-sm"
                    >
                        <Star className="w-4 h-4 mr-2" />
                        {isAuthenticated ? "View Your Portfolio" : "Start Investing"}
                    </Link>
                </motion.div>
            </section>

            {/* Why Invest Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Why Green?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                        <DollarSign className="w-6 h-6 text-emerald-500 mb-2" />
                        <h4 className="text-base font-semibold text-gray-900 mb-1">High Yields</h4>
                        <p className="text-gray-600 text-sm">Earn up to 10%+ annual returns.</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                        <BarChart2 className="w-6 h-6 text-emerald-500 mb-2" />
                        <h4 className="text-base font-semibold text-gray-900 mb-1">Fractional Ownership</h4>
                        <p className="text-gray-600 text-sm">Invest with low entry costs.</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                        <Star className="w-6 h-6 text-emerald-500 mb-2" />
                        <h4 className="text-base font-semibold text-gray-900 mb-1">Secure Platform</h4>
                        <p className="text-gray-600 text-sm">Blockchain-backed transactions.</p>
                    </motion.div>
                </div>
            </section>

            {/* Search & Filters */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <div className="bg-gray-50 rounded-lg shadow-md p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Title or location..."
                                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition bg-white text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Location</label>
                        <div className="relative">
                            <select
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition bg-white text-sm appearance-none"
                            >
                                <option value="all">All Locations</option>
                                <option value="douala">Douala</option>
                                <option value="yaounde">Yaoundé</option>
                                <option value="bafoussam">Bafoussam</option>
                                <option value="bamenda">Bamenda</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Price Range (FCFA)</label>
                        <div className="relative">
                            <select
                                value={priceRange}
                                onChange={(e) => setPriceRange(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition bg-white text-sm appearance-none"
                            >
                                <option value="all">All Prices</option>
                                <option value="0-100000">0 - 100,000</option>
                                <option value="100000-300000">100,000 - 300,000</option>
                                <option value="300000-500000">300,000 - 500,000</option>
                                <option value="500000">500,000+</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Sort By</label>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition bg-white text-sm appearance-none"
                            >
                                <option value="yield-desc">Yield: High to Low</option>
                                <option value="yield-asc">Yield: Low to High</option>
                                <option value="rent-desc">Rent: High to Low</option>
                                <option value="rent-asc">Rent: Low to High</option>
                                <option value="valuation-desc">Valuation: High to Low</option>
                                <option value="valuation-asc">Valuation: Low to High</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Properties Grid */}
                {filteredProperties.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16 text-gray-500"
                    >
                        <Home className="mx-auto mb-4 w-12 h-12 text-gray-400" />
                        <h3 className="text-xl font-semibold text-gray-900">No Properties Found</h3>
                        <p className="text-gray-600 text-sm">Try adjusting your search or filters.</p>
                    </motion.div>
                ) : (
                    <>
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            {currentProperties.map((property) => (
                                <PropertyCard
                                    key={property.id || property._id}
                                    property={property}
                                    onContactOwner={() => handleContactOwner(property)}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center mt-8 space-x-2">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => paginate(page)}
                                        className={`px-3 py-1.5 rounded-lg ${
                                            currentPage === page
                                                ? 'bg-emerald-400 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        } transition-colors text-sm`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>

            <Chat
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                activeConversationId={activeConversationId}
                receiverId={chatReceiverId}
            />
        </div>
    );
};

export default Properties;