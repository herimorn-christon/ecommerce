import React from "react";
import { useNavigate } from "react-router-dom";
import CheckoutForm from "../components/checkout/CheckoutForm";
import { useAppSelector } from "../redux/hooks";

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items } = useAppSelector((state) => state.cart);

  // Check if cart is empty
  React.useEffect(() => {
    if (items.length === 0) {
      navigate("/cart");
    }
  }, [items.length, navigate]);

  const handleBackToCart = () => {
    navigate("/cart");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <CheckoutForm onBack={handleBackToCart} />
      </div>
    </div>
  );
};

export default CheckoutPage;
