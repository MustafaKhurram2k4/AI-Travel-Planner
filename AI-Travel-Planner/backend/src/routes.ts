import { Router } from "express";
import { asyncHandler } from "./utils/asyncHandler.js";
import { requireAuth } from "./middleware/auth.js";

import * as auth from "./controllers/auth.controller.js";
import * as trips from "./controllers/trip.controller.js";
import * as places from "./controllers/place.controller.js";
import * as routes from "./controllers/route.controller.js";
import * as itinerary from "./controllers/itinerary.controller.js";
import * as planning from "./controllers/planning.controller.js";

export const api = Router();

api.post("/auth/register", asyncHandler(auth.register));
api.post("/auth/login", asyncHandler(auth.login));
api.get("/auth/me", requireAuth, asyncHandler(auth.me));

api.post("/trips", requireAuth, asyncHandler(trips.createTrip));
api.get("/trips", requireAuth, asyncHandler(trips.listTrips));
api.get("/trips/:id", requireAuth, asyncHandler(trips.getTrip));
api.patch("/trips/:id", requireAuth, asyncHandler(trips.updateTrip));
api.delete("/trips/:id", requireAuth, asyncHandler(trips.deleteTrip));
api.get("/trips/:id/preferences", requireAuth, asyncHandler(trips.getPreferences));
api.put("/trips/:id/preferences", requireAuth, asyncHandler(trips.updatePreferences));

api.get("/places/search", requireAuth, asyncHandler(places.search));
api.get("/places/:placeId", requireAuth, asyncHandler(places.details));

api.post("/routes/directions", requireAuth, asyncHandler(routes.directions));

api.post("/trips/:id/itinerary", requireAuth, asyncHandler(itinerary.createItinerary));
api.get("/trips/:id/itinerary", requireAuth, asyncHandler(itinerary.getItinerary));
api.post("/itineraries/:id/validate", requireAuth, asyncHandler(itinerary.validateItineraryRecord));
api.patch("/activities/:id", requireAuth, asyncHandler(itinerary.updateActivity));
api.delete("/activities/:id", requireAuth, asyncHandler(itinerary.deleteActivity));

api.post(
  "/planning/:tripId/validate-draft",
  requireAuth,
  asyncHandler(planning.validateDraft)
);
