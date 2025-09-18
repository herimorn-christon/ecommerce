import { Edit, Settings } from "lucide-react";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../redux/hooks";

const SellerSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { profile } = useAppSelector((state) => state.seller);
  const isUserSeller = user?.roles?.includes("seller");

  useEffect(() => {
    // Redirect if not authenticated or not a seller
    if (!isAuthenticated || !isUserSeller) {
      navigate("/login");
    }
  }, [isAuthenticated, isUserSeller, navigate]);

  // Return null during redirect
  if (!isAuthenticated || !isUserSeller) return null;

  const handleEditProfile = () => {
    navigate("/seller/profile/edit");
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your seller account settings
        </p>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900">Seller Profile</h2>
        </div>

        <div className="p-6">
          {profile ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Business Information
                  </h3>
                  <div className="mt-3 space-y-4">
                    <div>
                      <div className="text-xs text-gray-500">Business Name</div>
                      <div className="text-sm font-medium">
                        {profile.businessName}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Business Type</div>
                      <div className="text-sm font-medium capitalize">
                        {profile.sellerType}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">National ID</div>
                      <div className="text-sm">
                        {profile.nationalId || "Not provided"}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Contact & Location
                  </h3>
                  <div className="mt-3 space-y-4">
                    <div>
                      <div className="text-xs text-gray-500">Address</div>
                      <div className="text-sm font-medium">
                        {profile.address}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">
                        Region/District
                      </div>
                      <div className="text-sm font-medium">
                        {profile.region}, {profile.district}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Country</div>
                      <div className="text-sm font-medium">
                        {profile.country}
                      </div>
                    </div>
                  </div>
                </div>

                {/* License Information */}
                {profile.license && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      License Information
                    </h3>
                    <div className="mt-3 space-y-4">
                      <div>
                        <div className="text-xs text-gray-500">
                          License Number
                        </div>
                        <div className="text-sm font-medium">
                          {profile.license.licenseNumber}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">
                          License Type
                        </div>
                        <div className="text-sm font-medium capitalize">
                          {profile.license.licenseType.replace("_", " ")}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-500">
                            Issue Date
                          </div>
                          <div className="text-sm font-medium">
                            {new Date(
                              profile.license.issueDate
                            ).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">
                            Expiry Date
                          </div>
                          <div className="text-sm font-medium">
                            {new Date(
                              profile.license.expireDate
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      {profile.license.license && (
                        <div>
                          <div className="text-xs text-gray-500">
                            License Document
                          </div>
                          <div className="text-sm">
                            <a
                              href={profile.license.license}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-700 underline"
                            >
                              View License Document
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-5 border-t border-gray-200">
                <button
                  onClick={handleEditProfile}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Edit size={16} className="mr-2" />
                  Edit Profile
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-400">
              <div className="text-center">
                <Settings size={48} className="mx-auto mb-2" />
                <p>No profile information</p>
                <button
                  onClick={() => navigate("/seller-profile/create")}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                >
                  Complete Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerSettingsPage;
