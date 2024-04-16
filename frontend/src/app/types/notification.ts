import { User } from "./user";

interface NotificationType {
    id: number;
    content: string;
    notification_type: string;
    user_details: User;
  }
  export type { NotificationType };