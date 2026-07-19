import api from "../api/axios";

import {
  type StudentDashboard,
  type CreateComplaintRequest,
  type UploadResponse,
} from "../types/complaint";

export class ComplaintService {
  static async getStudentDashboard(): Promise<StudentDashboard> {
    const response = await api.get("/dashboard/student");

    return response.data.dashboard;
  }

  static async uploadImage(file: File): Promise<string> {
    const formData = new FormData();

    formData.append("image", file);

    const response = await api.post<UploadResponse>("/uploads", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.imageUrl;
  }

  static async createComplaint(data: CreateComplaintRequest) {
    const response = await api.post("/complaints", data);

    return response.data;
  }
}
