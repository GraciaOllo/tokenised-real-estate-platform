import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
CreditCard, Wallet, DollarSign, Clock, 
CheckCircle, XCircle, AlertCircle, Phone,
Calendar, Filter, Search, Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface Payment {
_id: string;
amount: number;
currency: string;
status: 'pending' | 'completed' | 'failed' | 'cancelled';
method: 'campay' | 'mtn' | 'orange';
reference: string;
description: string;
createdAt: string;
completedAt?: string;
}

interface PaymentForm {
amount: string;
phone: string;
description: string;
method: 'mtn' | 'orange';
}

const Payments: React.FC = () => {
const { user } = useAuth();
const [showPaymentForm, setShowPaymentForm] = useState(false);
const [payments, setPayments] = useState<Payment[]>([
// Mock data for demonstration
{
    _id: '1',
    amount: 50000,
    currency: 'XAF',
    status: 'completed',
    method: 'campay',
    reference: 'PAY_001',
    description: 'Sale of 10kg corn',
    createdAt: '2024-01-15T10:30:00Z',
    completedAt: '2024-01-15T10:32:00Z'
},
{
    _id: '2',
    amount: 25000,
    currency: 'XAF',
    status: 'pending',
    method: 'campay',
    reference: 'PAY_002',
    description: 'Sale of 5kg beans',
    createdAt: '2024-01-14T14:20:00Z'
}
]);

const [paymentForm, setPaymentForm] = useState<PaymentForm>({
amount: '',
phone: '',
description: '',
method: 'mtn'
});

const [filters, setFilters] = useState({
search: '',
status: '',
method: ''
});

const handleCreatePayment = async (e: React.FormEvent) => {
e.preventDefault();

try {
    // Campay API integration
    const campayData = {
    amount: paymentForm.amount,
    currency: "XAF",
    external_reference: `payment_${Date.now()}`,
    phone_number: paymentForm.phone,
    description: paymentForm.description,
    return_url: `${window.location.origin}/payments/success`,
    failure_url: `${window.location.origin}/payments/failure`
    };

    // Mock payment creation
    const newPayment: Payment = {
    _id: Date.now().toString(),
    amount: parseFloat(paymentForm.amount),
    currency: 'XAF',
    status: 'pending',
    method: 'campay',
    reference: `PAY_${Date.now()}`,
    description: paymentForm.description,
    createdAt: new Date().toISOString()
    };

    setPayments(prev => [newPayment, ...prev]);
    toast.success('Payment initiated successfully!');
    
    setShowPaymentForm(false);
    setPaymentForm({
    amount: '',
    phone: '',
    description: '',
    method: 'mtn'
    });

    // Simulate payment processing
    setTimeout(() => {
    setPayments(prev => prev.map(p => 
        p._id === newPayment._id 
        ? { ...p, status: 'completed', completedAt: new Date().toISOString() }
        : p
    ));
    toast.success('Payment completed successfully!');
    }, 3000);

} catch (error) {
    console.error('Payment error:', error);
    toast.error('Payment failed. Please try again.');
}
};

const getStatusColor = (status: string) => {
switch (status) {
    case 'completed': return 'text-green-600 bg-green-50 border-green-200';
    case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'failed': return 'text-red-600 bg-red-50 border-red-200';
    case 'cancelled': return 'text-gray-600 bg-gray-50 border-gray-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
}
};

const getStatusIcon = (status: string) => {
switch (status) {
    case 'completed': return <CheckCircle className="h-4 w-4" />;
    case 'pending': return <Clock className="h-4 w-4" />;
    case 'failed': return <XCircle className="h-4 w-4" />;
    case 'cancelled': return <AlertCircle className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
}
};

const getMethodColor = (method: string) => {
switch (method) {
    case 'mtn': return 'text-yellow-600 bg-yellow-50';
    case 'orange': return 'text-orange-600 bg-orange-50';
    case 'campay': return 'text-blue-600 bg-blue-50';
    default: return 'text-gray-600 bg-gray-50';
}
};

const filteredPayments = payments.filter(payment => {
const matchesSearch = !filters.search || 
    payment.description.toLowerCase().includes(filters.search.toLowerCase()) ||
    payment.reference.toLowerCase().includes(filters.search.toLowerCase());
const matchesStatus = !filters.status || payment.status === filters.status;
const matchesMethod = !filters.method || payment.method === filters.method;

return matchesSearch && matchesStatus && matchesMethod;
});

const totalEarnings = payments
.filter(p => p.status === 'completed')
.reduce((sum, p) => sum + p.amount, 0);

const pendingAmount = payments
.filter(p => p.status === 'pending')
.reduce((sum, p) => sum + p.amount, 0);

return (
<div className="space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
    <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600">Manage your payments and earnings</p>
    </div>
    
    <button
        onClick={() => setShowPaymentForm(true)}
        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
    >
        <CreditCard className="h-5 w-5" />
        <span>New Payment</span>
    </button>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
    >
        <div className="flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-gray-600">Total Earnings</p>
            <p className="text-2xl font-bold text-green-600">{totalEarnings.toLocaleString()} FCFA</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
            <DollarSign className="h-6 w-6 text-green-600" />
        </div>
        </div>
    </motion.div>

    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
    >
        <div className="flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{pendingAmount.toLocaleString()} FCFA</p>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg">
            <Clock className="h-6 w-6 text-yellow-600" />
        </div>
        </div>
    </motion.div>

    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
    >
        <div className="flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-gray-600">Transactions</p>
            <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
            <Wallet className="h-6 w-6 text-blue-600" />
        </div>
        </div>
    </motion.div>
    </div>

    {/* Filters */}
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
            type="text"
            placeholder="Search payments..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        </div>

        <select
        value={filters.status}
        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
        <option value="">All Status</option>
        <option value="completed">Completed</option>
        <option value="pending">Pending</option>
        <option value="failed">Failed</option>
        <option value="cancelled">Cancelled</option>
        </select>

        <select
        value={filters.method}
        onChange={(e) => setFilters(prev => ({ ...prev, method: e.target.value }))}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
        <option value="">All Methods</option>
        <option value="campay">Campay</option>
        <option value="mtn">MTN Mobile Money</option>
        <option value="orange">Orange Money</option>
        </select>

        <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2">
        <Download className="h-4 w-4" />
        <span>Export</span>
        </button>
    </div>
    </div>

    {/* Payments List */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
    <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
    </div>

    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
            <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reference
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Method
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
            </th>
            </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
            {filteredPayments.map((payment) => (
            <tr key={payment._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{payment.reference}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{payment.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                    {payment.amount.toLocaleString()} {payment.currency}
                </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMethodColor(payment.method)}`}>
                    {payment.method.toUpperCase()}
                </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(payment.status)}`}>
                    {getStatusIcon(payment.status)}
                    <span className="ml-1">{payment.status}</span>
                </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(payment.createdAt), 'PPp', { locale: fr })}
                </td>
            </tr>
            ))}
        </tbody>
        </table>
    </div>

    {filteredPayments.length === 0 && (
        <div className="text-center py-12">
        <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No payments found</p>
        </div>
    )}
    </div>

    {/* Payment Form Modal */}
    {showPaymentForm && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full"
        >
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <CreditCard className="h-6 w-6 mr-2" />
            Create Payment Request
        </h2>
        
        <form onSubmit={handleCreatePayment} className="space-y-4">
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (FCFA)
            </label>
            <input
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                required
                min="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter amount"
            />
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Phone Number
            </label>
            <input
                type="tel"
                value={paymentForm.phone}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, phone: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="6XXXXXXXX"
            />
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
            </label>
            <select
                value={paymentForm.method}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, method: e.target.value as 'mtn' | 'orange' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
                <option value="mtn">MTN Mobile Money</option>
                <option value="orange">Orange Money</option>
            </select>
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
            </label>
            <textarea
                value={paymentForm.description}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, description: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={3}
                placeholder="Payment description..."
            />
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Campay Integration:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
                <li>• Secure payment processing</li>
                <li>• Real-time transaction status</li>
                <li>• Support for all major mobile money providers</li>
                <li>• Automatic payment confirmation</li>
            </ul>
            </div>

            <div className="flex space-x-3 pt-4">
            <button
                type="button"
                onClick={() => setShowPaymentForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
                Cancel
            </button>
            <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
                <Wallet className="h-4 w-4" />
                <span>Create Payment</span>
            </button>
            </div>
        </form>
        </motion.div>
    </div>
    )}
</div>
);
};

export default Payments;
