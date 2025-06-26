import {
  AlertCircle,
  BanknoteIcon,
  CheckCircle2,
  DollarSign,
  Loader2,
  MoreVertical,
  Plus,
  RefreshCcw,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  cancelPayout,
  fetchEarningsSummary,
  fetchSellerPayouts,
} from "../../redux/slices/payoutSlice";
import { SellerPayout } from "../../types";

const SellerPayoutsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { profile } = useAppSelector((state) => state.seller);
  const { payouts, isLoading, error, earningsSummary } = useAppSelector(
    (state) => state.payouts
  );

  const isUserSeller = user?.roles?.includes("seller");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [cancellingPayoutId, setCancellingPayoutId] = useState<string | null>(
    null
  );
  const [showActionDropdown, setShowActionDropdown] = useState<string | null>(
    null
  );

  // Filter payouts based on status
  const filteredPayouts = filterStatus
    ? payouts.filter((payout) => payout.status === filterStatus)
    : payouts;

  // Fetch earnings summary when component mounts
  useEffect(() => {
    dispatch(fetchEarningsSummary());
  }, [dispatch]);

  // Fetch payouts when component mounts
  useEffect(() => {
    // Redirect if not authenticated or not a seller
    if (!isAuthenticated || !isUserSeller) {
      navigate("/login");
      return;
    }

    // Redirect if seller profile is not verified
    if (profile && !profile.isVerified) {
      navigate("/seller/dashboard");
      return;
    }

    // Fetch payouts
    dispatch(fetchSellerPayouts());
  }, [isAuthenticated, isUserSeller, profile, navigate, dispatch]);

  const handleRefresh = () => {
    dispatch(fetchSellerPayouts());
    dispatch(fetchEarningsSummary());
  };

  // Handle payout cancellation
  const handleCancelPayout = async (payoutId: string) => {
    if (
      window.confirm("Are you sure you want to cancel this payout request?")
    ) {
      setCancellingPayoutId(payoutId);
      try {
        await dispatch(cancelPayout(payoutId)).unwrap();
        toast.success("Payout request cancelled successfully");
      } catch (error) {
        toast.error("Failed to cancel payout request");
      } finally {
        setCancellingPayoutId(null);
        setShowActionDropdown(null);
      }
    }
  };

  // Toggle dropdown for a specific payout
  const toggleActionDropdown = (payoutId: string) => {
    setShowActionDropdown(showActionDropdown === payoutId ? null : payoutId);
  };

  // Get status class for badge
  const getStatusClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Redirect if not authenticated or not a seller
  if (!isAuthenticated || !isUserSeller || (profile && !profile.isVerified)) {
    return null;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payouts</h1>
          <p className="text-gray-600 mt-2">
            Manage your payout requests and transaction history
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50"
            disabled={isLoading || earningsSummary.isLoading}
          >
            {isLoading || earningsSummary.isLoading ? (
              <Loader2 size={16} className="mr-1.5 animate-spin" />
            ) : (
              <RefreshCcw size={16} className="mr-1.5" />
            )}
            Refresh
          </button>
          <button
            onClick={() => navigate("/seller/payouts/request")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            disabled={isLoading || earningsSummary.isLoading}
          >
            <Plus size={16} className="mr-2" />
            Request Payout
          </button>
        </div>
      </div>

      {/* Balance Card */}
      <div className="mb-6 bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Earnings Summary
            </h3>
            {earningsSummary.isLoading && (
              <div className="flex items-center text-sm text-gray-500">
                <Loader2 size={16} className="mr-1.5 animate-spin" />
                Loading...
              </div>
            )}
          </div>

          {earningsSummary.error ? (
            <div className="bg-red-50 p-4 rounded-md text-red-800 text-sm mb-4 flex items-center">
              <AlertCircle size={16} className="mr-2" />
              {earningsSummary.error}
              <button
                onClick={() => dispatch(fetchEarningsSummary())}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
              <div className="bg-primary-50 p-4 rounded-md border border-primary-100">
                <h3 className="text-sm font-medium text-gray-600 flex items-center">
                  <BanknoteIcon size={16} className="mr-1.5 text-primary-500" />
                  Available Balance
                </h3>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  TZS {earningsSummary.availableBalance.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Available for withdrawal
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <DollarSign size={16} className="mr-1.5 text-green-500" />
                  Total Earnings
                </h3>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  TZS{" "}
                  {parseFloat(
                    earningsSummary.totalNetEarnings || "0"
                  ).toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Net earnings (after fees)
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <RefreshCcw size={16} className="mr-1.5 text-purple-500" />
                  Total Payouts
                </h3>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  TZS{" "}
                  {parseFloat(
                    earningsSummary.totalPayouts || "0"
                  ).toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Total amount withdrawn
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <div className="w-64">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            disabled={isLoading}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Payouts list */}
      {isLoading && !payouts.length ? (
        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-center h-40">
            <div className="text-center">
              <Loader2
                className="animate-spin h-10 w-10 text-primary-600 mx-auto mb-3"
                aria-hidden="true"
              />
              <p className="text-gray-600">Loading payouts...</p>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white shadow-sm rounded-lg p-6 border border-red-200">
          <div className="text-center text-red-500">
            <XCircle className="h-10 w-10 mx-auto mb-3" />
            <p>{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 text-primary-600 hover:text-primary-800"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : filteredPayouts.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-center h-40 text-gray-400">
            <div className="text-center">
              <BanknoteIcon className="h-12 w-12 mx-auto mb-2" />
              <p>No payouts yet</p>
              {filterStatus ? (
                <button
                  onClick={() => setFilterStatus("")}
                  className="mt-2 text-sm text-primary-600 hover:text-primary-800"
                >
                  Clear filter
                </button>
              ) : (
                <button
                  onClick={() => navigate("/seller/payouts/request")}
                  className="mt-2 text-sm text-primary-600 hover:text-primary-800"
                >
                  Request a payout
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Payment Method
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayouts.map((payout: SellerPayout) => (
                  <tr key={payout.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payout.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        TZS {parseFloat(payout.amount).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Ref: {payout.reference}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">
                        {payout.paymentMethod || "Mobile Money"}
                      </div>
                      {payout.metadata && (
                        <div className="text-xs text-gray-500">
                          {payout.metadata.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                          payout.status
                        )}`}
                      >
                        {payout.status.charAt(0).toUpperCase() +
                          payout.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payout.createdAt).toLocaleDateString()}
                      <div className="text-xs">
                        {new Date(payout.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                      {payout.status === "pending" && (
                        <>
                          <button
                            onClick={() => toggleActionDropdown(payout.id)}
                            className="text-gray-500 hover:text-gray-700"
                            aria-label="Payout actions"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {showActionDropdown === payout.id && (
                            <div className="origin-top-right absolute right-6 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                              <div
                                className="py-1"
                                role="menu"
                                aria-orientation="vertical"
                              >
                                <button
                                  onClick={() => handleCancelPayout(payout.id)}
                                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                                  role="menuitem"
                                  disabled={cancellingPayoutId === payout.id}
                                >
                                  {cancellingPayoutId === payout.id ? (
                                    <Loader2
                                      size={14}
                                      className="mr-2 animate-spin"
                                    />
                                  ) : (
                                    <XCircle size={14} className="mr-2" />
                                  )}
                                  Cancel Request
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {payout.status === "cancelled" && (
                        <div className="flex items-center justify-end text-gray-500">
                          <AlertCircle size={14} className="mr-1" />
                          <span className="text-xs">Cancelled</span>
                        </div>
                      )}

                      {payout.status === "completed" && (
                        <div className="flex items-center justify-end text-green-500">
                          <CheckCircle2 size={14} className="mr-1" />
                          <span className="text-xs">Completed</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerPayoutsPage;
