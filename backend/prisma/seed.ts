import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // The seed gives the whole team a known account and known trip.
  // This makes frontend/backend integration possible before authentication
  // and live travel APIs are completely finalized.
  const passwordHash = await bcrypt.hash("Demo@12345", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@travelplanner.local" },
    update: { passwordHash },
    create: {
      email: "demo@travelplanner.local",
      passwordHash,
      name: "Demo Traveller",
      homeLocation: "Delhi",
      currency: "INR"
    }
  });

  const trip = await prisma.trip.findFirst({
    where: { userId: user.id, title: "Tokyo Demo Trip" }
  });

  if (!trip) {
    await prisma.trip.create({
      data: {
        userId: user.id,
        title: "Tokyo Demo Trip",
        origin: "Delhi",
        startDate: new Date("2026-11-10T00:00:00.000Z"),
        endDate: new Date("2026-11-15T00:00:00.000Z"),
        travelerCount: 1,
        budget: 150000,
        currency: "INR",
        preferences: {
          create: {
            interests: JSON.stringify(["technology", "food", "photography"]),
            dietary: JSON.stringify([]),
            pace: "balanced",
            transport: "public_transport"
          }
        },
        destinations: {
          create: [
            { name: "Tokyo", lat: 35.6762, lng: 139.6503, orderIndex: 0 }
          ]
        }
      }
    });
  }

  console.log("Seed complete.");
  console.log("Demo: demo@travelplanner.local / Demo@12345");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
