import {
  LayoutDashboard as BarChart3,
  ChevronRight,
  Home,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  User,
} from "lucide-react";
import React from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAppSelector } from "../../redux/hooks";

const SellerLayout: React.FC = () => {
  const { pathname } = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const { profile } = useAppSelector((state) => state.seller);
  const navigate = useNavigate();

  const navigation = [
    {
      name: "Dashboard",
      path: "/seller/dashboard",
      icon: <BarChart3 size={20} />,
    },
    {
      name: "Orders",
      path: "/seller/orders",
      icon: <ShoppingBag size={20} />,
    },
    {
      name: "Products",
      path: "/seller/products",
      icon: <Package size={20} />,
    },
    {
      name: "Settings",
      path: "/seller/settings",
      icon: <Settings size={20} />,
    },
  ];

  const isActive = (path: string) => {
    return pathname === path;
  };

  // Get the current page title based on the path
  const getPageTitle = () => {
    const route = navigation.find((item) => pathname === item.path);
    return route ? route.name : "Dashboard";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - hidden on mobile */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200 fixed top-16 bottom-0 hidden md:flex flex-col z-30">
        <div className="py-4 px-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-primary-600 flex items-center">
            <Package className="mr-2" /> Seller Hub
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          {/* Navigation */}
          <nav className="space-y-1">
            {navigation.map((item) => {
              // Don't show restricted items if profile isn't verified
              // if (
              //   item.requiresVerification &&
              //   (!profile || !profile.isVerified)
              // ) {
              //   return null;
              // }

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.path)
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span
                    className={`mr-3 ${
                      isActive(item.path) ? "text-primary-500" : "text-gray-500"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Profile section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center px-3">
              <div className="flex-shrink-0">
                <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center">
                  <User size={18} className="text-primary-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || "Seller"}
                </p>
                <p className="text-xs text-gray-500">
                  {profile?.isVerified
                    ? "Verified Seller"
                    : "Pending Verification"}
                </p>
              </div>
            </div>

            {/* Logout option */}
            <button
              onClick={() => navigate("/logout")}
              className="mt-4 w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md"
            >
              <LogOut size={18} className="mr-3 text-gray-500" />
              Log out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 w-full mt-0">
        {/* Breadcrumb navigation */}
        <div className="bg-white border-b border-gray-200 py-3 px-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-primary-600">
              <Home size={16} />
            </Link>
            <ChevronRight size={14} />
            <Link to="/seller/dashboard" className="hover:text-primary-600">
              Seller
            </Link>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium">{getPageTitle()}</span>
          </div>
        </div>

        <div className="p-6 pb-16 md:pb-6">
          <Outlet />
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 flex justify-around z-40">
        <NavLink
          to="/seller/dashboard"
          className={({ isActive }: { isActive: boolean }) =>
            `flex flex-col items-center py-2 px-3 ${
              isActive ? "text-primary-600" : "text-gray-500"
            }`
          }
        >
          <BarChart3 size={20} />
          <span className="text-xs mt-1">Dashboard</span>
        </NavLink>

        {profile?.isVerified && (
          <>
            <NavLink
              to="/seller/orders"
              className={({ isActive }: { isActive: boolean }) =>
                `flex flex-col items-center py-2 px-3 ${
                  isActive ? "text-primary-600" : "text-gray-500"
                }`
              }
            >
              <ShoppingBag size={20} />
              <span className="text-xs mt-1">Orders</span>
            </NavLink>

            <NavLink
              to="/seller/products"
              className={({ isActive }: { isActive: boolean }) =>
                `flex flex-col items-center py-2 px-3 ${
                  isActive ? "text-primary-600" : "text-gray-500"
                }`
              }
            >
              <Package size={20} />
              <span className="text-xs mt-1">Products</span>
            </NavLink>
          </>
        )}

        <NavLink
          to="/seller/settings"
          className={({ isActive }: { isActive: boolean }) =>
            `flex flex-col items-center py-2 px-3 ${
              isActive ? "text-primary-600" : "text-gray-500"
            }`
          }
        >
          <Settings size={20} />
          <span className="text-xs mt-1">Settings</span>
        </NavLink>
      </div>
    </div>
  );
};

export default SellerLayout;
