import { prismaClient } from "../prisma/client";

export const connectDB = async () => {
  try {
    await prismaClient.$connect();
    console.log("✅ PostgreSQL Connected");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};