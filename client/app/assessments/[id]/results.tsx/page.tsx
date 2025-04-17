import { ResultsView } from "@/components/assessments/ResultsView";

export default function ResultsPage({ params }: { params: { id: string } }) {
  return <ResultsView assessmentId={params.id} />;
}
