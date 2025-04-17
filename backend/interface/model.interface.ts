import { Document } from "mongoose";

export interface IResource {
  id: string;
  title: string;
  type: string;
  size?: string;
  url?: string;
}

export interface ILesson {
  id: string;
  title: string;
  duration: string;
  type: string;
  completed: boolean;
  content?: {
    videoUrl?: string;
    description?: string;
  };
  resources?: IResource[];
  nextLessonId?: string;
  prevLessonId?: string;
}

export interface IModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  lessons: ILesson[];
}

export interface ICourse extends Document {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  category: string;
  level: string;
  duration: string;
  rating: number;
  reviews?: number;
  students: number;
  instructor: {
    id: string;
    name: string;
    title?: string;
    bio?: string;
    avatar: string;
  };
  price: number;
  image: string;
  featured: boolean;
  tags: string[];
  requirements?: string[];
  objectives?: string[];
  modules?: IModule[];
  resources?: IResource[];
  progress: number;
  completedLessons: string[];
  nextLesson: { id: string; title: string };
  lessons: ILesson[];
  enrolled?: boolean;
}
