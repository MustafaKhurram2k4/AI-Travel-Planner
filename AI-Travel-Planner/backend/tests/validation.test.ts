import { describe, expect, it } from "vitest";
import { validateItinerary } from "../src/validation/itinerary.validator.js";

const trip = {
  startDate: new Date("2026-11-10T00:00:00"),
  endDate: new Date("2026-11-15T00:00:00"),
  budget: 5000
};

describe("deterministic itinerary validation", () => {
  it("accepts a valid itinerary", () => {
    const result = validateItinerary({
      trip,
      days: [{
        dayNumber: 1,
        date: "2026-11-10T00:00:00",
        activities: [{
          name: "Senso-ji",
          placeId: "sensoji",
          category: "temple",
          startTime: "2026-11-10T10:00:00",
          endTime: "2026-11-10T11:30:00",
          estimatedCost: 100
        }]
      }]
    });

    expect(result.valid).toBe(true);
  });

  it("rejects overlapping activities", () => {
    const result = validateItinerary({
      trip,
      days: [{
        dayNumber: 1,
        date: "2026-11-10T00:00:00",
        activities: [
          {
            name: "A",
            category: "museum",
            startTime: "2026-11-10T10:00:00",
            endTime: "2026-11-10T12:00:00",
            estimatedCost: 100
          },
          {
            name: "B",
            category: "food",
            startTime: "2026-11-10T11:00:00",
            endTime: "2026-11-10T13:00:00",
            estimatedCost: 100
          }
        ]
      }]
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.type === "OVERLAP")).toBe(true);
  });

  it("rejects budget overflow", () => {
    const result = validateItinerary({
      trip: { ...trip, budget: 50 },
      days: [{
        dayNumber: 1,
        date: "2026-11-10T00:00:00",
        activities: [{
          name: "Expensive Activity",
          category: "activity",
          startTime: "2026-11-10T10:00:00",
          endTime: "2026-11-10T11:00:00",
          estimatedCost: 100
        }]
      }]
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.type === "BUDGET")).toBe(true);
  });

  it("rejects an opening-hour violation", () => {
    const result = validateItinerary({
      trip,
      days: [{
        dayNumber: 1,
        date: "2026-11-10T00:00:00",
        activities: [{
          name: "Museum",
          category: "museum",
          startTime: "2026-11-10T08:00:00",
          endTime: "2026-11-10T10:00:00",
          estimatedCost: 100,
          openingHours: "09:00-18:00"
        }]
      }]
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.type === "OPENING_HOURS")).toBe(true);
  });
});
