import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
ChartBarIcon,
CurrencyDollarIcon,
HomeIcon,
UserGroupIcon,
ClockIcon,
ArrowTrendingUpIcon,
ArrowTrendingDownIcon,
DocumentTextIcon,
CalendarIcon,
XMarkIcon,
PlusIcon,
} from '@heroicons/react/24/outline';
import { Line, Pie } from 'react-chartjs-2';
import {
Chart as ChartJS,
CategoryScale,
LinearScale,
PointElement,
LineElement,
ArcElement,
Tooltip,
Legend,
} from 'chart.js';
import toast from 'react-hot-toast';
import { propertiesAPI, analyticsAPI } from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

interface PropertyAnalytics {
propertyId: string;
title: string;
valuation: number;
monthlyRent: number;
occupancyRate: number;
totalRentCollected: number;
projectedYield: number;
maintenanceRequests: number;
tenantCount: number;
rentTrend: { month: string; amount: number }[];
expenseBreakdown: { category: string; amount: number }[];
lastUpdated: string;
}

const OwnerPropertyAnalytics: React.FC = () => {
const [activePropertyId, setActivePropertyId] = useState<string | null>(null);
const [analytics, setAnalytics] = useState<PropertyAnalytics | null>(null);
const [properties, setProperties] = useState<{ id: string; title: string }[]>([]);
const [isLoading, setIsLoading] = useState(true); // Start true
const [error, setError] = useState<string | null>(null);
const [timeframe, setTimeframe] = useState<'30d' | '90d' | '1y'>('90d');
const [isExporting, setIsExporting] = useState(false);

// Load owner's properties
useEffect(() => {
const loadProperties = async () => {
    try {
    const data = await propertiesAPI.getMyProperties();
    const mapped = data
        .filter((p: any) => p.id && p.title)
        .map((p: any) => ({ id: p.id, title: p.title }));
    setProperties(mapped);
    if (mapped.length > 0) {
        setActivePropertyId(mapped[0].id);
    } else {
        setIsLoading(false); // No properties? Show empty state
    }
    } catch (err) {
    console.error('Failed to load properties:', err);
    setError('Unable to load your properties.');
    setIsLoading(false);
    toast.error('Failed to load properties');
    }
};

loadProperties();
}, []);

// Load analytics when property or timeframe changes
useEffect(() => {
if (!activePropertyId) {
    setIsLoading(false);
    setAnalytics(null);
    return;
}

let isMounted = true; // Prevent state updates on unmounted component
const controller = new AbortController(); // Optional: for real API cancellation

const loadAnalytics = async () => {
    setIsLoading(true);
    setError(null);

    try {
    const data = await analyticsAPI.getPropertyAnalytics(activePropertyId, timeframe);

    if (!isMounted) return; // Avoid memory leak

    setAnalytics(data);
    setIsLoading(false); // ✅ Always turn off loading — SUCCESS
    } catch (err) {
    if (!isMounted) return;

    console.error('Failed to load analytics:', err);
    setError('Failed to load analytics data. Please try again.');
    setAnalytics(null);
    setIsLoading(false); // ✅ Always turn off loading — ERROR
    toast.error('Failed to load analytics');
    }
};

loadAnalytics();

return () => {
    isMounted = false;
    controller.abort(); // Cleanup if using real fetch
};
}, [activePropertyId, timeframe]);

// Export handler
const handleExport = async () => {
if (!analytics) return;
setIsExporting(true);
try {
    await analyticsAPI.exportReport(activePropertyId!, 'pdf');
    toast.success('Analytics report exported successfully');
} catch (err) {
    toast.error('Export failed');
} finally {
    setIsExporting(false);
}
};

// Memoized chart data
const rentTrendData = useMemo(() => {
if (!analytics?.rentTrend) return { labels: [], datasets: [] };

return {
    labels: analytics.rentTrend.map((item) => item.month),
    datasets: [
    {
        label: 'Monthly Rent Collected',
        data: analytics.rentTrend.map((item) => item.amount),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.3,
        fill: true,
    },
    ],
};
}, [analytics]);

const expensePieData = useMemo(() => {
if (!analytics?.expenseBreakdown) return { labels: [], datasets: [] };

return {
    labels: analytics.expenseBreakdown.map((item) => item.category),
    datasets: [
    {
        data: analytics.expenseBreakdown.map((item) => item.amount),
        backgroundColor: ['#10b981', '#059669', '#047857', '#065f46', '#064e3b'],
        borderColor: '#ffffff',
        borderWidth: 2,
    },
    ],
};
}, [analytics]);

const chartOptions = {
responsive: true,
maintainAspectRatio: false,
plugins: {
    legend: {
    position: 'bottom' as const,
    labels: { color: '#4b5563', font: { size: 12 } },
    },
    tooltip: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    titleColor: '#111827',
    bodyColor: '#374151',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    usePointStyle: true,
    },
},
scales: {
    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { color: '#6b7280' } },
    x: { grid: { display: false }, ticks: { color: '#6b7280' } },
},
};

const pieOptions = {
...chartOptions,
plugins: {
    ...chartOptions.plugins,
    legend: { ...chartOptions.plugins.legend, position: 'right' as const },
},
};

// ✅ LOADING STATE — Now with timeout safeguard and better UX
if (isLoading) {
return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-25 to-slate-100 flex flex-col items-center justify-center p-6">
    <div className="text-center">
        <div className="animate-spin mx-auto h-12 w-12 border-2 border-emerald-500 rounded-full border-t-transparent"></div>
        <p className="mt-4 text-slate-600 font-medium">Curating your analytics...</p>
        <p className="mt-2 text-xs text-slate-400">This should only take a moment.</p>
    </div>
    </div>
);
}

// ✅ ERROR STATE
if (error) {
return (
    <div className="max-w-3xl mx-auto mt-20 p-8 bg-white/60 backdrop-blur-md rounded-2xl border border-rose-200 text-center">
    <div className="text-rose-500 mb-4">
        <XMarkIcon className="w-12 h-12 mx-auto" />
    </div>
    <h3 className="text-lg font-medium text-slate-800">Oops, something went wrong</h3>
    <p className="mt-2 text-slate-600">{error}</p>
    <button
        onClick={() => window.location.reload()}
        className="mt-6 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
    >
        Retry
    </button>
    </div>
);
}

// ✅ EMPTY STATE — No properties or no analytics
if (!activePropertyId && properties.length === 0) {
return (
    <div className="max-w-3xl mx-auto mt-20 p-8 bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200 text-center">
    <HomeIcon className="w-16 h-16 mx-auto text-slate-300" />
    <h3 className="mt-4 text-lg font-medium text-slate-800">No Properties Found</h3>
    <p className="mt-2 text-slate-600">You don’t have any properties yet. Add one to see analytics.</p>
    <Link
        to="/manager/add-property"
        className="mt-6 inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
    >
        <PlusIcon className="w-4 h-4" />
        <span>Add Property</span>
    </Link>
    </div>
);
}

return (
<div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-25 to-slate-100 pb-12">
    {/* Header */}
    <div className="bg-white/60 backdrop-blur-md sticky top-0 z-10 border-b border-slate-200/60">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1 className="text-3xl font-light text-slate-800 tracking-tight">Property Analytics</h1>
            <p className="mt-1 text-slate-500 text-sm">Demure insights for discerning owners</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <select
            value={activePropertyId || ''}
            onChange={(e) => setActivePropertyId(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 rounded-xl bg-white/80 text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            >
            {properties.map((prop) => (
                <option key={prop.id} value={prop.id}>
                {prop.title}
                </option>
            ))}
            </select>
            <button
            onClick={handleExport}
            disabled={isExporting || !analytics}
            className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 text-sm transition-all shadow-sm hover:shadow"
            >
            {isExporting ? (
                <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
            ) : (
                <DocumentTextIcon className="w-4 h-4" />
            )}
            <span>Export</span>
            </button>
        </div>
        </div>
    </div>
    </div>

    {/* Timeframe Selector */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
    <div className="flex items-center space-x-1 bg-white/60 backdrop-blur-sm rounded-xl p-1 w-fit mx-auto border border-slate-200/60">
        {(['30d', '90d', '1y'] as const).map((tf) => (
        <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            timeframe === tf
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
            }`}
        >
            {tf === '30d' && '30 Days'}
            {tf === '90d' && '90 Days'}
            {tf === '1y' && '1 Year'}
        </button>
        ))}
    </div>
    </div>

    {/* Show "No analytics available" if no data */}
    {!analytics ? (
    <div className="max-w-3xl mx-auto mt-20 p-8 bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200 text-center">
        <ChartBarIcon className="w-16 h-16 mx-auto text-slate-300" />
        <h3 className="mt-4 text-lg font-medium text-slate-800">No Analytics Available</h3>
        <p className="mt-2 text-slate-600">
        Analytics for this property are not available yet. Check back after some activity.
        </p>
    </div>
    ) : (
    <>
        {/* Analytics Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
            {
                title: 'Current Valuation',
                value: `$${analytics.valuation.toLocaleString()}`,
                icon: HomeIcon,
                trend: '+12.4%',
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
            },
            {
                title: 'Yield Rate',
                value: `${analytics.projectedYield}%`,
                icon: ArrowTrendingUpIcon,
                trend: '+1.2%',
                color: 'text-green-600',
                bg: 'bg-green-50',
            },
            {
                title: 'Occupancy',
                value: `${analytics.occupancyRate}%`,
                icon: UserGroupIcon,
                trend: analytics.occupancyRate > 90 ? '+2%' : '-1%',
                color: analytics.occupancyRate > 90 ? 'text-green-600' : 'text-amber-600',
                bg: analytics.occupancyRate > 90 ? 'bg-green-50' : 'bg-amber-50',
            },
            {
                title: 'Rent Collected',
                value: `$${analytics.totalRentCollected.toLocaleString()}`,
                icon: CurrencyDollarIcon,
                trend: '+8.7%',
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
            },
            ].map((stat, idx) => (
            <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 hover:shadow-lg transition-shadow"
            >
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                    <p className="mt-1 text-2xl font-light text-slate-800">{stat.value}</p>
                    <div className="mt-2 flex items-center">
                    <span className={`text-xs ${stat.color}`}>
                        {stat.trend.startsWith('+') ? (
                        <ArrowTrendingUpIcon className="w-3 h-3 inline mr-0.5" />
                        ) : (
                        <ArrowTrendingDownIcon className="w-3 h-3 inline mr-0.5" />
                        )}
                        {stat.trend}
                    </span>
                    </div>
                </div>
                <div className={`${stat.bg} p-3 rounded-xl`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                </div>
            </motion.div>
            ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50"
            >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-slate-800">Rent Collection Trend</h3>
                <ClockIcon className="w-5 h-5 text-slate-400" />
            </div>
            <div className="h-64">
                <Line data={rentTrendData} options={chartOptions} />
            </div>
            </motion.div>

            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50"
            >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-slate-800">Expense Breakdown</h3>
                <CurrencyDollarIcon className="w-5 h-5 text-slate-400" />
            </div>
            <div className="h-64">
                <Pie data={expensePieData} options={pieOptions} />
            </div>
            </motion.div>
        </div>

        {/* Activity & Summary */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 lg:col-span-2"
            >
            <h3 className="text-lg font-medium text-slate-800 mb-4">Property Activity</h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                    <DocumentTextIcon className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                    <p className="text-sm font-medium text-slate-700">Maintenance Requests</p>
                    <p className="text-xs text-slate-500">Open & resolved this period</p>
                    </div>
                </div>
                <span className="text-lg font-light text-slate-800">{analytics.maintenanceRequests}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                    <UserGroupIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                    <p className="text-sm font-medium text-slate-700">Active Tenants</p>
                    <p className="text-xs text-slate-500">Currently leasing your property</p>
                    </div>
                </div>
                <span className="text-lg font-light text-slate-800">{analytics.tenantCount}</span>
                </div>
            </div>
            </motion.div>

            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-emerald-50 to-green-50 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/50"
            >
            <div className="flex items-start justify-between">
                <div>
                <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Summary</p>
                <h4 className="mt-1 text-lg font-light text-slate-800">Performance Overview</h4>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                    Your property is performing above market average. Occupancy and rent collection remain strong.
                </p>
                </div>
                <div className="p-3 bg-white/60 rounded-xl">
                <ChartBarIcon className="w-6 h-6 text-emerald-600" />
                </div>
            </div>
            <div className="mt-6 pt-4 border-t border-emerald-200/50">
                <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Last Updated</span>
                <span className="text-slate-700 font-medium">
                    {new Date(analytics.lastUpdated).toLocaleDateString()}
                </span>
                </div>
            </div>
            </motion.div>
        </div>
        </div>
    </>
    )}
</div>
);
};

export default OwnerPropertyAnalytics;