import {
  ComplaintStatus,
  ReassignmentStatus,
  User,
} from "../generated/prisma/client";

import { prismaClient } from "../prisma/client";

export class MaintenanceDashboardService {
  static async getDashboard(currentUser: User) {
    const maintenanceId = currentUser.id;

    const [
      assignedCount,

      inProgressCount,

      resolvedCount,

      activeAssignments,

      pendingReassignments,

      assignedComplaints,

      inProgressComplaints,

      recentResolvedComplaints,
    ] = await Promise.all([
      /*
       * Assigned
       */
      prismaClient.complaint.count({
        where: {
          assignedToId: maintenanceId,

          status: ComplaintStatus.ASSIGNED,
        },
      }),

      /*
       * In Progress
       */
      prismaClient.complaint.count({
        where: {
          assignedToId: maintenanceId,

          status: ComplaintStatus.IN_PROGRESS,
        },
      }),

      /*
       * Resolved
       */
      prismaClient.complaint.count({
        where: {
          assignedToId: maintenanceId,

          status: ComplaintStatus.RESOLVED,
        },
      }),

      /*
       * Current Workload
       */
      prismaClient.user.findUnique({
        where: {
          id: maintenanceId,
        },

        select: {
          activeAssignments: true,
        },
      }),

      /*
       * Pending Reassignment Requests
       */
      prismaClient.reassignmentRequest.count({
        where: {
          requestedById: maintenanceId,

          status: ReassignmentStatus.PENDING,
        },
      }),

      /*
       * Assigned Complaints
       */
      prismaClient.complaint.findMany({
        where: {
          assignedToId: maintenanceId,

          status: ComplaintStatus.ASSIGNED,
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
       * In Progress Complaints
       */
      prismaClient.complaint.findMany({
        where: {
          assignedToId: maintenanceId,

          status: ComplaintStatus.IN_PROGRESS,
        },

        take: 10,

        orderBy: {
          updatedAt: "desc",
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
       * Recently Resolved
       */
      prismaClient.complaint.findMany({
        where: {
          assignedToId: maintenanceId,

          status: ComplaintStatus.RESOLVED,
        },

        take: 10,

        orderBy: {
          resolvedAt: "desc",
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
    ]);

    return {
      stats: {
        assignedCount,

        inProgressCount,

        resolvedCount,

        currentWorkload: activeAssignments?.activeAssignments ?? 0,

        pendingReassignments,
      },

      assignedComplaints,

      inProgressComplaints,

      recentResolvedComplaints,
    };
  }
}
