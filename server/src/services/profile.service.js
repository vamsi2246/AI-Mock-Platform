import prisma from "../lib/prisma.js";
import { ApiError } from "../utils/apiError.js";

export class ProfileService {
  static async getProfile(userId) {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { user: { select: { email: true } } },
    });

    if (!profile) {
      throw ApiError.notFound("Profile not found");
    }

    return {
      id: profile.id,
      email: profile.user.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      avatarUrl: profile.avatarUrl,
      currentRole: profile.currentRole,
      targetRole: profile.targetRole,
      yearsExperience: profile.yearsExperience,
      skills: profile.skills,
      resumeUrl: profile.resumeUrl,
      linkedinUrl: profile.linkedinUrl,
      githubUrl: profile.githubUrl,
      preferredDifficulty: profile.preferredDifficulty,
    };
  }

  static async updateProfile(userId, data) {
    const profile = await prisma.profile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
      include: { user: { select: { email: true } } },
    });

    return {
      id: profile.id,
      email: profile.user.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      avatarUrl: profile.avatarUrl,
      currentRole: profile.currentRole,
      targetRole: profile.targetRole,
      yearsExperience: profile.yearsExperience,
      skills: profile.skills,
      resumeUrl: profile.resumeUrl,
      linkedinUrl: profile.linkedinUrl,
      githubUrl: profile.githubUrl,
      preferredDifficulty: profile.preferredDifficulty,
    };
  }
}
