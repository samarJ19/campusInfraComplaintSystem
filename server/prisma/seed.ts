import bcrypt from "bcrypt";

import { prismaClient } from "../prisma/client";

import { Role, Department } from "../generated/prisma/enums";

const prisma = prismaClient;

async function main() {
  const hashedPassword = await bcrypt.hash("123456", 10);

  /*
   * ADMIN
   */
  await prisma.user.upsert({
    where: {
      email: "admin@campus.com",
    },

    update: {},

    create: {
      name: "Super Admin",

      email: "admin@campus.com",

      password: hashedPassword,

      role: Role.ADMIN,
    },
  });

  /*
   * FACULTY
   */
  await prisma.user.upsert({
    where: {
      email: "faculty@campus.com",
    },

    update: {},

    create: {
      name: "Dr Sharma",

      email: "faculty@campus.com",

      password: hashedPassword,

      role: Role.FACULTY,
    },
  });

  /*
   * ELECTRICAL STAFF
   */
  await prisma.user.upsert({
    where: {
      email: "electrical1@campus.com",
    },

    update: {},

    create: {
      name: "Raj",

      email: "electrical1@campus.com",

      password: hashedPassword,

      role: Role.MAINTENANCE,

      department: Department.ELECTRICAL,

      activeAssignments: 0,
    },
  });

  await prisma.user.upsert({
    where: {
      email: "electrical2@campus.com",
    },

    update: {},

    create: {
      name: "Aman",

      email: "electrical2@campus.com",

      password: hashedPassword,

      role: Role.MAINTENANCE,

      department: Department.ELECTRICAL,

      activeAssignments: 0,
    },
  });

  /*
   * WATER STAFF
   */
  await prisma.user.upsert({
    where: {
      email: "water1@campus.com",
    },

    update: {},

    create: {
      name: "Rohit",

      email: "water1@campus.com",

      password: hashedPassword,

      role: Role.MAINTENANCE,

      department: Department.WATER,

      activeAssignments: 0,
    },
  });

  /*
   * STUDENTS
   */
  await prisma.user.upsert({
    where: {
      email: "student1@campus.com",
    },

    update: {},

    create: {
      name: "Samar",

      email: "student1@campus.com",

      password: hashedPassword,

      role: Role.STUDENT,

      enrollmentNumber: "CS21001",
    },
  });

  await prisma.user.upsert({
    where: {
      email: "student2@campus.com",
    },

    update: {},

    create: {
      name: "Aryan",

      email: "student2@campus.com",

      password: hashedPassword,

      role: Role.STUDENT,

      enrollmentNumber: "CS21002",
    },
  });

  console.log("Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
