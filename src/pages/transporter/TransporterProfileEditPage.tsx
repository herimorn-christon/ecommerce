import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchCurrentTransporter } from "../../redux/slices/transporterSlice";

const TransporterProfileEditPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { selectedTransporter, isLoading } = useAppSelector(
    (state) => state.transporter
  );
  const isUserTransporter = user?.roles?.includes("transporter");

  // Form state
  const [formData, setFormData] = useState({
    businessName: "",
    address: "",
    country: "",
    region: "",
    district: "",
    description: "",
    licenseImage: "",
  });

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

  // Populate form when selectedTransporter data is available
  useEffect(() => {
    if (selectedTransporter) {
      setFormData({
        businessName: selectedTransporter.businessName || "",
        address: selectedTransporter.address || "",
        country: selectedTransporter.country || "",
        region: selectedTransporter.region || "",
        district: selectedTransporter.district || "",
        description: selectedTransporter.description || "",
        licenseImage: selectedTransporter.licenseImage || "",
      });
    }
  }, [selectedTransporter]);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement the update profile functionality in transporterService.ts and transporterSlice.ts
    // This would be similar to the getCurrentTransporter method but would be a PUT request

    // For now, just navigate back to the profile page
    navigate("/transporter/profile");
  };

  if (!isAuthenticated || !isUserTransporter) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Edit Transporter Profile
        </h1>
        <p className="text-gray-600 mt-2">
          Update your business information and details
        </p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg border border-gray-200 shadow-sm p-6"
        >
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-800 mb-4">
                Business Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="businessName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Business Name
                  </label>
                  <input
                    type="text"
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Business Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="country"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="region"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Region
                    </label>
                    <input
                      type="text"
                      id="region"
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="district"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      District
                    </label>
                    <input
                      type="text"
                      id="district"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Describe your transportation services"
                  />
                </div>

                <div>
                  <label
                    htmlFor="licenseImage"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    License Image URL
                  </label>
                  <input
                    type="text"
                    id="licenseImage"
                    name="licenseImage"
                    value={formData.licenseImage}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="URL to your license image"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/transporter/profile")}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default TransporterProfileEditPage;
