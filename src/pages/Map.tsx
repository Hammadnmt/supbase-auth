import { watchLocation } from "@/libs/getCuurentlocation";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAuth } from "@/context/useAuth";
import getCenter from "@/libs/getMapCenter";
import pinIcon from "@/assets/pin-icon.jpg";
import otherpinIcon from "@/assets/other-pin.png";
import Loader from "@/components/Loader";
import { useRealtime } from "@/context/real-time-provider";
import { toast } from "sonner";

const customIcon = L.icon({
  iconUrl: pinIcon,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const customOtherIcon = L.icon({
  iconUrl: otherpinIcon,
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
  const [otherLocations, setOtherLocations] = useState<UserLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { channel } = useRealtime();

  useEffect(() => {
    watchLocation(
      (pos) => {
        const updatedLocation = { userId: user?.id, lat: pos.lat, lng: pos.lng };
        setMyLocation(updatedLocation);
        setLoading(false);

        if (!channel) {
          console.warn("Channel is not available");
          return;
        }

        channel.send({
          type: "broadcast",
          event: "location-update",
          payload: updatedLocation,
        });
      },
      (error) => {
        toast.error("Error getting location: " + error.message);
        setLoading(false);
      }
    );
  }, [user?.id, channel]);

  useEffect(() => {
    if (!channel) {
      console.warn("Channel is not available");
      return;
    }

    const subscription = channel.on(
      "broadcast",
      { event: "location-update" },
      (payload: { payload: UserLocation }) => {
        const newLocation = payload.payload;

        // Don't add our own location to other locations
        if (newLocation.userId === user?.id) {
          return;
        }

        setOtherLocations((prev) => {
          const filtered = prev.filter((loc) => loc.userId !== newLocation.userId);
          return [...filtered, newLocation];
        });
      }
    );

    return () => {
      if (subscription) {
        channel.unsubscribe();
      }
    };
  }, [channel, user?.id]);

  if (loading || !myLocation) return <Loader />;

  const center = getCenter(myLocation, otherLocations) as [number, number];

  return (
    <MapContainer center={center} zoom={5} style={{ height: "100vh", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* My location */}
      <Marker icon={customIcon} position={[myLocation.lat, myLocation.lng]}>
        <Popup>You</Popup>
      </Marker>

      {/* Other users */}
      {otherLocations.map((userLoc) => (
        <Marker icon={customOtherIcon} key={userLoc.userId} position={[userLoc.lat, userLoc.lng]}>
          <Popup>{userLoc.userId}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
