import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role.name,
    },
    env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};
