import { User } from "./user";

interface Family {
    id: number;
    family_name: string;
    family_description: string;
    inviteCode: string;
    members: User[];
  }
  export type { Family };