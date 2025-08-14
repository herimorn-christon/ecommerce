import { MapPin, Truck } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { createAddress, fetchAddresses } from "../../redux/slices/addressSlice";
import { clearCart } from "../../redux/slices/cartSlice";
import { createOrder } from "../../redux/slices/ordersSlice";
import { fetchTransporters } from "../../redux/slices/transporterSlice";
import { Address } from "../../types";
import Button from "../common/Button";
import TextField from "../common/TextField";
import PaymentMethodSelector from "../payment/PaymentMethodSelector";
import TransporterSelect from "./TransporterSelect";

interface CheckoutFormProps {
  onBack: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onBack }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { items } = useAppSelector((state) => state.cart);
  const { addresses, isLoading, error } = useAppSelector((state) => {
    return state.address;
  });
  const { user } = useAppSelector((state) => state.auth);
  const { transporters, isLoading: transportersLoading } = useAppSelector(
    (state) => state.transporter
  );

  // State for the form
  const [selectedAddressId, setSelectedAddressId] = useState<string | "new">(
    ""
  );
  const [selectedTransporterIds, setSelectedTransporterIds] = useState<
    Record<string, string>
  >({});
  const [deliveryOption, setDeliveryOption] = useState("standard");
  const [notes, setNotes] = useState("");
  const [isCreatingAddress, setIsCreatingAddress] = useState(false);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);

  // New address form
  const [newAddress, setNewAddress] = useState<
    Omit<Address, "id" | "userId" | "createdAt" | "updatedAt">
  >({
    fullName: user?.name || "",
    phoneNumber: user?.phoneNumber || "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    region: "",
    district: "",
    postalCode: "",
    country: "Tanzania",
    isDefault: false,
  });

  // Fetch addresses when component mounts
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        await dispatch(fetchAddresses()).unwrap();
      } catch (err) {
        console.error("Failed to fetch addresses:", err);
      }
    };
    loadAddresses();
  }, [dispatch]);

  // Fetch transporters when component mounts
  useEffect(() => {
    const loadTransporters = async () => {
      try {
        await dispatch(fetchTransporters()).unwrap();
      } catch (err) {
        console.error("Failed to fetch transporters:", err);
      }
    };
    loadTransporters();
  }, [dispatch]);

  // Set default address if available
  useEffect(() => {
    if (addresses.length > 0) {
      const defaultAddress = addresses.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id as string);
      } else {
        setSelectedAddressId(addresses[0].id as string);
      }
    }
  }, [addresses]);

  // Set mobile number from user profile if available (remove this section)

  const handleNewAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewAddress((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTransporterSelect = (
    productId: string,
    transporterId: string
  ) => {
    setSelectedTransporterIds((prev) => ({
      ...prev,
      [productId]: transporterId,
    }));
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate required fields
      const requiredFields = [
        "fullName",
        "phoneNumber",
        "addressLine1",
        "city",
        "region",
        "district",
      ];
      const missingFields = requiredFields.filter(
        (field) => !newAddress[field as keyof typeof newAddress]
      );

      if (missingFields.length > 0) {
        alert(
          `Please fill in all required fields: ${missingFields.join(", ")}`
        );
        return;
      }

      // Format phone number if needed
      let formattedPhone = newAddress.phoneNumber;
      if (!formattedPhone.startsWith("255")) {
        formattedPhone = formattedPhone.startsWith("0")
          ? `255${formattedPhone.slice(1)}`
          : `255${formattedPhone}`;
      }

      // Prepare address data
      const addressData = {
        ...newAddress,
        phoneNumber: formattedPhone,
      };

      const result = await dispatch(createAddress(addressData)).unwrap();

      // Update selected address and close form
      setSelectedAddressId(result.id);
      setIsCreatingAddress(false);

      // Refresh addresses list
      dispatch(fetchAddresses());
    } catch (error: any) {
      alert(error.message || "Failed to create address. Please try again.");
    }
  };

  // Helper function to generate order summary for payment confirmation
  const getOrderSummaryForPayment = () => {
    const summaryItems = items.map((item) => ({
      id: item.productId,
      name: item.product.name,
      quantity: item.quantity,
      price: Number(item.product.unitPrice),
      image: item.product.images?.[0]?.url,
    }));

    const subtotal = items.reduce(
      (sum, item) =>
        sum + Number(item.product.unitPrice) * Number(item.quantity),
      0
    );

    const baseDeliveryFee = deliveryOption === "express" ? 10000 : 5000;
    const transportationFees = calculateTransportationFees();
    const totalShippingFee = baseDeliveryFee + transportationFees;

    return {
      items: summaryItems,
      subtotal,
      shippingFee: totalShippingFee,
      total: subtotal + totalShippingFee,
    };
  };

  // Calculate transportation fees based on selected transporters and delivery address
  const calculateTransportationFees = () => {
    if (!items?.length || !addresses.length) return 0;

    const selectedAddress = addresses.find(
      (addr) => addr.id === selectedAddressId
    );
    if (!selectedAddress) return 0;

    let totalTransportationFees = 0;

    items.forEach((item) => {
      const transporterId = selectedTransporterIds[item.productId];
      if (!transporterId) return;

      const transporter = transporters.find((t) => t.id === transporterId);
      if (!transporter?.transportationFees) return;

      // Find the appropriate transportation fee based on destination and delivery type
      const destinationCity = selectedAddress.city;

      // Try to find a fee that matches both destination and transportation type
      let applicableFee = transporter.transportationFees.find(
        (fee) =>
          (fee.destination.toLowerCase() === destinationCity.toLowerCase() ||
            fee.destination.toLowerCase() ===
              selectedAddress.region.toLowerCase()) &&
          fee.transportationType === deliveryOption
      );

      // If no exact match found, try to find by destination only
      if (!applicableFee) {
        applicableFee = transporter.transportationFees.find(
          (fee) =>
            fee.destination.toLowerCase() === destinationCity.toLowerCase() ||
            fee.destination.toLowerCase() ===
              selectedAddress.region.toLowerCase()
        );
      }

      // If still no specific route found, use the first available fee as fallback
      if (!applicableFee && transporter.transportationFees.length > 0) {
        applicableFee = transporter.transportationFees[0];
      }

      if (applicableFee) {
        // Calculate fee based on item quantity/weight if needed
        // For now, we'll charge the fee per item
        totalTransportationFees += applicableFee.price * item.quantity;
      }
    });

    return totalTransportationFees;
  };

  // Get detailed transportation fees breakdown
  const getTransportationFeesBreakdown = () => {
    if (!items?.length || !addresses.length) return [];

    const selectedAddress = addresses.find(
      (addr) => addr.id === selectedAddressId
    );
    if (!selectedAddress) return [];

    const breakdown: Array<{
      itemName: string;
      transporterName: string;
      route: string;
      transportationType: string;
      quantity: number;
      feePerUnit: number;
      totalFee: number;
    }> = [];

    items.forEach((item) => {
      const transporterId = selectedTransporterIds[item.productId];
      if (!transporterId) return;

      const transporter = transporters.find((t) => t.id === transporterId);
      if (!transporter?.transportationFees) return;

      const destinationCity = selectedAddress.city;

      // Try to find a fee that matches both destination and transportation type
      let applicableFee = transporter.transportationFees.find(
        (fee) =>
          (fee.destination.toLowerCase() === destinationCity.toLowerCase() ||
            fee.destination.toLowerCase() ===
              selectedAddress.region.toLowerCase()) &&
          fee.transportationType === deliveryOption
      );

      // If no exact match found, try to find by destination only
      if (!applicableFee) {
        applicableFee = transporter.transportationFees.find(
          (fee) =>
            fee.destination.toLowerCase() === destinationCity.toLowerCase() ||
            fee.destination.toLowerCase() ===
              selectedAddress.region.toLowerCase()
        );
      }

      // If still no specific route found, use the first available fee as fallback
      if (!applicableFee && transporter.transportationFees.length > 0) {
        applicableFee = transporter.transportationFees[0];
      }

      if (applicableFee) {
        breakdown.push({
          itemName: item.product.name,
          transporterName: transporter.businessName,
          route: `${applicableFee.startingPoint} → ${applicableFee.destination}`,
          transportationType:
            applicableFee.transportationType.charAt(0).toUpperCase() +
            applicableFee.transportationType.slice(1),
          quantity: item.quantity,
          feePerUnit: applicableFee.price,
          totalFee: applicableFee.price * item.quantity,
        });
      }
    });

    return breakdown;
  };

  // Calculate the total with delivery
  const getOrderTotal = () => {
    if (!items?.length) {
      return 0;
    }

    // Calculate items total
    const itemsTotal = items.reduce((sum, item) => {
      const price = Number(item.product.unitPrice);
      const quantity = Number(item.quantity);

      if (isNaN(price) || isNaN(quantity)) {
        return sum;
      }

      const itemTotal = price * quantity;
      return sum + itemTotal;
    }, 0);

    const baseDeliveryFee = deliveryOption === "express" ? 10000 : 5000;
    const transportationFees = calculateTransportationFees();
    const finalTotal = Math.round(
      itemsTotal + baseDeliveryFee + transportationFees
    );

    return finalTotal;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate address selection
    if (selectedAddressId === "new" || !selectedAddressId) {
      alert("Please select a delivery address");
      return;
    }

    // Show payment methods
    setShowPaymentMethods(true);
  };

  // Handle payment completion
  const handlePaymentComplete = async (transactionId: string) => {
    try {
      // Create order with payment details
      const orderData = {
        items: items.map((item) => {
          const transporterId = selectedTransporterIds[item.productId];
          return {
            productId: item.productId,
            quantity: item.quantity,
            ...(transporterId ? { transporterId } : {}),
          };
        }),
        deliveryOption,
        paymentMethod: "credit_card",
        paymentDetails: {
          provider: "Payment",
          phoneNumber: "",
          transactionId: transactionId,
        },
        addressId: selectedAddressId,
        notes: notes || "",
        transactionId: transactionId,
      };

      const result = await dispatch(createOrder(orderData)).unwrap();
      dispatch(clearCart());
      navigate(`/orders/${result.id}`);
    } catch (error: any) {
      alert(error.message || "Failed to create order");
    }
  };

  // Handle payment failure
  const handlePaymentFailed = () => {
    setShowPaymentMethods(false);
  };

  // Add this helper function at the top of the component
  const getLatestAddresses = (addresses: Address[]) => {
    return [...addresses]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 3);
  };

  // Add debug logging for addresses
  useEffect(() => {}, [addresses]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {typeof error === "string"
            ? error
            : "Failed to load addresses. Please try again."}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Delivery and Payment */}
          <div className="md:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <MapPin size={18} className="mr-2 text-blue-600" />
                Delivery Address
              </h3>

              {isLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <div>
                  {/* Show existing addresses first */}
                  {addresses.length > 0 && !isCreatingAddress && (
                    <div className="space-y-4 mb-4">
                      <div className="grid gap-4">
                        {getLatestAddresses(addresses).map((address) => (
                          <label key={address.id} className="relative block">
                            <input
                              type="radio"
                              name="addressId"
                              value={address.id}
                              checked={selectedAddressId === address.id}
                              onChange={() =>
                                setSelectedAddressId(address.id as string)
                              }
                              className="sr-only"
                            />
                            <div
                              className={`
                              border rounded-lg p-4 cursor-pointer transition-all
                              ${
                                selectedAddressId === address.id
                                  ? "border-blue-500 ring-2 ring-blue-200"
                                  : "border-gray-200 hover:border-gray-300"
                              }
                            `}
                            >
                              <div className="font-medium">
                                {address.fullName}
                              </div>
                              <div className="text-gray-600 text-sm mt-1">
                                {address.addressLine1}
                                {address.addressLine2 &&
                                  `, ${address.addressLine2}`}
                              </div>
                              <div className="text-gray-600 text-sm">
                                {address.district}, {address.city},{" "}
                                {address.region}
                              </div>
                              <div className="text-gray-600 text-sm">
                                {address.country}{" "}
                                {address.postalCode &&
                                  `, ${address.postalCode}`}
                              </div>
                              <div className="text-gray-600 text-sm mt-1">
                                {address.phoneNumber}
                              </div>
                              {address.isDefault && (
                                <span className="absolute top-2 right-2 text-xs font-medium text-blue-600">
                                  Default
                                </span>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>

                      {addresses.length > 3 && (
                        <div className="text-sm text-gray-500 mt-2">
                          Showing 3 most recent addresses. Click "Add New
                          Address" to create another.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Add New Address Button */}
                  {!isCreatingAddress && (
                    <Button
                      type="button"
                      onClick={() => setIsCreatingAddress(true)}
                      variant="outline"
                      className="w-full"
                    >
                      {addresses.length > 0
                        ? "+ Add New Address"
                        : "Add Your First Address"}
                    </Button>
                  )}

                  {/* Address Creation Form */}
                  {isCreatingAddress && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextField
                          label="Full Name"
                          name="fullName"
                          value={newAddress.fullName}
                          onChange={handleNewAddressChange}
                          required
                        />

                        <TextField
                          label="Phone Number"
                          name="phoneNumber"
                          value={newAddress.phoneNumber}
                          onChange={handleNewAddressChange}
                          required
                        />
                      </div>

                      <TextField
                        label="Address Line 1"
                        name="addressLine1"
                        value={newAddress.addressLine1}
                        onChange={handleNewAddressChange}
                        required
                      />

                      <TextField
                        label="Address Line 2 (Optional)"
                        name="addressLine2"
                        value={newAddress.addressLine2 || ""}
                        onChange={handleNewAddressChange}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <TextField
                          label="City"
                          name="city"
                          value={newAddress.city}
                          onChange={handleNewAddressChange}
                          required
                        />

                        <TextField
                          label="Region"
                          name="region"
                          value={newAddress.region}
                          onChange={handleNewAddressChange}
                          required
                        />

                        <TextField
                          label="District"
                          name="district"
                          value={newAddress.district}
                          onChange={handleNewAddressChange}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextField
                          label="Postal Code (Optional)"
                          name="postalCode"
                          value={newAddress.postalCode || ""}
                          onChange={handleNewAddressChange}
                        />

                        <TextField
                          label="Country"
                          name="country"
                          value={newAddress.country}
                          onChange={handleNewAddressChange}
                          required
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isDefault"
                          name="isDefault"
                          checked={newAddress.isDefault}
                          onChange={handleNewAddressChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="isDefault"
                          className="ml-2 text-gray-700"
                        >
                          Set as default address
                        </label>
                      </div>

                      <div className="flex space-x-3">
                        <Button
                          type="button"
                          onClick={handleCreateAddress}
                          variant="primary"
                        >
                          Save Address
                        </Button>

                        <Button
                          type="button"
                          onClick={() => setIsCreatingAddress(false)}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Delivery Options */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Truck size={18} className="mr-2 text-blue-600" />
                Delivery Options
              </h3>

              <div className="space-y-3">
                <label className="relative flex items-start">
                  <input
                    type="radio"
                    name="deliveryOption"
                    value="standard"
                    checked={deliveryOption === "standard"}
                    onChange={() => setDeliveryOption("standard")}
                    className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <span className="block font-medium text-gray-800">
                      Standard Delivery
                    </span>
                    <span className="block text-sm text-gray-500">
                      Delivery within 24-48 hours
                    </span>
                  </div>
                  <span className="ml-auto font-medium">TZS 5,000</span>
                </label>

                <label className="relative flex items-start">
                  <input
                    type="radio"
                    name="deliveryOption"
                    value="express"
                    checked={deliveryOption === "express"}
                    onChange={() => setDeliveryOption("express")}
                    className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <span className="block font-medium text-gray-800">
                      Express Delivery
                    </span>
                    <span className="block text-sm text-gray-500">
                      Delivery within 3-6 hours
                    </span>
                  </div>
                  <span className="ml-auto font-medium">TZS 10,000</span>
                </label>
              </div>
            </div>

            {/* Select Transporters */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Truck size={18} className="mr-2 text-blue-600" />
                Select Transporters
              </h3>

              {transportersLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-center mb-3">
                        <div className="w-16 h-16 rounded overflow-hidden border border-gray-200 flex-shrink-0">
                          {item.product.images &&
                          item.product.images.length > 0 ? (
                            <img
                              src={item.product.images[0].url}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <h4 className="font-medium text-gray-800 uppercase">
                            {item.product.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Quantity: {item.quantity} ×{" "}
                            {parseInt(item.product.unitPrice).toLocaleString()}{" "}
                            TZS
                          </p>
                        </div>
                      </div>

                      <TransporterSelect
                        transporters={transporters}
                        selectedTransporter={
                          selectedTransporterIds[item.productId] || null
                        }
                        onSelect={(transporterId) =>
                          handleTransporterSelect(item.productId, transporterId)
                        }
                        isLoading={transportersLoading}
                        className="mt-2"
                        destinationCity={
                          addresses.find(
                            (addr) => addr.id === selectedAddressId
                          )?.city
                        }
                        destinationRegion={
                          addresses.find(
                            (addr) => addr.id === selectedAddressId
                          )?.region
                        }
                        deliveryOption={
                          deliveryOption as "standard" | "express"
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Order Notes (Optional)
              </h3>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any special instructions or requests"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              ></textarea>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Order Summary
              </h3>

              <div className="border-t border-gray-200 pt-4">
                <div className="max-h-64 overflow-y-auto mb-4">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex justify-between py-2 border-b border-gray-100"
                    >
                      <div>
                        <span className="text-gray-800 uppercase">
                          {item.product.name}
                        </span>
                        <span className="text-gray-500 text-sm block">
                          Qty: {item.quantity}
                        </span>
                      </div>
                      <span className="font-medium">
                        TZS{" "}
                        {(
                          parseInt(item.product.unitPrice) * item.quantity
                        ).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    TZS{" "}
                    {items
                      .reduce(
                        (sum, item) =>
                          sum +
                          Number(item.product.unitPrice) *
                            Number(item.quantity),
                        0
                      )
                      .toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Base Delivery Fee</span>
                  <span className="font-medium">
                    TZS{" "}
                    {(deliveryOption === "express"
                      ? 10000
                      : 5000
                    ).toLocaleString()}
                  </span>
                </div>

                {/* Transportation Fees Breakdown */}
                {getTransportationFeesBreakdown().length > 0 && (
                  <div className="py-2 border-t border-gray-100">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600 font-medium">
                        Transportation Fees
                      </span>
                      <span className="font-medium">
                        TZS {calculateTransportationFees().toLocaleString()}
                      </span>
                    </div>
                    <div className="space-y-1 ml-4">
                      {getTransportationFeesBreakdown().map((fee, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm text-gray-500"
                        >
                          <div>
                            <span className="block">{fee.itemName}</span>
                            <span className="text-xs">
                              {fee.route} via {fee.transporterName} (
                              {fee.transportationType})
                            </span>
                          </div>
                          <span>
                            {fee.quantity} × TZS{" "}
                            {fee.feePerUnit.toLocaleString()} = TZS{" "}
                            {fee.totalFee.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between py-3 border-t border-gray-200 mt-2">
                  <span className="text-lg font-bold text-gray-800">Total</span>
                  <span className="text-lg font-bold text-blue-700">
                    TZS {getOrderTotal().toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {!showPaymentMethods ? (
                  <>
                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      isLoading={isLoading}
                      disabled={isLoading}
                    >
                      Place Order
                    </Button>

                    <Button
                      type="button"
                      onClick={onBack}
                      variant="outline"
                      fullWidth
                    >
                      Back to Cart
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <PaymentMethodSelector
                      amount={getOrderTotal()}
                      addressId={selectedAddressId as string}
                      onPaymentComplete={handlePaymentComplete}
                      onPaymentFailed={handlePaymentFailed}
                      orderSummary={getOrderSummaryForPayment()}
                    />

                    <Button
                      type="button"
                      onClick={() => setShowPaymentMethods(false)}
                      variant="outline"
                      fullWidth
                    >
                      Back to Order Details
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutForm;
