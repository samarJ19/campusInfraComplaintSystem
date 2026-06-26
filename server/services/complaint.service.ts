import { prismaClient } from "../prisma/client";
import {
  Department as ComplaintCategory,
  ComplaintStatus,
  Role,
  User,
  ValidityStatus,
} from "../generated/prisma/client";
import { PermissionService } from "./permission.service";
import { AppError, HttpStatus } from "../errors/AppError";

export interface CreateComplaintInput {
  title: string;
  description: string;
  category: ComplaintCategory;
  imageUrl?: string;
}

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

    const updatedComplaint = await prismaClient.complaint.update({
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

    return updatedComplaint;
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

    return prismaClient.comment.create({
      data: {
        content,
        complaintId,
        userId: currentUser.id,
      },
    });
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
