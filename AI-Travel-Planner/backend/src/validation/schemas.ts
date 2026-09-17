import { z } from "zod";

// These schemas are the first line of defense against malformed requests.
// The AI output has its own schema because LLM output must never be trusted blindly.
const isoDate = z.string().datetime({ offset: true });

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(2).max(100)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const tripCreateSchema = z.object({
  title: z.string().min(2).max(150),
  origin: z.string().max(150).optional(),
  destinations: z.array(z.object({
    name: z.string().min(1).max(150),
    lat: z.number().optional(),
    lng: z.number().optional()
  })).min(1),
  startDate: isoDate,
  endDate: isoDate,
  travelerCount: z.number().int().min(1).max(100),
  budget: z.number().positive(),
  currency: z.string().length(3).default("INR"),
  preferences: z.object({
    interests: z.array(z.string()).default([]),
    dietary: z.array(z.string()).default([]),
    pace: z.string().default("balanced"),
    hotelType: z.string().optional(),
    transport: z.string().optional(),
    freeText: z.string().max(2000).optional()
  }).optional()
});

export const tripUpdateSchema = tripCreateSchema.partial();

export const itineraryDraftSchema = z.object({
  days: z.array(z.object({
    dayNumber: z.number().int().positive(),
    date: isoDate,
    summary: z.string().optional(),
    activities: z.array(z.object({
      name: z.string().min(1),
      placeId: z.string().optional(),
      category: z.string().default("activity"),
      startTime: isoDate,
      endTime: isoDate,
      estimatedCost: z.number().nonnegative().default(0),
      notes: z.string().optional(),
      orderIndex: z.number().int().nonnegative().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
      openingHours: z.string().optional()
    }))
  }))
});

export const placeSearchSchema = z.object({
  query: z.string().min(1).max(150),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radius: z.coerce.number().positive().max(50000).default(5000)
});

export const routeSchema = z.object({
  origin: z.object({ lat: z.number(), lng: z.number() }),
  destination: z.object({ lat: z.number(), lng: z.number() })
});
