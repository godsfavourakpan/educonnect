import { QuizInterface } from "@/components/assessments/QuizInterface";

export default function AssessmentPage({ params }: { params: { id: string } }) {
  return <QuizInterface assessmentId={params.id} />;
}
