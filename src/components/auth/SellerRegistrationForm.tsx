import { AtSign, Mail, Phone, User } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { clearAuthError, registerSeller } from "../../redux/slices/authSlice";
import Button from "../common/Button";
import TextField from "../common/TextField";

const SellerRegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    sellerType: "individual" as const,
  });

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, otpSent } = useAppSelector((state) => state.auth);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Format phone number if necessary
    let formattedPhone = formData.phoneNumber;
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = `+${formattedPhone}`;
    }

    // Create the request payload
    const requestData = {
      ...formData,
      phoneNumber: formattedPhone,
    };

    try {
      await dispatch(registerSeller(requestData)).unwrap();
      // If successful, navigate to OTP verification
      navigate("/verify-otp");
    } catch (error) {
      console.error("Seller registration failed:", error);
      // Error will be displayed through Redux state
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Register as a Seller
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
              autoFocus
            />
          </div>

          <div className="mb-4">
            <TextField
              label="Phone Number"
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              placeholder="+255712345678"
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

          <div className="mb-4">
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

          <div className="mb-6">
            <label
              htmlFor="sellerType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Seller Type
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AtSign size={18} className="text-gray-400" />
              </div>
              <select
                id="sellerType"
                name="sellerType"
                value={formData.sellerType}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              >
                <option value="individual">Individual</option>
                <option value="company">Company</option>
                <option value="association">Association</option>
              </select>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
          >
            {isLoading ? "Registering..." : "Register as Seller"}
          </Button>

          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
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

export default SellerRegistrationForm;
