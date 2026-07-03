import { ComplaintStatus, User } from "../generated/prisma/client";
import { prismaClient } from "../prisma/client";

export class StudentDashboardService {
  static async getDashboard(currentUser: User) {
    const studentId = currentUser.id;

    const [
      totalComplaints,

      pendingApproval,

      assigned,

      inProgress,

      resolved,

      rejected,

      recentComplaints,

      resolvedComplaints,
    ] = await Promise.all([
      prismaClient.complaint.count({
        where: {
          createdById: studentId,
        },
      }),

      prismaClient.complaint.count({
        where: {
          createdById: studentId,
          status: ComplaintStatus.PENDING_APPROVAL,
        },
      }),

      prismaClient.complaint.count({
        where: {
          createdById: studentId,
          status: ComplaintStatus.ASSIGNED,
        },
      }),

      prismaClient.complaint.count({
        where: {
          createdById: studentId,
          status: ComplaintStatus.IN_PROGRESS,
        },
      }),

      prismaClient.complaint.count({
        where: {
          createdById: studentId,
          status: ComplaintStatus.RESOLVED,
        },
      }),

      prismaClient.complaint.count({
        where: {
          createdById: studentId,
          status: ComplaintStatus.REJECTED,
        },
      }),

      prismaClient.complaint.findMany({
        where: {
          createdById: studentId,
        },

        take: 5,

        orderBy: {
          createdAt: "desc",
        },

        select: {
          id: true,

          title: true,

          category: true,

          status: true,

          createdAt: true,

          assignedTo: {
            select: {
              id: true,
              name: true,
              department: true,
            },
          },
        },
      }),

      prismaClient.complaint.findMany({
        where: {
          createdById: studentId,
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
    ]);

    let averageResolutionTime = 0;

    if (resolvedComplaints.length > 0) {
      const totalResolutionTimeMs = resolvedComplaints.reduce(
        (sum, complaint) => {
          return (
            sum +
            (complaint.resolvedAt!.getTime() - complaint.createdAt.getTime())
          );
        },
        0,
      );

      averageResolutionTime = totalResolutionTimeMs / resolvedComplaints.length;
    }
    const averageResolutionTimeHours = averageResolutionTime / (1000 * 60 * 60);
    return {
      stats: {
        totalComplaints,

        pendingApproval,

        assigned,

        inProgress,

        resolved,

        rejected,

        averageResolutionTimeHours: Number(
          averageResolutionTimeHours.toFixed(2),
        ),
      },

      recentComplaints,
    };
  }
}
