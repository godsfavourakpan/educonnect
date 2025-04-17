import { RecordingPlayer } from "@/components/live-classes/RecordingPlayer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Class Recording | Student Tutor App",
  description: "Watch recorded class sessions",
};

export default function RecordingPage({ params }: { params: { id: string } }) {
  return <RecordingPlayer recordingId={params.id} />;
}
