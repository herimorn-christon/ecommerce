import {
  Clock,
  Edit,
  Mail,
  MapPin,
  Phone,
  Route,
  ShieldCheck,
  Truck,
  User,
} from "lucide-react";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchCurrentTransporter } from "../../redux/slices/transporterSlice";

const TransporterProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { selectedTransporter, isLoading } = useAppSelector(
    (state) => state.transporter
  );
  const isUserTransporter = user?.roles?.includes("transporter");

  useEffect(() => {
    // Redirect if not authenticated or not a transporter
    if (!isAuthenticated || !isUserTransporter) {
      navigate("/login");
    }
  }, [isAuthenticated, isUserTransporter, navigate]);

  // Fetch transporter data on component mount
  useEffect(() => {
    if (isAuthenticated && isUserTransporter) {
      dispatch(fetchCurrentTransporter());
    }
  }, [dispatch, isAuthenticated, isUserTransporter]);

  if (!isAuthenticated || !isUserTransporter) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Transporter Profile
        </h1>
        <p className="text-gray-600 mt-2">
          View and manage your transporter account details
        </p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      ) : selectedTransporter ? (
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  {selectedTransporter.businessName}
                </h2>
                {selectedTransporter.isVerified ? (
                  <div className="flex items-center text-green-600 mt-2">
                    <ShieldCheck size={18} className="mr-1" />
                    <span className="text-sm font-medium">
                      Verified Transporter
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center text-yellow-600 mt-2">
                    <Clock size={18} className="mr-1" />
                    <span className="text-sm font-medium">
                      Pending Verification
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => navigate("/transporter/profile/edit")}
                className="flex items-center text-primary-600 hover:text-primary-800 font-medium"
              >
                <Edit size={16} className="mr-1" />
                Edit Profile
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800">
                  Business Information
                </h3>

                <div className="flex items-start">
                  <Truck className="w-5 h-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Business Name
                    </p>
                    <p className="text-gray-800">
                      {selectedTransporter.businessName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Business Address
                    </p>
                    <p className="text-gray-800">
                      {selectedTransporter.address || "Not provided"}
                    </p>
                    {selectedTransporter.district &&
                      selectedTransporter.region && (
                        <p className="text-gray-800">
                          {selectedTransporter.district},{" "}
                          {selectedTransporter.region}
                          {selectedTransporter.country
                            ? `, ${selectedTransporter.country}`
                            : ""}
                        </p>
                      )}
                  </div>
                </div>

                {selectedTransporter.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Description
                    </p>
                    <p className="text-gray-800 mt-1">
                      {selectedTransporter.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800">
                  Contact Information
                </h3>

                {selectedTransporter.user && (
                  <>
                    <div className="flex items-start">
                      <User className="w-5 h-5 text-gray-500 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Contact Person
                        </p>
                        <p className="text-gray-800">
                          {selectedTransporter.user.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Phone className="w-5 h-5 text-gray-500 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Phone Number
                        </p>
                        <p className="text-gray-800">
                          {selectedTransporter.user.phoneNumber}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Mail className="w-5 h-5 text-gray-500 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Email Address
                        </p>
                        <p className="text-gray-800">
                          {selectedTransporter.user.email}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                License Information
              </h3>
              <div>
                {selectedTransporter.licenseImage ? (
                  <div className="border border-gray-200 rounded-lg overflow-hidden max-w-md">
                    <img
                      src={selectedTransporter.licenseImage}
                      alt="License"
                      className="w-full h-auto"
                    />
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    No license image provided
                  </p>
                )}
              </div>
            </div>

            {/* Transportation Fees Section */}
            <div className="mt-6 border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800 flex items-center">
                  <Route className="w-5 h-5 mr-2" />
                  Transportation Fees
                </h3>
              </div>

              {selectedTransporter.transportationFees &&
              selectedTransporter.transportationFees.length > 0 ? (
                <div className="space-y-3">
                  {selectedTransporter.transportationFees.map((fee, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            From
                          </p>
                          <p className="text-gray-800">{fee.startingPoint}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            To
                          </p>
                          <p className="text-gray-800">{fee.destination}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Weight
                          </p>
                          <p className="text-gray-800">{fee.weight} kg</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Price
                          </p>
                          <p className="text-lg font-semibold text-primary-600">
                            TZS {fee.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <Route className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 mb-2">
                    No transportation routes configured
                  </p>
                  <p className="text-sm text-gray-400">
                    Add your transportation routes and pricing to help customers
                    choose your services
                  </p>
                  <button
                    onClick={() => navigate("/transporter/profile/edit")}
                    className="mt-3 px-4 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    Add Routes
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">
                    Account created on{" "}
                    {new Date(
                      selectedTransporter.createdAt
                    ).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Last updated on{" "}
                    {new Date(
                      selectedTransporter.updatedAt
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
          <p className="text-gray-500">
            No transporter profile found. Please create your profile.
          </p>
          <button
            onClick={() => navigate("/transporter/profile/create")}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Create Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default TransporterProfilePage;
