import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db.js";
import { env } from "../config/env.js";
import { loginSchema, registerSchema } from "../validation/schemas.js";
import type { AuthRequest } from "../types.js";

function createToken(user: { id: string; email: string }) {
  // The token contains only identity information.
  // Do not put passwords, preferences, or sensitive trip data into a JWT.
  return jwt.sign(
    { email: user.email },
    env.JWT_SECRET,
    { subject: user.id, expiresIn: "7d" }
  );
}

export async function register(req: any, res: any) {
  const input = registerSchema.parse(req.body);

  const email = input.email.toLowerCase();

  if (await prisma.user.findUnique({ where: { email } })) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: input.name
    },
    select: {
      id: true,
      email: true,
      name: true,
      currency: true
    }
  });

  res.status(201).json({
    user,
    token: createToken(user)
  });
}

export async function login(req: any, res: any) {
  const input = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() }
  });

  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      currency: user.currency
    },
    token: createToken(user)
  });
}

export async function me(req: AuthRequest, res: any) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      name: true,
      homeLocation: true,
      currency: true
    }
  });

  res.json({ user });
}
