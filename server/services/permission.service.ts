import {
  Complaint,
  ComplaintStatus,
  Role,
  User,
} from "../generated/prisma/client";
import { AppError, HttpStatus } from "../errors/AppError";

export class PermissionService {
  static canViewComplaint(user: User, complaint: Complaint): void {
    switch (user.role) {
      case Role.ADMIN:
        return;
      case Role.FACULTY:
        return;
      case Role.STUDENT:
        if (complaint.createdById !== user.id) {
          throw new AppError(
            "You are not authorized to view this complaint.",
            HttpStatus.FORBIDDEN,
          );
        }
        return;
      case Role.MAINTENANCE:
        if (complaint.assignedToId !== user.id) {
          throw new AppError(
            "You are not authorized to view this complaint.",
            HttpStatus.FORBIDDEN,
          );
        }
        return;
      default:
        throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED);
    }
  }

  static canApproveComplaint(user: User): void {
    if (user.role !== Role.FACULTY && user.role !== Role.ADMIN) {
      throw new AppError(
        "Only faculty or admin can approve complaints.",
        HttpStatus.FORBIDDEN,
      );
    }
  }

  static canRejectComplaint(user: User): void {
    if (user.role !== Role.FACULTY && user.role !== Role.ADMIN) {
      throw new AppError(
        "Only faculty or admin can reject complaints.",
        HttpStatus.FORBIDDEN,
      );
    }
  }

  static canResolveComplaint(user: User, complaint: Complaint): void {
    if (user.role === Role.ADMIN) {
      return;
    }

    if (user.role === Role.MAINTENANCE && complaint.assignedToId === user.id) {
      return;
    }

    throw new AppError(
      "You are not authorized to resolve this complaint.",
      HttpStatus.FORBIDDEN,
    );
  }

  static canStartWork(user: User, complaint: Complaint): void {
    if (user.role === Role.ADMIN) {
      return;
    }

    if (user.role === Role.MAINTENANCE && complaint.assignedToId === user.id) {
      return;
    }

    throw new AppError(
      "You are not authorized to start this complaint.",
      HttpStatus.FORBIDDEN,
    );
  }

  static canDeleteComplaint(user: User, complaint: Complaint): void {
    if (user.role === Role.ADMIN) {
      return;
    }

    if (user.role === Role.STUDENT && complaint.createdById === user.id) {
      return;
    }

    throw new AppError(
      "You are not allowed to delete this complaint.",
      HttpStatus.FORBIDDEN,
    );
  }

  static canComment(user: User, complaint: Complaint): void {
    if (user.role === Role.ADMIN) {
      return;
    }

    if (user.role === Role.STUDENT && complaint.createdById === user.id) {
      return;
    }

    if (user.role === Role.MAINTENANCE && complaint.assignedToId === user.id) {
      return;
    }

    if (user.role === Role.FACULTY) {
      return;
    }

    throw new AppError(
      "You cannot comment on this complaint.",
      HttpStatus.FORBIDDEN,
    );
  }
  static canRequestReassignment(user: User, complaint: Complaint): void {
    if (user.role === Role.ADMIN) {
      return;
    }

    if (user.role !== Role.MAINTENANCE) {
      throw new AppError(
        "Only maintenance staff can request reassignment",
        HttpStatus.FORBIDDEN,
      );
    }

    if (complaint.assignedToId !== user.id) {
      throw new AppError(
        "You are not assigned to this complaint",
        HttpStatus.FORBIDDEN,
      );
    }

    if (
      complaint.status !== ComplaintStatus.ASSIGNED &&
      complaint.status !== ComplaintStatus.IN_PROGRESS
    ) {
      throw new AppError(
        "Reassignment request is not allowed for this complaint",
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  static canApproveReassignment(user: User): void {
    if (user.role !== Role.FACULTY && user.role !== Role.ADMIN) {
      throw new AppError(
        "You are not authorized to approve reassignment requests",
        HttpStatus.FORBIDDEN,
      );
    }
  }
  static canRejectReassignment(user: User): void {
    if (user.role !== Role.FACULTY && user.role !== Role.ADMIN) {
      throw new AppError(
        "You are not authorized to reject reassignment requests",
        HttpStatus.FORBIDDEN,
      );
    }
  }
  static canViewReassignmentRequests(user: User): void {
    if (user.role !== Role.ADMIN && user.role !== Role.FACULTY) {
      throw new AppError("Unauthorized", HttpStatus.FORBIDDEN);
    }
  }
}
