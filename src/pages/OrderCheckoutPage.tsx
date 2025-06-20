import { AlertCircle, Check, Loader, MapPin } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CheckoutPayment from "../components/checkout/CheckoutPayment";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchAddresses } from "../redux/slices/addressSlice";
import { fetchOrderById } from "../redux/slices/ordersSlice";

const OrderCheckoutPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    selectedOrder,
    isLoading: orderLoading,
    error: orderError,
  } = useAppSelector((state) => state.orders);
  const {
    addresses,
    isLoading: addressLoading,
    error: addressError,
  } = useAppSelector((state) => state.address);

  const isLoading = orderLoading || addressLoading;
  const error = orderError || addressError;

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderById(orderId));
      dispatch(fetchAddresses());
    }
  }, [dispatch, orderId]);

  // Set address from order if available
  useEffect(() => {
    if (selectedOrder?.addressId) {
      setSelectedAddressId(selectedOrder.addressId);
    }
  }, [selectedOrder]);

  // Set default address if available
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const defaultAddress = addresses.find((addr) => addr.isDefault);
      if (defaultAddress && defaultAddress.id) {
        setSelectedAddressId(defaultAddress.id);
      } else if (addresses[0] && addresses[0].id) {
        setSelectedAddressId(addresses[0].id);
      }
    }
  }, [addresses]);

  const handlePaymentSuccess = () => {
    navigate(`/orders/${orderId}`);
  };

  const handlePaymentCancel = () => {
    navigate(`/orders/${orderId}`);
  };

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size={32} className="text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle size={24} className="text-red-500 mr-3" />
            <h2 className="text-xl font-semibold text-red-700">Error</h2>
          </div>
          <p className="mt-2 text-red-600">{error}</p>
          <button
            onClick={() => navigate("/orders")}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            Go back to orders
          </button>
        </div>
      </div>
    );
  }

  if (!selectedOrder) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle size={24} className="text-yellow-500 mr-3" />
            <h2 className="text-xl font-semibold text-yellow-700">
              Order Not Found
            </h2>
          </div>
          <p className="mt-2 text-yellow-600">
            We couldn't find the order you're looking for.
          </p>
          <button
            onClick={() => navigate("/orders")}
            className="mt-4 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors"
          >
            Go back to orders
          </button>
        </div>
      </div>
    );
  }

  // Calculate the total amount
  const totalAmount = selectedOrder?.totalAmount
    ? parseInt(selectedOrder.totalAmount)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Order Info Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-3">Order Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Order Number</p>
            <p className="font-medium">{selectedOrder.orderNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="font-medium">
              TZS {parseInt(selectedOrder.totalAmount).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium capitalize">{selectedOrder.status}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p className="font-medium">
              {new Date(selectedOrder.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Order Items Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Order Items</h2>
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {selectedOrder.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {item.product?.images && item.product.images[0] && (
                        <img
                          src={item.product.images[0].url}
                          alt={item.product?.name}
                          className="h-10 w-10 object-cover rounded-md mr-3"
                        />
                      )}
                      <div className="font-medium text-gray-900">
                        {item.product?.name || "Product"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-gray-600">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600">
                    TZS {parseInt(item.unitPrice || "0").toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                    TZS{" "}
                    {(
                      parseInt(item.unitPrice || "0") * item.quantity
                    ).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Address Selection Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <MapPin className="mr-2 text-blue-600" size={20} />
          Delivery Address
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {addresses && addresses.length > 0 ? (
            addresses.map((address) => (
              <div
                key={address.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedAddressId === address.id
                    ? "border-blue-600 bg-blue-50 shadow"
                    : "border-gray-200 hover:border-blue-300"
                }`}
                onClick={() => handleAddressSelect(address.id as string)}
              >
                <div className="flex justify-between">
                  <div className="font-medium">{address.fullName}</div>
                  {address.isDefault && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center">
                      <Check size={12} className="mr-1" /> Default
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {address.phoneNumber}
                </div>
                <div className="text-sm text-gray-800 mt-2">
                  {address.addressLine1}
                  {address.addressLine2 && <>, {address.addressLine2}</>}
                </div>
                <div className="text-sm text-gray-800">
                  {address.district}, {address.city}, {address.region}
                </div>
                <div className="text-sm text-gray-800">
                  {address.country}{" "}
                  {address.postalCode && `- ${address.postalCode}`}
                </div>

                {selectedAddressId === address.id && (
                  <div className="mt-3 text-blue-600 text-sm font-medium flex items-center">
                    <Check size={16} className="mr-1" />
                    Selected for delivery
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full flex items-center justify-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <div className="text-center">
                <MapPin className="mx-auto text-gray-400 mb-2" size={24} />
                <p className="text-gray-600">No saved addresses found</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Section */}
      <CheckoutPayment
        orderId={orderId}
        amount={totalAmount}
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
        addressId={selectedAddressId}
      />
    </div>
  );
};

export default OrderCheckoutPage;
