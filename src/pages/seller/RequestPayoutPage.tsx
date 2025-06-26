import {
  ArrowLeft,
  BanknoteIcon,
  Clock,
  Loader2,
  Phone,
  RefreshCcw,
  WalletCards,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  fetchEarningsSummary,
  requestPayout,
} from "../../redux/slices/payoutSlice";
import { SellerPayoutRequest } from "../../types";

const RequestPayoutPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { profile } = useAppSelector((state) => state.seller);
  const { isLoading, error, earningsSummary } = useAppSelector(
    (state) => state.payouts
  );

  const isUserSeller = user?.roles?.includes("seller");

  // Fetch earnings summary to get available balance
  useEffect(() => {
    dispatch(fetchEarningsSummary());
  }, [dispatch]);

  // Form state
  const [form, setForm] = useState<SellerPayoutRequest>({
    amount: 0,
    paymentMethod: "mobile_money",
    paymentDetails: {
      phone: "",
      operator: "vodacom",
    },
  });

  // Validation state
  const [errors, setErrors] = useState<{
    amount?: string;
    phone?: string;
  }>({});

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "phone") {
      setForm({
        ...form,
        paymentDetails: {
          ...form.paymentDetails,
          phone: value,
        },
      });
    } else if (name === "operator") {
      setForm({
        ...form,
        paymentDetails: {
          ...form.paymentDetails,
          operator: value,
        },
      });
    } else {
      setForm({
        ...form,
        [name]: name === "amount" ? Number(value) : value,
      });
    }

    // Clear validation errors when field is changed
    if (name === "amount" || name === "phone") {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationErrors: { amount?: string; phone?: string } = {};

    if (!form.amount || form.amount <= 0) {
      validationErrors.amount = "Please enter a valid amount";
    }

    if (form.amount > earningsSummary.availableBalance) {
      validationErrors.amount = "Amount exceeds your available balance";
    }

    if (!form.paymentDetails.phone) {
      validationErrors.phone = "Please enter a valid phone number";
    } else if (
      !/^\d{9,15}$/.test(form.paymentDetails.phone.replace(/[+\s-]/g, ""))
    ) {
      validationErrors.phone = "Please enter a valid phone number format";
    }

    // If validation errors, show them and stop submission
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      // Ensure we're using the right format for phone numbers
      const formattedPhone = `255${form.paymentDetails.phone
        .replace(/[+\s-]/g, "")
        .replace(/^0/, "")}`;
      const payoutRequest = {
        ...form,
        paymentDetails: {
          ...form.paymentDetails,
          phone: formattedPhone,
        },
        note: `Payment via Mobile Money (${form.paymentDetails.operator})`,
      };

      await dispatch(requestPayout(payoutRequest)).unwrap();
      toast.success("Payout request submitted successfully");
      navigate("/seller/payouts");
    } catch (error: any) {
      toast.error(error || "Failed to submit payout request");
    }
  };

  // Redirect if not authenticated or not a seller
  useEffect(() => {
    if (!isAuthenticated || !isUserSeller) {
      navigate("/login");
      return;
    }

    // Redirect if seller profile is not verified
    if (profile && !profile.isVerified) {
      navigate("/seller/dashboard");
    }
  }, [isAuthenticated, isUserSeller, profile, navigate]);

  if (!isAuthenticated || !isUserSeller || (profile && !profile.isVerified)) {
    return null;
  }

  return (
    <div>
      <button
        onClick={() => navigate("/seller/payouts")}
        className="mb-6 inline-flex items-center text-primary-600 hover:text-primary-700"
      >
        <ArrowLeft size={16} className="mr-1" />
        Back to Payouts
      </button>

      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Request Payout</h1>
          <p className="text-gray-600 mt-2">
            Request a payout from your available balance
          </p>
        </div>
        <button
          onClick={() => dispatch(fetchEarningsSummary())}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50"
          disabled={earningsSummary.isLoading}
        >
          {earningsSummary.isLoading ? (
            <Loader2 size={16} className="mr-1.5 animate-spin" />
          ) : (
            <RefreshCcw size={16} className="mr-1.5" />
          )}
          Refresh Balance
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-6">
              {error && (
                <div className="mb-6 bg-red-50 p-4 rounded-md text-red-800 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Amount Field */}
                  <div>
                    <label
                      htmlFor="amount"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Amount (TZS) <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <BanknoteIcon size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={form.amount}
                        onChange={handleInputChange}
                        className={`pl-10 block w-full sm:text-sm rounded-md p-2 border ${
                          errors.amount
                            ? "border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                        }`}
                        placeholder="0"
                        min="0"
                        max={earningsSummary.availableBalance}
                      />
                    </div>
                    {errors.amount && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.amount}
                      </p>
                    )}{" "}
                    <div className="mt-1 flex justify-between items-center">
                      <p className="text-xs text-gray-500">
                        Available balance: TZS{" "}
                        {earningsSummary.availableBalance.toLocaleString()}
                      </p>
                      {earningsSummary.isLoading && (
                        <Loader2
                          size={14}
                          className="animate-spin text-gray-400"
                        />
                      )}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label
                      htmlFor="paymentMethod"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Payment Method <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <WalletCards size={16} className="text-gray-400" />
                      </div>
                      <select
                        id="paymentMethod"
                        name="paymentMethod"
                        value={form.paymentMethod}
                        onChange={handleInputChange}
                        className="pl-10 block w-full sm:text-sm border-gray-300 rounded-md p-2 border focus:ring-primary-500 focus:border-primary-500"
                        disabled
                      >
                        <option value="mobile_money">Mobile Money</option>
                      </select>
                    </div>
                  </div>

                  {/* Mobile Money Operator */}
                  <div>
                    <label
                      htmlFor="operator"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Mobile Money Provider{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <select
                        id="operator"
                        name="operator"
                        value={form.paymentDetails.operator}
                        onChange={handleInputChange}
                        className="block w-full sm:text-sm border-gray-300 rounded-md p-2 border focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="vodacom">Vodacom (M-Pesa)</option>
                        <option value="airtel">Airtel Money</option>
                        <option value="tigo">Tigo Pesa</option>
                        <option value="zantel">Ezy Pesa</option>
                        <option value="halotel">Halotel Money</option>
                        <option value="ttcl">T-Pesa</option>
                      </select>
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={form.paymentDetails.phone}
                        onChange={handleInputChange}
                        className={`pl-10 block w-full sm:text-sm rounded-md p-2 border ${
                          errors.phone
                            ? "border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                        }`}
                        placeholder="0712345678"
                      />
                    </div>
                    {errors.phone ? (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.phone}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-gray-500">
                        Enter your phone number in the format 0712345678
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-5">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                        isLoading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={16} className="mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Request Payout"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Payout Information
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-6 text-sm">
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Earnings Summary
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Earnings:</span>
                      <span className="font-medium">
                        {earningsSummary.isLoading ? (
                          <Loader2 size={14} className="inline animate-spin" />
                        ) : (
                          `TZS ${parseFloat(
                            earningsSummary.totalEarnings || "0"
                          ).toLocaleString()}`
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Platform Fees:</span>
                      <span className="font-medium">
                        {earningsSummary.isLoading ? (
                          <Loader2 size={14} className="inline animate-spin" />
                        ) : (
                          `TZS ${parseFloat(
                            earningsSummary.totalPlatformFees || "0"
                          ).toLocaleString()}`
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Net Earnings:</span>
                      <span className="font-medium">
                        {earningsSummary.isLoading ? (
                          <Loader2 size={14} className="inline animate-spin" />
                        ) : (
                          `TZS ${parseFloat(
                            earningsSummary.totalNetEarnings || "0"
                          ).toLocaleString()}`
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Previous Payouts:</span>
                      <span className="font-medium">
                        {earningsSummary.isLoading ? (
                          <Loader2 size={14} className="inline animate-spin" />
                        ) : (
                          `TZS ${parseFloat(
                            earningsSummary.totalPayouts || "0"
                          ).toLocaleString()}`
                        )}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between font-bold">
                        <span className="text-primary-600">
                          Available Balance:
                        </span>
                        <span className="text-primary-600">
                          {earningsSummary.isLoading ? (
                            <Loader2
                              size={14}
                              className="inline animate-spin"
                            />
                          ) : (
                            `TZS ${earningsSummary.availableBalance.toLocaleString()}`
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock size={16} className="text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Processing Time</p>
                    <p className="text-gray-600">
                      Payouts are typically processed within 1-3 business days.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <BanknoteIcon
                    size={16}
                    className="text-gray-500 mr-2 mt-0.5"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Minimum Amount</p>
                    <p className="text-gray-600">
                      The minimum payout amount is TZS 10,000.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <WalletCards
                    size={16}
                    className="text-gray-500 mr-2 mt-0.5"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Payment Methods</p>
                    <p className="text-gray-600">
                      Currently, we only support mobile money payments for
                      payouts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestPayoutPage;
