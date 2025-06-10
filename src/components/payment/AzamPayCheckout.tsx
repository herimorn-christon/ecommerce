import React, { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { initiatePayment, checkPaymentStatus } from '../../redux/slices/ordersSlice';
import { toast } from 'react-toastify';
import Button from '../common/Button';
import TextField from '../common/TextField';
import { Phone, AlertCircle, CheckCircle, XCircle, Loader } from 'lucide-react';

interface AzamPayCheckoutProps {
  amount: number;
  orderId?: string;
  onPaymentComplete: () => void;
  onPaymentFailed: () => void;
}

const AzamPayCheckout: React.FC<AzamPayCheckoutProps> = ({
  amount,
  orderId,
  onPaymentComplete,
  onPaymentFailed
}) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { paymentReference, paymentStatus, isLoading } = useAppSelector(state => state.orders);
  
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [phoneError, setPhoneError] = useState('');
  const [isPolling, setIsPolling] = useState(false);
  
  // Validate phone number
  const validatePhoneNumber = (phone: string): boolean => {
    // Basic validation for Tanzania phone numbers
    const tanzanianPhoneRegex = /^(255|0)[67]\d{8}$/;
    if (!tanzanianPhoneRegex.test(phone)) {
      setPhoneError('Please enter a valid Tanzanian phone number (e.g., 255712345678)');
      return false;
    }
    
    setPhoneError('');
    return true;
  };
  
  // Format phone number to ensure it starts with 255
  const formatPhoneNumber = (phone: string): string => {
    if (phone.startsWith('0')) {
      return '255' + phone.substring(1);
    }
    return phone;
  };
  
  // Poll for payment status
  const pollPaymentStatus = useCallback((reference: string) => {
    if (!reference) return;
    
    setIsPolling(true);
    
    const interval = setInterval(async () => {
      try {
        const action = await dispatch(checkPaymentStatus(reference));
        
        if (checkPaymentStatus.fulfilled.match(action)) {
          const status = action.payload.status;
          
          if (status === 'success') {
            clearInterval(interval);
            setIsPolling(false);
            toast.success('Payment completed successfully!');
            onPaymentComplete();
          } else if (status === 'failed') {
            clearInterval(interval);
            setIsPolling(false);
            toast.error('Payment failed. Please try again.');
            onPaymentFailed();
          }
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
      }
    }, 5000); // Check every 5 seconds
    
    // Clean up interval on component unmount
    return () => {
      clearInterval(interval);
      setIsPolling(false);
    };
  }, [dispatch, onPaymentComplete, onPaymentFailed]);
  
  // Start polling when payment reference is available
  useEffect(() => {
    if (paymentReference && paymentStatus === 'pending' && !isPolling) {
      const cleanup = pollPaymentStatus(paymentReference);
      return cleanup;
    }
  }, [paymentReference, paymentStatus, isPolling, pollPaymentStatus]);
  
  // Handle payment initiation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    if (!validatePhoneNumber(formattedPhone)) {
      return;
    }
    
    try {
      const result = await dispatch(initiatePayment({ 
        amount, 
        phone: formattedPhone,
        orderId
      })).unwrap();
      
      if (result.reference) {
        alert('Payment initiated. Please check your phone for payment prompt.');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to initiate payment');
      onPaymentFailed();
    }
  };
  
  // Render payment status
  const renderPaymentStatus = () => {
    if (!paymentStatus) return null;
    
    switch (paymentStatus) {
      case 'pending':
        return (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md flex items-center">
            <Loader size={20} className="text-amber-500 mr-2 animate-spin" />
            <div>
              <p className="font-medium text-amber-700">Payment Processing</p>
              <p className="text-sm text-amber-600">
                Please check your phone and complete the payment prompt.
              </p>
            </div>
          </div>
        );
        
      case 'success':
        return (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-center">
            <CheckCircle size={20} className="text-green-500 mr-2" />
            <div>
              <p className="font-medium text-green-700">Payment Successful</p>
              <p className="text-sm text-green-600">
                Your payment has been processed successfully.
              </p>
            </div>
          </div>
        );
        
      case 'failed':
        return (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center">
            <XCircle size={20} className="text-red-500 mr-2" />
            <div>
              <p className="font-medium text-red-700">Payment Failed</p>
              <p className="text-sm text-red-600">
                We couldn't process your payment. Please try again.
              </p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">AzamPay Mobile Money Payment</h3>
      
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <p className="text-gray-600">Amount to pay:</p>
          <p className="text-2xl font-bold text-blue-700">TZS {amount.toLocaleString()}</p>
        </div>
      </div>
      
      {paymentStatus !== 'success' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <TextField
              label="Mobile Money Number"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g., 255712345678"
              startIcon={<Phone size={18} />}
              error={phoneError}
              required
              disabled={isLoading || isPolling}
            />
            {!phoneError && (
              <p className="mt-1 text-sm text-gray-500">
                Enter your mobile money number (e.g., M-Pesa, Tigo Pesa, Airtel Money)
              </p>
            )}
          </div>
          
          <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-md flex items-start">
            <AlertCircle size={18} className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-700">
              You will receive a payment prompt on your mobile phone. Please follow the instructions to complete the payment.
            </p>
          </div>
          
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading || isPolling}
            disabled={isLoading || isPolling || paymentStatus === 'pending'}
          >
            {isLoading ? 'Processing...' : 'Pay Now'}
          </Button>
        </form>
      )}
      
      {renderPaymentStatus()}
    </div>
  );
};

export default AzamPayCheckout;