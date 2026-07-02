import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";

const SALT_ROUNDS = 12;

export class AuthService {
  static async signup(email, password, firstName, lastName) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw ApiError.conflict("An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        profile: {
          create: { firstName, lastName },
        },
      },
      include: { profile: true },
    });

    const tokens = this.generateTokens({ userId: user.id, email: user.email });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.profile?.firstName,
        lastName: user.profile?.lastName,
      },
      ...tokens,
    };
  }

  static async login(email, password) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const tokens = this.generateTokens({ userId: user.id, email: user.email });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.profile?.firstName,
        lastName: user.profile?.lastName,
      },
      ...tokens,
    };
  }

  static async refreshToken(token) {
    try {
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });
      if (!user || user.refreshToken !== token) {
        throw ApiError.unauthorized("Invalid refresh token");
      }

      const tokens = this.generateTokens({
        userId: user.id,
        email: user.email,
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      });

      return tokens;
    } catch (error) {
      throw ApiError.unauthorized("Invalid or expired refresh token");
    }
  }

  static async logout(userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  static generateTokens(payload) {
    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    });

    return { accessToken, refreshToken };
  }
}
