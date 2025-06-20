import { ArrowLeft, ShoppingCart } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import CartItem from "../components/cart/CartItem";
import CartSummary from "../components/cart/CartSummary";
import CheckoutForm from "../components/checkout/CheckoutForm";
import { useAppSelector } from "../redux/hooks";

const CartPage: React.FC = () => {
  const { items } = useAppSelector((state) => state.cart);
  const [isCheckout, setIsCheckout] = useState(false);

  const handleCheckout = () => {
    setIsCheckout(true);
  };

  const handleBackToCart = () => {
    setIsCheckout(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {isCheckout ? (
          <CheckoutForm onBack={handleBackToCart} />
        ) : (
          <>
            <div className="flex items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">
                {items.length > 0 ? "Your Cart" : "Your Cart is Empty"}
              </h1>
              <span className="ml-2 bg-primary-100 text-primary-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </div>

            {items.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="border-b border-gray-200 pb-3 mb-3">
                      <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800">
                          Cart Items
                        </h2>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {items.map((item) => (
                        <CartItem key={item.productId} item={item} />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <CartSummary onCheckout={handleCheckout} />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="mx-auto w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart size={32} className="text-primary-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Your cart is empty
                </h2>
                <p className="text-gray-600 mb-6">
                  Looks like you haven't added any fish products to your cart
                  yet.
                </p>
                <Link
                  to="/products"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  <ArrowLeft size={16} className="mr-1" /> Continue Shopping
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;
