import { Family } from "./family";
import { User } from "./user";

type NotificationType = {
  id: number;
  message: string;
  notification_type: string;
  sender_details: User;
  family_details: Family;
};
export type { NotificationType };
