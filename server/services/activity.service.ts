import { Prisma } from "../generated/prisma/client";
import { prismaClient } from "../prisma/client";
import { CreateActivityInput } from "../types/DTO";

export class ActivityService {
  static async createActivity(
    data: CreateActivityInput,
    tx: Prisma.TransactionClient = prismaClient
  ) {
    return tx.activityLog.create({
      data: {
        complaintId: data.complaintId,
        actorId: data.actorId,
        action: data.action,
        description: data.description,
        metadata: data.metadata,
      },
    });
  }

  static async getComplaintActivity(complaintId: string) {
    return prismaClient.activityLog.findMany({
      where: {
        complaintId,
      },
      include: {
        actor: {
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