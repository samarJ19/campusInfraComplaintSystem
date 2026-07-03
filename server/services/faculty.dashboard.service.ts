import {
  ComplaintStatus,
  ReassignmentStatus,
  User,
} from "../generated/prisma/client";

import { prismaClient } from "../prisma/client";

export class FacultyDashboardService {
  static async getDashboard(currentUser: User) {
    const facultyId = currentUser.id;

    const [
      pendingApproval,

      approvedByMe,

      rejectedByMe,

      pendingReassignments,

      recentPendingComplaints,

      recentReassignments,
    ] = await Promise.all([
      /*
       * Pending approvals
       */
      prismaClient.complaint.count({
        where: {
          status: ComplaintStatus.PENDING_APPROVAL,
        },
      }),

      /*
       * Approved by current faculty
       */
      prismaClient.complaint.count({
        where: {
          reviewedById: facultyId,

          status: ComplaintStatus.APPROVED,
        },
      }),

      /*
       * Rejected by current faculty
       */
      prismaClient.complaint.count({
        where: {
          reviewedById: facultyId,

          status: ComplaintStatus.REJECTED,
        },
      }),

      /*
       * Pending reassignments
       */
      prismaClient.reassignmentRequest.count({
        where: {
          status: ReassignmentStatus.PENDING,
        },
      }),

      /*
       * Recent complaints
       */
      prismaClient.complaint.findMany({
        where: {
          status: ComplaintStatus.PENDING_APPROVAL,
        },

        take: 10,

        orderBy: {
          createdAt: "desc",
        },

        include: {
          createdBy: {
            select: {
              id: true,

              name: true,
            },
          },
        },
      }),

      /*
       * Recent reassignments
       */
      prismaClient.reassignmentRequest.findMany({
        where: {
          status: ReassignmentStatus.PENDING,
        },

        take: 10,

        orderBy: {
          createdAt: "desc",
        },

        include: {
          complaint: {
            select: {
              id: true,

              title: true,

              category: true,

              status: true,
            },
          },

          requestedBy: {
            select: {
              id: true,

              name: true,
            },
          },
        },
      }),
    ]);

    return {
      stats: {
        pendingApproval,

        approvedByMe,

        rejectedByMe,

        pendingReassignments,
      },

      recentPendingComplaints,

      recentReassignments,
    };
  }
}
