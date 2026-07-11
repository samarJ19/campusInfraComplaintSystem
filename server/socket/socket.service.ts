import { Role } from "../generated/prisma/client";
import { getIO } from "./socket";

export class SocketService {
  /*
  |--------------------------------------------------------------------------
  | Student
  |--------------------------------------------------------------------------
  */

  static notifyStudent(studentId: string, notification: any) {
    getIO().to(studentId).emit("notification", notification);
  }

  static refreshStudentDashboard(studentId: string) {
    getIO().to(studentId).emit("dashboard:update");
  }

  static refreshStudentComplaint(studentId: string, complaintId: string) {
    getIO().to(studentId).emit("complaint:update", {
      complaintId,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Maintenance
  |--------------------------------------------------------------------------
  */

  static notifyMaintenance(maintenanceId: string, notification: any) {
    getIO().to(maintenanceId).emit("notification", notification);
  }

  static refreshMaintenanceDashboard(maintenanceId: string) {
    getIO().to(maintenanceId).emit("dashboard:update");
  }

  static refreshMaintenanceComplaint(
    maintenanceId: string,
    complaintId: string,
  ) {
    getIO().to(maintenanceId).emit("complaint:update", {
      complaintId,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Faculty
  |--------------------------------------------------------------------------
  */

  static notifyFaculty(notification: any) {
    getIO().to(Role.FACULTY).emit("notification", notification);
  }

  static refreshFacultyDashboard() {
    getIO().to(Role.FACULTY).emit("dashboard:update");
  }

  /*
  |--------------------------------------------------------------------------
  | Admin
  |--------------------------------------------------------------------------
  */

  static notifyAdmins(notification: any) {
    getIO().to(Role.ADMIN).emit("notification", notification);
  }

  static refreshAdminDashboard() {
    getIO().to(Role.ADMIN).emit("dashboard:update");
  }
}
