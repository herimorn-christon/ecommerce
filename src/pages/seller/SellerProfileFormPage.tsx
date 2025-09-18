import { ArrowLeft, CheckCircle, Info, Loader2, Upload } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  createSellerProfile,
  submitSellerLicense,
} from "../../redux/slices/sellerSlice";
import sellerService from "../../services/sellerService";
import { SellerProfileFormData } from "../../types";

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
    // License fields
    license: "",
    licenseNumber: "",
    issueDate: "",
    expireDate: "",
    licenseType: "business",
  });

  // File upload states
  const [frontIdFile, setFrontIdFile] = useState<File | null>(null);
  const [backIdFile, setBackIdFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [uploadingLicense, setUploadingLicense] = useState(false);
  const [frontIdUploaded, setFrontIdUploaded] = useState(false);
  const [backIdUploaded, setBackIdUploaded] = useState(false);
  const [licenseUploaded, setLicenseUploaded] = useState(false);

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

    setForm({
      ...form,
      [fieldName]: value,
    });
  };

  // Handle file selection for front ID
  const handleFrontIdSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFrontIdFile(e.target.files[0]);
    }
  };

  // Handle file selection for back ID
  const handleBackIdSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBackIdFile(e.target.files[0]);
    }
  };

  // Handle file selection for license
  const handleLicenseSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLicenseFile(e.target.files[0]);
    }
  };

  // Handle front ID upload
  const handleFrontIdUpload = async () => {
    if (!frontIdFile) {
      toast.error("Please select a file first");
      return;
    }

    setUploadingFront(true);

    try {
      const fileName = `id_front_${Date.now()}_${frontIdFile.name.replace(
        /\s+/g,
        "_"
      )}`;
      const result = await sellerService.uploadFile(frontIdFile, fileName);

      if (result?.data?.url) {
        setForm({
          ...form,
          frontNationalId: result?.data?.url,
        });
        setFrontIdUploaded(true);
        toast.success("Front ID uploaded successfully");
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading front ID:", error);
      toast.error("Failed to upload front ID image");
    } finally {
      setUploadingFront(false);
    }
  };

  // Handle back ID upload
  const handleBackIdUpload = async () => {
    if (!backIdFile) {
      toast.error("Please select a file first");
      return;
    }

    setUploadingBack(true);

    try {
      const fileName = `id_back_${Date.now()}_${backIdFile.name.replace(
        /\s+/g,
        "_"
      )}`;
      const result = await sellerService.uploadFile(backIdFile, fileName);

      if (result?.data?.url) {
        setForm({
          ...form,
          backNationalId: result?.data?.url,
        });
        setBackIdUploaded(true);
        toast.success("Back ID uploaded successfully");
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading back ID:", error);
      toast.error("Failed to upload back ID image");
    } finally {
      setUploadingBack(false);
    }
  };

  // Handle license upload
  const handleLicenseUpload = async () => {
    if (!licenseFile) {
      toast.error("Please select a license file first");
      return;
    }

    setUploadingLicense(true);

    try {
      const fileName = `license_${Date.now()}_${licenseFile.name.replace(
        /\s+/g,
        "_"
      )}`;
      const result = await sellerService.uploadFile(licenseFile, fileName);

      if (result?.data?.url) {
        setForm({
          ...form,
          license: result?.data?.url,
        });
        setLicenseUploaded(true);
        toast.success("License document uploaded successfully");
      } else {
        throw new Error("Failed to upload license");
      }
    } catch (error) {
      console.error("Error uploading license:", error);
      toast.error("Failed to upload license document");
    } finally {
      setUploadingLicense(false);
    }
  };

  // Submit the form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
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

    // License validation (only if any license field is filled)
    const hasLicenseData =
      form.license || form.licenseNumber || form.issueDate || form.expireDate;
    if (
      hasLicenseData &&
      (!form.license ||
        !form.licenseNumber ||
        !form.issueDate ||
        !form.expireDate ||
        !form.licenseType)
    ) {
      toast.error("Please complete all license information fields");
      return;
    }

    setSubmitting(true);

    try {
      // Create seller profile first
      const createdProfile = await dispatch(createSellerProfile(form)).unwrap();

      // If license data is provided, submit it separately
      if (hasLicenseData && createdProfile.id) {
        const licenseData = {
          license: form.license!,
          licenseNumber: form.licenseNumber!,
          issueDate: form.issueDate!,
          expireDate: form.expireDate!,
          licenseType: form.licenseType!,
        };

        await dispatch(
          submitSellerLicense({
            sellerId: createdProfile.id,
            licenseData,
          })
        ).unwrap();

        toast.success("Seller profile and license created successfully!");
      } else {
        toast.success("Seller profile created successfully!");
      }

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
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>

        {/* Page header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Create Seller Profile
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Complete your information to start selling on our marketplace
          </p>
        </div>

        {/* Form */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
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
                        placeholder="Your business or shop name"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="sellerType"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Business Type <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <select
                        id="sellerType"
                        name="sellerType"
                        value={form.sellerType}
                        onChange={handleChange}
                        required
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                      >
                        <option value="individual">Individual</option>
                        <option value="company">Company</option>
                        <option value="association">Association</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Address Information
                </h2>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="address"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        required
                        rows={3}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                        placeholder="Street address, building, etc."
                      />
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

                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700"
                    >
                      City <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        required
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                        placeholder="Your city"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="country"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Country
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="country"
                        name="country"
                        value={form.country}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border bg-gray-50"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Fields Based on Business Type */}
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
                        National ID Number{" "}
                        <span className="text-red-500">*</span>
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
                        National ID Number{" "}
                        <span className="text-red-500">*</span>
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
                        htmlFor="associationId"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Association Registration Number
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="associationId"
                          name="associationId"
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

              {form.sellerType === "individual" && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Personal Information
                  </h2>
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="nationalId"
                        className="block text-sm font-medium text-gray-700"
                      >
                        National ID Number{" "}
                        <span className="text-red-500">*</span>
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
                </div>
              )}

              {/* ID Document Upload */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  ID Verification <span className="text-red-500">*</span>
                </h2>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between">
                      <label
                        htmlFor="frontNationalId"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Front of National ID
                      </label>
                      {form.frontNationalId && (
                        <span className="text-xs text-green-600 flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Uploaded
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center">
                      <input
                        type="file"
                        id="frontNationalId"
                        accept="image/*"
                        onChange={handleFrontIdSelect}
                        className="sr-only"
                        disabled={frontIdUploaded}
                      />
                      <label
                        htmlFor="frontNationalId"
                        className={`flex-1 relative cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none ${
                          frontIdUploaded ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <span>{frontIdFile?.name || "Select file..."}</span>
                      </label>
                      <button
                        type="button"
                        disabled={
                          !frontIdFile || uploadingFront || frontIdUploaded
                        }
                        onClick={handleFrontIdUpload}
                        className={`ml-3 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                          !frontIdFile || uploadingFront || frontIdUploaded
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        }`}
                      >
                        {uploadingFront ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4 mr-1" />
                        )}
                        Upload
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Clear image of the front side of your national ID card
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <label
                        htmlFor="backNationalId"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Back of National ID
                      </label>
                      {form.backNationalId && (
                        <span className="text-xs text-green-600 flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Uploaded
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center">
                      <input
                        type="file"
                        id="backNationalId"
                        accept="image/*"
                        onChange={handleBackIdSelect}
                        className="sr-only"
                        disabled={backIdUploaded}
                      />
                      <label
                        htmlFor="backNationalId"
                        className={`flex-1 relative cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none ${
                          backIdUploaded ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <span>{backIdFile?.name || "Select file..."}</span>
                      </label>
                      <button
                        type="button"
                        disabled={
                          !backIdFile || uploadingBack || backIdUploaded
                        }
                        onClick={handleBackIdUpload}
                        className={`ml-3 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                          !backIdFile || uploadingBack || backIdUploaded
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        }`}
                      >
                        {uploadingBack ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4 mr-1" />
                        )}
                        Upload
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Clear image of the back side of your national ID card
                    </p>
                  </div>
                </div>
              </div>

              {/* License Information (Optional) */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Business License{" "}
                  <span className="text-gray-500">(Optional)</span>
                </h2>
                <div className="space-y-6">
                  {/* License Document Upload */}
                  <div>
                    <div className="flex justify-between">
                      <label
                        htmlFor="license"
                        className="block text-sm font-medium text-gray-700"
                      >
                        License Document
                      </label>
                      {form.license && (
                        <span className="text-xs text-green-600 flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Uploaded
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center">
                      <input
                        type="file"
                        id="license"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleLicenseSelect}
                        className="sr-only"
                        disabled={licenseUploaded}
                      />
                      <label
                        htmlFor="license"
                        className={`flex-1 relative cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none ${
                          licenseUploaded ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <span>
                          {licenseFile?.name || "Select license document..."}
                        </span>
                      </label>
                      <button
                        type="button"
                        disabled={
                          !licenseFile || uploadingLicense || licenseUploaded
                        }
                        onClick={handleLicenseUpload}
                        className={`ml-3 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                          !licenseFile || uploadingLicense || licenseUploaded
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        }`}
                      >
                        {uploadingLicense ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4 mr-1" />
                        )}
                        Upload
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Upload your business license document (PDF, DOC, or image
                      file)
                    </p>
                  </div>

                  {/* License Details */}
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <label
                        htmlFor="licenseNumber"
                        className="block text-sm font-medium text-gray-700"
                      >
                        License Number
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="licenseNumber"
                          name="licenseNumber"
                          value={form.licenseNumber}
                          onChange={handleChange}
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                          placeholder="e.g., LIC-2023-00123"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-1">
                      <label
                        htmlFor="licenseType"
                        className="block text-sm font-medium text-gray-700"
                      >
                        License Type
                      </label>
                      <div className="mt-1">
                        <select
                          id="licenseType"
                          name="licenseType"
                          value={form.licenseType}
                          onChange={handleChange}
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                        >
                          <option value="business">Business License</option>
                          <option value="trading">Trading License</option>
                          <option value="professional">
                            Professional License
                          </option>
                        </select>
                      </div>
                    </div>

                    <div className="sm:col-span-1">
                      <label
                        htmlFor="issueDate"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Issue Date
                      </label>
                      <div className="mt-1">
                        <input
                          type="date"
                          id="issueDate"
                          name="issueDate"
                          value={form.issueDate}
                          onChange={handleChange}
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-1">
                      <label
                        htmlFor="expireDate"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Expiry Date
                      </label>
                      <div className="mt-1">
                        <input
                          type="date"
                          id="expireDate"
                          name="expireDate"
                          value={form.expireDate}
                          onChange={handleChange}
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Info className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-800">
                          License Information
                        </h3>
                        <div className="mt-2 text-sm text-gray-600">
                          <p>
                            Adding license information helps build trust with
                            customers and may be required for certain product
                            categories. This section is optional but recommended
                            for business credibility.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Information */}
              <div className="bg-blue-50 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Verification Information
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        Your seller profile will need to be verified before you
                        can start selling products on our marketplace. This
                        process usually takes 1-2 business days.
                      </p>
                    </div>
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
                  disabled={submitting}
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                    submitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  }`}
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProfileFormPage;
