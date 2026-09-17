// OpenAPI specification for the backend API.
//
// We define the paths explicitly instead of relying on JSDoc route scanning.
// The previous version used `apis: []`, which produced a valid Swagger page
// but with zero operations. Keeping the specification here also makes the
// API contract easy for the frontend and AI teammates to understand.
export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "AI Travel Planner API",
    version: "1.0.0",
    description:
      "REST API for the AI Travel Planner & Itinerary Maker. The backend owns persistence, service abstractions, authentication, and deterministic itinerary validation."
  },
  servers: [{ url: "http://localhost:4000/api/v1" }],
  tags: [
    { name: "Authentication", description: "Registration, login and current-user operations." },
    { name: "Trips", description: "Trip creation, retrieval, modification and preferences." },
    { name: "Places", description: "Normalized place search and details." },
    { name: "Routes", description: "Route/directions service abstraction." },
    { name: "Itineraries", description: "Validated itinerary persistence and activity editing." },
    { name: "Planning", description: "AI candidate itinerary validation boundary." }
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
    },
    schemas: {
      AuthUser: {
        type: "object",
        properties: {
          id: { type: "string" },
          email: { type: "string", format: "email" },
          name: { type: "string" },
          homeLocation: { type: "string", nullable: true },
          currency: { type: "string", example: "INR" }
        }
      },
      AuthResponse: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/AuthUser" },
          token: { type: "string" }
        }
      },
      Error: {
        type: "object",
        properties: { error: { type: "string" } }
      },
      DestinationInput: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", example: "Delhi" },
          lat: { type: "number", format: "double" },
          lng: { type: "number", format: "double" }
        }
      },
      PreferencesInput: {
        type: "object",
        properties: {
          interests: { type: "array", items: { type: "string" }, example: ["history", "food"] },
          dietary: { type: "array", items: { type: "string" }, example: ["vegetarian"] },
          pace: { type: "string", example: "balanced" },
          hotelType: { type: "string", example: "3-star" },
          transport: { type: "string", example: "metro" },
          freeText: { type: "string", example: "Prefer places close to each other." }
        }
      },
      TripCreate: {
        type: "object",
        required: ["title", "destinations", "startDate", "endDate", "travelerCount", "budget"],
        properties: {
          title: { type: "string", example: "Delhi Weekend" },
          origin: { type: "string", example: "New Delhi" },
          destinations: { type: "array", minItems: 1, items: { $ref: "#/components/schemas/DestinationInput" } },
          startDate: { type: "string", format: "date-time" },
          endDate: { type: "string", format: "date-time" },
          travelerCount: { type: "integer", minimum: 1, example: 2 },
          budget: { type: "number", minimum: 0, example: 5000 },
          currency: { type: "string", minLength: 3, maxLength: 3, example: "INR" },
          preferences: { $ref: "#/components/schemas/PreferencesInput" }
        }
      },
      TripUpdate: {
        allOf: [{ $ref: "#/components/schemas/TripCreate" }],
        description: "All fields are optional when updating a trip."
      },
      RoutePoint: {
        type: "object",
        required: ["lat", "lng"],
        properties: {
          lat: { type: "number", format: "double", example: 28.6139 },
          lng: { type: "number", format: "double", example: 77.2090 }
        }
      },
      RouteRequest: {
        type: "object",
        required: ["origin", "destination"],
        properties: {
          origin: { $ref: "#/components/schemas/RoutePoint" },
          destination: { $ref: "#/components/schemas/RoutePoint" }
        }
      },
      ActivityDraft: {
        type: "object",
        required: ["name", "startTime", "endTime"],
        properties: {
          name: { type: "string", example: "Qutub Minar" },
          placeId: { type: "string", nullable: true },
          category: { type: "string", example: "sightseeing" },
          startTime: { type: "string", format: "date-time" },
          endTime: { type: "string", format: "date-time" },
          estimatedCost: { type: "number", minimum: 0, example: 500 },
          notes: { type: "string" },
          orderIndex: { type: "integer", minimum: 0 },
          lat: { type: "number", format: "double" },
          lng: { type: "number", format: "double" },
          openingHours: { type: "string", example: "09:00-18:00" }
        }
      },
      ItineraryDayDraft: {
        type: "object",
        required: ["dayNumber", "date", "activities"],
        properties: {
          dayNumber: { type: "integer", minimum: 1, example: 1 },
          date: { type: "string", format: "date-time" },
          summary: { type: "string" },
          activities: { type: "array", items: { $ref: "#/components/schemas/ActivityDraft" } }
        }
      },
      ItineraryDraft: {
        type: "object",
        required: ["days"],
        properties: {
          days: { type: "array", items: { $ref: "#/components/schemas/ItineraryDayDraft" } }
        }
      },
      ValidationResult: {
        type: "object",
        description: "Deterministic validation result returned by the backend validator."
      }
    }
  },
  paths: {
    "/auth/register": {
      post: {
        tags: ["Authentication"], summary: "Register a new user", requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["email", "password", "name"], properties: { email: { type: "string", format: "email" }, password: { type: "string", minLength: 8 }, name: { type: "string", minLength: 2 } } } } } },
        responses: { "201": { description: "User created", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } }, "409": { description: "Email already registered", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } } }
      }
    },
    "/auth/login": {
      post: {
        tags: ["Authentication"], summary: "Login and receive a JWT", requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["email", "password"], properties: { email: { type: "string", format: "email" }, password: { type: "string" } } } } } },
        responses: { "200": { description: "Authenticated", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } }, "401": { description: "Invalid credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } } }
      }
    },
    "/auth/me": {
      get: { tags: ["Authentication"], summary: "Get the authenticated user", security: [{ bearerAuth: [] }], responses: { "200": { description: "Current user" }, "401": { description: "Authentication required" } } }
    },
    "/trips": {
      post: { tags: ["Trips"], summary: "Create a trip", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/TripCreate" } } } }, responses: { "201": { description: "Trip created" }, "400": { description: "Invalid dates" } } },
      get: { tags: ["Trips"], summary: "List the user's trips", security: [{ bearerAuth: [] }], responses: { "200": { description: "Trip list" } } }
    },
    "/trips/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      get: { tags: ["Trips"], summary: "Get a trip", security: [{ bearerAuth: [] }], responses: { "200": { description: "Trip details" }, "404": { description: "Trip not found" } } },
      patch: { tags: ["Trips"], summary: "Update a trip", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/TripUpdate" } } } }, responses: { "200": { description: "Trip updated" }, "404": { description: "Trip not found" } } },
      delete: { tags: ["Trips"], summary: "Delete a trip", security: [{ bearerAuth: [] }], responses: { "204": { description: "Trip deleted" }, "404": { description: "Trip not found" } } }
    },
    "/trips/{id}/preferences": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      get: { tags: ["Trips"], summary: "Get trip preferences", security: [{ bearerAuth: [] }], responses: { "200": { description: "Preferences" } } },
      put: { tags: ["Trips"], summary: "Create or update trip preferences", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/PreferencesInput" } } } }, responses: { "200": { description: "Preferences updated" } } }
    },
    "/places/search": {
      get: { tags: ["Places"], summary: "Search places", security: [{ bearerAuth: [] }], parameters: [
        { name: "query", in: "query", required: true, schema: { type: "string" }, example: "museum" },
        { name: "lat", in: "query", schema: { type: "number" } },
        { name: "lng", in: "query", schema: { type: "number" } },
        { name: "radius", in: "query", schema: { type: "number", default: 5000 } }
      ], responses: { "200": { description: "Normalized place results" } } }
    },
    "/places/{placeId}": {
      get: { tags: ["Places"], summary: "Get place details", security: [{ bearerAuth: [] }], parameters: [{ name: "placeId", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Place details" }, "404": { description: "Place not found" } } }
    },
    "/routes/directions": {
      post: { tags: ["Routes"], summary: "Get route directions", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/RouteRequest" } } } }, responses: { "200": { description: "Route result" } } }
    },
    "/trips/{id}/itinerary": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      post: { tags: ["Itineraries"], summary: "Validate and persist an itinerary", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ItineraryDraft" } } } }, responses: { "201": { description: "Validated itinerary persisted" }, "422": { description: "Itinerary failed deterministic validation" } } },
      get: { tags: ["Itineraries"], summary: "Get latest itinerary", security: [{ bearerAuth: [] }], responses: { "200": { description: "Latest itinerary" } } }
    },
    "/itineraries/{id}/validate": {
      post: { tags: ["Itineraries"], summary: "Revalidate a stored itinerary", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Validation result" }, "404": { description: "Itinerary not found" } } }
    },
    "/activities/{id}": {
      patch: { tags: ["Itineraries"], summary: "Edit an itinerary activity", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" }, startTime: { type: "string", format: "date-time" }, endTime: { type: "string", format: "date-time" }, estimatedCost: { type: "number" }, notes: { type: "string" }, orderIndex: { type: "integer" } } } } } }, responses: { "200": { description: "Activity updated" }, "404": { description: "Activity not found" } } },
      delete: { tags: ["Itineraries"], summary: "Delete an itinerary activity", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "204": { description: "Activity deleted" }, "404": { description: "Activity not found" } } }
    },
    "/planning/{tripId}/validate-draft": {
      post: { tags: ["Planning"], summary: "Validate an AI-generated itinerary draft", description: "Integration boundary between the AI planner and the deterministic backend validation engine.", security: [{ bearerAuth: [] }], parameters: [{ name: "tripId", in: "path", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ItineraryDraft" } } } }, responses: { "200": { description: "Validation result", content: { "application/json": { schema: { type: "object", properties: { source: { type: "string", example: "deterministic-validation-engine" }, validation: { $ref: "#/components/schemas/ValidationResult" } } } } } }, "404": { description: "Trip not found" }, "422": { description: "Malformed itinerary draft" } } }
    }
  }
} as const;
