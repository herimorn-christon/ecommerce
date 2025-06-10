import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { clearCart } from '../../redux/slices/cartSlice';
import Button from '../common/Button';

interface CartSummaryProps {
  onCheckout: () => void;
}

const CartSummary: React.FC<CartSummaryProps> = ({ onCheckout }) => {
  const { items, total } = useAppSelector(state => state.cart);
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // Calculate subtotal (same as total since we don't have taxes or shipping yet)
  const subtotal = total;
  
  // Let's assume delivery fee is fixed for now
  const deliveryFee = 5000; // TZS 5,000
  
  // Total with delivery
  const totalWithDelivery = subtotal + deliveryFee;
  
  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      dispatch(clearCart());
    }
  };
  
  const handleCheckout = () => {
    if (!isAuthenticated) {
      if (window.confirm('You need to login before checkout. Go to login page?')) {
        navigate('/login');
      }
      return;
    }
    
    onCheckout();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
      
      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between py-2">
          <span className="text-gray-600">Subtotal ({items.length} items)</span>
          <span className="font-medium">TZS {subtotal.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between py-2">
          <span className="text-gray-600">Delivery Fee</span>
          <span className="font-medium">TZS {deliveryFee.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between py-3 border-t border-gray-200 mt-2">
          <span className="text-lg font-bold text-gray-800">Total</span>
          <span className="text-lg font-bold text-blue-700">TZS {totalWithDelivery.toLocaleString()}</span>
        </div>
      </div>
      
      <div className="mt-6 space-y-3">
        <Button
          onClick={handleCheckout}
          variant="primary"
          fullWidth
          disabled={items.length === 0}
        >
          Proceed to Checkout
        </Button>
        
        <Button
          onClick={handleClearCart}
          variant="outline"
          fullWidth
          disabled={items.length === 0}
        >
          Clear Cart
        </Button>
      </div>
    </div>
  );
};

export default CartSummary;