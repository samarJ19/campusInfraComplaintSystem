import { useMutation } from "@tanstack/react-query";

import { useNavigate } from "react-router-dom";

import { queryClient } from "../lib/queryClient";

import { ComplaintService } from "../services/complaint.service";

// what is this? and why is this?
export function useCreateComplaint() {
  
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ComplaintService.createComplaint,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["student-dashboard"],
      });

      queryClient.invalidateQueries({
        queryKey: ["my-complaints"],
      });

      navigate("/student/complaints");
    },
  });
}
