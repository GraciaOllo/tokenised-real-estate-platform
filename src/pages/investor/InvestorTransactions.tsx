import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Filter, Search, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Payment } from '../../types';
import { paymentsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const InvestorTransactions: React.FC = () => {
const { user } = useAuth();
const [transactions, setTransactions] = useState<Payment[]>([]);
const [filteredTransactions, setFilteredTransactions] = useState<Payment[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [searchTerm, setSearchTerm] = useState('');
const [statusFilter, setStatusFilter] = useState('all');
const [typeFilter, setTypeFilter] = useState('all');

useEffect(() => {
if (user) {
    loadTransactions();
}
}, [user]);

useEffect(() => {
filterTransactions();
}, [transactions, searchTerm, statusFilter, typeFilter]);

const loadTransactions = async () => {
try {
    setIsLoading(true);
    const data = await paymentsAPI.getByUser(user!.id);
    setTransactions(data);
} catch (error) {
    toast.error('Failed to load transactions');
} finally {
    setIsLoading(false);
}
};

const filterTransactions = () => {
let filtered = transactions;

if (searchTerm) {
    filtered = filtered.filter(transaction =>
    transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
}

if (statusFilter !== 'all') {
    filtered = filtered.filter(transaction => transaction.status === statusFilter);
}

if (typeFilter !== 'all') {
    filtered = filtered.filter(transaction => transaction.type === typeFilter);
}

setFilteredTransactions(filtered);
};

const getStatusIcon = (status: string) => {
switch (status) {
    case 'completed':
    return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'pending':
    return <Clock className="w-5 h-5 text-yellow-600" />;
    case 'failed':
    return <XCircle className="w-5 h-5 text-red-600" />;
    default:
    return <Clock className="w-5 h-5 text-gray-600" />;
}
};

const getStatusColor = (status: string) => {
switch (status) {
    case 'completed':
    return 'bg-green-100 text-green-800';
    case 'pending':
    return 'bg-yellow-100 text-yellow-800';
    case 'failed':
    return 'bg-red-100 text-red-800';
    default:
    return 'bg-gray-100 text-gray-800';
}
};

const getTypeColor = (type: string) => {
switch (type) {
    case 'token_purchase':
    return 'bg-blue-100 text-blue-800';
    case 'dividend':
    return 'bg-emerald-100 text-emerald-800';
    case 'rent':
    return 'bg-purple-100 text-purple-800';
    default:
    return 'bg-gray-100 text-gray-800';
}
};

const downloadReceipt = (transactionId: string) => {
// Mock receipt download
toast.success('Receipt downloaded successfully!');
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
    <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
    <p className="text-gray-600">View all your investment transactions and receipts</p>
    </div>

    {/* Filters */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
        <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Search transactions..."
            />
        </div>
        </div>
        
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
        <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
        </select>
        </div>

        <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
        <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
            <option value="all">All Types</option>
            <option value="token_purchase">Token Purchase</option>
            <option value="dividend">Dividend</option>
            <option value="rent">Rent Payment</option>
        </select>
        </div>

        <div className="flex items-end">
        <div className="text-sm text-gray-600">
            {filteredTransactions.length} transactions
        </div>
        </div>
    </div>
    </div>

    {/* Transactions List */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
    <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
    </div>
    
    <div className="divide-y divide-gray-200">
        {filteredTransactions.length > 0 ? (
        filteredTransactions.map((transaction) => (
            <motion.div
            key={transaction.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 hover:bg-gray-50 transition-colors"
            >
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    {getStatusIcon(transaction.status)}
                </div>
                <div>
                    <div className="flex items-center space-x-2 mb-1">
                    <p className="font-medium text-gray-900">
                        {transaction.amount.toLocaleString()} FCFA
                    </p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                        {transaction.type.replace('_', ' ').toUpperCase()}
                    </span>
                    </div>
                    <p className="text-sm text-gray-500">
                    {transaction.description || `Transaction ${transaction.id.slice(0, 8)}`}
                    </p>
                    <p className="text-xs text-gray-400">
                    {new Date(transaction.createdAt).toLocaleString()}
                    </p>
                </div>
                </div>
                
                <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </span>
                
                {transaction.status === 'completed' && (
                    <button
                    onClick={() => downloadReceipt(transaction.id)}
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center"
                    >
                    <Download className="w-4 h-4 mr-1" />
                    Receipt
                    </button>
                )}
                </div>
            </div>
            </motion.div>
        ))
        ) : (
        <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions Found</h3>
            <p className="text-gray-500">Your transaction history will appear here.</p>
        </div>
        )}
    </div>
    </div>
</div>
);
};

export default InvestorTransactions;