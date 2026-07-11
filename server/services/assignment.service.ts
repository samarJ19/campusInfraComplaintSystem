import { Prisma } from "../generated/prisma/client";
import {
  ActivityAction,
  Complaint,
  ComplaintStatus,
  Department,
  NotificationType,
  ReassignmentStatus,
  Role,
  User,
} from "../generated/prisma/client";
import { prismaClient } from "../prisma/client";
import { AppError, HttpStatus } from "../errors/AppError";
import { ActivityService } from "./activity.service";
import { PermissionService } from "./permission.service";
import { NotificationService } from "./notification.service";
import { SocketService } from "../socket/socket.service";

export class AssignmentService {
  static async getBestAssignee(
    complaint: Complaint,
    tx: Prisma.TransactionClient = prismaClient,
    excludedUserId?: string,
  ): Promise<User> {
    const staff = await tx.user.findMany({
      where: {
        role: Role.MAINTENANCE,
        department: complaint.category,
        id: excludedUserId ? { not: excludedUserId } : undefined,
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
    tx: Prisma.TransactionClient = prismaClient,
    excludedUserId?: string,
  ) {
    const complaint = await tx.complaint.findUnique({
      where: { id: complaintId },
    });

    if (!complaint) {
      throw new AppError("Complaint not found", HttpStatus.NOT_FOUND);
    }

    const assignee = await this.getBestAssignee(complaint, tx, excludedUserId);

    await tx.user.update({
      where: { id: assignee.id },
      data: { activeAssignments: { increment: 1 } },
    });

    const assignedComplaint = await tx.complaint.update({
      where: { id: complaintId },
      data: {
        assignedToId: assignee.id,
        status: ComplaintStatus.ASSIGNED,
      },
    });

    return {
      complaint: assignedComplaint,
      assignee,
    };
  }

  static async requestReassignment(
    complaintId: string,
    currentUser: User,
    reason: string,
  ) {
    const complaint = await prismaClient.complaint.findUnique({
      where: { id: complaintId },
    });

    if (!complaint) throw new AppError("Complaint not found", HttpStatus.NOT_FOUND);

    PermissionService.canRequestReassignment(currentUser, complaint);

    const existingRequest = await prismaClient.reassignmentRequest.findFirst({
      where: {
        complaintId,
        status: ReassignmentStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new AppError("A reassignment request already exists", HttpStatus.CONFLICT);
    }

    const request = await prismaClient.$transaction(async (tx) => {
      const newRequest = await tx.reassignmentRequest.create({
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
        metadata: { requestId: newRequest.id },
      }, tx);

      return newRequest;
    });

    // Execute Sockets AFTER successful transaction
    SocketService.notifyFaculty({
      title: "Reassignment Requested",
      message: "A maintenance staff requested reassignment.",
    });
    SocketService.notifyAdmins({
      title: "Reassignment Requested",
      message: "A maintenance staff requested reassignment.",
    });
    SocketService.refreshFacultyDashboard();
    SocketService.refreshAdminDashboard();

    return request;
  }

  static async getPendingRequests(currentUser: User) {
    PermissionService.canViewReassignmentRequests(currentUser);
    return prismaClient.reassignmentRequest.findMany({
      where: { status: ReassignmentStatus.PENDING },
      include: {
        complaint: true,
        requestedBy: {
          select: { id: true, name: true, department: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async approveReassignment(requestId: string, reviewer: User) {
    PermissionService.canApproveReassignment(reviewer);

    const request = await prismaClient.reassignmentRequest.findUnique({
      where: { id: requestId },
      include: { complaint: true },
    });

    if (!request) throw new AppError("Request not found", HttpStatus.NOT_FOUND);
    if (request.status !== ReassignmentStatus.PENDING) {
      throw new AppError("Request already processed", HttpStatus.BAD_REQUEST);
    }

    const oldAssignee = request.complaint.assignedToId;

    const complaint = await prismaClient.$transaction(async (tx) => {
      await tx.reassignmentRequest.update({
        where: { id: requestId },
        data: { status: ReassignmentStatus.APPROVED },
      });

      if (oldAssignee) {
        await tx.user.update({
          where: { id: oldAssignee },
          data: { activeAssignments: { decrement: 1 } },
        });
      }

      const { complaint: reAssignedComplaint } = await AssignmentService.autoAssignComplaint(
        request.complaint.id,
        tx,
        oldAssignee as string,
      );

      await ActivityService.createActivity({
        complaintId: reAssignedComplaint.id,
        actorId: reviewer.id,
        action: ActivityAction.REASSIGNMENT_APPROVED,
        description: "Reassignment approved",
      }, tx);

      return reAssignedComplaint;
    });

    // Execute Sockets AFTER successful transaction
    SocketService.notifyMaintenance(request.requestedById, {
      title: "Reassignment Approved",
      message: "Your request for reassignment has been approved.",
    });
    SocketService.refreshMaintenanceDashboard(request.requestedById);

    if (complaint.assignedToId) {
      SocketService.notifyMaintenance(complaint.assignedToId, {
        title: "New Complaint Assigned",
        message: "A complaint has been reassigned to you.",
      });
      SocketService.refreshMaintenanceDashboard(complaint.assignedToId);
    }

    SocketService.refreshFacultyDashboard();
    SocketService.refreshAdminDashboard();
    SocketService.refreshStudentDashboard(complaint.createdById);
    SocketService.refreshStudentComplaint(complaint.createdById, complaint.id);

    return complaint;
  }

  static async rejectReassignment(requestId: string, reviewer: User) {
    PermissionService.canRejectReassignment(reviewer);

    const request = await prismaClient.reassignmentRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) throw new AppError("Request not found", HttpStatus.NOT_FOUND);
    if (request.status !== ReassignmentStatus.PENDING) {
      throw new AppError("Request already processed", HttpStatus.BAD_REQUEST);
    }

    const updatedRequest = await prismaClient.$transaction(async (tx) => {
      const rejectedRequest = await tx.reassignmentRequest.update({
        where: { id: requestId },
        data: { status: ReassignmentStatus.REJECTED },
      });

      await ActivityService.createActivity({
        complaintId: request.complaintId,
        actorId: reviewer.id,
        action: ActivityAction.REASSIGNMENT_REJECTED,
        description: "Reassignment rejected",
      }, tx);

      return rejectedRequest;
    });

    // Execute Sockets AFTER successful transaction
    SocketService.notifyMaintenance(request.requestedById, {
      title: "Reassignment Rejected",
      message: "Your request for reassignment was rejected.",
    });
    SocketService.refreshMaintenanceDashboard(request.requestedById);
    SocketService.refreshFacultyDashboard();
    SocketService.refreshAdminDashboard();

    return updatedRequest;
  }

  static async getAvailableMaintenanceStaff(department: Department, currentUser: User) {
    PermissionService.canManualAssign(currentUser);
    return prismaClient.user.findMany({
      where: {
        role: Role.MAINTENANCE,
        department,
      },
      select: {
        id: true,
        name: true,
        department: true,
        activeAssignments: true,
      },
      orderBy: { activeAssignments: "asc" },
    });
  }

  static async manualAssignComplaint(
    complaintId: string,
    maintenanceId: string,
    currentUser: User,
  ) {
    PermissionService.canManualAssign(currentUser);

    const complaint = await prismaClient.complaint.findUnique({
      where: { id: complaintId },
    });
    if (!complaint) throw new AppError("Complaint not found", HttpStatus.NOT_FOUND);

    const maintenance = await prismaClient.user.findUnique({
      where: { id: maintenanceId },
    });
    if (!maintenance) throw new AppError("Maintenance staff not found", HttpStatus.NOT_FOUND);
    if (maintenance.role !== Role.MAINTENANCE) {
      throw new AppError("Invalid maintenance staff", HttpStatus.BAD_REQUEST);
    }

    const updatedComplaint = await prismaClient.$transaction(async (tx) => {
      if (complaint.assignedToId && complaint.assignedToId !== maintenanceId) {
        await tx.user.update({
          where: { id: complaint.assignedToId },
          data: { activeAssignments: { decrement: 1 } },
        });
      }

      await tx.user.update({
        where: { id: maintenanceId },
        data: { activeAssignments: { increment: 1 } },
      });

      const newComplaint = await tx.complaint.update({
        where: { id: complaintId },
        data: {
          assignedToId: maintenanceId,
          status: ComplaintStatus.ASSIGNED,
        },
      });

      await ActivityService.createActivity({
        complaintId,
        actorId: currentUser.id,
        action: ActivityAction.COMPLAINT_ASSIGNED,
        description: `Complaint manually assigned to ${maintenance.name}`,
        metadata: {
          assignedTo: maintenance.id,
          assignedBy: currentUser.id,
        },
      }, tx);

      // Pass the transaction client here for proper ACID compliance
      await NotificationService.createNotification({
        userId: maintenance.id,
        title: "Complaint Assigned",
        message: "A complaint has been assigned to you.",
        type: NotificationType.COMPLAINT_ASSIGNED,
        complaintId,
      }, tx);

      return newComplaint;
    });

    // Execute Sockets AFTER successful transaction
    SocketService.notifyMaintenance(maintenanceId, {
      title: "Complaint Assigned",
      message: "A complaint has been manually assigned to you.",
      type: NotificationType.COMPLAINT_ASSIGNED,
    });
    SocketService.refreshMaintenanceDashboard(maintenanceId);

    // Refresh the old assignee's dashboard if reassigned
    if (complaint.assignedToId && complaint.assignedToId !== maintenanceId) {
      SocketService.refreshMaintenanceDashboard(complaint.assignedToId);
    }

    SocketService.refreshAdminDashboard();
    SocketService.refreshStudentDashboard(complaint.createdById);
    SocketService.refreshStudentComplaint(complaint.createdById, complaintId);

    return updatedComplaint;
  }
}