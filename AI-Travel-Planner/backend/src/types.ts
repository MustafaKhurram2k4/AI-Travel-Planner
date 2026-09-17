import type { Request } from "express";

export type AuthRequest = Request & {
  user?: {
    id: string;
    email: string;
  };
};

// These normalized provider contracts are intentionally independent of Google.
// Arav and the frontend consume our stable application shape, not provider-specific JSON.
export type PlaceResult = {
  externalPlaceId: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  rating?: number;
  priceLevel?: number;
  openingHours?: string[];
};

export type RouteResult = {
  distanceMeters: number;
  durationSeconds: number;
  polyline?: string;
};
