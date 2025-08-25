import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
CreditCard, Wallet, DollarSign, Clock, 
CheckCircle, XCircle, AlertCircle, Smartphone, X, Loader
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PaymentForm {
amount: string;
phone: string;
description: string;
method: 'mtn' | 'orange';
}

interface PaymentModalProps {
isOpen: boolean;
onClose: () => void;
type: 'rent' | 'tokens' | 'general';
amount?: number;
propertyTitle?: string;
tokenQuantity?: number;
onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
isOpen,
onClose,
type,
amount,
propertyTitle,
tokenQuantity,
onPaymentSuccess,
}) => {
const [paymentForm, setPaymentForm] = useState<PaymentForm>({
  amount: amount?.toString() || '',
  phone: '',
  description: '',
  method: 'mtn'
});
const [isProcessing, setIsProcessing] = useState(false);
const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');

const handleCreatePayment = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!paymentForm.amount || !paymentForm.phone || !paymentForm.description) {
    toast.error('Please fill in all required fields');
    return;
  }

  setIsProcessing(true);
  setStep('processing');

  try {
    // Simulate CAMPAY API integration
    const campayData = {
      amount: paymentForm.amount,
      currency: "XAF",
      external_reference: `payment_${Date.now()}`,
      phone_number: paymentForm.phone,
      description: paymentForm.description,
      return_url: `${window.location.origin}/payments/success`,
      failure_url: `${window.location.origin}/payments/failure`
    };

    // Mock payment creation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    toast.success('Payment initiated successfully!');
    
    setTimeout(() => {
      setStep('success');
      toast.success('Payment completed successfully!');
      
      setTimeout(() => {
        onPaymentSuccess();
        onClose();
        resetForm();
      }, 2000);
    }, 1000);

  } catch (error) {
    console.error('Payment error:', error);
    toast.error('Payment failed. Please try again.');
    setStep('form');
  } finally {
    setIsProcessing(false);
  }
};

const resetForm = () => {
  setPaymentForm({
    amount: amount?.toString() || '',
    phone: '',
    description: '',
    method: 'mtn'
  });
  setStep('form');
};

const getTypeTitle = () => {
  switch (type) {
    case 'rent': return 'Pay Rent';
    case 'tokens': return 'Buy Tokens';
    default: return 'Make Payment';
  }
};

const getTypeDescription = () => {
  switch (type) {
    case 'rent':
      return propertyTitle ? `Property: ${propertyTitle}` : 'Rent Payment';
    case 'tokens':
      return tokenQuantity ? `${tokenQuantity} tokens` : 'Token Purchase';
    default:
      return 'Payment Request';
  }
};

return (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={() => !isProcessing && onClose()}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{getTypeTitle()}</h3>
                <p className="text-green-100 text-sm">{getTypeDescription()}</p>
              </div>
              {!isProcessing && (
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            {amount && (
              <p className="text-white font-bold text-xl mt-2">
                {amount.toLocaleString()} FCFA
              </p>
            )}
          </div>

          <div className="p-6">
            {step === 'form' && (
              <form onSubmit={handleCreatePayment} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (FCFA)
                  </label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                    required
                    min="100"
                    disabled={!!amount}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentForm.method}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, method: e.target.value as 'mtn' | 'orange' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="mtn">MTN Mobile Money</option>
                    <option value="orange">Orange Money</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={paymentForm.phone}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, phone: e.target.value }))}
                      required
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="6XXXXXXXX"
                      maxLength={9}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={paymentForm.description}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, description: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={3}
                    placeholder="Payment description..."
                  />
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Campay Integration:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Secure payment processing</li>
                    <li>• Real-time transaction status</li>
                    <li>• Support for all major mobile money providers</li>
                    <li>• Automatic payment confirmation</li>
                  </ul>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Create Payment'}
                  </button>
                </div>
              </form>
            )}

            {step === 'processing' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Loader className="w-8 h-8 text-green-600 animate-spin" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</h4>
                <p className="text-gray-600">Please wait while we process your payment...</p>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Payment Successful!</h4>
                <p className="text-gray-600 mb-4">
                  Your payment has been completed successfully.
                </p>
                <button
                  onClick={onClose}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
};

export default PaymentModal;
