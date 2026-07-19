import { useQuery } from "@tanstack/react-query";

import { ComplaintService } from "../services/complaint.service";

export function useStudentDashboard() {
  return useQuery({
    queryKey: ["student-dashboard"],

    queryFn: ComplaintService.getStudentDashboard,
  });
}
