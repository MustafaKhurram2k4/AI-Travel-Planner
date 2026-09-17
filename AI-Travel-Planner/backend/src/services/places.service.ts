import { prisma } from "../db.js";
import { placesProvider } from "./providers.js";

// This service is the application's stable place-search API.
// It normalizes provider data and caches useful place records in our DB.
export async function searchPlaces(
  query: string,
  lat?: number,
  lng?: number,
  radius?: number
) {
  const results = await placesProvider.search(query, lat, lng, radius);

  for (const place of results) {
    await prisma.place.upsert({
      where: { externalPlaceId: place.externalPlaceId },
      update: {
        name: place.name,
        category: place.category,
        lat: place.lat,
        lng: place.lng,
        rating: place.rating,
        priceLevel: place.priceLevel,
        openingHours: JSON.stringify(place.openingHours ?? [])
      },
      create: {
        externalPlaceId: place.externalPlaceId,
        name: place.name,
        category: place.category,
        lat: place.lat,
        lng: place.lng,
        rating: place.rating,
        priceLevel: place.priceLevel,
        openingHours: JSON.stringify(place.openingHours ?? [])
      }
    });
  }

  return results;
}

export function getPlaceDetails(externalPlaceId: string) {
  return placesProvider.getDetails(externalPlaceId);
}
