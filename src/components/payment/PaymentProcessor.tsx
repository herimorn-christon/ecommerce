import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { clearPaymentData } from '../../redux/slices/ordersSlice';
import AzamPayCheckout from './AzamPayCheckout';

interface PaymentProcessorProps {
  amount: number;
  orderId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PaymentProcessor: React.FC<PaymentProcessorProps> = ({ 
  amount, 
  orderId,
  onSuccess,
  onCancel
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const { paymentStatus } = useAppSelector(state => state.orders);
  
  // Clear payment data when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearPaymentData());
    };
  }, [dispatch]);
  
  // Handle payment completion
  const handlePaymentComplete = () => {
    setPaymentCompleted(true);
    
    if (onSuccess) {
      onSuccess();
    } else if (orderId) {
      navigate(`/orders/${orderId}`);
    } else {
      navigate('/orders');
    }
  };
  
  // Handle payment failure or cancellation
  const handlePaymentFailed = () => {
    if (onCancel) {
      onCancel();
    }
  };
  
  return (
    <div className="max-w-md mx-auto">
      {!paymentCompleted && (
        <AzamPayCheckout
          amount={amount}
          orderId={orderId}
          onPaymentComplete={handlePaymentComplete}
          onPaymentFailed={handlePaymentFailed}
        />
      )}
    </div>
  );
};

export default PaymentProcessor;