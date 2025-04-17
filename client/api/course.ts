/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode } from "react";
import { requestHandler } from "./handler";
import newRequest from "./newRequest";

export interface Course {
  students: any;
  resources: any;
  progress: ReactNode;
  modules: any;
  course: Course | PromiseLike<Course>;
  _id: string;
  title: string;
  description: string;
  longDescription?: string;
  category: string;
  level: string;
  price: number;
  duration: string;
  image: string;
  tags: string[];
  requirements?: string[];
  objectives?: string[];
  instructor: {
    id: string;
    name: string;
    avatar: string;
    title?: string;
  };
  rating?: number;
  numberOfStudents?: number;
  featured?: boolean;
  lessons?: {
    id: string;
    title: string;
    content:
      | string
      | { description: string; videoUrl?: string; problems?: any[] };
    duration: string;
    order: number;
    completed?: boolean;
    type?: string;
  }[];
  assessments?: {
    id: string;
    title: string;
    description: string;
    type: "quiz" | "exam" | "assignment";
    duration: string;
    totalPoints: number;
    dueDate?: string;
  }[];
}

export interface CourseResponse {
  courses: Course[];
  total?: number;
}

export interface MarkLessonCompleteParams {
  courseId: string;
  lessonId: string;
}

export const getAllCourses = async (): Promise<CourseResponse> => {
  try {
    const response = await requestHandler<CourseResponse>(
      newRequest.get("/courses")
    );
    return response;
  } catch (error) {
    throw error instanceof Error ? error : new Error("Failed to fetch courses");
  }
};

export const getCourseById = async (courseId: string): Promise<Course> => {
  try {
    const response = await requestHandler<Course>(
      newRequest.get(`/courses/${courseId}`)
    );
    if (!response) {
      throw new Error("Course not found");
    }
    return response;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch course"
    );
  }
};

export const enrollCourse = async (
  courseId: string
): Promise<{ message: string; user?: any }> => {
  try {
    console.log(`Making API request to enroll in course: ${courseId}`);

    // Make the request to the backend
    const response = await newRequest.post(`/courses/${courseId}/enroll`);

    console.log("Received response from enroll course API:", response.data);

    // Return the data from the response
    return response.data;
  } catch (error) {
    console.error("Error in enrollCourse API call:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to enroll in course");
  }
};

export const markLessonComplete = async ({
  courseId,
  lessonId,
}: MarkLessonCompleteParams): Promise<any> => {
  try {
    console.log(
      `Making API request to mark lesson complete - courseId: ${courseId}, lessonId: ${lessonId}`
    );

    // Make the request to the backend using the correct endpoint
    const response = await newRequest.post(
      `/student/courses/${courseId}/lessons/${lessonId}/progress`
    );

    console.log(
      "Received response from mark lesson complete API:",
      response.data
    );

    // Return the data from the response
    return response.data;
  } catch (error) {
    console.error("Error in markLessonComplete API call:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to mark lesson as complete");
  }
};

export const getCoursesForInstructor = async (
  instructorId: string
): Promise<CourseResponse> => {
  try {
    const response = await requestHandler<CourseResponse>(
      newRequest.get(`/courses/instructor/${instructorId}`)
    );
    if (!response) {
      throw new Error("No courses found");
    }
    return response;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch courses"
    );
  }
};

export const createCourse = async (course: Course): Promise<Course> => {
  try {
    const response = await requestHandler<Course>(
      newRequest.post("/courses", course)
    );
    return response;
  } catch (error) {
    throw error instanceof Error ? error : new Error("Failed to create course");
  }
};

export const downloadResource = async (
  courseId: string,
  resourceId: string
): Promise<{ url: string }> => {
  try {
    console.log(
      `Requesting download for resource: ${resourceId} in course: ${courseId}`
    );

    // Make the request to get the download URL
    const response = await newRequest.get(
      `/courses/${courseId}/resources/${resourceId}`
    );

    console.log("Received resource data:", response.data);

    return response.data;
  } catch (error) {
    console.error("Error getting resource download URL:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to download resource");
  }
};
