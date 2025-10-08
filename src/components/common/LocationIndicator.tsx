import { MapPin, RefreshCw } from "lucide-react";
import React from "react";
import { useLocation } from "../../hooks/useLocation";

interface LocationIndicatorProps {
  className?: string;
  showRefresh?: boolean;
}

const LocationIndicator: React.FC<LocationIndicatorProps> = ({
  className = "",
  showRefresh = true,
}) => {
  const { locationInfo, locationStatus, isLoading, refreshLocation } =
    useLocation();

  if (isLoading) {
    return (
      <div className={`flex items-center text-sm text-gray-600 ${className}`}>
        <MapPin size={14} className="mr-1 animate-pulse" />
        <span>Detecting location...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center text-sm ${className}`}>
      <MapPin
        size={14}
        className={`mr-1 ${
          locationStatus === "local" ? "text-green-600" : "text-blue-600"
        }`}
      />
      <span
        className={
          locationStatus === "local" ? "text-green-600" : "text-blue-600"
        }
      >
        {locationStatus === "local" ? "Tanzania (Local)" : "International"}
      </span>
      {locationInfo?.error && (
        <span className="text-amber-600 ml-1" title={locationInfo.error}>
          (Default)
        </span>
      )}
      {showRefresh && (
        <button
          onClick={refreshLocation}
          className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
          title="Refresh location"
        >
          <RefreshCw size={12} className="text-gray-500" />
        </button>
      )}
    </div>
  );
};

export default LocationIndicator;
