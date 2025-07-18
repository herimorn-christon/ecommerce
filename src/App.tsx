import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import ScrollToTop from "./components/common/ScrollToTop";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import SellerLayout from "./components/layout/SellerLayout";
import TransporterLayout from "./components/layout/TransporterLayout";
import AboutPage from "./pages/AboutPage";
import AuthPage from "./pages/AuthPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import ContactPage from "./pages/ContactPage";
import FAQPage from "./pages/FAQPage";
import HomePage from "./pages/HomePage";
import OrderCheckoutPage from "./pages/OrderCheckoutPage";
import PaymentPage from "./pages/PaymentPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProductsPage from "./pages/ProductsPage";
import ProfilePage from "./pages/ProfilePage";
import AddProductPage from "./pages/seller/AddProductPage";
import RequestPayoutPage from "./pages/seller/RequestPayoutPage";
import SellerDashboardPage from "./pages/seller/SellerDashboardPage";
import SellerOrderDetailPage from "./pages/seller/SellerOrderDetailPage";
import SellerOrdersPage from "./pages/seller/SellerOrdersPage";
import SellerPayoutsPage from "./pages/seller/SellerPayoutsPage";
import SellerProductDetailPage from "./pages/seller/SellerProductDetailPage";
import SellerProductsPage from "./pages/seller/SellerProductsPage";
import SellerProfileFormPage from "./pages/seller/SellerProfileFormPage";
import SellerSettingsPage from "./pages/seller/SellerSettingsPage";
import SellerRegistrationPage from "./pages/SellerRegistrationPage";
import TransporterDashboardPage from "./pages/transporter/TransporterDashboardPage";
import TransporterDeliveriesPage from "./pages/transporter/TransporterDeliveriesPage";
import TransporterOrderDetailPage from "./pages/transporter/TransporterOrderDetailPage";
import TransporterProfileEditPage from "./pages/transporter/TransporterProfileEditPage";
import TransporterProfilePage from "./pages/transporter/TransporterProfilePage";
import TransporterRegistrationPage from "./pages/TransporterRegistrationPage";
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
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Header />

        <main className="flex-grow pt-16 relative">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />
            <Route
              path="/register-seller"
              element={<SellerRegistrationPage />}
            />
            <Route
              path="/register-transporter"
              element={<TransporterRegistrationPage />}
            />
            <Route path="/verify-otp" element={<AuthPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQPage />} />
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
            {/* Seller Routes with SellerLayout */}
            <Route
              path="/seller"
              element={
                <ProtectedRoute>
                  <SellerLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<SellerDashboardPage />} />
              <Route path="orders" element={<SellerOrdersPage />} />
              <Route path="orders/:id" element={<SellerOrderDetailPage />} />
              <Route path="products" element={<SellerProductsPage />} />
              <Route path="products/add" element={<AddProductPage />} />
              <Route path="products/edit/:id" element={<AddProductPage />} />
              <Route
                path="products/view/:id"
                element={<SellerProductDetailPage />}
              />
              <Route path="payouts" element={<SellerPayoutsPage />} />
              <Route path="payouts/request" element={<RequestPayoutPage />} />
              <Route path="settings" element={<SellerSettingsPage />} />
              <Route
                path="profile/create"
                element={<SellerProfileFormPage />}
              />
              <Route path="profile/edit" element={<SellerProfileFormPage />} />
              <Route path="payouts" element={<SellerPayoutsPage />} />
              <Route path="payouts/request" element={<RequestPayoutPage />} />
              <Route
                index
                element={<Navigate to="/seller/dashboard" replace />}
              />
            </Route>

            {/* Legacy dashboard route - redirect to new seller dashboard */}
            <Route
              path="/dashboard"
              element={<Navigate to="/seller/dashboard" replace />}
            />

            {/* Legacy seller profile create route - redirect to new route */}
            <Route
              path="/seller-profile/create"
              element={<Navigate to="/seller/profile/create" replace />}
            />

            {/* Transporter Routes with TransporterLayout */}
            <Route
              path="/transporter"
              element={
                <ProtectedRoute>
                  <TransporterLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<TransporterDashboardPage />} />
              <Route
                path="deliveries"
                element={<TransporterDeliveriesPage />}
              />
              <Route
                path="orders/:orderId"
                element={<TransporterOrderDetailPage />}
              />
              <Route path="profile" element={<TransporterProfilePage />} />
              <Route
                path="profile/edit"
                element={<TransporterProfileEditPage />}
              />
              <Route
                index
                element={<Navigate to="/transporter/dashboard" replace />}
              />
            </Route>
          </Routes>
        </main>

        {/* Footer is conditionally displayed - not shown in seller layout */}
        <div className="mt-auto">
          <Footer />
        </div>
      </div>
      <Toaster position="bottom-right" />
    </Router>
  );
}

export default App;
