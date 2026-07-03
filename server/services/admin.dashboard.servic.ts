import {
  ComplaintStatus,
  ReassignmentStatus,
  Role,
} from "../generated/prisma/client";

import { prismaClient } from "../prisma/client";

export class AdminDashboardService {
  static async getDashboard() {
    const [
      totalComplaints,

      pendingApproval,

      unassigned,

      assigned,

      inProgress,

      resolved,

      rejected,

      pendingReassignments,

      approvedReassignments,

      rejectedReassignments,

      departmentAnalysis,

      maintenanceStats,

      recentComplaints,

      resolvedComplaints,

      maintenanceStaff,
    ] = await Promise.all([
      /*
       * Complaint Stats
       */

      prismaClient.complaint.count(),

      prismaClient.complaint.count({
        where: {
          status: ComplaintStatus.PENDING_APPROVAL,
        },
      }),

      prismaClient.complaint.count({
        where: {
          status: ComplaintStatus.APPROVED,
          assignedToId: null,
        },
      }),

      prismaClient.complaint.count({
        where: {
          status: ComplaintStatus.ASSIGNED,
        },
      }),

      prismaClient.complaint.count({
        where: {
          status: ComplaintStatus.IN_PROGRESS,
        },
      }),

      prismaClient.complaint.count({
        where: {
          status: ComplaintStatus.RESOLVED,
        },
      }),

      prismaClient.complaint.count({
        where: {
          status: ComplaintStatus.REJECTED,
        },
      }),

      /*
       * Reassignment Stats
       */

      prismaClient.reassignmentRequest.count({
        where: {
          status: ReassignmentStatus.PENDING,
        },
      }),

      prismaClient.reassignmentRequest.count({
        where: {
          status: ReassignmentStatus.APPROVED,
        },
      }),

      prismaClient.reassignmentRequest.count({
        where: {
          status: ReassignmentStatus.REJECTED,
        },
      }),

      /*
       * Department Analysis
       */

      prismaClient.complaint.groupBy({
        by: ["category"],
        _count: true,
      }),

      /*
       * Maintenance Analysis
       */

      prismaClient.user.findMany({
        where: {
          role: Role.MAINTENANCE,
        },

        select: {
          id: true,
          name: true,
          department: true,
          activeAssignments: true,

          _count: {
            select: {
              assignedComplaints: true,
            },
          },
        },
      }),

      /*
       * Recent Complaints
       */

      prismaClient.complaint.findMany({
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

          assignedTo: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),

      /*
       * Average Resolution Time
       */

      prismaClient.complaint.findMany({
        where: {
          status: ComplaintStatus.RESOLVED,
          resolvedAt: {
            not: null,
          },
        },

        select: {
          createdAt: true,
          resolvedAt: true,
        },
      }),

      /*
       * Top Maintenance Staff
       */

      prismaClient.user.findMany({
        where: {
          role: Role.MAINTENANCE,
        },

        select: {
          id: true,
          name: true,
          department: true,

          assignedComplaints: {
            where: {
              status: ComplaintStatus.RESOLVED,
            },

            select: {
              id: true,
            },
          },
        },
      }),
    ]);

    /*
     * Average Resolution Time
     */

    let averageResolutionTime = 0;

    if (resolvedComplaints.length > 0) {
      const totalTime = resolvedComplaints.reduce(
        (sum, complaint) =>
          sum +
          (complaint.resolvedAt!.getTime() - complaint.createdAt.getTime()),
        0,
      );

      averageResolutionTime =
        totalTime / resolvedComplaints.length / (1000 * 60 * 60); // hours
    }

    /*
     * Top Maintenance Staff
     */

    const topMaintenanceStaff = maintenanceStaff
      .map((staff) => ({
        id: staff.id,
        name: staff.name,
        department: staff.department,
        resolvedCount: staff.assignedComplaints.length,
      }))
      .sort((a, b) => b.resolvedCount - a.resolvedCount)
      .slice(0, 5);

    return {
      complaintStats: {
        totalComplaints,

        pendingApproval,

        unassigned,

        assigned,

        inProgress,

        resolved,

        rejected,

        averageResolutionTime: Number(averageResolutionTime.toFixed(2)),
      },

      assignmentStats: {
        pendingReassignments,

        approvedReassignments,

        rejectedReassignments,
      },

      departmentAnalysis,

      maintenanceStats,

      topMaintenanceStaff,

      recentComplaints,
    };
  }
}
