import { prismaClient } from "../prisma/client";

import {
  ComplaintStatus,
  Department,
  ValidityStatus,
  ReassignmentStatus,
} from "../generated/prisma/client";

const prisma = prismaClient;

async function main() {
  const student1 = await prisma.user.findUnique({
    where: {
      email: "student1@campus.com",
    },
  });

  const student2 = await prisma.user.findUnique({
    where: {
      email: "student2@campus.com",
    },
  });

  const faculty = await prisma.user.findUnique({
    where: {
      email: "faculty@campus.com",
    },
  });

  const electrical1 = await prisma.user.findUnique({
    where: {
      email: "electrical1@campus.com",
    },
  });

  const electrical2 = await prisma.user.findUnique({
    where: {
      email: "electrical2@campus.com",
    },
  });

  const water1 = await prisma.user.findUnique({
    where: {
      email: "water1@campus.com",
    },
  });

  if (
    !student1 ||
    !student2 ||
    !faculty ||
    !electrical1 ||
    !electrical2 ||
    !water1
  ) {
    throw new Error("Run seed.ts first");
  }

  /*
   * PENDING APPROVAL
   */
  await prisma.complaint.upsert({
    where: {
      id: "pending-1",
    },

    update: {},

    create: {
      id: "pending-1",

      title: "Fan not working",

      description: "Classroom fan broken",

      category: Department.ELECTRICAL,

      status: ComplaintStatus.PENDING_APPROVAL,

      createdById: student1.id,
    },
  });

  /*
   * APPROVED BUT UNASSIGNED
   */
  await prisma.complaint.upsert({
    where: {
      id: "approved-1",
    },

    update: {},

    create: {
      id: "approved-1",

      title: "Water leakage",

      description: "Pipe leaking",

      category: Department.WATER,

      status: ComplaintStatus.APPROVED,

      validityStatus: ValidityStatus.VALID,

      createdById: student2.id,

      reviewedById: faculty.id,

      reviewedAt: new Date(),
    },
  });

  /*
   * ASSIGNED
   */
  await prisma.complaint.upsert({
    where: {
      id: "assigned-1",
    },

    update: {},

    create: {
      id: "assigned-1",

      title: "Tube light broken",

      description: "Tube light replacement",

      category: Department.ELECTRICAL,

      status: ComplaintStatus.ASSIGNED,

      validityStatus: ValidityStatus.VALID,

      createdById: student1.id,

      assignedToId: electrical1.id,

      reviewedById: faculty.id,

      reviewedAt: new Date(),
    },
  });

  /*
   * IN PROGRESS
   */
  await prisma.complaint.upsert({
    where: {
      id: "progress-1",
    },

    update: {},

    create: {
      id: "progress-1",

      title: "Switch board issue",

      description: "Switch board damaged",

      category: Department.ELECTRICAL,

      status: ComplaintStatus.IN_PROGRESS,

      validityStatus: ValidityStatus.VALID,

      createdById: student2.id,

      assignedToId: electrical2.id,

      reviewedById: faculty.id,

      reviewedAt: new Date(),
    },
  });

  /*
   * RESOLVED
   */
  await prisma.complaint.upsert({
    where: {
      id: "resolved-1",
    },

    update: {},

    create: {
      id: "resolved-1",

      title: "Internet issue",

      description: "LAN cable fixed",

      category: Department.INTERNET,

      status: ComplaintStatus.RESOLVED,

      validityStatus: ValidityStatus.VALID,

      createdById: student1.id,

      assignedToId: water1.id,

      reviewedById: faculty.id,

      reviewedAt: new Date(),

      resolvedAt: new Date(),
    },
  });

  /*
   * REJECTED
   */
  await prisma.complaint.upsert({
    where: {
      id: "rejected-1",
    },

    update: {},

    create: {
      id: "rejected-1",

      title: "Fake complaint",

      description: "Testing",

      category: Department.ELECTRICAL,

      status: ComplaintStatus.REJECTED,

      validityStatus: ValidityStatus.INVALID,

      createdById: student2.id,

      reviewedById: faculty.id,

      reviewedAt: new Date(),
    },
  });

  /*
   * REASSIGNMENT REQUEST
   */
  await prisma.reassignmentRequest.upsert({
    where: {
      id: "reassign-1",
    },

    update: {},

    create: {
      id: "reassign-1",

      reason: "Wrong allocation",

      status: ReassignmentStatus.PENDING,

      complaintId: "assigned-1",

      requestedById: electrical1.id,
    },
  });

  /*
   * WORKLOAD
   */
  await prisma.user.update({
    where: {
      id: electrical1.id,
    },

    data: {
      activeAssignments: 1,
    },
  });

  await prisma.user.update({
    where: {
      id: electrical2.id,
    },

    data: {
      activeAssignments: 1,
    },
  });

  console.log("Dashboard data seeded");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
