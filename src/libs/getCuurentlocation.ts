export function watchLocation(callback: (pos: { lat: number; lng: number }) => void) {
  if (!navigator.geolocation) return;
  const watchId = navigator.geolocation.watchPosition((position) => {
    callback({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    });
  });
  return watchId; // number
}
