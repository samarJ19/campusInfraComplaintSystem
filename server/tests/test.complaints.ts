import { ComplaintService } from "../services/complaint.service";
import { Department} from "../generated/prisma/client";
const complaint = await ComplaintService.createComplaint("cmqqv6v0c0000l0ukj9lcd8hn", {
  title: "Broken benches in class room",
  description: "The benches in the computer science classroom are broken and need to be replaced.",
  category: Department.INFRASTRUCTURE,
  imageUrl: "https://example.com/image.jpg",
});

console.log("Complaint created:", complaint);