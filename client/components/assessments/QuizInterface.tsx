"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Clock,
  Flag,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getQuestion, startAssessment } from "@/api/assessment";
import { useQuery, useMutation } from "@tanstack/react-query";
import { submitAssessment } from "@/api/assessment";
import { toast } from "sonner";

// Define interfaces for the question data
interface Question {
  id: string;
  text: string;
  options: string[];
  type: "multiple-choice" | "multiple-select" | "true-false";
}

// Define interface for the API response
interface QuestionsResponse {
  questions: Question[];
  course?: {
    _id: string;
    title: string;
  };
  title?: string;
  timeLimit?: number;
}

export function QuizInterface({ assessmentId }: { assessmentId: string }) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // Default 30 minutes, will be updated
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  // Start assessment mutation
  const { mutate: startAssessmentMutation, isLoading: isStarting } =
    useMutation({
      mutationFn: () => startAssessment(assessmentId),
      onSuccess: (data) => {
        console.log("Assessment started:", data);
        setIsStarted(true);

        if (data.userStatus === "completed") {
          // User has already completed this assessment, redirect to results
          toast.info("You've already completed this assessment");
          router.push(`/assessments/${assessmentId}/results`);
        }
      },
      onError: (error) => {
        console.error("Failed to start assessment:", error);
        toast.error("Failed to start the assessment");
      },
    });

  // Start the assessment when component loads
  useEffect(() => {
    if (assessmentId && !isStarted) {
      startAssessmentMutation();
    }
  }, [assessmentId, isStarted, startAssessmentMutation]);

  // Submit assessment - defined early to avoid the "used before declaration" error
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);

    try {
      const response = await submitAssessment(
        assessmentId,
        answers,
        timeRemaining
      );
      console.log("Response:", response);
      // Navigate to the results page using the correct Next.js route structure
      router.push(`/assessments/${assessmentId}/results.tsx`);
    } catch (error) {
      console.error("Failed to submit assessment:", error);
      toast.error("Failed to submit assessment");
    } finally {
      setIsSubmitting(false);
    }
  }, [assessmentId, answers, timeRemaining, router]);

  // Fetch questions data
  const {
    data: questionsData,
    isLoading: isLoadingQuestions,
    error: questionsError,
  } = useQuery<QuestionsResponse>({
    queryKey: ["questions", assessmentId],
    queryFn: async () => {
      const response = await getQuestion(assessmentId);
      return response || { questions: [] };
    },
    enabled: !!assessmentId,
  });

  // Derived state using useMemo - defined before any conditional returns
  const questions = useMemo(
    () => questionsData?.questions || [],
    [questionsData]
  );

  const totalQuestions = useMemo(() => questions.length, [questions]);

  const currentQuestion = useMemo(
    () =>
      questions[currentQuestionIndex] || {
        id: "",
        text: "",
        options: [],
        type: "multiple-choice" as const,
      },
    [questions, currentQuestionIndex]
  );

  // Update time remaining when assessment data is loaded
  useEffect(() => {
    if (questionsData?.timeLimit) {
      setTimeRemaining(questionsData.timeLimit * 60);
    }
  }, [questionsData]);

  const answeredQuestionsCount = useMemo(() => {
    return Object.keys(answers).filter((questionId) => {
      const answer = answers[questionId];
      return Array.isArray(answer) ? answer.length > 0 : !!answer;
    }).length;
  }, [answers]);

  const progress = useMemo(() => {
    return totalQuestions > 0
      ? (answeredQuestionsCount / totalQuestions) * 100
      : 0;
  }, [answeredQuestionsCount, totalQuestions]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handleSubmit]);

  // Format time remaining
  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle single choice answer
  const handleSingleChoiceAnswer = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  // Handle multiple choice answer
  const handleMultipleChoiceAnswer = (
    questionId: string,
    optionId: string,
    checked: boolean
  ) => {
    setAnswers((prev) => {
      const currentAnswers = (prev[questionId] as string[]) || [];
      return {
        ...prev,
        [questionId]: checked
          ? [...currentAnswers, optionId]
          : currentAnswers.filter((id) => id !== optionId),
      };
    });
  };

  // Toggle flagged question
  const toggleFlaggedQuestion = (questionId: string) => {
    setFlaggedQuestions((prev) => {
      if (prev.includes(questionId)) {
        return prev.filter((id) => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };

  // Navigate to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Navigate to previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // If questions are still loading or there's an error, show appropriate UI
  if (isLoadingQuestions || isStarting) {
    return (
      <div className="container mx-auto flex h-[60vh] max-w-4xl items-center justify-center px-4 py-8 sm:px-6">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-lg">
            {isStarting ? "Starting assessment..." : "Loading assessment..."}
          </p>
        </div>
      </div>
    );
  }

  if (questionsError) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load questions. Make sure you are enrolled in this course.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // If no questions are available
  if (!questions.length) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Questions Available</AlertTitle>
          <AlertDescription>
            This assessment does not have any questions yet. Please check back
            later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {questionsData?.title || "Assessment"}
          </h1>
          <p className="text-muted-foreground">
            {questionsData?.course?.title || "No course"}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div
            className={`flex items-center rounded-full px-3 py-1 ${
              timeRemaining < 300
                ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                : "bg-muted"
            }`}
          >
            <Clock className="mr-2 h-4 w-4" />
            <span className="font-medium">{formatTimeRemaining()}</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span>Progress</span>
          <span>
            {answeredQuestionsCount}/{totalQuestions} questions answered
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_250px]">
        {/* Question Area */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </CardTitle>
                  <CardDescription>
                    {currentQuestion.type === "multiple-choice" &&
                      "Select one answer"}
                    {currentQuestion.type === "multiple-select" &&
                      "Select all that apply"}
                    {currentQuestion.type === "true-false" &&
                      "Select True or False"}
                  </CardDescription>
                </div>
                <Button
                  variant={
                    flaggedQuestions.includes(currentQuestion.id)
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => toggleFlaggedQuestion(currentQuestion.id)}
                >
                  <Flag className="mr-2 h-4 w-4" />
                  {flaggedQuestions.includes(currentQuestion.id)
                    ? "Flagged"
                    : "Flag for Review"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-lg">{currentQuestion.text}</div>

                {(currentQuestion.type === "multiple-choice" ||
                  currentQuestion.type === "true-false") && (
                  <RadioGroup
                    value={answers[currentQuestion.id] as string}
                    onValueChange={(value) =>
                      handleSingleChoiceAnswer(currentQuestion._id, value)
                    }
                  >
                    <div className="space-y-2">
                      {currentQuestion.options.map(
                        (option: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted/50"
                          >
                            <RadioGroupItem
                              value={option}
                              id={`${currentQuestion._id}-${index}`}
                              className="peer"
                            />
                            <Label
                              htmlFor={`${currentQuestion._id}-${index}`}
                              className="flex-1 cursor-pointer"
                            >
                              {option}
                            </Label>
                          </div>
                        )
                      )}
                    </div>
                  </RadioGroup>
                )}

                {currentQuestion.type === "multiple-select" && (
                  <div className="space-y-2">
                    {currentQuestion.options.map(
                      (option: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted/50"
                        >
                          <Checkbox
                            id={`${currentQuestion._id}-${index}`}
                            checked={
                              Array.isArray(answers[currentQuestion._id]) &&
                              (
                                answers[currentQuestion._id] as string[]
                              ).includes(option)
                            }
                            onCheckedChange={(checked) =>
                              handleMultipleChoiceAnswer(
                                currentQuestion._id,
                                option,
                                checked as boolean
                              )
                            }
                            className="peer"
                          />
                          <Label
                            htmlFor={`${currentQuestion._id}-${index}`}
                            className="flex-1 cursor-pointer"
                          >
                            {option}
                          </Label>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              {currentQuestionIndex < totalQuestions - 1 ? (
                <Button onClick={handleNextQuestion}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={() => setShowConfirmSubmit(true)}>
                  Finish
                </Button>
              )}
            </CardFooter>
          </Card>

          {showConfirmSubmit && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Confirm Submission</AlertTitle>
              <AlertDescription>
                <p className="mb-2">
                  Are you sure you want to submit your assessment? You have
                  answered {Object.keys(answers).length} out of {totalQuestions}{" "}
                  questions.
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowConfirmSubmit(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Assessment"}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Question Navigation */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question Navigator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((question: Question, index: number) => (
                  <Button
                    key={question._id}
                    variant={
                      currentQuestionIndex === index
                        ? "default"
                        : answers[question._id]
                        ? "outline"
                        : "ghost"
                    }
                    size="sm"
                    className={`h-10 w-10 ${
                      flaggedQuestions.includes(question._id)
                        ? "border-2 border-yellow-500"
                        : ""
                    }`}
                    onClick={() => setCurrentQuestionIndex(index)}
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center">
                  <div className="mr-2 h-3 w-3 rounded-full bg-primary"></div>
                  <span>Current Question</span>
                </div>
                <div className="flex items-center">
                  <div className="mr-2 h-3 w-3 rounded-full border-2 border-yellow-500"></div>
                  <span>Flagged for Review</span>
                </div>
                <div className="flex items-center">
                  <div className="mr-2 h-3 w-3 rounded-full border"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center">
                  <div className="mr-2 h-3 w-3 rounded-full bg-muted"></div>
                  <span>Not Answered</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => setShowConfirmSubmit(true)}
              >
                Submit Assessment
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assessment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Questions:</span>
                  <span className="font-medium">{totalQuestions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Answered:</span>
                  <span className="font-medium">
                    {Object.keys(answers).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Flagged:</span>
                  <span className="font-medium">{flaggedQuestions.length}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span>Time Remaining:</span>
                  <span className="font-medium">{formatTimeRemaining()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
