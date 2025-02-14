import { Family } from "./family";

type User = {
  id: string;
  first_name: string;
  last_name: string;
  profile_picture: string;
  // Add other user details here if needed
  families: Family[];
  connectionStatus?: string;
  isIncomingRequest?: boolean;
  connectionId?: string;
  connection_count?: number;
};
export type { User };
