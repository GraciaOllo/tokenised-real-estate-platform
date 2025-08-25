export interface Property {
  id: string;
  title: string;
  location: string;
  images: string[];
  description: string;
  valuation: number;
  tokenPrice: number;
  totalTokens: number;
  availableTokens?: number;
  expectedYield: number;
  monthlyRent: number;
  contractAddress?: string;
  documents: string[];
  ownerId: string;
  status: 'pending' | 'approved' | 'rejected' | 'tokenized';
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
}

export interface Portfolio {
  totalValue: number;
  totalRentReceived: number;
  properties: PortfolioProperty[];
}

export interface PortfolioProperty {
  id: string;
  property: Property;
  tokensOwned: number;
  incomeReceived: number;
  purchaseDate: string;
}

export interface User {
  walletAddress: string;
  isConnected: boolean;
  portfolio: Portfolio;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'investor' | 'tenant' | 'manager';
  walletAddress?: string;
  phone?: string;
  isActive: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'property_approved' | 'property_rejected' | 'property_submitted' | 'rent_received' | 'message';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: any;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
  read: boolean;
  senderName: string;
  senderRole: string;
}

export interface ChatConversation {
  id: string;
  participants: string[];
  lastMessage: ChatMessage;
  unreadCount: number;
}
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'investor' | 'tenant' | 'manager';
  walletAddress?: string;
  phone?: string;
}

export interface Payment {
  id: string;
  userId: string;
  propertyId: string;
  amount: number;
  type: 'rent' | 'token_purchase' | 'dividend';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description?: string;
  transactionHash?: string;
  createdAt: string;
}

export interface TenantDashboard {
  rentDue: number;
  nextPaymentDate: string;
  paymentHistory: Payment[];
  leaseContract: string;
  propertyDetails: Property;
}

export interface BlockchainTransaction {
  hash: string;
  type: 'mint' | 'transfer' | 'rent_distribution';
  amount: number;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'failed';
}