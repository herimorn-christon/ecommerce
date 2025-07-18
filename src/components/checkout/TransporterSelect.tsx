import { Truck } from "lucide-react";
import React from "react";
import { Transporter } from "../../types";

interface TransporterSelectProps {
  transporters: Transporter[];
  selectedTransporter: string | null;
  onSelect: (transporterId: string) => void;
  isLoading: boolean;
  className?: string;
}

const TransporterSelect: React.FC<TransporterSelectProps> = ({
  transporters,
  selectedTransporter,
  onSelect,
  isLoading,
  className = "",
}) => {
  if (isLoading) {
    return (
      <div className={`animate-pulse space-y-3 ${className}`}>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!transporters || transporters.length === 0) {
    return (
      <div
        className={`bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded ${className}`}
      >
        No transporters available at the moment. Please try again later.
      </div>
    );
  }

  return (
    <div className={className}>
      <h4 className="text-sm font-medium text-gray-700 mb-2">
        Select a transporter:
      </h4>
      <div className="space-y-3">
        {transporters.map((transporter) => (
          <div
            key={transporter.id}
            className={`border rounded-lg p-3 cursor-pointer transition-colors ${
              selectedTransporter === transporter.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => onSelect(transporter.id)}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mr-3">
                <Truck size={16} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {transporter.businessName}
                </p>
                <p className="text-xs text-gray-500">
                  {transporter.region || "Location not specified"}{" "}
                  {transporter.isVerified && "• Verified"}
                </p>
              </div>
              <div className="ml-2">
                <div
                  className={`w-5 h-5 border rounded-full flex items-center justify-center ${
                    selectedTransporter === transporter.id
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {selectedTransporter === transporter.id && (
                    <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransporterSelect;
