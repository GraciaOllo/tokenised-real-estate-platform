import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
HomeIcon, 
BuildingOfficeIcon, 
ChartBarIcon, 
CreditCardIcon,
UserGroupIcon,
DocumentTextIcon,
ChatBubbleLeftRightIcon,
BellIcon,
CogIcon,
PlusIcon,
ClipboardDocumentListIcon,
BanknotesIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { MessageCircle } from 'lucide-react';

const Sidebar: React.FC = () => {
const { user } = useAuth();
const location = useLocation();

const isActive = (path: string) => location.pathname === path;

const getMenuItems = () => {
if (!user) return [];

const baseItems = [
    { path: '/dashboard', label: 'Dashboard', icon: HomeIcon },
    { path: '/chat', label: 'Messages', icon: ChatBubbleLeftRightIcon },
    { path: '/notifications', label: 'Notifications', icon: BellIcon },
];

switch (user.role) {
    case 'admin':
    return [
        ...baseItems,
        { path: '/admin/users', label: 'Manage Users', icon: UserGroupIcon },
        { path: '/admin/properties', label: 'Manage properties', icon: BuildingOfficeIcon },
        { path: '/admin/tenants', label: 'Tenant Management', icon: UserGroupIcon },
        { path: '/admin/analytics', label: 'Platform Analytics', icon: ChartBarIcon }, 
        { path: '/admin/chats', label: 'My Messages', icon: MessageCircle },
        { path: '/admin/payments', label: 'Payment Management', icon: BanknotesIcon },
        { path: '/profile', label: 'Settings', icon: CogIcon },
    ];
    
    case 'manager':
    return [
        ...baseItems,
        { path: '/manager/properties', label: 'My Properties', icon: BuildingOfficeIcon },
        { path: '/manager/tenants', label: 'My Tenants', icon: UserGroupIcon },
        { path: '/manager/add-property', label: 'Add Property', icon: PlusIcon },
        { path: '/manager/chats', label: 'My Messages', icon: MessageCircle },
        { path: '/manager/analytics', label: 'Property Analytics', icon: ChartBarIcon },
        { path: '/profile', label: 'Profile', icon: CogIcon },
    ];
    
    case 'investor':
    return [
        ...baseItems,
        { path: '/investor/portfolio', label: 'My Portfolio', icon: ChartBarIcon },
        { path: '/investor/properties', label: 'Browse Properties', icon: BuildingOfficeIcon },
        { path: '/investor/transactions', label: 'Transactions', icon: ClipboardDocumentListIcon },
        { path: '/profile', label: 'Profile', icon: CogIcon },
    ];
    
    case 'tenant':
    return [
        ...baseItems,
        { path: '/tenant/rent', label: 'Pay Rent', icon: CreditCardIcon },
        { path: '/tenant/history', label: 'Payment History', icon: DocumentTextIcon },
        { path: '/tenant/property', label: 'My Property', icon: BuildingOfficeIcon },
        { path: '/tenant/chats', label: 'My Messages', icon: MessageCircle },
        { path: '/profile', label: 'Profile', icon: CogIcon },
    ];
    
    default:
    return baseItems;
}
};

const menuItems = getMenuItems();

return (
<div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-16 z-30">
    <div className="p-6">
    <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
        <span className="text-emerald-600 font-semibold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
        </span>
        </div>
        <div>
        <p className="font-medium text-gray-900">{user?.name}</p>
        <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
        </div>
    </div>

    <nav className="space-y-2">
        {menuItems.map((item) => {
        const Icon = item.icon;
        return (
            <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                ? 'bg-emerald-50 text-emerald-600 border-r-2 border-emerald-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
            </Link>
        );
        })}
    </nav>
    </div>
</div>
);
};

export default Sidebar;