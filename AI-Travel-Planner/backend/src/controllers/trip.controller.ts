import { prisma } from "../db.js";
import { tripCreateSchema, tripUpdateSchema } from "../validation/schemas.js";
import type { AuthRequest } from "../types.js";
import type { Prisma } from "@prisma/client";
import { routeParam } from "../utils/params.js";

export async function createTrip(req: AuthRequest, res: any) {
  const input = tripCreateSchema.parse(req.body);

  const startDate = new Date(input.startDate);
  const endDate = new Date(input.endDate);

  if (endDate < startDate) {
    return res.status(400).json({ error: "endDate must be after startDate" });
  }

  const trip = await prisma.trip.create({
    data: {
      userId: req.user!.id,
      title: input.title,
      origin: input.origin,
      startDate,
      endDate,
      travelerCount: input.travelerCount,
      budget: input.budget,
      currency: input.currency,

      // Nested writes make trip creation atomic: either the trip and its
      // related destination/preferences are created together or the operation fails.
      destinations: {
        create: input.destinations.map((d, index) => ({
          name: d.name,
          lat: d.lat,
          lng: d.lng,
          orderIndex: index
        }))
      },

      preferences: input.preferences
        ? {
            create: {
              interests: JSON.stringify(input.preferences.interests),
              dietary: JSON.stringify(input.preferences.dietary),
              pace: input.preferences.pace,
              hotelType: input.preferences.hotelType,
              transport: input.preferences.transport,
              freeText: input.preferences.freeText
            }
          }
        : undefined
    },
    include: {
      destinations: true,
      preferences: true
    }
  });

  res.status(201).json({ trip });
}

export async function listTrips(req: AuthRequest, res: any) {
  const trips = await prisma.trip.findMany({
    where: { userId: req.user!.id },
    include: { destinations: true, preferences: true },
    orderBy: { createdAt: "desc" }
  });

  res.json({ trips });
}

export async function getTrip(req: AuthRequest, res: any) {
  const tripId = routeParam(req.params.id);
  if (!tripId) return res.status(400).json({ error: "Missing trip id" });
  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      userId: req.user!.id
    },
    include: {
      destinations: true,
      preferences: true,
      itineraries: {
        include: {
          days: {
            include: { activities: true }
          }
        }
      }
    }
  });

  const typedTrip = trip as Prisma.TripGetPayload<{
    include: {
      destinations: true;
      preferences: true;
      itineraries: { include: { days: { include: { activities: true } } } };
    };
  }> | null;

  if (!typedTrip) return res.status(404).json({ error: "Trip not found" });

  res.json({ trip: typedTrip });
}

export async function updateTrip(req: AuthRequest, res: any) {
  const tripId = routeParam(req.params.id);
  if (!tripId) return res.status(400).json({ error: "Missing trip id" });
  const input = tripUpdateSchema.parse(req.body);

  const existing = await prisma.trip.findFirst({
    where: {
      id: tripId,
      userId: req.user!.id
    }
  });

  if (!existing) return res.status(404).json({ error: "Trip not found" });

  const trip = await prisma.trip.update({
    where: { id: existing.id },
    data: {
      title: input.title,
      origin: input.origin,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
      travelerCount: input.travelerCount,
      budget: input.budget,
      currency: input.currency
    }
  });

  res.json({ trip });
}

export async function deleteTrip(req: AuthRequest, res: any) {
  const tripId = routeParam(req.params.id);
  if (!tripId) return res.status(400).json({ error: "Missing trip id" });
  const existing = await prisma.trip.findFirst({
    where: {
      id: tripId,
      userId: req.user!.id
    }
  });

  if (!existing) return res.status(404).json({ error: "Trip not found" });

  await prisma.trip.delete({ where: { id: existing.id } });

  res.status(204).send();
}

export async function getPreferences(req: AuthRequest, res: any) {
  const tripId = routeParam(req.params.id);
  if (!tripId) return res.status(400).json({ error: "Missing trip id" });
  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      userId: req.user!.id
    },
    include: { preferences: true }
  });

  const typedTrip = trip as Prisma.TripGetPayload<{ include: { preferences: true } }> | null;

  if (!typedTrip) return res.status(404).json({ error: "Trip not found" });

  res.json({ preferences: typedTrip.preferences });
}

export async function updatePreferences(req: AuthRequest, res: any) {
  const tripId = routeParam(req.params.id);
  if (!tripId) return res.status(400).json({ error: "Missing trip id" });
  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      userId: req.user!.id
    }
  });

  if (!trip) return res.status(404).json({ error: "Trip not found" });

  const body = req.body;

  const preferences = await prisma.tripPreference.upsert({
    where: { tripId: trip.id },
    update: {
      interests: JSON.stringify(body.interests ?? []),
      dietary: JSON.stringify(body.dietary ?? []),
      pace: body.pace ?? "balanced",
      hotelType: body.hotelType,
      transport: body.transport,
      freeText: body.freeText
    },
    create: {
      tripId: trip.id,
      interests: JSON.stringify(body.interests ?? []),
      dietary: JSON.stringify(body.dietary ?? []),
      pace: body.pace ?? "balanced",
      hotelType: body.hotelType,
      transport: body.transport,
      freeText: body.freeText
    }
  });

  res.json({ preferences });
}
