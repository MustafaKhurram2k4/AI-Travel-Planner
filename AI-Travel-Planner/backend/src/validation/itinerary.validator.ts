// The validation engine is the most important piece of Mustafa's contribution.
//
// The LLM can produce a candidate itinerary, but this module is deterministic.
// That means the same input produces the same validation result and the model
// cannot override hard constraints.

export type DraftActivity = {
  name: string;
  placeId?: string;
  category: string;
  startTime: string | Date;
  endTime: string | Date;
  estimatedCost: number;
  lat?: number;
  lng?: number;
  openingHours?: string;
};

export type DraftDay = {
  dayNumber: number;
  date: string | Date;
  activities: DraftActivity[];
};

export type ValidationInput = {
  trip: {
    startDate: Date;
    endDate: Date;
    budget: number;
  };
  days: DraftDay[];
  routeMinutes?: Record<string, number>;
};

export type ValidationIssue = {
  type: string;
  dayNumber?: number;
  activity?: string;
  message: string;
  severity: "error" | "warning";
};

export function validateItinerary(input: ValidationInput) {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  let totalCost = 0;
  const placeOccurrences = new Map<string, number>();

  for (const day of input.days) {
    const dayDate = new Date(day.date);

    // Hard constraint: every itinerary day must fall inside the requested trip.
    if (
      dayDate < startOfDay(input.trip.startDate) ||
      dayDate > startOfDay(input.trip.endDate)
    ) {
      errors.push({
        type: "DATE",
        dayNumber: day.dayNumber,
        message: `Day ${day.dayNumber} falls outside the requested trip dates.`,
        severity: "error"
      });
    }

    // Sorting makes overlap detection independent of the order in which the AI
    // happened to return activities.
    const activities = [...day.activities].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    for (let i = 0; i < activities.length; i++) {
      const activity = activities[i];
      const start = new Date(activity.startTime);
      const end = new Date(activity.endTime);

      if (end <= start) {
        errors.push({
          type: "TIME_RANGE",
          dayNumber: day.dayNumber,
          activity: activity.name,
          message: `${activity.name} has an invalid time range.`,
          severity: "error"
        });
      }

      // Budget is calculated by normal application code, never by the LLM.
      totalCost += activity.estimatedCost;

      if (activity.placeId) {
        placeOccurrences.set(
          activity.placeId,
          (placeOccurrences.get(activity.placeId) ?? 0) + 1
        );
      }

      // If authoritative opening-hour data is present, enforce it.
      if (
        activity.openingHours &&
        !isWithinOpeningHours(start, end, activity.openingHours)
      ) {
        errors.push({
          type: "OPENING_HOURS",
          dayNumber: day.dayNumber,
          activity: activity.name,
          message: `${activity.name} is scheduled outside its supplied opening hours.`,
          severity: "error"
        });
      }

      const next = activities[i + 1];

      if (next) {
        const nextStart = new Date(next.startTime);

        // Hard constraint: activities cannot overlap.
        if (end > nextStart) {
          errors.push({
            type: "OVERLAP",
            dayNumber: day.dayNumber,
            activity: `${activity.name} → ${next.name}`,
            message: "Two activities overlap.",
            severity: "error"
          });
        }

        // If route information was supplied by the service layer, make sure
        // the free interval is long enough to travel.
        const routeKey =
          `${activity.placeId ?? activity.name}->${next.placeId ?? next.name}`;

        const requiredMinutes = input.routeMinutes?.[routeKey];

        if (requiredMinutes !== undefined) {
          const availableMinutes =
            (nextStart.getTime() - end.getTime()) / 60000;

          if (availableMinutes < requiredMinutes) {
            errors.push({
              type: "TRAVEL_TIME",
              dayNumber: day.dayNumber,
              activity: `${activity.name} → ${next.name}`,
              message:
                `Only ${Math.round(availableMinutes)} minutes available, ` +
                `but route requires about ${requiredMinutes} minutes.`,
              severity: "error"
            });
          }
        }
      }
    }
  }

  // Hard budget constraint.
  if (totalCost > input.trip.budget) {
    errors.push({
      type: "BUDGET",
      message:
        `Estimated itinerary cost ${totalCost.toFixed(2)} exceeds ` +
        `the trip budget ${input.trip.budget.toFixed(2)}.`,
      severity: "error"
    });
  }

  // Duplicate places are warnings rather than automatic failures because
  // returning to a place can sometimes be intentional.
  for (const [placeId, count] of placeOccurrences) {
    if (count > 1) {
      warnings.push({
        type: "DUPLICATE",
        activity: placeId,
        message: `Place ${placeId} appears ${count} times.`,
        severity: "warning"
      });
    }
  }

  // This is intentionally a warning because geographic efficiency is a soft
  // optimization rather than a strict safety constraint.
  for (const day of input.days) {
    const coordinates = day.activities.filter(
      a => a.lat !== undefined && a.lng !== undefined
    );

    if (coordinates.length >= 3) {
      for (let i = 2; i < coordinates.length; i++) {
        const previous = distance(
          coordinates[i - 2].lat!,
          coordinates[i - 2].lng!,
          coordinates[i - 1].lat!,
          coordinates[i - 1].lng!
        );

        const current = distance(
          coordinates[i - 1].lat!,
          coordinates[i - 1].lng!,
          coordinates[i].lat!,
          coordinates[i].lng!
        );

        if (current > previous * 2.5) {
          warnings.push({
            type: "GEOGRAPHIC_EFFICIENCY",
            dayNumber: day.dayNumber,
            message:
              "Potential geographic backtracking detected; consider clustering nearby activities.",
            severity: "warning"
          });
          break;
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary: {
      totalCost,
      budget: input.trip.budget,
      remainingBudget: input.trip.budget - totalCost,
      days: input.days.length,
      errorCount: errors.length,
      warningCount: warnings.length
    }
  };
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function distance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(a));
}

function isWithinOpeningHours(start: Date, end: Date, openingHours: string) {
  const match = openingHours.match(
    /(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/
  );

  // If the provider didn't give a parseable simple range, don't invent data.
  if (!match) return true;

  const [, sh, sm, eh, em] = match;

  const openMinutes = Number(sh) * 60 + Number(sm);
  const closeMinutes = Number(eh) * 60 + Number(em);

  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();

  return startMinutes >= openMinutes && endMinutes <= closeMinutes;
}
