import { requestHandler } from "./handler";
import newRequest from "./newRequest";
import { Course } from "./course";

// User interface for admin operations
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "student" | "tutor" | "both" | "admin";
  avatar?: string;
  enrolledCourses?: { _id: string }[];
  createdAt?: string;
}

// Lesson interface for admin operations
// Define problem interface to avoid using 'any'
interface Problem {
  id: string;
  question: string;
  options?: string[];
  correctAnswer?: string | string[];
  explanation?: string;
  points?: number;
}

export interface Lesson {
  _id: string;
  title: string;
  content: string | { description: string; videoUrl?: string; problems?: Problem[] };
  duration: string;
  order: number;
  courseId?: string;
}

// Stats interface for admin dashboard
export interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  activeStudents: number;
  activeTutors: number;
  completedCourses: number;
  featuredCourses: number;
}

// Get all users (admin only)
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await requestHandler<User[]>(
      newRequest.get("/admin/users")
    );
    return response;
  } catch (error) {
    throw error instanceof Error ? error : new Error("Failed to fetch users");
  }
};

// Create a new user (admin only)
export const createUser = async (userData: {
  name: string;
  email: string;
  password: string;
  role: "student" | "tutor" | "both" | "admin";
}): Promise<User> => {
  try {
    const response = await requestHandler<User>(
      newRequest.post("/admin/users", userData)
    );
    return response;
  } catch (error) {
    throw error instanceof Error ? error : new Error("Failed to create user");
  }
};

// Delete a user (admin only)
export const deleteUser = async (userId: string): Promise<{ message: string }> => {
  try {
    const response = await requestHandler<{ message: string }>(
      newRequest.delete(`/admin/users/${userId}`)
    );
    return response;
  } catch (error) {
    throw error instanceof Error ? error : new Error("Failed to delete user");
  }
};

// Update a course's featured status (admin only)
export const updateCourseFeaturedStatus = async (
  courseId: string,
  featured: boolean
): Promise<Course> => {
  try {
    const response = await requestHandler<Course>(
      newRequest.patch(`/admin/courses/${courseId}`, { featured })
    );
    return response;
  } catch (error) {
    throw error instanceof Error ? error : new Error("Failed to update course");
  }
};

// Get all lessons (admin only)
export const getAllLessons = async (): Promise<Lesson[]> => {
  try {
    const response = await requestHandler<Lesson[]>(
      newRequest.get("/admin/lessons")
    );
    return response;
  } catch (error) {
    throw error instanceof Error ? error : new Error("Failed to fetch lessons");
  }
};

// For now, we'll simulate these API calls with the existing endpoints
// In a real implementation, you would create proper admin endpoints in the backend

// Fallback implementations that use existing endpoints
export const getAllUsersAlt = async (): Promise<User[]> => {
  try {
    // This would typically be an admin-specific endpoint
    const response = await requestHandler<User[]>(
      newRequest.get("/users")
    );
    return response;
  } catch (error) {
    console.error("Error fetching users:", error);
    // Return empty array if the endpoint doesn't exist yet
    return [];
  }
};

export const getAllCoursesAdmin = async (): Promise<Course[]> => {
  try {
    const response = await requestHandler<{ courses: Course[] }>(
      newRequest.get("/courses")
    );
    return response.courses;
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
};

export const getAllLessonsAlt = async (): Promise<Lesson[]> => {
  try {
    // This would typically be an admin-specific endpoint
    const response = await requestHandler<Lesson[]>(
      newRequest.get("/lessons")
    );
    return response;
  } catch (error) {
    console.error("Error fetching lessons:", error);
    // Return empty array if the endpoint doesn't exist yet
    return [];
  }
};
