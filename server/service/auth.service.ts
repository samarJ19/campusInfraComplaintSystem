import bcrypt from "bcrypt";
import { prismaClient } from "../prisma/client";

import { Role } from "../generated/prisma/enums";

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
      throw new Error("User already exists");
    }

    if (role === Role.STUDENT && !enrollmentNumber) {
      throw new Error("Enrollment number is required for students");
    }
    if (role !== Role.STUDENT) {
      throw new Error("Only student self-registration allowed");
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
      throw new Error("Invalid credentials");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      throw new Error("Invalid credentials");
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
      throw new Error("User not found");
    }

    return user;
  }
}
