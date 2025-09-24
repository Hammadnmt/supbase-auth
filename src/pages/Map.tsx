import { watchLocation } from "@/libs/getCuurentlocation";
import { locationChannel } from "@/libs/supabase";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAuth } from "@/context/useAuth";
import getCenter from "@/libs/getMapCenter";
import pinIcon from "@/assets/pin-icon.jpg";
import Loader from "@/components/Loader";

// Simple loader component

const customIcon = L.icon({
  iconUrl: pinIcon,
  iconSize: [32, 32], // width, height
  iconAnchor: [16, 32], // point of the icon which will correspond to marker's location
  popupAnchor: [0, -32], // where popups open relative to the iconAnchor
});
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
  console.log("others:", otherLocation);

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
        <Marker icon={customIcon} position={[myLocation.lat, myLocation.lng]}>
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
