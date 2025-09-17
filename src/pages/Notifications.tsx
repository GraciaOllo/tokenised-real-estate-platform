import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
BellIcon, 
CheckIcon, 
XMarkIcon,
BuildingOfficeIcon,
CurrencyDollarIcon,
UserGroupIcon,
ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { Notification } from '../types';
import toast from 'react-hot-toast';

const Notifications: React.FC = () => {
const { user } = useAuth();
const [notifications, setNotifications] = useState<Notification[]>([]);
const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
loadNotifications();
}, []);

const loadNotifications = async () => {
try {
    setIsLoading(true);
    
    // Mock notifications - in real app, load from API
    const mockNotifications: Notification[] = [
    {
        id: '1',
        userId: user!.id,
        type: 'property_approved',
        title: 'Property Approved',
        message: 'Your property "Luxury Downtown Apartment" has been approved for tokenization.',
        read: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        data: { propertyId: '1' }
    },
    {
        id: '2',
        userId: user!.id,
        type: 'rent_received',
        title: 'Rent Payment Received',
        message: 'You received 15,000 FCFA in rent from your property investments.',
        read: false,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        data: { amount: 15000 }
    },
    {
        id: '3',
        userId: user!.id,
        type: 'property_rejected',
        title: 'Property Rejected',
        message: 'Your property submission requires additional documentation.',
        read: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        data: { propertyId: '2', reason: 'Missing ownership documents' }
    },
    {
        id: '4',
        userId: user!.id,
        type: 'message',
        title: 'New Message',
        message: 'You have a new message from Admin Support.',
        read: true,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        data: { senderId: 'admin-1' }
    }
    ];
    
    setNotifications(mockNotifications);
} catch (error) {
    toast.error('Failed to load notifications');
} finally {
    setIsLoading(false);
}
};

const markAsRead = async (notificationId: string) => {
try {
    // In real app, call API to mark as read
    setNotifications(prev => 
    prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
    )
    );
    toast.success('Notification marked as read');
} catch (error) {
    toast.error('Failed to mark notification as read');
}
};

const markAllAsRead = async () => {
try {
    // In real app, call API to mark all as read
    setNotifications(prev => 
    prev.map(notif => ({ ...notif, read: true }))
    );
    toast.success('All notifications marked as read');
} catch (error) {
    toast.error('Failed to mark all notifications as read');
}
};

const deleteNotification = async (notificationId: string) => {
try {
    // In real app, call API to delete notification
    setNotifications(prev => 
    prev.filter(notif => notif.id !== notificationId)
    );
    toast.success('Notification deleted');
} catch (error) {
    toast.error('Failed to delete notification');
}
};

const getNotificationIcon = (type: string) => {
switch (type) {
    case 'property_approved':
    case 'property_rejected':
    case 'property_submitted':
    return <BuildingOfficeIcon className="w-6 h-6" />;
    case 'rent_received':
    return <CurrencyDollarIcon className="w-6 h-6" />;
    case 'message':
    return <ChatBubbleLeftRightIcon className="w-6 h-6" />;
    default:
    return <BellIcon className="w-6 h-6" />;
}
};

const getNotificationColor = (type: string) => {
switch (type) {
    case 'property_approved':
    return 'bg-green-100 text-green-600';
    case 'property_rejected':
    return 'bg-red-100 text-red-600';
    case 'property_submitted':
    return 'bg-blue-100 text-blue-600';
    case 'rent_received':
    return 'bg-emerald-100 text-emerald-600';
    case 'message':
    return 'bg-purple-100 text-purple-600';
    default:
    return 'bg-gray-100 text-gray-600';
}
};

const filteredNotifications = notifications.filter(notif => {
if (filter === 'unread') return !notif.read;
if (filter === 'read') return notif.read;
return true;
});

const unreadCount = notifications.filter(notif => !notif.read).length;

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
    <div className="flex items-center justify-between">
    <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600">
        {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'All caught up!'}
        </p>
    </div>
    {unreadCount > 0 && (
        <button
        onClick={markAllAsRead}
        className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
        <CheckIcon className="w-5 h-5" />
        <span>Mark All Read</span>
        </button>
    )}
    </div>

    {/* Filters */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
    <div className="flex space-x-4">
        <button
        onClick={() => setFilter('all')}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all' 
            ? 'bg-emerald-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        >
        All ({notifications.length})
        </button>
        <button
        onClick={() => setFilter('unread')}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'unread' 
            ? 'bg-emerald-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        >
        Unread ({unreadCount})
        </button>
        <button
        onClick={() => setFilter('read')}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'read' 
            ? 'bg-emerald-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        >
        Read ({notifications.length - unreadCount})
        </button>
    </div>
    </div>

    {/* Notifications List */}
    <div className="space-y-4">
    {filteredNotifications.length > 0 ? (
        filteredNotifications.map((notification) => (
        <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${
            !notification.read ? 'border-l-4 border-l-emerald-500' : ''
            }`}
        >
            <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                    {!notification.read && (
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    )}
                </div>
                <p className="text-gray-600 mb-2">{notification.message}</p>
                <p className="text-sm text-gray-500">
                    {new Date(notification.createdAt).toLocaleString()}
                </p>
                </div>
            </div>
            
            <div className="flex items-center space-x-2">
                {!notification.read && (
                <button
                    onClick={() => markAsRead(notification.id)}
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Mark as read"
                >
                    <CheckIcon className="w-5 h-5" />
                </button>
                )}
                <button
                onClick={() => deleteNotification(notification.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete notification"
                >
                <XMarkIcon className="w-5 h-5" />
                </button>
            </div>
            </div>
        </motion.div>
        ))
    ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
        <p className="text-gray-500">
            {filter === 'unread' 
            ? "You don't have any unread notifications" 
            : filter === 'read'
            ? "You don't have any read notifications"
            : "You don't have any notifications yet"}
        </p>
        </div>
    )}
    </div>
</div>
);
};

export default Notifications;