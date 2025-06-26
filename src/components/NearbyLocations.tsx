import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Location {
  id: string;
  name: string;
  type: "no-frills" | "loblaws";
  address: string;
  distance: string;
  rating: number;
  openNow: boolean;
  lat: number;
  lng: number;
}

interface UserLocation {
  lat: number;
  lng: number;
  address: string;
}

export const NearbyLocations = ({ userId }: { userId: string }) => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [nearbyStores, setNearbyStores] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for nearby stores (in real app, this would come from Google Places API)
  const mockStores: Location[] = [
    {
      id: "1",
      name: "No Frills",
      type: "no-frills",
      address: "123 Queen St W, Toronto, ON M5H 2M9",
      distance: "0.3 km",
      rating: 4.2,
      openNow: true,
      lat: 43.6532,
      lng: -79.3832,
    },
    {
      id: "2",
      name: "Loblaws",
      type: "loblaws",
      address: "456 Bay St, Toronto, ON M5G 2C9",
      distance: "0.8 km",
      rating: 4.5,
      openNow: true,
      lat: 43.6548,
      lng: -79.3805,
    },
    {
      id: "3",
      name: "No Frills",
      type: "no-frills",
      address: "789 Yonge St, Toronto, ON M4W 2G8",
      distance: "1.2 km",
      rating: 4.0,
      openNow: false,
      lat: 43.671,
      lng: -79.388,
    },
  ];

  useEffect(() => {
    async function getUserLocation() {
      try {
        // Try to get user's location from browser geolocation
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userLoc: UserLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                address: "Your Location",
              };
              setUserLocation(userLoc);
              setNearbyStores(mockStores);
              setLoading(false);
            },
            (error) => {
              console.log("Geolocation error:", error);
              // Fallback to downtown Toronto
              const fallbackLocation: UserLocation = {
                lat: 43.6532,
                lng: -79.3832,
                address: "Downtown Toronto",
              };
              setUserLocation(fallbackLocation);
              setNearbyStores(mockStores);
              setLoading(false);
            }
          );
        } else {
          // Fallback to downtown Toronto if geolocation not available
          const fallbackLocation: UserLocation = {
            lat: 43.6532,
            lng: -79.3832,
            address: "Downtown Toronto",
          };
          setUserLocation(fallbackLocation);
          setNearbyStores(mockStores);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error getting location:", error);
        // Final fallback to downtown Toronto
        const fallbackLocation: UserLocation = {
          lat: 43.6532,
          lng: -79.3832,
          address: "Downtown Toronto",
        };
        setUserLocation(fallbackLocation);
        setNearbyStores(mockStores);
        setLoading(false);
      }
    }

    getUserLocation();
  }, []);

  const getStoreIcon = (type: string) => {
    return type === "no-frills" ? "🛒" : "🏪";
  };

  const getStoreColor = (type: string) => {
    return type === "no-frills"
      ? "bg-orange-100 text-orange-700"
      : "bg-green-100 text-green-700";
  };

  const handleVisitStore = (store: Location) => {
    // This would typically open a map or store locator
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      store.address
    )}`;
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 border border-orange-200/50 mb-4">
          <h2 className="text-xl font-bold text-gray-900">Nearby Locations</h2>
          <p className="text-sm text-gray-600">Finding stores near you...</p>
        </div>
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded-2xl mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 border border-orange-200/50 mb-4">
        <h2 className="text-xl font-bold text-gray-900">Nearby Locations</h2>
        <p className="text-sm text-gray-600">
          Stores where you can use your discounts and circle rewards
        </p>
      </div>

      <div>
        {/* Store List */}
        <div className="space-y-3">
          {nearbyStores.map((store) => (
            <div
              key={store.id}
              className="p-4 rounded-2xl border-2 border-gray-200 bg-white/40 backdrop-blur-sm transition-all duration-200 hover:shadow-md"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{getStoreIcon(store.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-gray-900">
                        {store.name}
                      </h4>
                      <Badge className={getStoreColor(store.type)}>
                        {store.type === "no-frills" ? "No Frills" : "Loblaws"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {store.address}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{store.distance} away</span>
                      <span>⭐ {store.rating}</span>
                      <span
                        className={
                          store.openNow ? "text-green-600" : "text-red-600"
                        }
                      >
                        {store.openNow ? "Open Now" : "Closed"}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                  onClick={() => handleVisitStore(store)}
                >
                  Directions
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-green-50 rounded-2xl border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">📍</span>
            </div>
            <div>
              <p className="font-medium text-green-800">Store Summary</p>
              <p className="text-sm text-green-700">
                Found {nearbyStores.length} stores within 1.5km of your location
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};