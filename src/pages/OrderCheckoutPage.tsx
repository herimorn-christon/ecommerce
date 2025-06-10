import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { fetchOrderById } from '../redux/slices/ordersSlice';
import CheckoutPayment from '../components/checkout/CheckoutPayment';
import { Loader, AlertCircle } from 'lucide-react';

const OrderCheckoutPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedOrder, isLoading, error } = useAppSelector(state => state.orders);
  
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  
  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderById(orderId));
    }
  }, [dispatch, orderId]);
  
  const handlePaymentSuccess = () => {
    setPaymentCompleted(true);
    navigate(`/orders/${orderId}`);
  };
  
  const handlePaymentCancel = () => {
    navigate(`/orders/${orderId}`);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size={32} className="text-blue-600 animate-spin" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle size={24} className="text-red-500 mr-3" />
            <h2 className="text-xl font-semibold text-red-700">Error</h2>
          </div>
          <p className="mt-2 text-red-600">{error}</p>
          <button 
            onClick={() => navigate('/orders')}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            Go back to orders
          </button>
        </div>
      </div>
    );
  }
  
  if (!selectedOrder) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle size={24} className="text-yellow-500 mr-3" />
            <h2 className="text-xl font-semibold text-yellow-700">Order Not Found</h2>
          </div>
          <p className="mt-2 text-yellow-600">We couldn't find the order you're looking for.</p>
          <button 
            onClick={() => navigate('/orders')}
            className="mt-4 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors"
          >
            Go back to orders
          </button>
        </div>
      </div>
    );
  }
  
  // Calculate the total amount
  const totalAmount = selectedOrder.totalAmount || 0;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <CheckoutPayment
        orderId={orderId}
        amount={totalAmount}
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
      />
    </div>
  );
};

export default OrderCheckoutPage;