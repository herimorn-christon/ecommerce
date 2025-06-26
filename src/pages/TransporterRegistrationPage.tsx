import React from "react";
import TransporterRegistrationForm from "../components/auth/TransporterRegistrationForm";

const TransporterRegistrationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900">
          Join Our Delivery Network
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          Register as a transporter and start delivering products to customers
        </p>
      </div>
      <TransporterRegistrationForm />
    </div>
  );
};

export default TransporterRegistrationPage;
