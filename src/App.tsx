import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import AuthPage from "./pages/AuthPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import OrderCheckoutPage from "./pages/OrderCheckoutPage";
import PaymentPage from "./pages/PaymentPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProductsPage from "./pages/ProductsPage";
import ProfilePage from "./pages/ProfilePage";
import SellerRegistrationPage from "./pages/SellerRegistrationPage";
import WishlistPage from "./pages/WishlistPage";
import { useAppDispatch, useAppSelector } from "./redux/hooks";
import { fetchUserProfile } from "./redux/slices/authSlice";
import { webSocketService } from "./services/webSocketService";

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

function App() {
  const dispatch = useAppDispatch();

  // Initialize WebSocket connection
  useEffect(() => {
    webSocketService.connect();

    // Cleanup on unmount
    return () => {
      webSocketService.disconnect();
    };
  }, []);

  // Check if user is authenticated on app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />
            <Route
              path="/register-seller"
              element={<SellerRegistrationPage />}
            />
            <Route path="/verify-otp" element={<AuthPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

            {/* Protected routes */}
            <Route
              path="/wishlist"
              element={
                <ProtectedRoute>
                  <WishlistPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout/payment"
              element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout/payment/:orderId"
              element={
                <ProtectedRoute>
                  <OrderCheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        <Footer />
      </div>
      <Toaster position="bottom-right" />
    </Router>
  );
}

export default App;
