import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import OtpVerificationForm from '../components/auth/OtpVerificationForm';
import logo from '../assets/logo/2.svg';

const AuthPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector(state => state.auth);
  
  // Add useEffect to handle redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/'); // Redirect to homepage when authenticated
    }
  }, [isAuthenticated, navigate]);

  const isRegisterPage = location.pathname === '/register';
  const isOtpVerificationPage = location.pathname === '/verify-otp';
  
  // Determine which form to render based on the current path
  const renderForm = () => {
    if (isRegisterPage) {
      return <RegisterForm />;
    } else if (isOtpVerificationPage) {
      return <OtpVerificationForm />;
    } else {
      return <LoginForm />;
    }
  };
  
  // Page title based on current form
  const getPageTitle = () => {
    if (isRegisterPage) {
      return 'Create an Account';
    } else if (isOtpVerificationPage) {
      return 'Verify OTP';
    } else {
      return 'Login to Your Account';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center">
            <img 
              src={logo} 
              alt="TanfishMarket Logo" 
              className="h-10 w-10 text-blue-600 filter brightness-0"
            />
            <span className="ml-2 text-2xl font-bold text-gray-800">Fish Market</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mt-4">{getPageTitle()}</h1>
        </div>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="md:grid md:grid-cols-5">
            {/* Left column - Image */}
            <div className="hidden md:block md:col-span-2 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-700 opacity-90"></div>
              {/* <img 
                src="https://images.pexels.com/photos/2824133/pexels-photo-2824133.jpeg" 
                alt="Fish Market" 
                className="h-full w-full object-cover"
              /> */}
              
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
                <h2 className="text-2xl font-bold mb-4">Welcome to Fish Market</h2>
                <p className="text-center text-blue-100 mb-6">
                  Tanzania's premier online marketplace for fresh, high-quality fish and seafood products.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <svg className="h-5 w-5 mr-2 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Fresh, high-quality fish</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 mr-2 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Fast delivery to your doorstep</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 mr-2 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Secure mobile money payments</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Right column - Form */}
            <div className="p-8 md:col-span-3">
              {renderForm()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;