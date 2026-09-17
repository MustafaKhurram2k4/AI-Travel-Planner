import { routesProvider } from "./providers.js";

// Route calls are deliberately hidden behind a service.
// This allows Google, a mock provider, or a future provider to be swapped
// without changing controllers or frontend contracts.
export function getDirections(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
) {
  return routesProvider.directions(origin, destination);
}
