import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, TrendingUp, Home, Filter, Search } from 'lucide-react';
import { Property } from '../../types';
import { propertiesAPI } from '../../services/api';
import PaymentModal from '../../components/PaymentModal';
import toast from 'react-hot-toast';

const InvestorProperties: React.FC = () => {
const [properties, setProperties] = useState<Property[]>([]);
const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [searchTerm, setSearchTerm] = useState('');
const [yieldFilter, setYieldFilter] = useState('all');
const [paymentModal, setPaymentModal] = useState({
isOpen: false,
type: 'tokens' as 'rent' | 'tokens',
amount: 0,
propertyTitle: '',
tokenQuantity: 1,
});

useEffect(() => {
loadProperties();
}, []);

useEffect(() => {
filterProperties();
}, [properties, searchTerm, yieldFilter]);

const loadProperties = async () => {
try {
    setIsLoading(true);
    const data = await propertiesAPI.getAll();
    // Only show approved/tokenized properties for investors
    const tokenizedProperties = data.filter(p => p.status === 'approved');
    setProperties(tokenizedProperties);
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
    property.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
}

if (yieldFilter !== 'all') {
    const [min, max] = yieldFilter.split('-').map(Number);
    filtered = filtered.filter(property => {
    const yield_ = property.expectedYield || 0;
    if (max) {
        return yield_ >= min && yield_ <= max;
    }
    return yield_ >= min;
    });
}

setFilteredProperties(filtered);
};

const handleBuyTokens = (property: Property, quantity: number = 1) => {
setPaymentModal({
    isOpen: true,
    type: 'tokens',
    amount: (property.tokenPrice || 0) * quantity,
    propertyTitle: property.title,
    tokenQuantity: quantity,
});
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
    <div>
    <h1 className="text-2xl font-bold text-gray-900">Investment Properties</h1>
    <p className="text-gray-600">Discover tokenized properties available for investment</p>
    </div>

    {/* Filters */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Search Properties</label>
        <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Search by name or location..."
            />
        </div>
        </div>
        
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Expected Yield</label>
        <select
            value={yieldFilter}
            onChange={(e) => setYieldFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
            <option value="all">All Yields</option>
            <option value="0-5">0% - 5%</option>
            <option value="5-8">5% - 8%</option>
            <option value="8-12">8% - 12%</option>
            <option value="12">12%+</option>
        </select>
        </div>

        <div className="flex items-end">
        <div className="text-sm text-gray-600">
            {filteredProperties.length} properties available
        </div>
        </div>
    </div>
    </div>

    {/* Properties Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {filteredProperties.map((property) => (
        <motion.div
        key={property.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
        >
        <div className="relative">
            <img
            src={property.images?.[0] || 'https://images.pexels.com/photos/1642125/pexels-photo-1642125.jpeg?auto=compress&cs=tinysrgb&w=800'}
            alt={property.title}
            className="w-full h-48 object-cover"
            />
            <div className="absolute top-4 right-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            {property.expectedYield}% Yield
            </div>
        </div>
        
        <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {property.title}
            </h3>
            
            <div className="flex items-center text-gray-600 mb-4">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm">{property.location}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
                <p className="text-sm text-gray-500">Token Price</p>
                <p className="text-lg font-semibold text-gray-900">
                {(property.tokenPrice || 0).toLocaleString()} FCFA
                </p>
            </div>
            <div>
                <p className="text-sm text-gray-500">Available Tokens</p>
                <p className="text-lg font-semibold text-gray-900">
                {(property.availableTokens || 0).toLocaleString()}
                </p>
            </div>
            </div>

            <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Token Sales Progress</span>
                <span className="text-sm font-medium text-gray-900">
                {Math.round(((property.totalTokens - (property.availableTokens || 0)) / property.totalTokens) * 100)}% Sold
                </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                    width: `${((property.totalTokens - (property.availableTokens || 0)) / property.totalTokens) * 100}%` 
                }}
                />
            </div>
            </div>
            
            <button
            onClick={() => handleBuyTokens(property)}
            className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center"
            >
            <TrendingUp className="w-4 h-4 mr-2" />
            Buy Tokens
            </button>
        </div>
        </motion.div>
    ))}
    </div>

    {filteredProperties.length === 0 && (
    <div className="text-center py-12">
        <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Available</h3>
        <p className="text-gray-500">Check back later for new investment opportunities.</p>
    </div>
    )}

    {/* Payment Modal */}
    <PaymentModal
    isOpen={paymentModal.isOpen}
    onClose={() => setPaymentModal({ ...paymentModal, isOpen: false })}
    type={paymentModal.type}
    amount={paymentModal.amount}
    propertyTitle={paymentModal.propertyTitle}
    tokenQuantity={paymentModal.tokenQuantity}
    onPaymentSuccess={() => {
        toast.success('Token purchase completed successfully!');
        loadProperties();
    }}
    />
</div>
);
};

export default InvestorProperties;