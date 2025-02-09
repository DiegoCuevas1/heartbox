import { Family } from "./family";

type User = {
  id: string;
  first_name: string;
  last_name: string;
  profile_picture: string;
  // Add other user details here if needed
  families: Family[];
};
export type { User };
