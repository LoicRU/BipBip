import { comparePassword, hashPassword } from "../../utils/hash.js";
import { generateToken } from "../../utils/jwt.js";
import prisma from "../../lib/prisma.js";
import { AppError } from "../../utils/error.js";
import { serializeUser } from "../../utils/serializers.js";

export async function register({ name, email, password, role: roleName }) {
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    throw new AppError(409, "Email already exists");
  }

  const role = await prisma.role.findUnique({
    where: { name: roleName },
  });

  if (!role) {
    throw new AppError(500, `Role ${roleName} not found`);
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      status: "active",
      role: { connect: { id: role.id } },
    },
    include: { role: true },
  });

  return {
    user: serializeUser(user),
    token: generateToken(user),
  };
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });

  if (!user) {
    throw new AppError(401, "Invalid credentials");
  }

  const valid = await comparePassword(password, user.passwordHash);

  if (!valid) {
    throw new AppError(401, "Invalid credentials");
  }

  if (user.status === "blocked") {
    throw new AppError(403, "User account is blocked");
  }

  const token = generateToken(user);

  return { user: serializeUser(user), token };
}

export async function getCurrentUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return serializeUser(user);
}

export async function updateCurrentUser(userId, { name, email }) {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  if (!existingUser) {
    throw new AppError(404, "User not found");
  }

  if (email !== existingUser.email) {
    const emailOwner = await prisma.user.findUnique({
      where: { email },
    });

    if (emailOwner && emailOwner.id !== userId) {
      throw new AppError(409, "Email already exists");
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      email,
    },
    include: { role: true },
  });

  return serializeUser(updatedUser);
}

export async function deleteCurrentUser(userId, password) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const validPassword = await comparePassword(password, user.passwordHash);
  if (!validPassword) {
    throw new AppError(401, "Mot de passe invalide");
  }

  await prisma.user.delete({ where: { id: userId } });
  return { success: true };
}
