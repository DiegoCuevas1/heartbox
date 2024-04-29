import { Family } from "./family";
import { User } from "./user";

type Post = {
    
    id:number,
    title:string,
    user:number,
    message:string,
    family_details:Family,
    datePosted:string,
    
  
    user_details: User,
    // Add other post details here if needed
}

export type { Post };