import {
  Home,
  LayoutDashboard,
  Package,
  Settings,
  TruckIcon,
  User,
} from "lucide-react";
import React, { useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../redux/hooks";

const TransporterLayout: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const isUserTransporter = user?.roles?.includes("transporter");

  // Redirect if not authenticated or not a transporter
  useEffect(() => {
    if (!isAuthenticated || !isUserTransporter) {
      navigate("/login");
    }
  }, [isAuthenticated, isUserTransporter, navigate]);

  if (!isAuthenticated || !isUserTransporter) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <TruckIcon className="mr-2 text-primary-600" size={20} />
            Transporter Portal
          </h2>
        </div>

        <nav className="p-4">
          <ul className="space-y-1">
            <li>
              <NavLink
                to="/transporter/dashboard"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md ${
                    isActive
                      ? "bg-primary-50 text-primary-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <LayoutDashboard size={18} className="mr-2" />
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/transporter/deliveries"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md ${
                    isActive
                      ? "bg-primary-50 text-primary-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <Package size={18} className="mr-2" />
                Deliveries
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/transporter/profile"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md ${
                    isActive
                      ? "bg-primary-50 text-primary-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <User size={18} className="mr-2" />
                Profile
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/transporter/settings"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md ${
                    isActive
                      ? "bg-primary-50 text-primary-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <Settings size={18} className="mr-2" />
                Settings
              </NavLink>
            </li>
          </ul>

          <div className="border-t border-gray-200 mt-6 pt-6">
            <Link
              to="/"
              className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              <Home size={18} className="mr-2" />
              Back to Home
            </Link>
          </div>
        </nav>
      </aside>

      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 md:hidden z-10">
        <NavLink
          to="/transporter/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center px-3 py-1 ${
              isActive ? "text-primary-600" : "text-gray-600"
            }`
          }
        >
          <LayoutDashboard size={20} />
          <span className="text-xs mt-1">Dashboard</span>
        </NavLink>
        <NavLink
          to="/transporter/deliveries"
          className={({ isActive }) =>
            `flex flex-col items-center px-3 py-1 ${
              isActive ? "text-primary-600" : "text-gray-600"
            }`
          }
        >
          <Package size={20} />
          <span className="text-xs mt-1">Deliveries</span>
        </NavLink>
        <NavLink
          to="/transporter/profile"
          className={({ isActive }) =>
            `flex flex-col items-center px-3 py-1 ${
              isActive ? "text-primary-600" : "text-gray-600"
            }`
          }
        >
          <User size={20} />
          <span className="text-xs mt-1">Profile</span>
        </NavLink>
        <NavLink
          to="/transporter/settings"
          className={({ isActive }) =>
            `flex flex-col items-center px-3 py-1 ${
              isActive ? "text-primary-600" : "text-gray-600"
            }`
          }
        >
          <Settings size={20} />
          <span className="text-xs mt-1">Settings</span>
        </NavLink>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto pb-16 md:pb-0">
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default TransporterLayout;
