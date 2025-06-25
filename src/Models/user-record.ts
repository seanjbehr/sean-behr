import { User } from "./user";

export interface UserRecord extends User {
  userId: string;
}