import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { 
TrendingUp, 
Wallet, 
Home, 
DollarSign, 
Shield, 
Eye, 
EyeOff,
CreditCard,
ArrowUpRight,
ArrowDownRight,
Target,
Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { propertiesAPI, paymentsAPI } from '../../services/api';
import { Property, Payment } from '../../types';
import PaymentModal from '../../components/PaymentModal';
import FaceRecognition from '../../components/FaceRecognition';
import toast from 'react-hot-toast';

const InvestorDashboard: React.FC = () => {
const { user } = useAuth();
const [properties, setProperties] = useState<Property[]>([]);
const [payments, setPayments] = useState<Payment[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [showWallet, setShowWallet] = useState(false);
const [faceRecognitionOpen, setFaceRecognitionOpen] = useState(false);
const [walletBalance] = useState(2500000); // Mock wallet balance
const [paymentModal, setPaymentModal] = useState({
isOpen: false,
type: 'tokens' as 'rent' | 'tokens',
amount: 0,
propertyTitle: '',
tokenQuantity: 1,
});

// Mock portfolio data - in real app, calculate from actual investments
const [portfolioData] = useState({
totalInvested: 1500000,
totalTokens: 150,
monthlyIncome: 45000,
totalProperties: 3,
monthlyIncomeData: [
    { month: 'Jan', income: 42000 },
    { month: 'Feb', income: 45000 },
    { month: 'Mar', income: 43000 },
    { month: 'Apr', income: 47000 },
    { month: 'May', income: 45000 },
    { month: 'Jun', income: 48000 },
],
portfolioAllocation: [
    { name: 'Residential', value: 60, color: '#10b981' },
    { name: 'Commercial', value: 30, color: '#3b82f6' },
    { name: 'Mixed Use', value: 10, color: '#8b5cf6' },
]
});

useEffect(() => {
if (user) {
    loadInvestorData();
}
}, [user]);

const loadInvestorData = async () => {
try {
    setIsLoading(true);
    
    // Load tokenized properties
    const allProperties = await propertiesAPI.getAll();
    const tokenizedProperties = allProperties.filter(p => p.status === 'approved');
    setProperties(tokenizedProperties);
    
    // Load investor's transactions
    const transactions = await paymentsAPI.getByUser(user!.id);
    setPayments(transactions);
} catch (error) {
    console.error('Error loading investor data:', error);
    toast.error('Failed to load investor data');
} finally {
    setIsLoading(false);
}
};

const handleWalletAccess = () => {
setFaceRecognitionOpen(true);
};

const handleFaceVerificationSuccess = () => {
setShowWallet(true);
toast.success('Wallet access granted!');
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

const handlePaymentSuccess = () => {
toast.success('Token purchase completed successfully!');
loadInvestorData();
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
    <div className="bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl p-8 text-white">
    <div className="flex items-center justify-between">
        <div>
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}</h1>
        <p className="text-emerald-100">Track your real estate investments and portfolio performance</p>
        </div>
        <div className="text-right">
        <div className="text-2xl font-bold">{portfolioData.totalInvested.toLocaleString()} FCFA</div>
        <div className="text-emerald-100">Total Invested</div>
        </div>
    </div>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
    >
        <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-emerald-600" />
        </div>
        <div className="flex items-center text-emerald-600 text-sm font-medium">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            +12.5%
        </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">
        {portfolioData.totalInvested.toLocaleString()} FCFA
        </h3>
        <p className="text-gray-600">Total Invested</p>
    </motion.div>

    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
    >
        <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex items-center text-blue-600 text-sm font-medium">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            +8.2%
        </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">
        {portfolioData.monthlyIncome.toLocaleString()} FCFA
        </h3>
        <p className="text-gray-600">Monthly Income</p>
    </motion.div>

    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
    >
        <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6 text-purple-600" />
        </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">
        {portfolioData.totalTokens}
        </h3>
        <p className="text-gray-600">Total Tokens</p>
    </motion.div>

    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
    >
        <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Home className="w-6 h-6 text-green-600" />
        </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">
        {portfolioData.totalProperties}
        </h3>
        <p className="text-gray-600">Properties</p>
    </motion.div>
    </div>

    {/* Wallet Section */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Wallet className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
            <h3 className="text-lg font-semibold text-gray-900">Digital Wallet</h3>
            <p className="text-gray-600 text-sm">Secure access with face recognition</p>
        </div>
        </div>
        
        <button
        onClick={handleWalletAccess}
        className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
        <Shield className="w-4 h-4" />
        <span>Access Wallet</span>
        </button>
    </div>

    {showWallet ? (
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
            <div>
            <h4 className="text-xl font-bold text-gray-900">
                {walletBalance.toLocaleString()} FCFA
            </h4>
            <p className="text-gray-600">Available Balance</p>
            </div>
            <button
            onClick={() => setShowWallet(false)}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
            <EyeOff className="w-5 h-5 text-gray-600" />
            </button>
        </div>
        
        <div className="flex space-x-4">
            <button className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors">
            Deposit
            </button>
            <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
            Withdraw
            </button>
        </div>
        </div>
    ) : (
        <div className="bg-gray-50 rounded-xl p-6 text-center">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Use face recognition to access your wallet securely</p>
        </div>
    )}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    {/* Income Chart */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Monthly Income Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
        <LineChart data={portfolioData.monthlyIncomeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
            formatter={(value) => [`${Number(value).toLocaleString()} FCFA`, 'Income']}
            labelStyle={{ color: '#374151' }}
            contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Line 
            type="monotone" 
            dataKey="income" 
            stroke="#10b981" 
            strokeWidth={3}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
            />
        </LineChart>
        </ResponsiveContainer>
    </div>

    {/* Portfolio Allocation */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Portfolio Allocation</h3>
        <div className="flex items-center justify-center">
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
            <Pie
                data={portfolioData.portfolioAllocation}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
            >
                {portfolioData.portfolioAllocation.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value}%`, 'Allocation']} />
            </PieChart>
        </ResponsiveContainer>
        </div>
        <div className="flex justify-center space-x-6 mt-4">
        {portfolioData.portfolioAllocation.map((item, index) => (
            <div key={index} className="flex items-center">
            <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-gray-600">{item.name}</span>
            </div>
        ))}
        </div>
    </div>
    </div>

    {/* Available Properties */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
    <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Investment Opportunities</h3>
        <div className="text-sm text-gray-500">
            {properties.length} properties available
        </div>
        </div>
    </div>
    
    <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.slice(0, 6).map((property) => (
            <motion.div
            key={property.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
            >
            <img
                src={property.images?.[0] || 'https://images.pexels.com/photos/1642125/pexels-photo-1642125.jpeg?auto=compress&cs=tinysrgb&w=400'}
                alt={property.title}
                className="w-full h-32 object-cover"
            />
            
            <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{property.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{property.location}</p>
                
                <div className="flex items-center justify-between mb-3">
                <div>
                    <p className="text-xs text-gray-500">Token Price</p>
                    <p className="font-semibold text-gray-900">
                    {(property.tokenPrice || 0).toLocaleString()} FCFA
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500">Yield</p>
                    <p className="font-semibold text-emerald-600">
                    {property.expectedYield}%
                    </p>
                </div>
                </div>
                
                <button
                onClick={() => handleBuyTokens(property)}
                className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                >
                Buy Tokens
                </button>
            </div>
            </motion.div>
        ))}
        </div>
    </div>
    </div>

    {/* Face Recognition Modal */}
    <FaceRecognition
    isOpen={faceRecognitionOpen}
    onClose={() => setFaceRecognitionOpen(false)}
    onSuccess={handleFaceVerificationSuccess}
    userName={user?.name || ''}
    />

    {/* Payment Modal */}
    <PaymentModal
    isOpen={paymentModal.isOpen}
    onClose={() => setPaymentModal({ ...paymentModal, isOpen: false })}
    type={paymentModal.type}
    amount={paymentModal.amount}
    propertyTitle={paymentModal.propertyTitle}
    tokenQuantity={paymentModal.tokenQuantity}
    onPaymentSuccess={handlePaymentSuccess}
    />
</div>
);
};

export default InvestorDashboard;