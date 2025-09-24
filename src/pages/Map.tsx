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

const customIcon = L.icon({
  iconUrl: pinIcon,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export interface UserLocation {
  userId: string | undefined;
  lat: number;
  lng: number;
}

export default function Map() {
  const [myLocation, setMyLocation] = useState<UserLocation | null>(null);
  const [otherLocations, setOtherLocations] = useState<Record<string, UserLocation>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // 🔹 Watch and broadcast my location
  useEffect(() => {
    watchLocation((pos) => {
      const updatedLocation = { userId: user?.id, lat: pos.lat, lng: pos.lng };
      setMyLocation(updatedLocation);

      // Broadcast updated location
      locationChannel.send({
        type: "broadcast",
        event: "location-update",
        payload: updatedLocation,
      });

      setLoading(false);
    });
  }, [user]);

  console.log("other", otherLocations);

  // 🔹 Listen for other users' locations
  useEffect(() => {
    locationChannel
      .on("system", { event: "location-update" }, (payload: { userId: string; lat: number; lng: number }) => {
        console.log("received location", payload);
        if (!payload.userId || payload.userId === user?.id) return; // ignore my own updates

        setOtherLocations((prev) => ({
          ...prev,
          [payload.userId]: payload, // upsert by userId
        }));
      })
      .subscribe();

    return () => {
      locationChannel.unsubscribe();
    };
  }, [user]);

  if (loading || !myLocation) return <Loader />;

  const center = getCenter(myLocation, Object.values(otherLocations)) as [number, number];

  return (
    <MapContainer center={center} zoom={5} style={{ height: "100vh", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* My location */}
      <Marker icon={customIcon} position={[myLocation.lat, myLocation.lng]}>
        <Popup>You</Popup>
      </Marker>

      {/* Other users */}
      {Object.values(otherLocations).map((user) => (
        <Marker key={user.userId} position={[user.lat, user.lng]}>
          <Popup>{user.userId}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
