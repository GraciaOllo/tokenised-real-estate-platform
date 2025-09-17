import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
CreditCard, 
Download, 
FileText, 
MessageCircle, 
Calendar, 
DollarSign,
Clock,
CheckCircle,
AlertCircle,
Bell,
Settings,
Home,
User,
Receipt,
Phone,
Mail
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Payment, Property } from '../../types';
import { paymentsAPI, propertiesAPI } from '../services/api';
import toast from 'react-hot-toast';
import PaymentModal from '../components/PaymentModal';

const TenantDashboard: React.FC = () => {
const { user } = useAuth();
const [payments, setPayments] = useState<Payment[]>([]);
const [property, setProperty] = useState<Property | null>(null);
const [rentDue, setRentDue] = useState(0);
const [nextPaymentDate, setNextPaymentDate] = useState('');
const [isLoading, setIsLoading] = useState(true);
const [paymentModal, setPaymentModal] = useState({
isOpen: false,
type: 'rent' as 'rent' | 'tokens',
amount: 0,
propertyTitle: '',
});
const [activeTab, setActiveTab] = useState('overview');

useEffect(() => {
if (user) {
    loadTenantData();
}
}, [user]);

const loadTenantData = async () => {
try {
    setIsLoading(true);
    
    // Load payment history
    const paymentHistory = await paymentsAPI.getByUser(user!.id);
    const rentPayments = paymentHistory.filter(p => p.type === 'rent');
    setPayments(rentPayments);
    
    // Load properties and find tenant's property
    const properties = await propertiesAPI.getAll();
    if (properties.length > 0) {
    const tenantProperty = properties[0]; // In real app, filter by tenant assignment
    setProperty(tenantProperty);
    setRentDue(tenantProperty.monthlyRent);
    
    // Calculate next payment date (first of next month)
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    setNextPaymentDate(nextMonth.toISOString().split('T')[0]);
    }
} catch (error) {
    console.error('Error loading tenant data:', error);
    toast.error('Failed to load tenant data');
} finally {
    setIsLoading(false);
}
};

const handlePayRent = () => {
setPaymentModal({
    isOpen: true,
    type: 'rent',
    amount: rentDue,
    propertyTitle: property?.title || 'Monthly Rent',
});
};

const downloadReceipt = (paymentId: string) => {
// In real app, generate and download PDF receipt
toast.success('Receipt downloaded successfully!');
};

const handlePaymentSuccess = () => {
toast.success('Payment completed successfully!');
loadTenantData();
};

const tabs = [
{ id: 'overview', label: 'Overview', icon: Home },
{ id: 'payments', label: 'Payments', icon: CreditCard },
{ id: 'history', label: 'History', icon: Clock },
{ id: 'property', label: 'My Property', icon: FileText },
{ id: 'support', label: 'Support', icon: MessageCircle },
];

if (isLoading) {
return (
    <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
    </div>
);
}

const isRentOverdue = new Date() > new Date(nextPaymentDate);
const daysUntilDue = Math.ceil((new Date(nextPaymentDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

return (
<div className="space-y-6">
    {/* Header */}
    <div className="bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl p-8 text-white">
    <div className="flex items-center justify-between">
        <div>
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}</h1>
        <p className="text-emerald-100">Manage your rent payments and property information</p>
        </div>
        <div className="text-right">
        <div className="text-2xl font-bold">{rentDue.toLocaleString()} FCFA</div>
        <div className="text-emerald-100">Monthly Rent</div>
        </div>
    </div>
    </div>

    {/* Navigation Tabs */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
    <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-8">
        {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
            </button>
            );
        })}
        </nav>
    </div>

    <div className="p-8">
        {activeTab === 'overview' && (
        <div className="space-y-6">
            {/* Rent Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl p-6 ${
                isRentOverdue 
                    ? 'bg-red-50 border border-red-200' 
                    : 'bg-emerald-50 border border-emerald-200'
                }`}
            >
                <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isRentOverdue ? 'bg-red-100' : 'bg-emerald-100'
                }`}>
                    <DollarSign className={`w-6 h-6 ${
                    isRentOverdue ? 'text-red-600' : 'text-emerald-600'
                    }`} />
                </div>
                {isRentOverdue && (
                    <div className="flex items-center text-red-600 text-sm font-medium">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Overdue
                    </div>
                )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {rentDue.toLocaleString()} FCFA
                </h3>
                <p className="text-gray-600">
                {isRentOverdue ? 'Rent Overdue' : 'Rent Due'}
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-blue-50 border border-blue-200 rounded-xl p-6"
            >
                <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {new Date(nextPaymentDate).toLocaleDateString()}
                </h3>
                <p className="text-gray-600">Next Payment Date</p>
                <div className="mt-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                    isRentOverdue 
                    ? 'bg-red-100 text-red-800' 
                    : daysUntilDue <= 7 
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                    {isRentOverdue 
                    ? `${Math.abs(daysUntilDue)} days overdue`
                    : `${daysUntilDue} days remaining`
                    }
                </span>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-purple-50 border border-purple-200 rounded-xl p-6"
            >
                <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {payments.filter(p => p.status === 'completed').length}
                </h3>
                <p className="text-gray-600">Payments Made</p>
            </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
                <div>
                <h3 className="text-xl font-semibold mb-2">Pay Your Rent</h3>
                <p className="text-emerald-100">
                    {isRentOverdue 
                    ? 'Your rent payment is overdue. Please pay now to avoid late fees.'
                    : `Your next rent payment of ${rentDue.toLocaleString()} FCFA is due on ${new Date(nextPaymentDate).toLocaleDateString()}`
                    }
                </p>
                </div>
                <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePayRent}
                className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center"
                >
                <CreditCard className="w-5 h-5 mr-2" />
                Pay Now
                </motion.button>
            </div>
            </div>
        </div>
        )}

        {activeTab === 'payments' && (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Make Payment</h2>
            
            <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                <h3 className="text-lg font-semibold text-gray-900">Current Rent Due</h3>
                <p className="text-gray-600">Due Date: {new Date(nextPaymentDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{rentDue.toLocaleString()} FCFA</div>
                <div className="text-sm text-gray-500">Monthly Rent</div>
                </div>
            </div>
            
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePayRent}
                className="w-full bg-emerald-600 text-white py-4 rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center"
            >
                <CreditCard className="w-5 h-5 mr-2" />
                Pay {rentDue.toLocaleString()} FCFA
            </motion.button>
            </div>

            <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
                Secure payment powered by CAMPAY
            </p>
            <div className="flex justify-center space-x-4">
                <div className="w-12 h-8 bg-orange-500 rounded text-white text-xs flex items-center justify-center font-bold">
                OM
                </div>
                <div className="w-12 h-8 bg-yellow-500 rounded text-white text-xs flex items-center justify-center font-bold">
                MTN
                </div>
            </div>
            </div>
        </div>
        )}

        {activeTab === 'history' && (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Payment History</h2>
            
            <div className="space-y-4">
            {payments.length > 0 ? (
                payments.map((payment) => (
                <div key={payment.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        payment.status === 'completed' 
                        ? 'bg-green-100' 
                        : payment.status === 'pending'
                        ? 'bg-yellow-100'
                        : 'bg-red-100'
                    }`}>
                        {payment.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : payment.status === 'pending' ? (
                        <Clock className="w-5 h-5 text-yellow-600" />
                        ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        )}
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">
                        {payment.amount.toLocaleString()} FCFA
                        </p>
                        <p className="text-sm text-gray-500">
                        {new Date(payment.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : payment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                    
                    {payment.status === 'completed' && (
                        <button
                        onClick={() => downloadReceipt(payment.id)}
                        className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center"
                        >
                        <Download className="w-4 h-4 mr-1" />
                        Receipt
                        </button>
                    )}
                    </div>
                </div>
                ))
            ) : (
                <div className="text-center py-12">
                <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment History</h3>
                <p className="text-gray-500">Your payment history will appear here once you make your first payment.</p>
                </div>
            )}
            </div>
        </div>
        )}

        {activeTab === 'property' && property && (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">My Property</h2>
            
            <div className="bg-gray-50 rounded-xl p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                <img
                    src={property.images?.[0] || 'https://images.pexels.com/photos/1642125/pexels-photo-1642125.jpeg?auto=compress&cs=tinysrgb&w=800'}
                    alt={property.title}
                    className="w-full h-48 object-cover rounded-lg"
                />
                </div>
                <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{property.title}</h3>
                <div className="space-y-3">
                    <div className="flex items-center">
                    <Home className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">{property.location}</span>
                    </div>
                    <div className="flex items-center">
                    <DollarSign className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">{property.monthlyRent.toLocaleString()} FCFA/month</span>
                    </div>
                    <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">12-month lease</span>
                    </div>
                </div>
                </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-gray-600">{property.description}</p>
            </div>
            </div>
        </div>
        )}

        {activeTab === 'support' && (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Contact Support</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                <Phone className="w-6 h-6 text-emerald-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Phone Support</h3>
                </div>
                <p className="text-gray-600 mb-4">Call us for immediate assistance</p>
                <p className="text-emerald-600 font-semibold">+237 6XX XXX XXX</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                <Mail className="w-6 h-6 text-emerald-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Email Support</h3>
                </div>
                <p className="text-gray-600 mb-4">Send us an email for detailed inquiries</p>
                <p className="text-emerald-600 font-semibold">support@green.cm</p>
            </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Message</h3>
            <div className="space-y-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    <option>Payment Issue</option>
                    <option>Property Maintenance</option>
                    <option>Lease Question</option>
                    <option>Other</option>
                </select>
                </div>
                
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Describe your issue or question..."
                />
                </div>
                
                <button className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
                Send Message
                </button>
            </div>
            </div>
        </div>
        )}
    </div>
    </div>

    {/* Payment Modal */}
    <PaymentModal
    isOpen={paymentModal.isOpen}
    onClose={() => setPaymentModal({ ...paymentModal, isOpen: false })}
    type={paymentModal.type}
    amount={paymentModal.amount}
    propertyTitle={paymentModal.propertyTitle}
    onPaymentSuccess={handlePaymentSuccess}
    />
</div>
);
};

export default TenantDashboard;