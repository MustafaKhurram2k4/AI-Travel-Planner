import { PrismaClient } from "@prisma/client";

// One Prisma client is shared by the application.
// Keeping database access behind this module makes the rest of the project
// easier to test and keeps connection management in one place.
export const prisma = new PrismaClient();
