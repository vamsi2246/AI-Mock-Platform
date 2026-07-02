import { AuthService } from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const signup = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  const result = await AuthService.signup(
    email,
    password,
    firstName || "",
    lastName || "",
  );

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: result,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await AuthService.login(email, password);

  res.json({
    success: true,
    message: "Login successful",
    data: result,
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const tokens = await AuthService.refreshToken(refreshToken);

  res.json({
    success: true,
    data: tokens,
  });
});

export const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    await AuthService.logout(req.user.userId);
  }

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

export const me = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: req.user,
  });
});
