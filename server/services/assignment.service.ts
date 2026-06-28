import {
  ActivityAction,
  Complaint,
  ComplaintStatus,
  ReassignmentStatus,
  Role,
  User,
} from "../generated/prisma/client";

import { prismaClient } from "../prisma/client";

import { AppError, HttpStatus } from "../errors/AppError";
import { ActivityService } from "./activity.service";
import { PermissionService } from "./permission.service";

export class AssignmentService {
  static async getBestAssignee(
    complaint: Complaint,
    excludedUserId?: string,
  ): Promise<User> {
    const staff = await prismaClient.user.findMany({
      where: {
        role: Role.MAINTENANCE,

        department: complaint.category,

        id: excludedUserId
          ? {
              not: excludedUserId,
            }
          : undefined,
      },

      orderBy: {
        activeAssignments: "asc",
      },
    });

    if (staff.length === 0) {
      throw new AppError(
        `No maintenance staff found for ${complaint.category}`,
        HttpStatus.NOT_FOUND,
      );
    }

    return staff[0];
  }

  static async autoAssignComplaint(
    complaintId: string,
    excludedUserId?: string,
  ) {
    const complaint = await prismaClient.complaint.findUnique({
      where: {
        id: complaintId,
      },
    });

    if (!complaint) {
      throw new AppError("Complaint not found", HttpStatus.NOT_FOUND);
    }

    const assignee = await this.getBestAssignee(complaint, excludedUserId);

    return prismaClient.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: assignee.id,
        },
        data: {
          activeAssignments: {
            increment: 1,
          },
        },
      });

      const assignedComplaint = await tx.complaint.update({
        where: {
          id: complaintId,
        },
        data: {
          assignedToId: assignee.id,
          status: ComplaintStatus.ASSIGNED,
        },
      });

      return {
        complaint: assignedComplaint,
        assignee,
      };
    });
  }
  static async requestReassignment(
    complaintId: string,
    currentUser: User,
    reason: string,
  ) {
    const complaint = await prismaClient.complaint.findUnique({
      where: {
        id: complaintId,
      },
    });

    if (!complaint) {
      throw new AppError("Complaint not found", HttpStatus.NOT_FOUND);
    }

    PermissionService.canRequestReassignment(currentUser, complaint);

    const existingRequest = await prismaClient.reassignmentRequest.findFirst({
      where: {
        complaintId,
        status: ReassignmentStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new AppError(
        "A reassignment request already exists",
        HttpStatus.CONFLICT,
      );
    }

    const request = await prismaClient.reassignmentRequest.create({
      data: {
        reason,

        complaintId,

        requestedById: currentUser.id,
      },
    });

    await ActivityService.createActivity({
      complaintId,

      actorId: currentUser.id,

      action: ActivityAction.REASSIGNMENT_REQUESTED,

      description: "Maintenance requested reassignment",

      metadata: {
        requestId: request.id,
      },
    });

    return request;
  }

  static async getPendingRequests(currentUser: User) {
    PermissionService.canViewReassignmentRequests(currentUser);

    return prismaClient.reassignmentRequest.findMany({
      where: {
        status: ReassignmentStatus.PENDING,
      },

      include: {
        complaint: true,

        requestedBy: {
          select: {
            id: true,
            name: true,
            department: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  }
  static async approveReassignment(requestId: string, reviewer: User) {
    PermissionService.canApproveReassignment(reviewer);

    const request = await prismaClient.reassignmentRequest.findUnique({
      where: {
        id: requestId,
      },

      include: {
        complaint: true,
      },
    });

    if (!request) {
      throw new AppError("Request not found", HttpStatus.NOT_FOUND);
    }

    if (request.status !== ReassignmentStatus.PENDING) {
      throw new AppError("Request already processed", HttpStatus.BAD_REQUEST);
    }

    const oldAssignee = request.complaint.assignedToId;

    await prismaClient.reassignmentRequest.update({
      where: {
        id: requestId,
      },

      data: {
        status: ReassignmentStatus.APPROVED,
      },
    });

    if (oldAssignee) {
      await prismaClient.user.update({
        where: {
          id: oldAssignee,
        },

        data: {
          activeAssignments: {
            decrement: 1,
          },
        },
      });
    }

    const { complaint } = await AssignmentService.autoAssignComplaint(
      request.complaint.id,
      oldAssignee as string,
    );

    await ActivityService.createActivity({
      complaintId: complaint.id,

      actorId: reviewer.id,

      action: ActivityAction.REASSIGNMENT_APPROVED,

      description: "Reassignment approved",
    });

    return complaint;
  }

  static async rejectReassignment(requestId: string, reviewer: User) {
    PermissionService.canRejectReassignment(reviewer);

    const request = await prismaClient.reassignmentRequest.findUnique({
      where: {
        id: requestId,
      },
    });

    if (!request) {
      throw new AppError("Request not found", HttpStatus.NOT_FOUND);
    }

    if (request.status !== ReassignmentStatus.PENDING) {
      throw new AppError("Request already processed", HttpStatus.BAD_REQUEST);
    }

    const updatedRequest = await prismaClient.reassignmentRequest.update({
      where: {
        id: requestId,
      },

      data: {
        status: ReassignmentStatus.REJECTED,
      },
    });

    await ActivityService.createActivity({
      complaintId: request.complaintId,

      actorId: reviewer.id,

      action: ActivityAction.REASSIGNMENT_REJECTED,

      description: "Reassignment rejected",
    });

    return updatedRequest;
  }
}
