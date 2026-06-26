import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { generateToken } from "../utils/generateToken";
import { cookieOptions } from "../utils/cookieOptions";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError, HttpStatus } from "../errors/AppError";

// A separate function and controller is required to handle signup for admin and other user types except for the student user type. 
// The current implementation is only for student user type.
export const signup = asyncHandler(async (req: Request, res: Response) => {
  const user = await AuthService.signup(req.body);

  const token = generateToken(user.id);

  res.cookie("token", token, cookieOptions);

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    user,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const user = await AuthService.login(req.body);

  const token = generateToken(user.id);

  res.cookie("token", token, cookieOptions);

  res.status(200).json({
    success: true,
    message: "Login successful",
    user,
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie("token");

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED);
  }

  const user = await AuthService.getCurrentUser(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});