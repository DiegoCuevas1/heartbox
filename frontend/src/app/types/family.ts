import type { Member } from ".";
interface Family {
    id: number;
    familyName: string;
    familyDescription: string;
    inviteCode: string;
    members: Member[];
    // Add more properties if needed
  }
  export type { Family };