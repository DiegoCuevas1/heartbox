import { User } from "./user";

type Family = {
  id: number;
  family_name: string;
  family_description: string;
  invite_code: string;
  members: User[];
  family_picture: string;
};
export type { Family };
