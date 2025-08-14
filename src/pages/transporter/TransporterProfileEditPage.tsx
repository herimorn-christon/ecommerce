import { Plus, Save, Trash2, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  fetchCurrentTransporter,
  updateTransporterProfile,
} from "../../redux/slices/transporterSlice";
import { TransportationFee, TransportationType } from "../../types";

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

  const [transportationFees, setTransportationFees] = useState<
    TransportationFee[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      // Populate transportation fees
      if (
        selectedTransporter.transportationFees &&
        selectedTransporter.transportationFees.length > 0
      ) {
        setTransportationFees(selectedTransporter.transportationFees);
      } else {
        // Initialize with empty fee if none exist
        setTransportationFees([
          { startingPoint: "", destination: "", price: 0, weight: 0, transportationType: 'standard' },
        ]);
      }
    }
  }, [selectedTransporter]);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle transportation fee changes
  const handleFeeChange = (
    index: number,
    field: keyof TransportationFee,
    value: string | number
  ) => {
    setTransportationFees((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Add new transportation fee
  const addTransportationFee = () => {
    setTransportationFees((prev) => [
      ...prev,
      { startingPoint: "", destination: "", price: 0, weight: 0, transportationType: 'standard' },
    ]);
  };

  // Remove transportation fee
  const removeTransportationFee = (index: number) => {
    setTransportationFees((prev) => {
      const updated = [...prev];
      // If fee has an ID, mark it for deletion
      if (updated[index].id) {
        updated[index] = { ...updated[index], delete: true };
      } else {
        // If no ID, remove from array
        updated.splice(index, 1);
      }
      return updated;
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare update data
      const updateData = {
        ...formData,
        transportationFees: transportationFees.filter(
          (fee) =>
            // Include fees that are not marked for deletion and have valid data
            (!fee.delete &&
              fee.startingPoint &&
              fee.destination &&
              fee.price > 0 &&
              fee.weight > 0) ||
            // Include fees marked for deletion (to delete them on backend)
            fee.delete
        ),
      };

      await dispatch(updateTransporterProfile(updateData)).unwrap();
      toast.success("Profile updated successfully!");
      navigate("/transporter/profile");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
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
          <div className="space-y-8">
            {/* Business Information Section */}
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
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select country</option>
                      <option value="Tanzania">Tanzania</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="region"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Region
                    </label>
                    <select
                      id="region"
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select region</option>
                      <option value="Kigoma">Kigoma</option>
                    </select>
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

            {/* Transportation Fees Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-800">
                  Transportation Fees
                </h2>
                <Button
                  type="button"
                  onClick={addTransportationFee}
                  variant="outline"
                  className="flex items-center"
                >
                  <Plus size={16} className="mr-2" />
                  Add Route
                </Button>
              </div>

              <div className="space-y-4">
                {transportationFees.map((fee, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${
                      fee.delete ? "opacity-50 bg-red-50" : "bg-gray-50"
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Starting Point
                        </label>
                        <select
                          value={fee.startingPoint}
                          onChange={(e) =>
                            handleFeeChange(
                              index,
                              "startingPoint",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          disabled={fee.delete}
                        >
                          <option value="">Select starting point</option>
                          <option value="Dar es Salaam">Dar es Salaam</option>
                          <option value="Kigoma">Kigoma</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Destination
                        </label>
                        <select
                          value={fee.destination}
                          onChange={(e) =>
                            handleFeeChange(
                              index,
                              "destination",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          disabled={fee.delete}
                        >
                          <option value="">Select destination</option>
                          <option value="Dar es Salaam">Dar es Salaam</option>
                          <option value="Kigoma">Kigoma</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Transportation Type
                        </label>
                        <select
                          value={fee.transportationType}
                          onChange={(e) =>
                            handleFeeChange(
                              index,
                              "transportationType",
                              e.target.value as 'standard' | 'express'
                            )
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          disabled={fee.delete}
                        >
                          <option value="standard">Standard</option>
                          <option value="express">Express</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Weight (kg)
                        </label>
                        <input
                          type="number"
                          value={fee.weight}
                          onChange={(e) =>
                            handleFeeChange(
                              index,
                              "weight",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="10"
                          min="0"
                          step="0.1"
                          disabled={fee.delete}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price (TZS)
                        </label>
                        <input
                          type="number"
                          value={fee.price}
                          onChange={(e) =>
                            handleFeeChange(
                              index,
                              "price",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="50000"
                          min="0"
                          disabled={fee.delete}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        {fee.delete ? (
                          <div className="flex items-center text-red-600 text-sm">
                            <X size={16} className="mr-1" />
                            Marked for deletion
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => removeTransportationFee(index)}
                            className="flex items-center text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    {fee.delete && (
                      <div className="mt-2 text-sm text-red-600">
                        This route will be deleted when you save changes.
                      </div>
                    )}
                  </div>
                ))}

                {transportationFees.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No transportation routes configured.</p>
                    <p className="text-sm">Click "Add Route" to get started.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                onClick={() => navigate("/transporter/profile")}
                variant="outline"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                disabled={isSubmitting}
                className="flex items-center"
              >
                <Save size={16} className="mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default TransporterProfileEditPage;
