import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { verifyOtp, clearAuthError } from '../../redux/slices/authSlice';
import Button from '../common/Button';
import TextField from '../common/TextField';
import { KeyRound } from 'lucide-react';

const OtpVerificationForm: React.FC = () => {
  const [otpCode, setOtpCode] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated, tempPhoneNumber } = useAppSelector(state => state.auth);

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Redirect to login if no temp phone number
  useEffect(() => {
    if (!tempPhoneNumber) {
      navigate('/login');
    }
  }, [tempPhoneNumber, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tempPhoneNumber) {
      return;
    }
    
    await dispatch(verifyOtp({ phoneNumber: tempPhoneNumber, otpCode }));
    
    // Will automatically redirect if authentication is successful due to the effect above
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Verify OTP
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
        
        <div className="mb-4 text-center">
          <p className="text-gray-600">
            We've sent a verification code to <span className="font-medium">{tempPhoneNumber}</span>
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <TextField
              label="OTP Code"
              type="text"
              id="otpCode"
              placeholder="Enter the 6-digit code"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              startIcon={<KeyRound size={18} />}
              fullWidth
              required
              autoFocus
            />
          </div>
          
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </Button>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OtpVerificationForm;