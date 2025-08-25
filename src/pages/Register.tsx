import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Phone, Wallet, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RegisterData } from '../types';

const Register: React.FC = () => {
    const [formData, setFormData] = useState<RegisterData>({
        name: '',
        email: '',
        password: '',
        role: 'investor',
        walletAddress: '',
        phone: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const success = await register(formData);
        if (success) {
            navigate('/');
        } else {
            setError('Registration failed. Please try again.');
        }
        setIsLoading(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const inputVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-700 flex items-center justify-center px-4 py-12">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="relative w-full max-w-lg"
            >
                <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-10 border border-gray-100/30">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <Link to="/" className="inline-flex items-center justify-center mb-6">
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg"
                            >
                                <Home className="w-7 h-7 text-white" />
                            </motion.div>
                        </Link>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">Join Green</h1>
                        <p className="text-gray-600 text-lg">Create your account to start investing</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-xl"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <motion.div variants={inputVariants} initial="hidden" animate="visible">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 placeholder-gray-400"
                                    placeholder="Enter your full name"
                                    required
                                    aria-required="true"
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={inputVariants} initial="hidden" animate="visible">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 placeholder-gray-400"
                                    placeholder="Enter your email"
                                    required
                                    aria-required="true"
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={inputVariants} initial="hidden" animate="visible">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-14 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 placeholder-gray-400"
                                    placeholder="Create a password"
                                    required
                                    minLength={6}
                                    aria-required="true"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </motion.div>

                        <motion.div variants={inputVariants} initial="hidden" animate="visible">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Account Type</label>
                            <div className="relative">
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 appearance-none"
                                    required
                                    aria-required="true"
                                >
                                    <option value="investor">Investor</option>
                                    <option value="tenant">Tenant</option>
                                    <option value="manager">Property Manager</option>
                                </select>
                                <div className="absolute right-4 top-3.5 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div variants={inputVariants} initial="hidden" animate="visible">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number (Optional)</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 placeholder-gray-400"
                                    placeholder="Enter your phone number"
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={inputVariants} initial="hidden" animate="visible">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Wallet Address (Optional)</label>
                            <div className="relative">
                                <Wallet className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="walletAddress"
                                    value={formData.walletAddress}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 placeholder-gray-400"
                                    placeholder="0x..."
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={inputVariants} initial="hidden" animate="visible" className="flex items-center">
                            <input
                                type="checkbox"
                                className="w-4 h-4 text-emerald-600 border-gray-200 rounded focus:ring-emerald-500"
                                required
                                aria-required="true"
                            />
                            <span className="ml-2 text-sm text-gray-600">
                                I agree to the{' '}
                                <Link to="/terms" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link to="/privacy" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                                    Privacy Policy
                                </Link>
                            </span>
                        </motion.div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3.5 px-4 rounded-xl font-semibold text-white transition-all duration-300 shadow-md ${
                                isLoading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-lg'
                            }`}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                                    Creating Account...
                                </div>
                            ) : (
                                'Create Account'
                            )}
                        </motion.button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-600 text-sm">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-emerald-600 hover:text-emerald-700 font-semibold"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;