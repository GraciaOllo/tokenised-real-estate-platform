import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { X, Percent, Package, Home, MapPin, Save, Camera, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { propertiesAPI } from '../../services/api';
import toast from 'react-hot-toast';

// Inline Property interface since types.ts is not available
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

interface PropertyForm {
    title: string;
    location: string;
    description: string;
    valuation: number;
    monthlyRent: number;
    expectedYield: number;
    tokenPercentage: number;
    tokenPrice: number;
    totalTokens: number;
    tokensForSale: number;
}

const AddProperty: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [images, setImages] = useState<File[]>([]);
    const [documents, setDocuments] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<PropertyForm>({
        defaultValues: {
            valuation: 0,
            monthlyRent: 0,
            expectedYield: 0,
            tokenPercentage: 0,
            tokenPrice: 0,
            totalTokens: 0,
            tokensForSale: 0,
        },
    });

    const valuation = watch('valuation');
    const tokenPercentage = watch('tokenPercentage');

    useEffect(() => {
        // Debug user data
        console.log('User from useAuth:', user);
        if (valuation && tokenPercentage) {
            const pricePerToken = valuation * (tokenPercentage / 100);
            setValue('tokenPrice', parseFloat(pricePerToken.toFixed(2)));
            setValue('totalTokens', Math.floor(valuation / pricePerToken));
            setValue('tokensForSale', Math.floor(valuation / pricePerToken));
        }
    }, [valuation, tokenPercentage, setValue, user]);

    const onSubmit = async (data: PropertyForm) => {
        if (!user) {
            toast.error('User not authenticated');
            return;
        }

        // Validate ownerId as UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const ownerId = user.id && uuidRegex.test(user.id) ? user.id : '00000000-0000-4000-8000-000000000000'; // Fallback UUID

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('location', data.location);
            formData.append('description', data.description);
            formData.append('valuation', String(data.valuation));
            formData.append('monthlyRent', String(data.monthlyRent));
            formData.append('expectedYield', String(data.expectedYield));
            formData.append('tokenPercentage', String(data.tokenPercentage));
            formData.append('tokenPrice', String(data.tokenPrice));
            formData.append('totalTokens', String(data.totalTokens));
            formData.append('tokensForSale', String(data.tokensForSale));
            formData.append('ownerId', ownerId);
            formData.append('ownerName', user.name || 'Anonymous Investor');
            formData.append('status', 'pending');
            images.forEach((img) => formData.append('images', img));
            documents.forEach((doc) => formData.append('documents', doc));

            // Log FormData for debugging
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }

            await propertiesAPI.create(formData);
            toast.success('Property Listed! Green: Your Path to Wealth!');
            reset();
            setImages([]);
            setDocuments([]);
            navigate('/manager/properties');
        } catch (error) {
            console.error('Error details:', error.response?.data || error.message);
            toast.error('Failed to submit: ' + (error.response?.data?.message || 'Invalid data provided'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImages([...images, ...Array.from(e.target.files)]);
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setDocuments([...documents, ...Array.from(e.target.files)]);
        }
    };

    const removeDocument = (index: number) => {
        setDocuments(documents.filter((_, i) => i !== index));
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 bg-gradient-to-br from-emerald-50 to-white rounded-2xl shadow-lg font-montserrat">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">List Property on Green</h1>
                <p className="text-gray-600 mt-2 text-lg">Launch Your Empire with Green!</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Information */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                            <Home className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900">Property Details</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Property Title *</label>
                            <input
                                {...register('title', { required: 'Property title is required' })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/50"
                                placeholder="Luxury Downtown Penthouse"
                            />
                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-emerald-500" />
                                <input
                                    {...register('location', { required: 'Location is required' })}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/50"
                                    placeholder="Douala, Cameroon"
                                />
                            </div>
                            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                        <textarea
                            {...register('description', { required: 'Description is required' })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/50"
                            rows={4}
                            placeholder="Describe your wealth-building asset..."
                        ></textarea>
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Valuation (FCFA) *</label>
                            <input
                                type="number"
                                {...register('valuation', {
                                    required: 'Valuation is required',
                                    min: { value: 1, message: 'Valuation must be positive' },
                                    valueAsNumber: true,
                                })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/50"
                            />
                            {errors.valuation && <p className="text-red-500 text-sm mt-1">{errors.valuation.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Token % of Valuation *</label>
                            <div className="relative">
                                <Percent className="absolute left-3 top-3.5 w-5 h-5 text-emerald-500" />
                                <input
                                    type="number"
                                    {...register('tokenPercentage', {
                                        required: 'Token percentage is required',
                                        min: { value: 1, message: 'Token percentage must be positive' },
                                        valueAsNumber: true,
                                    })}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/50"
                                />
                            </div>
                            {errors.tokenPercentage && <p className="text-red-500 text-sm mt-1">{errors.tokenPercentage.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Token Price (FCFA)</label>
                            <input
                                type="number"
                                {...register('tokenPrice', { valueAsNumber: true })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100"
                                readOnly
                            />
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Total Tokens</label>
                            <input
                                type="number"
                                {...register('totalTokens', { valueAsNumber: true })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100"
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tokens for Sale *</label>
                            <div className="relative">
                                <Package className="absolute left-3 top-3.5 w-5 h-5 text-emerald-500" />
                                <input
                                    type="number"
                                    {...register('tokensForSale', {
                                        required: 'Tokens for sale is required',
                                        min: { value: 1, message: 'Tokens for sale must be positive' },
                                        valueAsNumber: true,
                                    })}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/50"
                                />
                            </div>
                            {errors.tokensForSale && <p className="text-red-500 text-sm mt-1">{errors.tokensForSale.message}</p>}
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Rent (FCFA) *</label>
                            <input
                                type="number"
                                {...register('monthlyRent', {
                                    required: 'Monthly rent is required',
                                    min: { value: 1, message: 'Monthly rent must be positive' },
                                    valueAsNumber: true,
                                })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/50"
                            />
                            {errors.monthlyRent && <p className="text-red-500 text-sm mt-1">{errors.monthlyRent.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Expected Yield (%) *</label>
                            <input
                                type="number"
                                {...register('expectedYield', {
                                    required: 'Expected yield is required',
                                    min: { value: 0, message: 'Expected yield must be non-negative' },
                                    valueAsNumber: true,
                                })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/50"
                            />
                            {errors.expectedYield && <p className="text-red-500 text-sm mt-1">{errors.expectedYield.message}</p>}
                        </div>
                    </div>
                </div>

                {/* Media Uploads */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-gray-200">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Property Media</h2>
                    <p className="text-gray-600 mb-4 text-lg">Showcase Your Goldmine to Investors!</p>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images</label>
                        <div className="relative">
                            <Camera className="absolute left-3 top-3.5 w-5 h-5 text-emerald-500" />
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white/50"
                            />
                        </div>
                        <div className="mt-4 flex flex-wrap gap-4">
                            {images.map((file, index) => (
                                <div key={index} className="relative w-32 h-32 border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                                    <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload PDFs for Approval</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3.5 w-5 h-5 text-emerald-500" />
                            <input
                                type="file"
                                accept="application/pdf"
                                multiple
                                onChange={handleDocumentUpload}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white/50"
                            />
                        </div>
                        <ul className="mt-4 space-y-2">
                            {documents.map((file, index) => (
                                <li key={index} className="flex items-center justify-between border border-gray-300 p-3 rounded-lg bg-white/50">
                                    <span className="text-sm text-gray-700">{file.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeDocument(index)}
                                        className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate('/manager/properties')}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={isSubmitting}
                        className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-semibold text-white transition-all ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-md'}`}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                <span>Submitting...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                <span>List Your Asset, Win Big!</span>
                            </>
                        )}
                    </motion.button>
                </div>
            </form>
        </div>
    );
};

export default AddProperty;