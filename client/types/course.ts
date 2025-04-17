export interface ILesson {
  id: string;
  title: string;
  content: string;
  duration: string;
  order: number;
}

export interface IAssessment {
  id: string;
  title: string;
  description: string;
  type: "quiz" | "exam" | "assignment";
  duration: string;
  totalPoints: number;
  dueDate?: string;
  questions?: {
    id: string;
    text: string;
    type: "multiple_choice" | "true_false" | "essay";
    options?: string[];
    correctAnswer?: string | boolean;
    points: number;
  }[];
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  price: number;
  duration: string;
  image: string;
  tags: string[];
  instructor: {
    id: string;
    name: string;
    avatar: string;
  };
  rating?: number;
  numberOfStudents?: number;
  featured?: boolean;
  lessons?: ILesson[];
  assessments?: IAssessment[];
}
