import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { loginWithPhone, clearAuthError } from '../../redux/slices/authSlice';
import Button from '../common/Button';
import TextField from '../common/TextField';
import { Phone } from 'lucide-react';

const LoginForm: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error, otpSent } = useAppSelector(state => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format phone number if needed
    let formattedPhone = phoneNumber;
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+${formattedPhone}`;
    }
    
    await dispatch(loginWithPhone(formattedPhone));
    
    // If OTP was sent successfully, navigate to OTP verification page
    if (otpSent) {
      navigate('/verify-otp');
    }
  };

  const handleLoginSuccess = () => {
    // Get return URL from query params
    const params = new URLSearchParams(location.search);
    const returnUrl = params.get('returnUrl');
    
    // Navigate to return URL or default route
    navigate(returnUrl || '/');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Login to Your Account
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
          <div className="mb-6">
            <TextField
              label="Phone Number"
              type="tel"
              id="phoneNumber"
              placeholder="+255782322814"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              startIcon={<Phone size={18} />}
              fullWidth
              required
              autoFocus
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter your phone number with country code (e.g., +255).
            </p>
          </div>
          
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
          >
            {isLoading ? 'Sending OTP...' : 'Login with Phone'}
          </Button>
          
          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Register
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;