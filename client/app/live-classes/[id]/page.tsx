import { LiveSession } from "@/components/live-classes/LiveSession";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Session | Student Tutor App",
  description: "Join an interactive live class session",
};

export default function LiveSessionPage({
  params,
}: {
  params: { id: string };
}) {
  return <LiveSession sessionId={params.id} />;
}
