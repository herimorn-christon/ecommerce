import { useEffect, useState } from "react";
import {
  geolocationService,
  LocationInfo,
} from "../services/geolocationService";

export interface UseLocationResult {
  locationInfo: LocationInfo | null;
  locationStatus: "local" | "international";
  isLoading: boolean;
  error: string | null;
  refreshLocation: () => Promise<void>;
  hasPermission: boolean;
}

export const useLocation = (): UseLocationResult => {
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  const fetchLocation = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check permission first
      const permission = await geolocationService.checkPermission();
      setHasPermission(permission === "granted");

      // Get location with caching
      const location = await geolocationService.getLocationWithCache();

      setLocationInfo(location);

      if (location.error) {
        setError(location.error);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to get location";
      setError(errorMessage);

      // Set default to local if location detection fails
      setLocationInfo({
        latitude: 0,
        longitude: 0,
        isLocal: true,
        country: "Tanzania",
        error: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLocation = async () => {
    // Clear cache and fetch fresh location
    localStorage.removeItem("userLocation");
    await fetchLocation();
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  const locationStatus: "local" | "international" = locationInfo?.isLocal
    ? "local"
    : "international";

  return {
    locationInfo,
    locationStatus,
    isLoading,
    error,
    refreshLocation,
    hasPermission,
  };
};

export default useLocation;
