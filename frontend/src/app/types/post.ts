import { Category } from "./category";
import { Family } from "./family";
import { User } from "./user";
import { Comment } from "./comment";

type Post = {
  id: number;
  title: string;
  user: number;
  message: string;
  family_details: Family;
  datePosted: string;

  user_details: User;
  media_type?: "IMAGE" | "VIDEO" | null;
  media_url?: string | null;
  categories?: Category[];
  comments?: Comment[];
  // Add other post details here if needed
};

export type { Post };
