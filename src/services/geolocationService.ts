export interface LocationInfo {
  latitude: number;
  longitude: number;
  isLocal: boolean;
  country?: string;
  error?: string;
}

class GeolocationService {
  // Tanzania boundaries (approximate)
  private readonly TANZANIA_BOUNDS = {
    north: -0.99, // Northern boundary
    south: -11.74, // Southern boundary
    east: 40.43, // Eastern boundary
    west: 29.34, // Western boundary
  };

  /**
   * Check if coordinates are within Tanzania boundaries
   */
  private isWithinTanzania(latitude: number, longitude: number): boolean {
    return (
      latitude >= this.TANZANIA_BOUNDS.south &&
      latitude <= this.TANZANIA_BOUNDS.north &&
      longitude >= this.TANZANIA_BOUNDS.west &&
      longitude <= this.TANZANIA_BOUNDS.east
    );
  }

  /**
   * Get user's current location using browser geolocation API
   */
  async getCurrentLocation(): Promise<LocationInfo> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({
          latitude: 0,
          longitude: 0,
          isLocal: false,
          error: "Geolocation is not supported by this browser",
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const isLocal = this.isWithinTanzania(latitude, longitude);

          console.log("User location:", { latitude, longitude, isLocal });

          resolve({
            latitude,
            longitude,
            isLocal,
            country: isLocal ? "Tanzania" : "International",
          });
        },
        (error) => {
          console.error("Geolocation error:", error);

          // Default to local if geolocation fails
          resolve({
            latitude: 0,
            longitude: 0,
            isLocal: true, // Default to local for Tanzania market
            error: error.message,
          });
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000, // Cache for 5 minutes
        }
      );
    });
  }

  /**
   * Get location status (local/international) as string for API
   */
  async getLocationStatus(): Promise<"local" | "international"> {
    const locationInfo = await this.getCurrentLocation();
    return locationInfo.isLocal ? "local" : "international";
  }

  /**
   * Check if user has granted geolocation permission
   */
  async checkPermission(): Promise<PermissionState> {
    if ("permissions" in navigator) {
      const result = await navigator.permissions.query({ name: "geolocation" });
      return result.state;
    }
    return "prompt";
  }

  /**
   * Get cached location from localStorage if available
   */
  getCachedLocation(): LocationInfo | null {
    try {
      const cached = localStorage.getItem("userLocation");
      if (cached) {
        const parsed = JSON.parse(cached);
        const cacheTime = parsed.timestamp;
        const now = Date.now();

        // Cache for 30 minutes
        if (now - cacheTime < 30 * 60 * 1000) {
          return {
            latitude: parsed.latitude,
            longitude: parsed.longitude,
            isLocal: parsed.isLocal,
            country: parsed.country,
          };
        }
      }
    } catch (error) {
      console.error("Error reading cached location:", error);
    }
    return null;
  }

  /**
   * Cache location to localStorage
   */
  cacheLocation(locationInfo: LocationInfo): void {
    try {
      const cacheData = {
        ...locationInfo,
        timestamp: Date.now(),
      };
      localStorage.setItem("userLocation", JSON.stringify(cacheData));
    } catch (error) {
      console.error("Error caching location:", error);
    }
  }

  /**
   * Get location with caching
   */
  async getLocationWithCache(): Promise<LocationInfo> {
    // Try to get cached location first
    const cached = this.getCachedLocation();
    if (cached) {
      console.log("Using cached location:", cached);
      return cached;
    }

    // Get fresh location and cache it
    const location = await this.getCurrentLocation();
    if (!location.error) {
      this.cacheLocation(location);
    }

    return location;
  }
}

export const geolocationService = new GeolocationService();
export default geolocationService;
