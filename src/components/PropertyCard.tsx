import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, TrendingUp, ExternalLink, CreditCard, Star, MessageCircle, Video, DollarSign } from 'lucide-react';
import { Property } from '../types';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface PropertyCardProps {
    property: Property;
    onContactOwner: () => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onContactOwner }) => {
    const { user, isAuthenticated } = useAuth();
    const [paymentModal, setPaymentModal] = useState({
        isOpen: false,
        type: 'tokens' as 'rent' | 'tokens',
        amount: 0,
        tokenQuantity: 1,
    });
    const [virtualTourOpen, setVirtualTourOpen] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(true);

    const soldPercentage = ((property.totalTokens - (property.availableTokens || 0)) / property.totalTokens) * 100;
    const isFeatured = property.expectedYield > 8;

    const getImageUrl = (image: string | undefined) => {
        if (!image) {
            setIsImageLoading(false);
            return 'https://images.pexels.com/photos/1642125/pexels-photo-1642125.jpeg?auto=compress&cs=tinysrgb&w=800';
        }
        const url = image.startsWith('http') ? image : `http://localhost:3001${image.startsWith('/') ? image : '/uploads/' + image}`;
        console.log('Image URL:', url);
        return url;
    };

    const handleBuyTokens = () => {
        if (!isAuthenticated || user?.role === 'tenant' || property.status !== 'approved') {
            toast.error('Please login as an investor to buy tokens for approved properties');
            return;
        }
        setPaymentModal({
            isOpen: true,
            type: 'tokens',
            amount: property.tokenPrice,
            tokenQuantity: 1,
        });
    };

    const handleRentPayment = () => {
        if (!isAuthenticated || user?.role !== 'tenant') {
            toast.error('Please login as a tenant to rent');
            return;
        }
        setPaymentModal({
            isOpen: true,
            type: 'rent',
            amount: property.monthlyRent,
            tokenQuantity: 0,
        });
    };

    const canPayRent = user?.role === 'tenant';
    const canBuyTokens = isAuthenticated && user?.role !== 'tenant' && property.status === 'approved';

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-50 rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
            >
                <div className="relative h-48">
                    {isImageLoading && (
                        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center text-gray-500 text-sm">
                            Loading...
                        </div>
                    )}
                    <img
                        src={getImageUrl(property.images?.[0])}
                        alt={property.title}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                        onLoad={() => setIsImageLoading(false)}
                        onError={() => {
                            setIsImageLoading(false);
                            console.error(`Failed to load image for property ${property.id || property._id}`);
                        }}
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs font-medium text-emerald-500">{property.expectedYield}% Yield</span>
                    </div>
                    {isFeatured && (
                        <div className="absolute top-3 left-3 bg-yellow-400 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            Featured
                        </div>
                    )}
                    {property.status !== 'approved' && (
                        <div className="absolute bottom-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            {property.status === 'pending' ? 'Pending Approval' : 'Not Approved'}
                        </div>
                    )}
                </div>

                <div className="p-4 flex flex-col">
                    <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-1">{property.title}</h3>
                    <div className="flex items-center text-gray-600 mb-3 text-sm">
                        <MapPin className="w-3 h-3 mr-1 text-emerald-500" />
                        <span>{property.location}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{property.description}</p>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                            <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                                <TrendingUp className="w-3 h-3 text-emerald-500" />
                                Token Price
                            </p>
                            <p className="text-sm font-semibold text-gray-900">{property.tokenPrice.toLocaleString()} FCFA</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                            <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                                <DollarSign className="w-3 h-3 text-emerald-500" />
                                Monthly Rent
                            </p>
                            <p className="text-sm font-semibold text-gray-900">{property.monthlyRent.toLocaleString()} FCFA</p>
                        </div>
                    </div>
                    <div className="mb-3">
                        <div className="flex justify-between items-center mb-1 text-xs">
                            <span className="text-gray-600 font-medium">Progress</span>
                            <span className="font-medium text-emerald-500">{Math.round(soldPercentage)}% Sold</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${soldPercentage}%` }}
                            />
                        </div>
                        <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
                            <span>{(property.availableTokens || 0).toLocaleString()} Available</span>
                            <span>{property.totalTokens.toLocaleString()} Total</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex space-x-2">
                            {canBuyTokens ? (
                                <button
                                    onClick={handleBuyTokens}
                                    className="flex-1 bg-emerald-400 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-500 transition-all duration-200 shadow-sm text-sm flex items-center justify-center"
                                >
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    Buy Tokens
                                </button>
                            ) : isAuthenticated && user?.role !== 'tenant' && (
                                <button
                                    disabled
                                    className="flex-1 bg-gray-300 text-gray-600 px-3 py-1.5 rounded-lg font-medium cursor-not-allowed text-sm flex items-center justify-center"
                                >
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    Buy Tokens (Pending Approval)
                                </button>
                            )}
                            {canPayRent ? (
                                <button
                                    onClick={handleRentPayment}
                                    className="flex-1 bg-teal-500 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-teal-600 transition-all duration-200 shadow-sm text-sm flex items-center justify-center"
                                >
                                    <CreditCard className="w-3 h-3 mr-1" />
                                    Rent Now
                                </button>
                            ) : isAuthenticated && (
                                <button
                                    disabled
                                    className="flex-1 bg-gray-300 text-gray-600 px-3 py-1.5 rounded-lg font-medium cursor-not-allowed text-sm flex items-center justify-center"
                                >
                                    <CreditCard className="w-3 h-3 mr-1" />
                                    Rent (Tenants Only)
                                </button>
                            )}
                            {!isAuthenticated && (
                                <Link
                                    to="/login"
                                    className="flex-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 shadow-sm text-sm flex items-center justify-center border border-yellow-400"
                                >
                                    Login to Invest
                                </Link>
                            )}
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={onContactOwner}
                                className="flex-1 bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-indigo-600 transition-all duration-200 shadow-sm text-sm flex items-center justify-center"
                            >
                                <MessageCircle className="w-3 h-3 mr-1" />
                                Contact Owner
                            </button>
                            <button
                                onClick={() => setVirtualTourOpen(!virtualTourOpen)}
                                className="flex-1 bg-slate-700 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-slate-800 transition-all duration-200 shadow-sm text-sm flex items-center justify-center"
                            >
                                <Video className="w-3 h-3 mr-1" />
                                Virtual Tour
                            </button>
                        </div>
                        <Link
                            to={`/property/${property.id || property._id}`}
                            className="w-full px-3 py-1.5 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 shadow-sm text-sm flex items-center justify-center"
                        >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View Details
                        </Link>
                    </div>
                    {virtualTourOpen && (
                        <div className="mt-3 rounded-lg overflow-hidden h-48">
                            <iframe
                                src="https://my.matterport.com/show/?m=1DSCmNjbKaT"
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                allowFullScreen
                                allow="xr-spatial-tracking"
                                title="3D Property Tour"
                                className="rounded-lg"
                            />
                        </div>
                    )}
                </div>
            </motion.div>

            <PaymentModal
                isOpen={paymentModal.isOpen}
                onClose={() => setPaymentModal({ ...paymentModal, isOpen: false })}
                type={paymentModal.type}
                amount={paymentModal.amount}
                propertyTitle={property.title}
                tokenQuantity={paymentModal.tokenQuantity}
                onPaymentSuccess={() => {
                    toast.success('Payment successful!');
                    console.log('Payment successful');
                }}
            />
        </>
    );
};

export default PropertyCard;