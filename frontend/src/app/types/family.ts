import { User } from "./user";

interface Family {
    id: number;
    family_name: string;
    family_description: string;
    invite_code: string;
    members: User[];
  }
  export type { Family };