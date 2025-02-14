import { User } from "./user";

type Comment = {
  id: number;
  user: number;
  post: number;
  message: string;
  datePosted: string;
  user_details: User;
  parent: number | null;
  parent_user?: User;
  replies: Comment[];
};

export type { Comment };
