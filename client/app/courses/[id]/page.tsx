import { CourseDetails } from "@/components/courses/CourseDetails";

interface CourseDetailsPageProps {
  params: { id: string };
}

export default async function CourseDetailsPage({
  params,
}: CourseDetailsPageProps) {
  const courseId = await params.id;
  return <CourseDetails courseId={courseId} />;
}
