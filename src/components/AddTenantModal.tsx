import React, { useState, useEffect } from 'react';
import { X, Mail, Home, Calendar, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { tenantsAPI, usersAPI } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
}

interface Property {
  id: string;
  title: string;
  location: string;
}

interface AddTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  properties: Property[];
  ownerId?: string;
}

interface TenantFormData {
  userId: string;
  propertyId: string;
  leaseStartDate: string;
  leaseEndDate: string;
  monthlyRent: number;
  depositAmount: number;
  emergencyContact?: string;
  occupation?: string;
  employer?: string;
}

const AddTenantModal: React.FC<AddTenantModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  properties
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<TenantFormData>({
    // resolver: zodResolver(tenantSchema)
  });

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      const usersData = await usersAPI.getAll();
      setUsers(usersData);
    } catch (err: unknown) {
      console.error('Failed to fetch users:', err);
    }
  };

  const onSubmit = async (data: TenantFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Convert date strings to Date objects and prepare JSON data
      const tenantData = {
        userId: data.userId,
        propertyId: data.propertyId,
        leaseStartDate: new Date(data.leaseStartDate),
        leaseEndDate: new Date(data.leaseEndDate),
        monthlyRent: data.monthlyRent,
        depositAmount: data.depositAmount,
        emergencyContact: data.emergencyContact || '',
        occupation: data.occupation || '',
        employer: data.employer || ''
      };

      await tenantsAPI.create(tenantData);

      reset();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to add tenant');
      } else if (typeof err === 'object' && err !== null && 'response' in err) {
        const errorResponse = err as { response?: { data?: { message?: string } } };
        setError(errorResponse.response?.data?.message || 'Failed to add tenant');
      } else {
        setError('Failed to add tenant');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Add New Tenant</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* User Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Select User</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <select
                  {...register('userId')}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a user</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.email} - {user.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.userId && (
                <p className="text-red-500 text-sm mt-1">{errors.userId.message}</p>
              )}
            </div>
          </div>

          {/* Property Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Property Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property
                </label>
                <div className="relative">
                  <Home className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <select
                    {...register('propertyId')}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a property</option>
                    {properties.map(property => (
                      <option key={property.id} value={property.id}>
                        {property.name} - {property.address}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.propertyId && (
                  <p className="text-red-500 text-sm mt-1">{errors.propertyId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Rent ($)
                </label>
                <input
                  {...register('monthlyRent', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1500.00"
                />
                {errors.monthlyRent && (
                  <p className="text-red-500 text-sm mt-1">{errors.monthlyRent.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lease Start Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    {...register('leaseStartDate')}
                    type="date"
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {errors.leaseStartDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.leaseStartDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lease End Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    {...register('leaseEndDate')}
                    type="date"
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {errors.leaseEndDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.leaseEndDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deposit Amount ($)
                </label>
                <input
                  {...register('depositAmount', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1500.00"
                />
                {errors.depositAmount && (
                  <p className="text-red-500 text-sm mt-1">{errors.depositAmount.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact
                </label>
                <input
                  {...register('emergencyContact')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Name and phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Occupation
                </label>
                <input
                  {...register('occupation')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employer
                </label>
                <input
                  {...register('employer')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tech Company Inc."
                />
              </div>
            </div>
          </div>

          {/* Documents */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Documents</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Documents
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="documents"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload files</span>
                      <input
                        id="documents"
                        name="documents"
                        type="file"
                        multiple
                        className="sr-only"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, JPG, PNG, DOC up to 10MB
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
        >
            Cancel
        </button>
        <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isLoading ? 'Adding...' : 'Add Tenant'}
        </button>
        </div>
    </form>
    </div>
</div>
);
};

export default AddTenantModal;
