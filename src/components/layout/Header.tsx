import {
  Heart,
  LayoutDashboard,
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo/2.svg";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { logout } from "../../redux/slices/authSlice";
import { searchProducts } from "../../redux/slices/productsSlice";

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { items: cartItems } = useAppSelector((state) => state.cart);
  const wishlist = useAppSelector((state) => state.wishlist);
  const wishlistCount = wishlist?.count || 0;

  // Check if user has seller role
  const isUserSeller = user?.roles?.includes("seller");

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // We no longer need to fetch wishlist as it's stored locally
  useEffect(() => {
    // Wishlist is now handled locally through Redux and persisted to storage
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(searchProducts(searchTerm));
    navigate("/products");
  };

  return (
    <header className="bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <img
              src={logo}
              alt="TanfishMarket Logo"
              className="h-8 w-auto filter brightness-0 invert"
            />
            <span className="text-xl font-bold">TanFishMarket</span>
          </Link>

          <div className="hidden md:block flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search for fish products..."
                className="w-full py-2 px-4 pr-10 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-0 top-0 mt-2 mr-3 text-gray-600 hover:text-blue-500"
              >
                <Search size={20} />
              </button>
            </form>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            {/* Always visible icons */}
            <Link
              to="/wishlist"
              className="relative hover:text-blue-200 transition-colors"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="relative hover:text-blue-200 transition-colors"
            >
              <ShoppingCart size={20} />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {/* Account button or dropdown based on authentication status */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="flex items-center space-x-1 hover:text-blue-200 transition-colors"
                >
                  <User size={20} />
                  <span className="ml-1">Account</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-800 hover:bg-primary-50"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-gray-800 hover:bg-primary-50"
                    >
                      Orders
                    </Link>
                    {isUserSeller && (
                      <Link
                        to="/seller/dashboard"
                        className="block px-4 py-2 text-gray-800 hover:bg-primary-50"
                      >
                        Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-primary-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center bg-white text-primary-600 px-4 py-2 rounded-md font-medium hover:bg-primary-50 transition-colors"
              >
                <User size={18} className="mr-1" />
                Account
              </Link>
            )}
          </nav>

          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className="mt-3 md:hidden">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search for fish products..."
              className="w-full py-2 px-4 pr-10 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-0 top-0 mt-2 mr-3 text-gray-600 hover:text-blue-500"
            >
              <Search size={20} />
            </button>
          </form>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden mt-3 py-3 px-2 bg-primary-700 rounded-md">
            <Link
              to="/products"
              className="block py-2 hover:bg-primary-600 px-2 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>

            {/* Always visible on mobile menu regardless of auth status */}
            <Link
              to="/wishlist"
              className="block py-2 hover:bg-primary-600 px-2 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex items-center">
                <Heart size={20} className="mr-2" />
                <span>
                  Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                </span>
              </div>
            </Link>

            <Link
              to="/cart"
              className="block py-2 hover:bg-primary-600 px-2 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex items-center">
                <ShoppingCart size={20} className="mr-2" />
                <span>
                  Cart {cartItems.length > 0 && `(${cartItems.length})`}
                </span>
              </div>
            </Link>

            {/* Account options based on auth status */}
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="block py-2 hover:bg-primary-600 px-2 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <User size={20} className="mr-2" />
                    <span>Profile</span>
                  </div>
                </Link>

                <Link
                  to="/orders"
                  className="block py-2 hover:bg-primary-600 px-2 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Orders
                </Link>

                {isUserSeller && (
                  <Link
                    to="/seller/dashboard"
                    className="block py-2 hover:bg-primary-600 px-2 rounded"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <LayoutDashboard size={20} className="mr-2" />
                      <span>Dashboard</span>
                    </div>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full text-left block py-2 hover:bg-primary-600 px-2 rounded"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block py-2 mt-2 bg-white text-primary-600 px-2 rounded font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <User size={18} className="mr-2" />
                  <span>Account</span>
                </div>
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
