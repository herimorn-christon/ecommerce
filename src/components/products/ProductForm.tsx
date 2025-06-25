import { AlertCircle, ArrowLeft, Loader2, Upload } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import productService from "../../services/productService";
import { Category, ProductFormData } from "../../types";

const ProductForm: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoriesLoading, setCategoriesLoading] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [showRemoveOptions, setShowRemoveOptions] = useState(false);

  // Form state
  const [form, setForm] = useState<ProductFormData>({
    name: "",
    unitPrice: 0,
    availableQuantity: 0,
    imageUrls: [],
    description: "",
    categoryId: "",
    storageType: "frozen", // Default value
    alertQuantity: 0,
  });

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await productService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        toast.error("Failed to load categories");
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    // Convert numeric fields
    if (["unitPrice", "availableQuantity", "alertQuantity"].includes(name)) {
      setForm({
        ...form,
        [name]: parseFloat(value) || 0,
      });
    } else {
      setForm({
        ...form,
        [name]: value,
      });
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Convert FileList to Array and append to existing files
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    setUploading(true);
    const urls: string[] = [];

    try {
      // Upload each file and collect URLs
      for (const file of files) {
        // Using the updated uploadImage function with default folder parameter
        const result = await productService.uploadImage(file);
        console.log(result);

        if (result?.data?.url) {
          urls.push(result.data.url);
        } else {
          throw new Error("Failed to upload image");
        }
      }

      setUploadedUrls([...uploadedUrls, ...urls]);
      setForm({
        ...form,
        imageUrls: [...form.imageUrls, ...urls],
      });

      setFiles([]); // Clear files array after successful upload
      toast.success(`${urls.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  // Remove an uploaded image
  const handleRemoveImage = (index: number) => {
    const updatedUrls = [...uploadedUrls];
    updatedUrls.splice(index, 1);
    setUploadedUrls(updatedUrls);

    setForm({
      ...form,
      imageUrls: updatedUrls,
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!form.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (!form.categoryId) {
      toast.error("Please select a category");
      return;
    }

    if (form.imageUrls.length === 0) {
      toast.error("Please upload at least one product image");
      return;
    }

    if (form.unitPrice <= 0) {
      toast.error("Price must be greater than zero");
      return;
    }

    if (form.availableQuantity <= 0) {
      toast.error("Available quantity must be greater than zero");
      return;
    }

    setIsLoading(true);

    try {
      await productService.createProduct(form);
      toast.success("Product created successfully");
      navigate("/seller/products");
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Failed to create product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Add New Product</h2>
          <button
            onClick={() => navigate("/seller/products")}
            className="flex items-center text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Products
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          {/* Basic Information Section */}
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Product Name <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                    placeholder="Enter product name"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="unitPrice"
                  className="block text-sm font-medium text-gray-700"
                >
                  Price (TZS) <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    id="unitPrice"
                    name="unitPrice"
                    value={form.unitPrice}
                    onChange={handleChange}
                    min="0"
                    required
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="categoryId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleChange}
                    required
                    disabled={isCategoriesLoading}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                {isCategoriesLoading && (
                  <p className="mt-1 text-xs text-gray-500 flex items-center">
                    <Loader2 size={12} className="animate-spin mr-1" />
                    Loading categories...
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Inventory Information */}
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-4">
              Inventory Information
            </h3>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="availableQuantity"
                  className="block text-sm font-medium text-gray-700"
                >
                  Available Quantity <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    id="availableQuantity"
                    name="availableQuantity"
                    value={form.availableQuantity}
                    onChange={handleChange}
                    min="0"
                    required
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="alertQuantity"
                  className="block text-sm font-medium text-gray-700"
                >
                  Low Stock Alert
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    id="alertQuantity"
                    name="alertQuantity"
                    value={form.alertQuantity}
                    onChange={handleChange}
                    min="0"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  You'll be notified when stock reaches this level
                </p>
              </div>

              <div>
                <label
                  htmlFor="storageType"
                  className="block text-sm font-medium text-gray-700"
                >
                  Storage Type
                </label>
                <div className="mt-1">
                  <select
                    id="storageType"
                    name="storageType"
                    value={form.storageType}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  >
                    <option value="frozen">Frozen</option>
                    <option value="refrigerated">Refrigerated</option>
                    <option value="ambient">Ambient</option>
                    <option value="dried">Dried</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Product Description */}
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-4">
              Product Description
            </h3>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  required
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  placeholder="Provide a detailed description of your product"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Product Images */}
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-4">
              Product Images <span className="text-red-500">*</span>
            </h3>

            {/* Image upload control */}
            <div className="mb-4">
              <div className="flex items-center">
                <input
                  type="file"
                  id="productImages"
                  accept="image/*"
                  onChange={handleFileSelect}
                  multiple
                  className="sr-only"
                />
                <label
                  htmlFor="productImages"
                  className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none flex-1"
                >
                  {files.length > 0
                    ? `${files.length} file(s) selected`
                    : "Select images..."}
                </label>
                <button
                  type="button"
                  disabled={files.length === 0 || uploading}
                  onClick={handleUpload}
                  className={`ml-3 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                    files.length === 0 || uploading
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  }`}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-1" />
                  )}
                  Upload
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Upload clear, high-quality images of your product. You can
                select multiple files.
              </p>
            </div>

            {/* Display uploaded images */}
            {uploadedUrls.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    Uploaded Images ({uploadedUrls.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowRemoveOptions(!showRemoveOptions)}
                    className="text-xs text-primary-600 hover:text-primary-800"
                  >
                    {showRemoveOptions ? "Done" : "Manage Images"}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {uploadedUrls.map((url, index) => (
                    <div
                      key={index}
                      className="relative border border-gray-200 rounded-md overflow-hidden group"
                    >
                      <img
                        src={url}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-24 object-cover"
                      />
                      {showRemoveOptions && (
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error message if no images are uploaded */}
            {form.imageUrls.length === 0 && (
              <div className="rounded-md bg-yellow-50 p-4 mt-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle
                      className="h-5 w-5 text-yellow-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Product images are required
                    </h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Please upload at least one image for your product.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-5 border-t border-gray-200 flex justify-end">
            <button
              type="button"
              onClick={() => navigate("/seller/products")}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Creating...
                </>
              ) : (
                "Create Product"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
