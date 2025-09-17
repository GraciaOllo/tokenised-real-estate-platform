import axios from 'axios';

// ======== INTERFACES ========
interface AuthUser {
    id: string;
    email: string;
    name: string;
    role?: string;
}

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

interface Payment {
    id?: string;
    _id?: string;
    userId: string;
    propertyId: string;
    amount: number;
    status: string;
    createdAt?: Date;
}

interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterData {
    email: string;
    password: string;
    name: string;
}

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

// ======== AXIOS INSTANCE ========
const API_BASE_URL = 'http://localhost:3001';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }
    return config;
});

// ======== AUTH API ========
export const authAPI = {
    login: async (credentials: LoginCredentials): Promise<{ token: string; user: AuthUser }> => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },
    register: async (userData: RegisterData): Promise<{ token: string; user: AuthUser }> => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
};

// ======== PROPERTIES API ========
export const propertiesAPI = {
    getAll: async (): Promise<Property[]> => {
        const response = await api.get('/properties');
        return response.data;
    },
    getById: async (id: string): Promise<Property> => {
        if (!id) throw new Error('Property ID is required');
        const response = await api.get(`/properties/${id}`);
        return response.data;
    },
    create: async (propertyData: FormData): Promise<Property> => {
        const response = await api.post('/properties', propertyData);
        return response.data;
    },
    update: async (id: string, propertyData: Partial<Property>): Promise<Property> => {
        if (!id) throw new Error('Property ID is required');
        const response = await api.patch(`/properties/${id}`, propertyData);
        return response.data;
    },
    publish: async (id: string, data?: { ownerWalletAddress?: string }): Promise<Property> => {
        if (!id) throw new Error('Property ID is required');
        const response = await api.patch(`/properties/${id}/publish`, data || {});
        return response.data;
    },
    delete: async (id: string): Promise<void> => {
        if (!id) throw new Error('Property ID is required');
        await api.delete(`/properties/${id}`);
    },
    getByOwner: async (managerId: string): Promise<Property[]> => {
        if (!managerId) throw new Error('Manager ID is required');
        const response = await api.get(`/properties/manager/${managerId}`);
        return response.data;
    },
    getMyProperties: async (): Promise<Property[]> => {
        const response = await api.get('/properties/owner');
        return response.data;
    },
};

// ======== PAYMENTS API ========
export const paymentsAPI = {
    getAll: async (): Promise<Payment[]> => {
        const response = await api.get('/payments');
        return response.data;
    },
    getById: async (id: string): Promise<Payment> => {
        if (!id) throw new Error('Payment ID is required');
        const response = await api.get(`/payments/${id}`);
        return response.data;
    },
    create: async (paymentData: Partial<Payment>): Promise<Payment> => {
        const response = await api.post('/payments', paymentData);
        return response.data;
    },
    getByUser: async (userId: string): Promise<Payment[]> => {
        if (!userId) throw new Error('User ID is required');
        const response = await api.get(`/payments/user/${userId}`);
        return response.data;
    },
    getByProperty: async (propertyId: string): Promise<Payment[]> => {
        if (!propertyId) throw new Error('Property ID is required');
        const response = await api.get(`/payments/property/${propertyId}`);
        return response.data;
    },
    updateStatus: async (id: string, status: string): Promise<Payment> => {
        if (!id) throw new Error('Payment ID is required');
        const response = await api.put(`/payments/${id}/status`, { status });
        return response.data;
    },
};

// ======== BLOCKCHAIN API ========
export const blockchainAPI = {
    uploadPropertyToBlockchain: async (propertyData: {
        ownerWallet: string;
        ipfsMetadata: string;
        valuation: number;
        monthlyRent: number;
    }) => {
        const response = await api.post('/blockchain/upload-property', propertyData);
        return response.data;
    },
    getPropertyFromBlockchain: async (tokenId: string) => {
        if (!tokenId) throw new Error('Token ID required');
        const response = await api.get(`/blockchain/property/${tokenId}`);
        return response.data;
    },
    getTokenBalance: async (walletAddress: string) => {
        if (!walletAddress) throw new Error('Wallet address required');
        const response = await api.get(`/blockchain/balance/${walletAddress}`);
        return response.data;
    },
    getTotalSupply: async () => {
        const response = await api.get('/blockchain/total-supply');
        return response.data;
    },
    getContractInfo: async () => {
        const response = await api.get('/blockchain/contract-info');
        return response.data;
    },
    checkConnection: async () => {
        const response = await api.get('/blockchain/connection-status');
        return response.data;
    },
    deployContract: async (propertyData: any) => {
        const response = await api.post('/blockchain/tokenize-property', propertyData);
        return response.data;
    },
    mintTokens: async (contractAddress: string, amount: number, recipient: string) => {
        const response = await api.post('/blockchain/mint-tokens', {
            erc20ContractAddress: contractAddress,
            amount,
            recipient,
        });
        return response.data;
    },
    distributeRent: async (contractAddress: string, totalAmount: number) => {
        const response = await api.post('/blockchain/distribute-rent', {
            contractAddress,
            totalAmount,
        });
        return response.data;
    },
};

// ======== USERS API ========
export const usersAPI = {
    getAll: async (): Promise<AuthUser[]> => {
        const response = await api.get('/users');
        return response.data;
    },
    getById: async (id: string): Promise<AuthUser> => {
        if (!id) throw new Error('User ID is required');
        const response = await api.get(`/users/${id}`);
        return response.data;
    },
    create: async (userData: RegisterData): Promise<AuthUser> => {
        const response = await api.post('/users', userData);
        return response.data;
    },
    update: async (id: string, userData: Partial<AuthUser>): Promise<AuthUser> => {
        if (!id) throw new Error('User ID is required');
        const response = await api.patch(`/users/${id}`, userData);
        return response.data;
    },
    delete: async (id: string): Promise<void> => {
        if (!id) throw new Error('User ID is required');
        await api.delete(`/users/${id}`);
    },
    activate: async (id: string): Promise<AuthUser> => {
        if (!id) throw new Error('User ID is required');
        const response = await api.put(`/users/${id}/activate`);
        return response.data;
    },
    deactivate: async (id: string): Promise<AuthUser> => {
        if (!id) throw new Error('User ID is required');
        const response = await api.put(`/users/${id}/deactivate`);
        return response.data;
    },
};

// ======== CHAT API ========
export const chatAPI = {
    getConversations: async (userId: string) => {
        if (!userId) throw new Error('User ID is required');
        const response = await api.get(`/chat/conversations/${userId}`);
        return response.data;
    },
    getMessages: async (conversationId: string) => {
        if (!conversationId) throw new Error('Conversation ID is required');
        const response = await api.get(`/chat/messages/${conversationId}`);
        return response.data;
    },
    markAsRead: async (messageId: string) => {
        if (!messageId) throw new Error('Message ID is required');
        const response = await api.post(`/chat/messages/${messageId}/read`);
        return response.data;
    },
    createConversation: async ({ userId1, userId2 }: { userId1: string; userId2: string }) => {
        if (!userId1 || !userId2) throw new Error('User IDs are required');
        const response = await api.post('/chat/conversations', { userId1, userId2 });
        return response.data;
    },
};

// ======== NOTIFICATIONS API ========
export const notificationsAPI = {
    getAll: async () => {
        const response = await api.get('/notifications');
        return response.data;
    },
    markAsRead: async (id: string) => {
        if (!id) throw new Error('Notification ID is required');
        const response = await api.put(`/notifications/${id}/read`);
        return response.data;
    },
    markAllAsRead: async () => {
        const response = await api.put('/notifications/mark-all-read');
        return response.data;
    },
    delete: async (id: string) => {
        if (!id) throw new Error('Notification ID is required');
        await api.delete(`/notifications/${id}`);
    },
};

// ======== TENANTS API ========
export const tenantsAPI = {
    getAll: async () => {
        const response = await api.get('/tenants');
        return response.data;
    },
    getById: async (id: string) => {
        if (!id) throw new Error('Tenant ID is required');
        const response = await api.get(`/tenants/${id}`);
        return response.data;
    },
    getByUserId: async (userId: string) => {
        if (!userId) throw new Error('User ID is required');
        const response = await api.get(`/tenants/user/${userId}`);
        return response.data;
    },
    create: async (tenantData: any) => {
        const response = await api.post('/tenants', tenantData);
        return response.data;
    },
    update: async (id: string, tenantData: any) => {
        if (!id) throw new Error('Tenant ID is required');
        const response = await api.put(`/tenants/${id}`, tenantData);
        return response.data;
    },
    delete: async (id: string) => {
        if (!id) throw new Error('Tenant ID is required');
        await api.delete(`/tenants/${id}`);
    },
    addPayment: async (id: string, paymentData: any) => {
        if (!id) throw new Error('Tenant ID is required');
        const response = await api.post(`/tenants/${id}/payments`, paymentData);
        return response.data;
    },
    addMaintenanceRequest: async (id: string, requestData: any) => {
        if (!id) throw new Error('Tenant ID is required');
        const response = await api.post(`/tenants/${id}/maintenance-requests`, requestData);
        return response.data;
    },
    assignProperty: async (id: string, propertyId: string) => {
        if (!id) throw new Error('Tenant ID is required');
        const response = await api.post(`/tenants/${id}/assign-property`, { propertyId });
        return response.data;
    },
    getByPropertyOwner: async (ownerId: string) => {
        if (!ownerId) throw new Error('Owner ID is required');
        const response = await api.get(`/tenants/owner/${ownerId}`);
        return response.data;
    },
};

// ======== ANALYTICS API ========
export const analyticsAPI = {
    getPropertyAnalytics: async (propertyId: string, timeframe: string): Promise<PropertyAnalytics> => {
        if (!propertyId) throw new Error('Property ID is required');

        // 👇 MOCK DATA — Replace with real API call later: await api.get(`/analytics/property/${propertyId}?timeframe=${timeframe}`)
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay

        const now = new Date();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        let rentTrend = [];
        let totalRentCollected = 0;

        if (timeframe === '30d') {
            const month = months[now.getMonth()];
            rentTrend = [{ month, amount: 4200 }];
            totalRentCollected = 4200;
        } else if (timeframe === '90d') {
            const startMonth = (now.getMonth() - 2 + 12) % 12;
            rentTrend = [
                { month: months[startMonth], amount: 4200 },
                { month: months[(startMonth + 1) % 12], amount: 4200 },
                { month: months[(startMonth + 2) % 12], amount: 4200 },
            ];
            totalRentCollected = 12600;
        } else if (timeframe === '1y') {
            rentTrend = Array.from({ length: 12 }, (_, i) => {
                const monthIndex = (now.getMonth() - 11 + i + 12) % 12;
                return { month: months[monthIndex], amount: 4200 };
            });
            totalRentCollected = 50400;
        }

        return {
            propertyId,
            title: `Elegant Residence ${propertyId.slice(-4)}`,
            valuation: 850000,
            monthlyRent: 4200,
            occupancyRate: 96,
            totalRentCollected,
            projectedYield: 6.2,
            maintenanceRequests: 3,
            tenantCount: 2,
            rentTrend,
            expenseBreakdown: [
                { category: 'Maintenance', amount: 1200 },
                { category: 'Property Management', amount: 800 },
                { category: 'Taxes', amount: 2100 },
                { category: 'Insurance', amount: 600 },
            ],
            lastUpdated: new Date().toISOString(),
        };
    },

    exportReport: async (propertyId: string, format: 'pdf' | 'csv' = 'pdf') => {
        if (!propertyId) throw new Error('Property ID is required');
        await new Promise(resolve => setTimeout(resolve, 1500));

        const content = `Property Analytics Report\nProperty ID: ${propertyId}\nGenerated: ${new Date().toLocaleString()}\n\n📊 Mock Data — Replace with real backend export.`;
        const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/pdf' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `analytics-${propertyId}-${new Date().toISOString().split('T')[0]}.${format}`);
        document.body.appendChild(link);
        link.click();

        link.remove();
        URL.revokeObjectURL(url);
    },
};

// ======== DEFAULT EXPORT ========
// This is your base axios instance — only import this if you need to make custom requests
export default api;