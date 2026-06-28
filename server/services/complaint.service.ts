import { prismaClient } from "../prisma/client";
import {
  ActivityAction,
  ComplaintStatus,
  NotificationType,
  Role,
  User,
  ValidityStatus,
} from "../generated/prisma/client";
import { PermissionService } from "./permission.service";
import { AppError, HttpStatus } from "../errors/AppError";
import { ActivityService } from "./activity.service";
import { CreateComplaintInput } from "../types/DTO";
import { NotificationService } from "./notification.service";
import { AssignmentService } from "./assignment.service";

export class ComplaintService {
  static async createComplaint(studentId: string, data: CreateComplaintInput) {
    const student = await prismaClient.user.findUnique({
      where: {
        id: studentId,
      },
    });

    if (!student) {
      throw new AppError("Student not found", HttpStatus.NOT_FOUND);
    }

    if (student.role !== Role.STUDENT) {
      throw new AppError(
        "Only students can create complaints",
        HttpStatus.FORBIDDEN,
      );
    }

    const complaint = await prismaClient.complaint.create({
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        category: data.category,
        status: ComplaintStatus.PENDING_APPROVAL,
        createdById: studentId,
      },
    });
    await ActivityService.createActivity({
      complaintId: complaint.id,

      actorId: studentId,

      action: ActivityAction.COMPLAINT_CREATED,

      description: "Complaint created",
    });
    await NotificationService.createNotification({
      userId: complaint.createdById,

      title: "Complaint Submitted",

      message: "Your complaint has been submitted successfully.",

      type: NotificationType.COMPLAINT_CREATED,

      complaintId: complaint.id,
    });
    return complaint;
  }

  static async getMyComplaints(studentId: string) {
    return prismaClient.complaint.findMany({
      where: {
        createdById: studentId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async getComplaintById(complaintId: string, currentUser: User) {
    const complaint = await prismaClient.complaint.findUnique({
      where: {
        id: complaintId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            department: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!complaint) {
      throw new AppError("Complaint not found", HttpStatus.NOT_FOUND);
    }

    PermissionService.canViewComplaint(currentUser, complaint);

    return complaint;
  }

  static async approveComplaint(complaintId: string, facultyId: string) {
    const faculty = await prismaClient.user.findUnique({
      where: {
        id: facultyId,
      },
    });

    if (!faculty) {
      throw new AppError("Faculty not found", HttpStatus.NOT_FOUND);
    }

    PermissionService.canApproveComplaint(faculty);

    const complaint = await prismaClient.complaint.findUnique({
      where: {
        id: complaintId,
      },
    });

    if (!complaint) {
      throw new AppError("Complaint not found", HttpStatus.NOT_FOUND);
    }

    if (complaint.status !== ComplaintStatus.PENDING_APPROVAL) {
      throw new AppError("Complaint already reviewed", HttpStatus.BAD_REQUEST);
    }

    /*
     * STEP 1
     * Faculty approves complaint
     */
    const approvedComplaint = await prismaClient.complaint.update({
      where: {
        id: complaintId,
      },
      data: {
        status: ComplaintStatus.APPROVED,

        validityStatus: ValidityStatus.VALID,

        reviewedById: facultyId,

        reviewedAt: new Date(),
      },
    });

    /*
     * STEP 2
     * Activity for approval
     */
    await ActivityService.createActivity({
      complaintId,

      actorId: facultyId,

      action: ActivityAction.COMPLAINT_APPROVED,

      description: "Complaint approved",
    });

    /*
     * STEP 3
     * Notify student
     */
    await NotificationService.createNotification({
      userId: complaint.createdById,

      title: "Complaint Approved",

      message: "Your complaint has been approved.",

      type: NotificationType.COMPLAINT_APPROVED,

      complaintId,
    });

    /*
     * STEP 4
     * Auto Assignment
     */
    try {
      const { complaint: assignedComplaint, assignee } =
        await AssignmentService.autoAssignComplaint(complaintId);

      /*
       * STEP 5
       * Activity for assignment
       */
      await ActivityService.createActivity({
        complaintId,

        actorId: facultyId,

        action: ActivityAction.COMPLAINT_ASSIGNED,

        description: `Complaint assigned to ${assignee.name}`,

        metadata: {
          assignedTo: assignedComplaint.assignedToId,
        },
      });

      /*
       * STEP 6
       * Notify maintenance staff
       */
      await NotificationService.createNotification({
        userId: assignedComplaint.assignedToId!,

        title: "New Complaint Assigned",

        message: "A new complaint has been assigned to you.",

        type: NotificationType.COMPLAINT_ASSIGNED,

        complaintId,
      });

      return assignedComplaint;
    } catch (error) {
      /*
       * No maintenance staff available.
       * Complaint remains APPROVED.
       */
      return approvedComplaint;
    }
  }

  static async rejectComplaint(complaintId: string, facultyId: string) {
    const faculty = await prismaClient.user.findUnique({
      where: {
        id: facultyId,
      },
    });

    if (!faculty) {
      throw new AppError("Faculty not found", HttpStatus.NOT_FOUND);
    }

    PermissionService.canRejectComplaint(faculty);

    const complaint = await prismaClient.complaint.findUnique({
      where: {
        id: complaintId,
      },
    });

    if (!complaint) {
      throw new AppError("Complaint not found", HttpStatus.NOT_FOUND);
    }

    if (complaint.status !== ComplaintStatus.PENDING_APPROVAL) {
      throw new AppError("Complaint already reviewed", HttpStatus.BAD_REQUEST);
    }

    const updatedComplaint = await prismaClient.complaint.update({
      where: {
        id: complaintId,
      },
      data: {
        status: ComplaintStatus.REJECTED,
        validityStatus: ValidityStatus.INVALID,
        reviewedById: facultyId,
        reviewedAt: new Date(),
      },
    });
    await ActivityService.createActivity({
      complaintId,

      actorId: facultyId,

      action: ActivityAction.COMPLAINT_REJECTED,

      description: "Complaint rejected",
    });
    await NotificationService.createNotification({
      userId: complaint.createdById,

      title: "Complaint Rejected",

      message: "Your complaint was rejected.",

      type: NotificationType.COMPLAINT_REJECTED,

      complaintId,
    });
    return updatedComplaint;
  }

  static async startWork(complaintId: string, currentUser: User) {
    const complaint = await prismaClient.complaint.findUnique({
      where: {
        id: complaintId,
      },
    });

    if (!complaint) {
      throw new AppError("Complaint not found", HttpStatus.NOT_FOUND);
    }

    PermissionService.canStartWork(currentUser, complaint);

    if (complaint.status !== ComplaintStatus.ASSIGNED) {
      throw new AppError("Complaint is not assigned.", HttpStatus.BAD_REQUEST);
    }
    await ActivityService.createActivity({
      complaintId,

      actorId: currentUser.id,

      action: ActivityAction.IN_PROGRESS,

      description: "Maintenance started working",
    });
    await NotificationService.createNotification({
      userId: complaint.createdById,

      title: "Work Started",

      message: "Maintenance staff has started working on your complaint.",

      type: NotificationType.COMPLAINT_IN_PROGRESS,

      complaintId,
    });
    return prismaClient.complaint.update({
      where: {
        id: complaintId,
      },
      data: {
        status: ComplaintStatus.IN_PROGRESS,
      },
    });
  }

  static async resolveComplaint(complaintId: string, currentUser: User) {
    const complaint = await prismaClient.complaint.findUnique({
      where: {
        id: complaintId,
      },
    });

    if (!complaint) {
      throw new AppError("Complaint not found", HttpStatus.NOT_FOUND);
    }

    PermissionService.canResolveComplaint(currentUser, complaint);

    if (complaint.status !== ComplaintStatus.IN_PROGRESS) {
      throw new AppError(
        "Complaint is not in progress.",
        HttpStatus.BAD_REQUEST,
      );
    }
    await ActivityService.createActivity({
      complaintId,

      actorId: currentUser.id,

      action: ActivityAction.RESOLVED,

      description: "Complaint resolved",
    });
    await NotificationService.createNotification({
      userId: complaint.createdById,

      title: "Complaint Resolved",

      message: "Your complaint has been resolved.",

      type: NotificationType.COMPLAINT_RESOLVED,

      complaintId,
    });
    if (complaint.assignedToId) {
      await prismaClient.user.update({
        where: {
          id: complaint.assignedToId,
        },
        data: {
          activeAssignments: {
            decrement: 1,
          },
        },
      });
    }
    return prismaClient.complaint.update({
      where: {
        id: complaintId,
      },
      data: {
        status: ComplaintStatus.RESOLVED,
        resolvedAt: new Date(),
      },
    });
  }

  static async deleteComplaint(complaintId: string, currentUser: User) {
    const complaint = await prismaClient.complaint.findUnique({
      where: {
        id: complaintId,
      },
    });

    if (!complaint) {
      throw new AppError("Complaint not found", HttpStatus.NOT_FOUND);
    }

    PermissionService.canDeleteComplaint(currentUser, complaint);

    if (
      complaint.status !== ComplaintStatus.PENDING_APPROVAL &&
      currentUser.role !== Role.ADMIN
    ) {
      throw new AppError(
        "Approved complaints cannot be deleted.",
        HttpStatus.FORBIDDEN,
      );
    }

    await prismaClient.complaint.delete({
      where: {
        id: complaintId,
      },
    });

    return;
  }
  static async getAssignedComplaints(
    currentUser: User
){

    if(currentUser.role === Role.ADMIN){

        return prismaClient.complaint.findMany({

            where:{
                assignedToId:{
                    not:null
                }
            },

            include:{
                assignedTo:true
            }

        });

    }

    return prismaClient.complaint.findMany({

        where:{
            assignedToId:
                currentUser.id
        },

        include:{
            assignedTo:true
        }

    });

}

static async getUnassignedComplaints() {
  return prismaClient.complaint.findMany({
    where: {
      status: ComplaintStatus.APPROVED,
      assignedToId: null,
    },

    orderBy: {
      createdAt: "desc",
    }
  });
}
  static async addComment(
    complaintId: string,
    currentUser: User,
    content: string,
  ) {
    const complaint = await prismaClient.complaint.findUnique({
      where: {
        id: complaintId,
      },
    });

    if (!complaint) {
      throw new AppError("Complaint not found", HttpStatus.NOT_FOUND);
    }

    PermissionService.canComment(currentUser, complaint);
    const comment = await prismaClient.comment.create({
      data: {
        content,
        complaintId,
        userId: currentUser.id,
      },
    });
    await ActivityService.createActivity({
      complaintId,

      actorId: currentUser.id,

      action: ActivityAction.COMMENT_ADDED,

      description: "Comment added",

      metadata: {
        commentId: comment.id,
      },
    });
    return comment;
  }

  static async getComments(complaintId: string, currentUser: User) {
    const complaint = await prismaClient.complaint.findUnique({
      where: {
        id: complaintId,
      },
    });

    if (!complaint) {
      throw new AppError("Complaint not found", HttpStatus.NOT_FOUND);
    }

    PermissionService.canViewComplaint(currentUser, complaint);

    return prismaClient.comment.findMany({
      where: {
        complaintId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }
}
