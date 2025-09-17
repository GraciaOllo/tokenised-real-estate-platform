import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, LoginCredentials, RegisterData } from '../types';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

interface AuthContextType {
user: AuthUser | null;
isLoading: boolean;
login: (credentials: LoginCredentials) => Promise<boolean>;
register: (userData: RegisterData) => Promise<boolean>;
logout: () => void;
isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
const context = useContext(AuthContext);
if (context === undefined) {
throw new Error('useAuth must be used within an AuthProvider');
}
return context;
};

interface AuthProviderProps {
children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
const [user, setUser] = useState<AuthUser | null>(null);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
const token = localStorage.getItem('token');
const userData = localStorage.getItem('user');

if (token && userData) {
    try {
    setUser(JSON.parse(userData));
    } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    }
}
setIsLoading(false);
}, []);

const login = async (credentials: LoginCredentials): Promise<boolean> => {
try {
    setIsLoading(true);
    const response = await authAPI.login(credentials);
    
    if (response.success) {
    const { token, user: userData } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    toast.success('Login successful!');
    
    // Redirect to dashboard after successful login
    window.location.href = '/dashboard';
    return true;
    } else {
    toast.error(response.message || 'Login failed');
    return false;
    }
} catch (error: any) {
    toast.error(error.response?.data?.message || 'Login failed');
    return false;
} finally {
    setIsLoading(false);
}
};

const register = async (userData: RegisterData): Promise<boolean> => {
try {
    setIsLoading(true);
    const response = await authAPI.register(userData);
    
    if (response.success) {
    const { token, user: newUser } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
    toast.success('Registration successful!');
    
    // Redirect to dashboard after successful registration
    window.location.href = '/dashboard';
    return true;
    } else {
    toast.error(response.message || 'Registration failed');
    return false;
    }
} catch (error: any) {
    toast.error(error.response?.data?.message || 'Registration failed');
    return false;
} finally {
    setIsLoading(false);
}
};

const logout = () => {
authAPI.logout();
setUser(null);
toast.success('Logged out successfully');
};

const value: AuthContextType = {
user,
isLoading,
login,
register,
logout,
isAuthenticated: !!user,
};

return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};