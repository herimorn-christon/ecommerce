import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { createOrder, fetchAddresses, createAddress } from '../../redux/slices/ordersSlice';
import { clearCart } from '../../redux/slices/cartSlice';
import { Address } from '../../types';
import Button from '../common/Button';
import TextField from '../common/TextField';
import { Phone, MapPin, CreditCard, Truck } from 'lucide-react';
import paymentService from '../../services/paymentService';

interface CheckoutFormProps {
  onBack: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onBack }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { items, total } = useAppSelector(state => state.cart);
  const { addresses, isLoading, error } = useAppSelector(state => {
    console.log('Redux State:', state.orders);
    return state.orders;
  });
  const { user } = useAppSelector(state => state.auth);
  
  // State for the form
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new'>('');
  const [deliveryOption, setDeliveryOption] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('mobile_money');
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isCreatingAddress, setIsCreatingAddress] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  
  // New address form
  const [newAddress, setNewAddress] = useState<Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>({
    fullName: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    region: '',
    district: '',
    postalCode: '',
    country: 'Tanzania',
    isDefault: false
  });
  
  // Fetch addresses when component mounts
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        await dispatch(fetchAddresses()).unwrap();
      } catch (err) {
        console.error('Failed to fetch addresses:', err);
      }
    };
    loadAddresses();
  }, [dispatch]);
  
  // Set default address if available
  useEffect(() => {
    if (addresses.length > 0) {
      const defaultAddress = addresses.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id as string);
      } else {
        setSelectedAddressId(addresses[0].id as string);
      }
    }
  }, [addresses]);
  
  // Set mobile number from user profile if available
  useEffect(() => {
    if (user?.phoneNumber) {
      setMobileMoneyNumber(user.phoneNumber);
    }
  }, [user]);
  
  const handleNewAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      const requiredFields = ['fullName', 'phoneNumber', 'addressLine1', 'city', 'region', 'district'];
      const missingFields = requiredFields.filter(field => !newAddress[field]);
      
      if (missingFields.length > 0) {
        alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Format phone number if needed
      let formattedPhone = newAddress.phoneNumber;
      if (!formattedPhone.startsWith('255')) {
        formattedPhone = formattedPhone.startsWith('0') 
          ? `255${formattedPhone.slice(1)}` 
          : `255${formattedPhone}`;
      }

      // Prepare address data
      const addressData = {
        ...newAddress,
        phoneNumber: formattedPhone
      };

      console.log('Creating new address:', addressData);
      
      const result = await dispatch(createAddress(addressData)).unwrap();
      console.log('Address created:', result);

      // Update selected address and close form
      setSelectedAddressId(result.id);
      setIsCreatingAddress(false);

      // Refresh addresses list
      dispatch(fetchAddresses());

    } catch (error: any) {
      console.error('Failed to create address:', error);
      alert(error.message || 'Failed to create address. Please try again.');
    }
  };

  const generateTransactionId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `clr${random}${timestamp.toString(36)}`;
  };

  // Calculate the total with delivery
  const getOrderTotal = () => {
    if (!items?.length) {
      console.error('No items in cart');
      return 0;
    }

    // Calculate items total
    const itemsTotal = items.reduce((sum, item) => {
      const price = Number(item.product.unitPrice);
      const quantity = Number(item.quantity);

      if (isNaN(price) || isNaN(quantity)) {
        console.error('Invalid price or quantity:', { price, quantity, item });
        return sum;
      }

      const itemTotal = price * quantity;
      return sum + itemTotal;
    }, 0);

    const deliveryFee = deliveryOption === 'express' ? 10000 : 5000;
    const finalTotal = Math.round(itemsTotal + deliveryFee);

    console.log('Order total calculation:', {
      itemsTotal,
      deliveryFee,
      finalTotal
    });

    return finalTotal;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentProcessing(true);

    try {
      // Calculate base total without delivery fee
      const baseTotal = items.reduce((sum, item) => {
        return sum + (Number(item.product.unitPrice) * Number(item.quantity));
      }, 0);

      // Get delivery fee
      const deliveryFee = deliveryOption === 'express' ? 10000 : 5000;
      
      // Log both totals for debugging
      console.log('Order totals:', {
        baseTotal,
        deliveryFee,
        fullTotal: baseTotal + deliveryFee
      });

      if (paymentMethod === 'mobile_money') {
        const formattedPhone = mobileMoneyNumber.startsWith('+') 
          ? mobileMoneyNumber.substring(1) 
          : mobileMoneyNumber;

        // Send base total without delivery fee to payment service
        const paymentResponse = await paymentService.initiatePayment(
          baseTotal, // Important: Only send base amount
          formattedPhone
        );

        console.log('Payment Response:', paymentResponse);

        // Wait for transaction to be processed
        await new Promise(resolve => setTimeout(resolve, 2000));

        const orderData = {
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          })),
          deliveryOption,
          paymentMethod: 'mobile_money',
          paymentDetails: {
            provider: 'M-Pesa',
            phoneNumber: formattedPhone
          },
          addressId: selectedAddressId,
          notes: notes || '',
          transactionId: paymentResponse.transactionId
        };

        console.log('Creating order with data:', orderData);
        const result = await dispatch(createOrder(orderData)).unwrap();

        if (!result?.id) {
          throw new Error('Order creation failed: no ID returned');
        }

        dispatch(clearCart());
        navigate(`/checkout/payment/${result.id}`);

      } else {
        // For cash on delivery, generate a new transaction ID
        const orderData = {
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          })),
          deliveryOption,
          paymentMethod: 'cash_on_delivery',
          paymentDetails: {
            provider: 'Cash',
            phoneNumber: ''
          },
          addressId: selectedAddressId,
          notes: notes || '',
          transactionId: `COD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };

        const result = await dispatch(createOrder(orderData)).unwrap();
        dispatch(clearCart());
        navigate(`/orders/${result.id}`);
      }

    } catch (error: any) {
      console.error('Order creation failed:', error);
      alert(error.message || 'Something went wrong while creating your order');
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Add this helper function at the top of the component
  const getLatestAddresses = (addresses: Address[]) => {
    return [...addresses]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 3);
  };

  // Add debug logging for addresses
  useEffect(() => {
    console.log('Current addresses:', addresses);
  }, [addresses]);

  return (
    <div>
      {/* Debug output */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-2 bg-gray-100 rounded">
          <p>Debug - Addresses count: {addresses?.length || 0}</p>
          <p>Loading: {isLoading ? 'true' : 'false'}</p>
          <p>Error: {error || 'none'}</p>
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {typeof error === 'string' ? error : 'Failed to load addresses. Please try again.'}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Delivery and Payment */}
          <div className="md:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <MapPin size={18} className="mr-2 text-blue-600" />
                Delivery Address
              </h3>
              
              {isLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <div>
                  {/* Show existing addresses first */}
                  {addresses.length > 0 && !isCreatingAddress && (
                    <div className="space-y-4 mb-4">
                      <div className="grid gap-4">
                        {getLatestAddresses(addresses).map(address => (
                          <label key={address.id} className="relative block">
                            <input
                              type="radio"
                              name="addressId"
                              value={address.id}
                              checked={selectedAddressId === address.id}
                              onChange={() => setSelectedAddressId(address.id as string)}
                              className="sr-only"
                            />
                            <div className={`
                              border rounded-lg p-4 cursor-pointer transition-all
                              ${selectedAddressId === address.id 
                                ? 'border-blue-500 ring-2 ring-blue-200' 
                                : 'border-gray-200 hover:border-gray-300'
                              }
                            `}>
                              <div className="font-medium">{address.fullName}</div>
                              <div className="text-gray-600 text-sm mt-1">
                                {address.addressLine1}
                                {address.addressLine2 && `, ${address.addressLine2}`}
                              </div>
                              <div className="text-gray-600 text-sm">
                                {address.district}, {address.city}, {address.region}
                              </div>
                              <div className="text-gray-600 text-sm">
                                {address.country} {address.postalCode && `, ${address.postalCode}`}
                              </div>
                              <div className="text-gray-600 text-sm mt-1">
                                {address.phoneNumber}
                              </div>
                              {address.isDefault && (
                                <span className="absolute top-2 right-2 text-xs font-medium text-blue-600">
                                  Default
                                </span>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                      
                      {addresses.length > 3 && (
                        <div className="text-sm text-gray-500 mt-2">
                          Showing 3 most recent addresses. Click "Add New Address" to create another.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Add New Address Button */}
                  {!isCreatingAddress && (
                    <Button
                      type="button"
                      onClick={() => setIsCreatingAddress(true)}
                      variant="outline"
                      className="w-full"
                    >
                      {addresses.length > 0 ? '+ Add New Address' : 'Add Your First Address'}
                    </Button>
                  )}

                  {/* Address Creation Form */}
                  {isCreatingAddress && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextField
                          label="Full Name"
                          name="fullName"
                          value={newAddress.fullName}
                          onChange={handleNewAddressChange}
                          required
                        />
                        
                        <TextField
                          label="Phone Number"
                          name="phoneNumber"
                          value={newAddress.phoneNumber}
                          onChange={handleNewAddressChange}
                          required
                        />
                      </div>
                      
                      <TextField
                        label="Address Line 1"
                        name="addressLine1"
                        value={newAddress.addressLine1}
                        onChange={handleNewAddressChange}
                        required
                      />
                      
                      <TextField
                        label="Address Line 2 (Optional)"
                        name="addressLine2"
                        value={newAddress.addressLine2 || ''}
                        onChange={handleNewAddressChange}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <TextField
                          label="City"
                          name="city"
                          value={newAddress.city}
                          onChange={handleNewAddressChange}
                          required
                        />
                        
                        <TextField
                          label="Region"
                          name="region"
                          value={newAddress.region}
                          onChange={handleNewAddressChange}
                          required
                        />
                        
                        <TextField
                          label="District"
                          name="district"
                          value={newAddress.district}
                          onChange={handleNewAddressChange}
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextField
                          label="Postal Code (Optional)"
                          name="postalCode"
                          value={newAddress.postalCode || ''}
                          onChange={handleNewAddressChange}
                        />
                        
                        <TextField
                          label="Country"
                          name="country"
                          value={newAddress.country}
                          onChange={handleNewAddressChange}
                          required
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isDefault"
                          name="isDefault"
                          checked={newAddress.isDefault}
                          onChange={handleNewAddressChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isDefault" className="ml-2 text-gray-700">
                          Set as default address
                        </label>
                      </div>
                      
                      <div className="flex space-x-3">
                        <Button
                          type="button"
                          onClick={handleCreateAddress}
                          variant="primary"
                        >
                          Save Address
                        </Button>
                        
                        <Button
                          type="button"
                          onClick={() => setIsCreatingAddress(false)}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Delivery Options */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Truck size={18} className="mr-2 text-blue-600" />
                Delivery Options
              </h3>
              
              <div className="space-y-3">
                <label className="relative flex items-start">
                  <input
                    type="radio"
                    name="deliveryOption"
                    value="standard"
                    checked={deliveryOption === 'standard'}
                    onChange={() => setDeliveryOption('standard')}
                    className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <span className="block font-medium text-gray-800">Standard Delivery</span>
                    <span className="block text-sm text-gray-500">Delivery within 24-48 hours</span>
                  </div>
                  <span className="ml-auto font-medium">TZS 5,000</span>
                </label>
                
                <label className="relative flex items-start">
                  <input
                    type="radio"
                    name="deliveryOption"
                    value="express"
                    checked={deliveryOption === 'express'}
                    onChange={() => setDeliveryOption('express')}
                    className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <span className="block font-medium text-gray-800">Express Delivery</span>
                    <span className="block text-sm text-gray-500">Delivery within 3-6 hours</span>
                  </div>
                  <span className="ml-auto font-medium">TZS 10,000</span>
                </label>
              </div>
            </div>
            
            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <CreditCard size={18} className="mr-2 text-blue-600" />
                Payment Method
              </h3>
              
              <div className="space-y-4">
                <label className="relative flex items-start">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="mobile_money"
                    checked={paymentMethod === 'mobile_money'}
                    onChange={() => setPaymentMethod('mobile_money')}
                    className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <span className="block font-medium text-gray-800">Mobile Money</span>
                    <span className="block text-sm text-gray-500">Pay using M-Pesa, Tigo Pesa, or Airtel Money</span>
                  </div>
                </label>
                
                {paymentMethod === 'mobile_money' && (
                  <div className="ml-7 mt-2">
                    <TextField
                      label="Mobile Money Number"
                      value={mobileMoneyNumber}
                      onChange={(e) => setMobileMoneyNumber(e.target.value)}
                      placeholder="e.g., 255712345678"
                      startIcon={<Phone size={18} />}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Format: 255XXXXXXXXX (without + or leading 0)
                    </p>
                  </div>
                )}
                
                <label className="relative flex items-start">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash_on_delivery"
                    checked={paymentMethod === 'cash_on_delivery'}
                    onChange={() => setPaymentMethod('cash_on_delivery')}
                    className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <span className="block font-medium text-gray-800">Cash on Delivery</span>
                    <span className="block text-sm text-gray-500">Pay when you receive your order</span>
                  </div>
                </label>
              </div>
            </div>
            
            {/* Order Notes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Notes (Optional)</h3>
              
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any special instructions or requests"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              ></textarea>
            </div>
          </div>
          
          {/* Right Column - Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="max-h-64 overflow-y-auto mb-4">
                  {items.map(item => (
                    <div key={item.productId} className="flex justify-between py-2 border-b border-gray-100">
                      <div>
                        <span className="text-gray-800">{item.product.name}</span>
                        <span className="text-gray-500 text-sm block">Qty: {item.quantity}</span>
                      </div>
                      <span className="font-medium">
                        TZS {(parseInt(item.product.unitPrice) * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    TZS {items.reduce((sum, item) => 
                      sum + (Number(item.product.unitPrice) * Number(item.quantity)), 
                    0).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">
                    TZS {(deliveryOption === 'express' ? 10000 : 5000).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between py-3 border-t border-gray-200 mt-2">
                  <span className="text-lg font-bold text-gray-800">Total</span>
                  <span className="text-lg font-bold text-blue-700">
                    TZS {getOrderTotal().toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading || paymentProcessing}
                  disabled={isLoading || paymentProcessing}
                >
                  {paymentProcessing ? 'Processing Payment...' : 'Place Order'}
                </Button>
                
                <Button
                  type="button"
                  onClick={onBack}
                  variant="outline"
                  fullWidth
                  disabled={paymentProcessing}
                >
                  Back to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutForm;