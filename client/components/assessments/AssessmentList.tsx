"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Award,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Search,
  Timer,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAssessmentForUser } from "@/api/assessment";
import { getUserCertificates, Certificate as CertificateType } from "@/api/certificate";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// Define assessment interface
interface AssessmentQuestion {
  id: string;
  text: string;
  options: Array<{ id: string; text: string }>;
}

interface Assessment {
  _id: string;
  title: string;
  description: string;
  courseId: string;
  course?: {
    _id: string;
    title: string;
  };
  type: "quiz" | "exam";
  timeLimit: number;
  dueDate: string;
  category: string;
  status: "not_started" | "in_progress" | "completed";
  progress?: number;
  averageScore?: number;
  questions: AssessmentQuestion[];
}

interface AssessmentResponse {
  assessment: Assessment[];
}

// Certificate interface is imported from the API

export function AssessmentList() {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  // Fetch assessments using React Query
  const { data, isLoading, error } = useQuery<AssessmentResponse>({
    queryKey: ["assessments"],
    queryFn: async () => {
      const response = await getAssessmentForUser();
      return response as AssessmentResponse;
    },
    enabled: !!user,
  });

  // Fetch user certificates
  const { data: certificateData, isLoading: certificatesLoading } = useQuery({
    queryKey: ["certificates"],
    queryFn: async () => {
      const response = await getUserCertificates();
      return response;
    },
    enabled: !!user,
  });

  // Extract assessments from the response
  const assessments: Assessment[] = data?.assessment || [];

  console.log(assessments);

  // Extract unique categories from assessments
  const categories = ["All Categories"];
  const uniqueCategories = new Set<string>();

  assessments.forEach((assessment) => {
    if (assessment.category) {
      uniqueCategories.add(assessment.category);
    }
  });

  // Add unique categories to the categories array
  uniqueCategories.forEach((category) => {
    categories.push(category);
  });

  // Filter assessments based on search query and category
  const filteredAssessments = assessments.filter((assessment: Assessment) => {
    const matchesSearch =
      assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (assessment.course?.title || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      assessment.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All Categories" ||
      assessment.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Calculate days remaining
  const getDaysRemaining = (dateString: string) => {
    const dueDate = new Date(dateString);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Function to determine if we should show the "View Results" button
  const shouldShowResults = (assessment: Assessment) => {
    // Only show results for completed assessments with a score
    return (
      assessment.status === "completed" &&
      typeof assessment.averageScore === "number" &&
      assessment.averageScore >= 0
    );
  };

  // Function to determine correct action button based on assessment status
  const getActionButton = (assessment: Assessment) => {
    if (shouldShowResults(assessment)) {
      return (
        <Button variant="outline" asChild className="w-full">
          <Link href={`/assessments/${assessment._id}/results.tsx`}>
            <CheckCircle className="mr-2 h-4 w-4" />
            View Results
          </Link>
        </Button>
      );
    } else if (assessment.status === "in_progress") {
      return (
        <Button asChild className="w-full">
          <Link href={`/assessments/${assessment._id}`}>
            <Clock className="mr-2 h-4 w-4" />
            Continue
          </Link>
        </Button>
      );
    } else {
      return (
        <Button asChild className="w-full">
          <Link href={`/assessments/${assessment._id}`}>Start Assessment</Link>
        </Button>
      );
    }
  };

  return (
    <div className="container px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Assessments & Certifications
        </h1>
        <p className="text-muted-foreground">
          Take quizzes and exams to test your knowledge and earn certificates.
        </p>
      </div>

      <Tabs defaultValue="assessments" className="mb-8">
        <TabsList>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assessments..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="assessments" className="mt-6">
          {isLoading ? (
            <div className="flex h-40 w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading assessments...</span>
            </div>
          ) : error ? (
            <div className="mt-8 text-center">
              <h3 className="text-lg font-medium">Error loading assessments</h3>
              <p className="text-muted-foreground">
                Please try refreshing the page
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAssessments.map((assessment: Assessment) => (
                <Card key={assessment._id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant="outline" className="mb-2">
                          {assessment.category}
                        </Badge>
                        <CardTitle>{assessment.title}</CardTitle>
                        {/* <CardDescription>
                          {assessment.course?.title || "No course assigned"}
                        </CardDescription> */}
                      </div>
                      {assessment.status === "completed" ? (
                        <Badge className="bg-green-500 hover:bg-green-600">
                          {assessment.averageScore}%
                        </Badge>
                      ) : assessment.status === "in_progress" ? (
                        <Badge variant="secondary">In Progress</Badge>
                      ) : (
                        <Badge variant="outline">
                          {getDaysRemaining(assessment.dueDate) <= 2 ? (
                            <span className="text-red-500">Due Soon</span>
                          ) : (
                            "Not Started"
                          )}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-sm">{assessment.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>
                          {assessment.questions?.length || 0}{" "}
                          {assessment.questions?.length === 1
                            ? "question"
                            : "questions"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Timer className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{assessment.timeLimit} min</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Due: {formatDate(assessment.dueDate)}</span>
                      </div>
                      <div className="flex items-center">
                        <Badge variant="outline">
                          {assessment.type === "quiz" ? "Quiz" : "Exam"}
                        </Badge>
                      </div>
                    </div>

                    {assessment.status === "in_progress" &&
                      assessment.progress !== undefined && (
                        <div className="mt-4">
                          <div className="mb-2 flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span className="font-medium">
                              {assessment.progress}%
                            </span>
                          </div>
                          <Progress
                            value={assessment.progress}
                            className="h-2"
                          />
                        </div>
                      )}
                  </CardContent>
                  <CardFooter>{getActionButton(assessment)}</CardFooter>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && !error && filteredAssessments.length === 0 && (
            <div className="mt-8 text-center">
              <h3 className="text-lg font-medium">No assessments found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="certificates" className="mt-6">
          {certificatesLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading certificates...</span>
            </div>
          ) : certificateData?.certificates && certificateData.certificates.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {certificateData.certificates.map((certificate: CertificateType) => (
                <Card key={certificate._id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{certificate.title}</CardTitle>
                        <CardDescription>
                          {certificate.courseId?.title && (
                            <span className="block text-sm">
                              Course: {certificate.courseId.title}
                            </span>
                          )}
                          Issued by {certificate.issuer}
                        </CardDescription>
                      </div>
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Issue Date</p>
                        <p className="font-medium">
                          {new Date(certificate.issueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Expiry Date</p>
                        <p className="font-medium">
                          {certificate.expiryDate
                            ? new Date(certificate.expiryDate).toLocaleDateString()
                            : "No expiry"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Credential ID</p>
                        <p className="font-medium">{certificate.credentialId}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Grade</p>
                        <p className="font-medium">{certificate.grade}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="mb-2 text-sm text-muted-foreground">Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {certificate.skills && certificate.skills.length > 0 ? (
                          certificate.skills.map((skill) => (
                            <Badge key={skill} variant="secondary">
                              {skill}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">No skills listed</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => router.push(`/certificates/${certificate._id}`)}
                    >
                      <Award className="mr-2 h-4 w-4" />
                      View Certificate
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="mt-8 flex flex-col items-center justify-center text-center">
              <Award className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No certificates yet</h3>
              <p className="text-muted-foreground">
                Complete courses and pass assessments to earn certificates
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
