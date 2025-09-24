import type { UserLocation } from "@/pages/Map";

export default function getCenter(
  point: UserLocation | null,
  pointsArr: UserLocation[] | null
): [number, number] {
  const allPoints: UserLocation[] = [];

  if (point) allPoints.push(point);

  if (pointsArr) allPoints.push(...pointsArr);

  if (allPoints.length === 0) return [point?.lat || 0, point?.lng || 0];

  const n = allPoints.length;
  const centerLat = allPoints.reduce((sum, p) => sum + p.lat, 0) / n;
  const centerLng = allPoints.reduce((sum, p) => sum + p.lng, 0) / n;

  return [centerLat, centerLng];
}
