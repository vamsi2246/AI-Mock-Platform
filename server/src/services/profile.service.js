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
      skills: typeof profile.skills === 'string' ? JSON.parse(profile.skills) : (profile.skills || []),
      resumeUrl: profile.resumeUrl,
      linkedinUrl: profile.linkedinUrl,
      githubUrl: profile.githubUrl,
      preferredDifficulty: profile.preferredDifficulty,
    };
  }

  static async updateProfile(userId, data) {
    const profileData = { ...data };
    if (profileData.skills && Array.isArray(profileData.skills)) {
      profileData.skills = JSON.stringify(profileData.skills);
    }

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: profileData,
      create: { userId, ...profileData },
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
      skills: typeof profile.skills === 'string' ? JSON.parse(profile.skills) : (profile.skills || []),
      resumeUrl: profile.resumeUrl,
      linkedinUrl: profile.linkedinUrl,
      githubUrl: profile.githubUrl,
      preferredDifficulty: profile.preferredDifficulty,
    };
  }
}
