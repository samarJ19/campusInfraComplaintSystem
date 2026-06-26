import bcrypt from "bcrypt";
import { prismaClient } from "../prisma/client";
import { Role } from "../generated/prisma/enums";
import { AppError, HttpStatus } from "../errors/AppError";

interface SignupInput {
  name: string;
  email: string;
  password: string;
  role: Role;
  enrollmentNumber?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  static async signup(data: SignupInput) {
    const { name, email, password, role, enrollmentNumber } = data;

    const existingUser = await prismaClient.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new AppError("User already exists", HttpStatus.CONFLICT);
    }

    if (role === Role.STUDENT && !enrollmentNumber) {
      throw new AppError(
        "Enrollment number is required for students",
        HttpStatus.BAD_REQUEST,
      );
    }
    if (role !== Role.STUDENT) {
      throw new AppError(
        "Only student self-registration allowed",
        HttpStatus.FORBIDDEN,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prismaClient.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        enrollmentNumber,
      },
    });

    const { password: accountPassword, ...safeUser } = user;

    return safeUser;
  }

  static async login(data: LoginInput) {
    const { email, password } = data;

    const user = await prismaClient.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new AppError("Invalid credentials", HttpStatus.UNAUTHORIZED);
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      throw new AppError("Invalid credentials", HttpStatus.UNAUTHORIZED);
    }

    const { password: accountPassword, ...safeUser } = user;

    return safeUser;
  }

  static async getCurrentUser(userId: string) {
    const user = await prismaClient.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        enrollmentNumber: true,
        department: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError("User not found", HttpStatus.NOT_FOUND);
    }

    return user;
  }
}
