import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { blockchainAPI } from '../services/api';
import toast from 'react-hot-toast';

interface BlockchainUploadProps {
  propertyId: string;
  propertyData: {
    title: string;
    valuation: number;
    monthlyRent: number;
    ownerWallet?: string;
  };
  onSuccess?: (result: any) => void;
  onCancel?: () => void;
}

const BlockchainUpload: React.FC<BlockchainUploadProps> = ({
  propertyId,
  propertyData,
  onSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    ownerWallet: propertyData.ownerWallet || user?.walletAddress || '',
    ipfsMetadata: `QmProperty${propertyId}`, // Placeholder IPFS hash
    valuation: propertyData.valuation,
    monthlyRent: propertyData.monthlyRent
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'valuation' || name === 'monthlyRent' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.ownerWallet) {
      toast.error('Owner wallet address is required');
      return;
    }

    if (formData.valuation <= 0 || formData.monthlyRent <= 0) {
      toast.error('Valuation and monthly rent must be greater than 0');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await blockchainAPI.uploadPropertyToBlockchain(formData);
      
      if (result.success) {
        toast.success('Property uploaded to blockchain successfully!');
        onSuccess?.(result.data);
      } else {
        toast.error(result.message || 'Failed to upload property to blockchain');
      }
    } catch (error: any) {
      console.error('Blockchain upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload property to blockchain');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Upload Property to Blockchain
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Property Title
          </label>
          <input
            type="text"
            value={propertyData.title}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Owner Wallet Address *
          </label>
          <input
            type="text"
            name="ownerWallet"
            value={formData.ownerWallet}
            onChange={handleInputChange}
            placeholder="0x..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            IPFS Metadata Hash
          </label>
          <input
            type="text"
            name="ipfsMetadata"
            value={formData.ipfsMetadata}
            onChange={handleInputChange}
            placeholder="Qm..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Property Valuation (ETH) *
          </label>
          <input
            type="number"
            name="valuation"
            value={formData.valuation}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monthly Rent (ETH) *
          </label>
          <input
            type="number"
            name="monthlyRent"
            value={formData.monthlyRent}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Blockchain Transaction
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  This will create a new ERC-721 token on the blockchain representing this property.
                  The transaction may take a few moments to complete.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </div>
            ) : (
              'Upload to Blockchain'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlockchainUpload; 