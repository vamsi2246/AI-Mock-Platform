import { DashboardService } from "../services/dashboard.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getDashboard = asyncHandler(async (req, res) => {
  const data = await DashboardService.getDashboard(req.user.userId);

  res.json({
    success: true,
    data,
  });
});
