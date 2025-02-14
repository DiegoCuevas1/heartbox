import { Family } from "./family";
import { User } from "./user";

type NotificationType = {
  message: string;
  notification_type: string;
  sender_details: User;
  family_details: Family;
  connection_id: string | null;
  comment_message?: string;
  post_id?: number;
  id: number;
  timestamp: string;
  read: boolean;
};
export type { NotificationType };
