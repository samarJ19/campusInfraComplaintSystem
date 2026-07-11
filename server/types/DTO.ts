import { ActivityAction,  Department as ComplaintCategory, NotificationType, } from "../generated/prisma/enums";
export interface CreateActivityInput {

    complaintId: string;

    actorId: string;

    action: ActivityAction;

    description: string;

    metadata?: any;

}


export interface CreateComplaintInput {
  title: string;
  description: string;
  category: ComplaintCategory;
  imageUrl?: string;
}

export interface CreateNotificationInput {

    userId: string;

    title: string;

    message: string;

    type: NotificationType;

    complaintId?: string;

}

export interface JoinPayload {

    userId: string;

    role: string;

}