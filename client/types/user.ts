export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "student" | "instructor" | "admin";
  courses?: string[];
  createdAt: string;
  updatedAt: string;
}
