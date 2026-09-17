import { itineraryDraftSchema } from "../validation/schemas.js";
import { validateItinerary } from "../validation/itinerary.validator.js";
import { prisma } from "../db.js";
import type { AuthRequest } from "../types.js";
import { routeParam } from "../utils/params.js";

// This endpoint is the clean handoff between Arav's AI and Mustafa's backend.
// Arav can generate any candidate that conforms to the schema.
// The backend then becomes the deterministic authority.
export async function validateDraft(req: AuthRequest, res: any) {
  const tripId = routeParam(req.params.tripId);
  if (!tripId) return res.status(400).json({ error: "Missing trip id" });

  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      userId: req.user!.id
    }
  });

  if (!trip) return res.status(404).json({ error: "Trip not found" });

  const draft = itineraryDraftSchema.parse(req.body);

  const validation = validateItinerary({
    trip,
    days: draft.days
  });

  res.json({
    source: "deterministic-validation-engine",
    validation
  });
}
