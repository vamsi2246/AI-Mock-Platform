import { ProfileService } from "../services/profile.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await ProfileService.getProfile(req.user.userId);

  res.json({
    success: true,
    data: profile,
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const profile = await ProfileService.updateProfile(req.user.userId, req.body);

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: profile,
  });
});
