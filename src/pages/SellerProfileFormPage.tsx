import { ArrowLeft, CheckCircle, Info, Loader2, Upload } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { createSellerProfile } from "../redux/slices/sellerSlice";
import sellerService from "../services/sellerService";
import { SellerProfileFormData } from "../types";

const SellerProfileFormPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {} = useAppSelector((state) => state.seller);

  // Form states
  const [form, setForm] = useState<SellerProfileFormData>({
    businessName: "",
    sellerType: "individual",
    address: "",
    region: "",
    district: "",
    city: "",
    country: "Tanzania",
    nationalId: "",
    frontNationalId: "",
    backNationalId: "",
  });

  // File upload states
  const [frontIdFile, setFrontIdFile] = useState<File | null>(null);
  const [backIdFile, setBackIdFile] = useState<File | null>(null);
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [frontIdUploaded, setFrontIdUploaded] = useState(false);
  const [backIdUploaded, setBackIdUploaded] = useState(false);

  // Form submission state
  const [submitting, setSubmitting] = useState(false);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    // Handle field name mapping for form to API
    let fieldName = name;

    setForm((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  // Handle file selection
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    side: "front" | "back"
  ) => {
    if (e.target.files && e.target.files[0]) {
      if (side === "front") {
        setFrontIdFile(e.target.files[0]);
        setFrontIdUploaded(false);
      } else {
        setBackIdFile(e.target.files[0]);
        setBackIdUploaded(false);
      }
    }
  };

  // Upload ID image
  const uploadIdImage = async (side: "front" | "back") => {
    const file = side === "front" ? frontIdFile : backIdFile;
    if (!file) return;

    try {
      side === "front" ? setUploadingFront(true) : setUploadingBack(true);

      const response = await sellerService.uploadFile(file, "national-ids");

      if (response.success) {
        const fileData = response.data;
        setForm((prev) => ({
          ...prev,
          [side === "front" ? "frontNationalId" : "backNationalId"]:
            fileData.url,
        }));

        if (side === "front") {
          setFrontIdUploaded(true);
          setUploadingFront(false);
        } else {
          setBackIdUploaded(true);
          setUploadingBack(false);
        }

        toast.success(
          `${
            side === "front" ? "Front" : "Back"
          } ID image uploaded successfully`
        );
      }
    } catch (error) {
      toast.error(
        `Failed to upload ${side === "front" ? "front" : "back"} ID image`
      );
      side === "front" ? setUploadingFront(false) : setUploadingBack(false);
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !form.businessName ||
      !form.address ||
      !form.region ||
      !form.district ||
      !form.nationalId ||
      !form.frontNationalId ||
      !form.backNationalId
    ) {
      toast.error("Please fill all required fields and upload both ID images");
      return;
    }

    setSubmitting(true);

    try {
      await dispatch(createSellerProfile(form)).unwrap();
      toast.success("Seller profile created successfully!");
      navigate("/seller/dashboard");
    } catch (error: any) {
      toast.error(error?.message || "Failed to create seller profile");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <Link
          to="/seller/dashboard"
          className="flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Complete Your Seller Profile
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Complete the form below to set up your seller account and start
            selling on our marketplace.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-6 border border-gray-200"
        >
          <div className="space-y-6">
            {/* Business Information */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Business Information
              </h2>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="businessName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="businessName"
                      name="businessName"
                      value={form.businessName}
                      onChange={handleChange}
                      required
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                      placeholder="Your business name"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Business Address <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      required
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                      placeholder="Street address"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Country <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <select
                      id="country"
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                    >
                      <option value="Tanzania">Tanzania</option>
                      <option value="Kenya">Kenya</option>
                      <option value="Uganda">Uganda</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="region"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Region <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="region"
                      name="region"
                      value={form.region}
                      onChange={handleChange}
                      required
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                      placeholder="Your region"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="district"
                    className="block text-sm font-medium text-gray-700"
                  >
                    District <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="district"
                      name="district"
                      value={form.district}
                      onChange={handleChange}
                      required
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                      placeholder="Your district"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Seller Type */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Seller Type
              </h2>
              <div className="mt-1 space-y-4">
                <div className="flex items-center">
                  <input
                    id="individual"
                    name="sellerType"
                    type="radio"
                    value="individual"
                    checked={form.sellerType === "individual"}
                    onChange={handleChange}
                    className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                  />
                  <label
                    htmlFor="individual"
                    className="ml-3 block text-sm font-medium text-gray-700"
                  >
                    Individual Seller
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="company"
                    name="sellerType"
                    type="radio"
                    value="company"
                    checked={form.sellerType === "company"}
                    onChange={handleChange}
                    className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                  />
                  <label
                    htmlFor="company"
                    className="ml-3 block text-sm font-medium text-gray-700"
                  >
                    Company
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="association"
                    name="sellerType"
                    type="radio"
                    value="association"
                    checked={form.sellerType === "association"}
                    onChange={handleChange}
                    className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                  />
                  <label
                    htmlFor="association"
                    className="ml-3 block text-sm font-medium text-gray-700"
                  >
                    Association
                  </label>
                </div>
              </div>
            </div>

            {/* Additional Fields based on Seller Type */}
            {form.sellerType === "individual" && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Identification
                </h2>
                <div>
                  <label
                    htmlFor="nationalId"
                    className="block text-sm font-medium text-gray-700"
                  >
                    National ID Number <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="nationalId"
                      name="nationalId"
                      value={form.nationalId}
                      onChange={handleChange}
                      required
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                      placeholder="Your national ID number"
                    />
                  </div>
                </div>
              </div>
            )}

            {form.sellerType === "company" && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Company Information
                </h2>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="nationalId"
                      className="block text-sm font-medium text-gray-700"
                    >
                      National ID Number <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="nationalId"
                        name="nationalId"
                        value={form.nationalId}
                        onChange={handleChange}
                        required
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                        placeholder="Your national ID number"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="companyId"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Company Registration Number
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="companyId"
                        name="companyId"
                        value={form.companyId || ""}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                        placeholder="Company registration number"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {form.sellerType === "association" && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Association Information
                </h2>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="nationalId"
                      className="block text-sm font-medium text-gray-700"
                    >
                      National ID Number <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="nationalId"
                        name="nationalId"
                        value={form.nationalId}
                        onChange={handleChange}
                        required
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                        placeholder="Your national ID number"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="associateId"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Association Registration Number
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="associateId"
                        name="associateId"
                        value={form.associateId || ""}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                        placeholder="Association registration number"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ID Document Upload Section */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                ID Document Upload
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Please upload clear images of the front and back of your
                National ID card.
              </p>

              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                {/* Front ID Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Front of National ID <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-col items-center px-6 py-4 border-2 border-dashed border-gray-300 rounded-md text-center">
                    {frontIdUploaded ? (
                      <div className="flex flex-col items-center text-green-600">
                        <CheckCircle className="h-8 w-8 mb-2" />
                        <p className="text-sm font-medium">ID Front Uploaded</p>
                        <button
                          type="button"
                          onClick={() => {
                            setFrontIdFile(null);
                            setFrontIdUploaded(false);
                            setForm((prev) => ({
                              ...prev,
                              frontNationalId: "",
                            }));
                          }}
                          className="mt-2 text-xs text-red-600 underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <label
                          htmlFor="front-id-upload"
                          className="cursor-pointer text-center"
                        >
                          <Upload className="h-10 w-10 mx-auto text-gray-400" />
                          <p className="mt-1 text-sm text-gray-600">
                            {frontIdFile
                              ? frontIdFile.name
                              : "Click to select image"}
                          </p>
                          <input
                            id="front-id-upload"
                            name="front-id-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => handleFileChange(e, "front")}
                          />
                        </label>

                        {frontIdFile && (
                          <button
                            type="button"
                            onClick={() => uploadIdImage("front")}
                            className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            disabled={uploadingFront}
                          >
                            {uploadingFront ? (
                              <>
                                <Loader2 className="animate-spin h-4 w-4 mr-1" />
                                Uploading...
                              </>
                            ) : (
                              "Upload Image"
                            )}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Back ID Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Back of National ID <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-col items-center px-6 py-4 border-2 border-dashed border-gray-300 rounded-md text-center">
                    {backIdUploaded ? (
                      <div className="flex flex-col items-center text-green-600">
                        <CheckCircle className="h-8 w-8 mb-2" />
                        <p className="text-sm font-medium">ID Back Uploaded</p>
                        <button
                          type="button"
                          onClick={() => {
                            setBackIdFile(null);
                            setBackIdUploaded(false);
                            setForm((prev) => ({
                              ...prev,
                              backNationalId: "",
                            }));
                          }}
                          className="mt-2 text-xs text-red-600 underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <label
                          htmlFor="back-id-upload"
                          className="cursor-pointer text-center"
                        >
                          <Upload className="h-10 w-10 mx-auto text-gray-400" />
                          <p className="mt-1 text-sm text-gray-600">
                            {backIdFile
                              ? backIdFile.name
                              : "Click to select image"}
                          </p>
                          <input
                            id="back-id-upload"
                            name="back-id-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => handleFileChange(e, "back")}
                          />
                        </label>

                        {backIdFile && (
                          <button
                            type="button"
                            onClick={() => uploadIdImage("back")}
                            className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            disabled={uploadingBack}
                          >
                            {uploadingBack ? (
                              <>
                                <Loader2 className="animate-spin h-4 w-4 mr-1" />
                                Uploading...
                              </>
                            ) : (
                              "Upload Image"
                            )}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Note about verification */}
            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-blue-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    Your information will be verified by our team. This process
                    usually takes 1-2 business days. You will be notified once
                    your seller profile has been approved.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6 flex items-center justify-end">
              <button
                type="button"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mr-3"
                onClick={() => navigate("/seller/dashboard")}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                disabled={
                  submitting || !form.frontNationalId || !form.backNationalId
                }
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Submitting...
                  </>
                ) : (
                  "Submit Profile"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerProfileFormPage;
