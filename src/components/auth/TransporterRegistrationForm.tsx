import { Mail, Phone, Truck, User } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  clearAuthError,
  registerTransporter,
} from "../../redux/slices/authSlice";
import Button from "../common/Button";
import TextField from "../common/TextField";

const TransporterRegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    businessName: "",
  });

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, otpSent } = useAppSelector((state) => state.auth);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let formattedPhone = formData.phoneNumber;
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = `+${formattedPhone}`;
    }

    const transporterData = {
      ...formData,
      phoneNumber: formattedPhone,
    };

    await dispatch(registerTransporter(transporterData));

    if (otpSent) {
      navigate("/verify-otp");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Register as Transporter
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
          <div className="space-y-4">
            <TextField
              label="Full Name"
              type="text"
              id="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              startIcon={<User size={18} />}
              fullWidth
              required
              autoFocus
            />

            <TextField
              label="Phone Number"
              type="tel"
              id="phoneNumber"
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

            <TextField
              label="Email"
              type="email"
              id="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              startIcon={<Mail size={18} />}
              fullWidth
              required
            />

            <TextField
              label="Business Name"
              type="text"
              id="businessName"
              placeholder="Fast Delivery Services"
              value={formData.businessName}
              onChange={handleChange}
              startIcon={<Truck size={18} />}
              fullWidth
              required
            />
          </div>

          <div className="mt-6">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
            >
              {isLoading ? "Registering..." : "Register as Transporter"}
            </Button>
          </div>

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

export default TransporterRegistrationForm;
