import type { Member } from ".";
interface Family {
    id: number;
    family_name: string;
    family_description: string;
    inviteCode: string;
    members: Member[];
  }
  export type { Family };