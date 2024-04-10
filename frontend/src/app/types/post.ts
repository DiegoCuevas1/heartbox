import { User } from "./user";

type Post = {
    post_details:{
        id:number,
        title:string,
        user:number,
        message:string,
        family:number,
        datePosted:string,
    }
  
    user_details: any;
    // Add other post details here if needed
}

export type { Post };