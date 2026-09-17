import { getPlaceDetails, searchPlaces } from "../services/places.service.js";
import { placeSearchSchema } from "../validation/schemas.js";
import { routeParam } from "../utils/params.js";

export async function search(req: any, res: any) {
  const input = placeSearchSchema.parse(req.query);

  const places = await searchPlaces(
    input.query,
    input.lat,
    input.lng,
    input.radius
  );

  res.json({
    places,
    provider: "places-service"
  });
}

export async function details(req: any, res: any) {
  const placeId = routeParam(req.params.placeId);
  if (!placeId) return res.status(400).json({ error: "Missing place id" });

  const place = await getPlaceDetails(placeId);

  if (!place) return res.status(404).json({ error: "Place not found" });

  res.json({ place });
}
