import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { registerSeller, clearAuthError } from '../../redux/slices/authSlice';
import Button from '../common/Button';
import TextField from '../common/TextField';
import { User, Phone, Mail } from 'lucide-react';

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: ''
  });
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, otpSent } = useAppSelector(state => state.auth);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format phone number if needed
    let formattedPhone = formData.phoneNumber;
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+${formattedPhone}`;
    }
    
    const userData = {
      ...formData,
      phoneNumber: formattedPhone
    };
    
    await dispatch(registerSeller(userData));
    
    // If registration was successful and OTP was sent, navigate to OTP verification page
    if (otpSent) {
      navigate('/verify-otp');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Create a Seller Account
        </h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button 
              onClick={() => dispatch(clearAuthError())}
              className="float-right text-red-700 hover:text-red-900"
            >
              &times;
            </button>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <TextField
              label="Full Name"
              type="text"
              id="name"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              startIcon={<User size={18} />}
              fullWidth
              required
            />
          </div>
          
          <div className="mb-4">
            <TextField
              label="Phone Number"
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              placeholder="+255782322814"
              value={formData.phoneNumber}
              onChange={handleChange}
              startIcon={<Phone size={18} />}
              fullWidth
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter your phone number with country code (e.g., +255).
            </p>
          </div>
          
          <div className="mb-6">
            <TextField
              label="Email Address"
              type="email"
              id="email"
              name="email"
              placeholder="john.doe@example.com"
              value={formData.email}
              onChange={handleChange}
              startIcon={<Mail size={18} />}
              fullWidth
              required
            />
          </div>
          
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </Button>
          
          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Login
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;