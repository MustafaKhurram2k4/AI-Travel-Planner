import type { PlaceResult, RouteResult } from "../types.js";
import { env } from "../config/env.js";

// Provider interfaces are the key abstraction.
// The rest of the backend asks for places/routes without caring whether
// the data comes from a mock implementation or Google.
export interface PlacesProvider {
  search(query: string, lat?: number, lng?: number, radius?: number): Promise<PlaceResult[]>;
  getDetails(externalPlaceId: string): Promise<PlaceResult | null>;
}

export interface RoutesProvider {
  directions(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<RouteResult>;
}

// Mock data makes the project deterministic and demonstrable without API keys.
class MockPlacesProvider implements PlacesProvider {
  private places: PlaceResult[] = [
    {
      externalPlaceId: "mock-sensoji",
      name: "Senso-ji Temple",
      category: "temple",
      lat: 35.7148,
      lng: 139.7967,
      rating: 4.7,
      priceLevel: 0,
      openingHours: ["06:00-17:00"]
    },
    {
      externalPlaceId: "mock-akihabara",
      name: "Akihabara Electric Town",
      category: "technology",
      lat: 35.6984,
      lng: 139.7731,
      rating: 4.5,
      priceLevel: 1,
      openingHours: ["10:00-20:00"]
    },
    {
      externalPlaceId: "mock-teamlab",
      name: "teamLab Borderless",
      category: "museum",
      lat: 35.6259,
      lng: 139.7833,
      rating: 4.6,
      priceLevel: 2,
      openingHours: ["09:00-21:00"]
    },
    {
      externalPlaceId: "mock-shibuya",
      name: "Shibuya Crossing",
      category: "landmark",
      lat: 35.6595,
      lng: 139.7005,
      rating: 4.6,
      priceLevel: 0,
      openingHours: ["00:00-23:59"]
    }
  ];

  async search(query: string) {
    const q = query.toLowerCase();
    const matches = this.places.filter(p =>
      `${p.name} ${p.category}`.toLowerCase().includes(q)
    );
    return matches.length ? matches : this.places;
  }

  async getDetails(externalPlaceId: string) {
    return this.places.find(p => p.externalPlaceId === externalPlaceId) ?? null;
  }
}

// Google implementation is isolated here.
// If Google changes its response shape, only this adapter should need major changes.
class GooglePlacesProvider implements PlacesProvider {
  constructor(private readonly key: string) {}

  async search(query: string, lat?: number, lng?: number, radius = 5000) {
    const body: Record<string, unknown> = {
      textQuery: query,
      maxResultCount: 10
    };

    if (lat !== undefined && lng !== undefined) {
      body.locationBias = {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius
        }
      };
    }

    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": this.key,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.location,places.rating,places.priceLevel,places.regularOpeningHours"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) throw new Error(`Google Places error: ${response.status}`);
    const data = await response.json() as any;

    return (data.places ?? []).map((p: any) => ({
      externalPlaceId: p.id,
      name: p.displayName?.text ?? "Unknown place",
      category: "place",
      lat: p.location?.latitude ?? 0,
      lng: p.location?.longitude ?? 0,
      rating: p.rating,
      priceLevel: p.priceLevel,
      openingHours: p.regularOpeningHours?.weekdayDescriptions
    }));
  }

  async getDetails(externalPlaceId: string) {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(externalPlaceId)}`,
      {
        headers: {
          "X-Goog-Api-Key": this.key,
          "X-Goog-FieldMask":
            "id,displayName,location,rating,priceLevel,regularOpeningHours"
        }
      }
    );

    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Google Places details error: ${response.status}`);

    const p = await response.json() as any;
    return {
      externalPlaceId: p.id,
      name: p.displayName?.text ?? "Unknown place",
      category: "place",
      lat: p.location?.latitude ?? 0,
      lng: p.location?.longitude ?? 0,
      rating: p.rating,
      priceLevel: p.priceLevel,
      openingHours: p.regularOpeningHours?.weekdayDescriptions
    };
  }
}

class MockRoutesProvider implements RoutesProvider {
  async directions(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ) {
    // Haversine gives deterministic approximate distance.
    // It is NOT a replacement for road/transit routing and is only used in mock mode.
    const distanceMeters = haversine(origin.lat, origin.lng, destination.lat, destination.lng);
    const durationSeconds = Math.round(distanceMeters / 7);
    return { distanceMeters, durationSeconds };
  }
}

class GoogleRoutesProvider implements RoutesProvider {
  constructor(private readonly key: string) {}

  async directions(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ) {
    const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": this.key,
        "X-Goog-FieldMask":
          "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline"
      },
      body: JSON.stringify({
        origin: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
        destination: {
          location: { latLng: { latitude: destination.lat, longitude: destination.lng } }
        },
        travelMode: "TRANSIT"
      })
    });

    if (!response.ok) throw new Error(`Google Routes error: ${response.status}`);

    const data = await response.json() as any;
    const route = data.routes?.[0];
    if (!route) throw new Error("No route found");

    return {
      distanceMeters: route.distanceMeters ?? 0,
      durationSeconds: Number.parseFloat(String(route.duration ?? "0").replace("s", "")),
      polyline: route.polyline?.encodedPolyline
    };
  }
}

export const placesProvider: PlacesProvider =
  !env.USE_MOCK_SERVICES && env.GOOGLE_MAPS_API_KEY
    ? new GooglePlacesProvider(env.GOOGLE_MAPS_API_KEY)
    : new MockPlacesProvider();

export const routesProvider: RoutesProvider =
  !env.USE_MOCK_SERVICES && env.GOOGLE_MAPS_API_KEY
    ? new GoogleRoutesProvider(env.GOOGLE_MAPS_API_KEY)
    : new MockRoutesProvider();

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
