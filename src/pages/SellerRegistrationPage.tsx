import React from "react";
import { Link } from "react-router-dom";
import SellerRegistrationForm from "../components/auth/SellerRegistrationForm";

const SellerRegistrationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block">
            <img src="/src/assets/logo/1.svg" alt="Logo" className="h-12" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mt-6">
            Join Our Seller Community
          </h1>
          <p className="text-gray-600 mt-2">
            Register your seller account to start selling your fish products
          </p>
        </div>

        <SellerRegistrationForm />

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            By registering, you agree to our{" "}
            <Link to="/terms" className="text-blue-600 hover:text-blue-800">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy-policy"
              className="text-blue-600 hover:text-blue-800"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SellerRegistrationPage;
