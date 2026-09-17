import { prisma } from "../db.js";
import type { Prisma } from "@prisma/client";
import { itineraryDraftSchema } from "../validation/schemas.js";
import { validateItinerary } from "../validation/itinerary.validator.js";
import type { AuthRequest } from "../types.js";
import { routeParam } from "../utils/params.js";

export async function createItinerary(req: AuthRequest, res: any) {
  const tripId = routeParam(req.params.id);
  if (!tripId) return res.status(400).json({ error: "Missing trip id" });

  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      userId: req.user!.id
    }
  });

  if (!trip) return res.status(404).json({ error: "Trip not found" });

  // Parse the candidate itinerary before it can touch the database.
  const input = itineraryDraftSchema.parse(req.body);

  const validation = validateItinerary({
    trip,
    days: input.days
  });

  // Invalid itineraries are not persisted by this endpoint.
  if (!validation.valid) {
    return res.status(422).json({
      error: "Itinerary failed deterministic validation",
      validation
    });
  }

  const version =
    (await prisma.itinerary.count({ where: { tripId: trip.id } })) + 1;

  const itinerary = await prisma.itinerary.create({
    data: {
      tripId: trip.id,
      version,
      status: "VALIDATED",
      days: {
        create: input.days.map(day => ({
          dayNumber: day.dayNumber,
          date: new Date(day.date),
          summary: day.summary,
          activities: {
            create: day.activities.map((activity, index) => ({
              name: activity.name,
              placeId: activity.placeId,
              category: activity.category,
              startTime: new Date(activity.startTime),
              endTime: new Date(activity.endTime),
              estimatedCost: activity.estimatedCost,
              notes: activity.notes,
              orderIndex: activity.orderIndex ?? index,
              lat: activity.lat,
              lng: activity.lng,
              openingHours: activity.openingHours
            }))
          }
        }))
      }
    },
    include: {
      days: {
        include: { activities: true },
        orderBy: { dayNumber: "asc" }
      }
    }
  });

  await prisma.trip.update({
    where: { id: trip.id },
    data: { status: "READY" }
  });

  res.status(201).json({
    itinerary,
    validation
  });
}

export async function getItinerary(req: AuthRequest, res: any) {
  const tripId = routeParam(req.params.id);
  if (!tripId) return res.status(400).json({ error: "Missing trip id" });

  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      userId: req.user!.id
    }
  });

  if (!trip) return res.status(404).json({ error: "Trip not found" });

  const itinerary = await prisma.itinerary.findFirst({
    where: { tripId: trip.id },
    orderBy: { version: "desc" },
    include: {
      days: {
        include: { activities: true },
        orderBy: { dayNumber: "asc" }
      }
    }
  });

  res.json({ itinerary });
}

export async function validateItineraryRecord(req: AuthRequest, res: any) {
  const itineraryId = routeParam(req.params.id);
  if (!itineraryId) return res.status(400).json({ error: "Missing itinerary id" });

  const itinerary = await prisma.itinerary.findFirst({
    where: {
      id: itineraryId,
      trip: { userId: req.user!.id }
    },
    include: {
      trip: true,
      days: {
        include: { activities: true }
      }
    }
  }) as Prisma.ItineraryGetPayload<{
    include: {
      trip: true;
      days: { include: { activities: true } };
    };
  }> | null;

  if (!itinerary) {
    return res.status(404).json({ error: "Itinerary not found" });
  }

  // Prisma returns nullable database fields as `null`, while the public
  // validation contract uses optional fields (`undefined`). Normalize the
  // persisted record at this boundary so the validator stays provider- and
  // ORM-independent.
  const validationDays = itinerary.days.map(day => ({
    dayNumber: day.dayNumber,
    date: day.date,
    activities: day.activities.map(activity => ({
      name: activity.name,
      placeId: activity.placeId ?? undefined,
      category: activity.category,
      startTime: activity.startTime,
      endTime: activity.endTime,
      estimatedCost: activity.estimatedCost,
      lat: activity.lat ?? undefined,
      lng: activity.lng ?? undefined,
      openingHours: activity.openingHours ?? undefined
    }))
  }));

  const validation = validateItinerary({
    trip: itinerary.trip,
    days: validationDays
  });

  res.json({ validation });
}

export async function updateActivity(req: AuthRequest, res: any) {
  const activityId = routeParam(req.params.id);
  if (!activityId) return res.status(400).json({ error: "Missing activity id" });
  // The nested ownership query is essential: a user must not be able to
  // edit an activity belonging to someone else's trip by guessing its ID.
  const activity = await prisma.activity.findFirst({
    where: {
      id: activityId,
      itineraryDay: {
        itinerary: {
          trip: { userId: req.user!.id }
        }
      }
    }
  });

  if (!activity) return res.status(404).json({ error: "Activity not found" });

  const body = req.body;

  const updated = await prisma.activity.update({
    where: { id: activity.id },
    data: {
      name: body.name,
      startTime: body.startTime ? new Date(body.startTime) : undefined,
      endTime: body.endTime ? new Date(body.endTime) : undefined,
      estimatedCost: body.estimatedCost,
      notes: body.notes,
      orderIndex: body.orderIndex,
      source: "USER_EDIT"
    }
  });

  res.json({ activity: updated });
}

export async function deleteActivity(req: AuthRequest, res: any) {
  const activityId = routeParam(req.params.id);
  if (!activityId) return res.status(400).json({ error: "Missing activity id" });
  const activity = await prisma.activity.findFirst({
    where: {
      id: activityId,
      itineraryDay: {
        itinerary: {
          trip: { userId: req.user!.id }
        }
      }
    }
  });

  if (!activity) return res.status(404).json({ error: "Activity not found" });

  await prisma.activity.delete({
    where: { id: activity.id }
  });

  res.status(204).send();
}
