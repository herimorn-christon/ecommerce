import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { initiatePayment, checkPaymentStatus } from '../../redux/slices/ordersSlice';
import Button from '../common/Button';
import TextField from '../common/TextField';
import { Phone } from 'lucide-react';

interface PaymentFormProps {
  amount: number;
  onPaymentComplete: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ amount, onPaymentComplete }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.auth);
  const { paymentReference, paymentStatus, isLoading } = useAppSelector(state => state.orders);
  
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [statusCheckInterval]);

  useEffect(() => {
    if (paymentStatus === 'success') {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
      toast.success('Payment completed successfully!');
      onPaymentComplete();
    } else if (paymentStatus === 'failed') {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
      toast.error('Payment failed. Please try again.');
    }
  }, [paymentStatus, statusCheckInterval, onPaymentComplete]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await dispatch(initiatePayment({ amount, phone: phoneNumber })).unwrap();
      
      if (result.reference) {
        // Start checking payment status every 5 seconds
        const interval = setInterval(() => {
          dispatch(checkPaymentStatus(result.reference));
        }, 5000);
        
        setStatusCheckInterval(interval);
        
        toast.info('Payment initiated. Please check your phone for payment prompt.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to initiate payment');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Mobile Money Payment</h3>
      
      <div className="mb-4">
        <p className="text-gray-600">Amount to pay:</p>
        <p className="text-2xl font-bold text-blue-700">TZS {amount.toLocaleString()}</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <TextField
            label="Mobile Money Number"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="e.g., 255712345678"
            startIcon={<Phone size={18} />}
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter your mobile money number (e.g., M-Pesa, Tigo Pesa, Airtel Money)
          </p>
        </div>
        
        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isLoading}
        >
          {isLoading ? 'Processing...' : 'Pay Now'}
        </Button>
      </form>
      
      {paymentStatus === 'pending' && (
        <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded-md">
          <p className="text-center">
            Please check your phone for the payment prompt and complete the transaction.
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentForm;