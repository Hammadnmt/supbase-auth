export function watchLocation(
  callback: (pos: { lat: number; lng: number }) => void,
  errorCallback?: (err: GeolocationPositionError) => void
) {
  if (!navigator.geolocation) {
    console.warn("Geolocation is not supported by this browser.");
    return;
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      callback({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    },
    (error) => {
      if (errorCallback) {
        errorCallback(error);
      } else {
        console.error("Geolocation error:", error);
      }
    },
    {
      enableHighAccuracy: true, // better accuracy (but more battery use)
      maximumAge: 5000, // reuse cached position if < 5s old
      timeout: 10000, // fail if no position in 10s
    }
  );

  return watchId; // number
}
