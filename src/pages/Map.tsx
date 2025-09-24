import { watchLocation } from "@/libs/getCuurentlocation";
import { locationChannel } from "@/libs/supabase";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useAuth } from "@/context/useAuth";
import getCenter from "@/libs/getMapCenter";
// Simple loader component
function Loader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

export interface UserLocation {
  userId: string | undefined;
  lat: number;
  lng: number;
}

export default function Map() {
  const [myLocation, setMyLocation] = useState<UserLocation | null>(null);
  const [otherLocation, setOtherLocation] = useState<UserLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Watch my location
  useEffect(() => {
    watchLocation((pos) => {
      const updatedLocation = { userId: user?.id, lat: pos.lat, lng: pos.lng };
      setMyLocation(updatedLocation);

      // Broadcast updated location
      locationChannel.send({ type: "broadcast", event: "location-update", payload: updatedLocation });

      // Stop loading when we get first location
      setLoading(false);
    });
  }, [user]);

  // Listen for other users' locations
  useEffect(() => {
    locationChannel
      .on("system", { event: "location-update" }, (payload: UserLocation) => {
        setOtherLocation((prev) => {
          const exists = prev.find((loc) => loc.userId === payload.userId);
          if (exists) {
            return prev.map((loc) => (loc.userId === payload.userId ? payload : loc));
          } else {
            return [...prev, payload];
          }
        });
      })
      .subscribe();
  }, []);

  if (loading || !myLocation) return <Loader />;

  const center = getCenter(myLocation, otherLocation) as [number, number];

  return (
    <MapContainer center={center} zoom={5} style={{ height: "100vh", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {myLocation && (
        <Marker position={[myLocation.lat, myLocation.lng]}>
          <Popup>You</Popup>
        </Marker>
      )}
      {otherLocation.map((user) => (
        <Marker key={user.userId} position={[user.lat, user.lng]}>
          <Popup>Other User</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
