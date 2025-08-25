import axios from 'axios';

// Inline types to avoid dependency on types.ts
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
    // Remove Content-Type for FormData to let browser set it with boundary
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }
    return config;
});

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
        const response = await api.put(`/properties/${id}`, propertyData);
        return response.data;
    },
    delete: async (id: string): Promise<void> => {
        if (!id) throw new Error('Property ID is required');
        await api.delete(`/properties/${id}`);
    },
    getByOwner: async (ownerId: string): Promise<Property[]> => {
        if (!ownerId) throw new Error('Owner ID is required');
        const response = await api.get(`/properties/owner/${ownerId}`);
        return response.data;
    },
};

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

export const blockchainAPI = {
    deployContract: async (propertyData: any) => {
        const response = await api.post('/blockchain/deploy', propertyData);
        return response.data;
    },
    mintTokens: async (contractAddress: string, amount: number, recipient: string) => {
        const response = await api.post('/blockchain/mint', {
            contractAddress,
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
    getTokenBalance: async (contractAddress: string, walletAddress: string) => {
        if (!contractAddress || !walletAddress) throw new Error('Contract and wallet address required');
        const response = await api.get(`/blockchain/balance/${contractAddress}/${walletAddress}`);
        return response.data;
    },
    getContractInfo: async (contractAddress: string) => {
        if (!contractAddress) throw new Error('Contract address required');
        const response = await api.get(`/blockchain/contract/${contractAddress}`);
        return response.data;
    },
};

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
        const response = await api.put(`/users/${id}`, userData);
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

export default api;