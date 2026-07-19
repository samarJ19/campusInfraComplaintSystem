export type ComplaintStatus =
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "REJECTED"
  | "REASSIGNMENT_REQUESTED";

export type Priority = "LOW" | "MEDIUM" | "HIGH";

export type Department =
  | "ELECTRICAL"
  | "WATER"
  | "SANITIZATION"
  | "INTERNET"
  | "INFRASTRUCTURE"
  | "GENERAL";

export interface CreateComplaintRequest {

  title: string;

  description: string;

  category: Department;

  priority: Priority;

  imageUrl?: string;

}

export interface UploadResponse {

  success: boolean;

  message: string;

  imageUrl: string;

}

export interface Complaint {
  id: string;

  title: string;

  description: string;

  imageUrl?: string;

  category: Department;

  priority: Priority;

  status: ComplaintStatus;

  createdAt: string;

  updatedAt: string;
}

export interface StudentDashboard {
  stats: {
    totalComplaints: number;

    pendingApproval: number;

    assigned: number;

    inProgress: number;

    resolved: number;

    rejected: number;

    averageResolutionTimeHours: number;
  };

  recentComplaints: Complaint[];
}
