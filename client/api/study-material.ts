import axios from "@/lib/axios";

export interface StudyMaterial {
  _id: string;
  title: string;
  description: string;
  type: "study_guide" | "past_question";
  subject: string;
  courseId: {
    _id: string;
    title: string;
  };
  uploadedBy: {
    _id: string;
    name: string;
  };
  fileUrl: string;
  fileName: string;
  fileSize: number;
  downloads: number;
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface StudyMaterialsResponse {
  materials: StudyMaterial[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export async function getStudyMaterials(params?: {
  type?: string;
  courseId?: string;
  subject?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const response = await axios.get<StudyMaterialsResponse>("/study-materials", {
    params,
  });
  return response.data;
}

export async function getStudyMaterialById(id: string) {
  const response = await axios.get<{ material: StudyMaterial }>(
    `/study-materials/${id}`
  );
  return response.data.material;
}

export async function uploadStudyMaterial(data: {
  title: string;
  description: string;
  type: "study_guide" | "past_question";
  subject: string;
  courseId: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
}) {
  const response = await axios.post<{ material: StudyMaterial }>(
    "/study-materials",
    data
  );
  return response.data.material;
}

export async function updateStudyMaterial(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    subject: string;
    status: "active" | "archived";
  }>
) {
  const response = await axios.put<{ material: StudyMaterial }>(
    `/study-materials/${id}`,
    data
  );
  return response.data.material;
}

export async function deleteStudyMaterial(id: string) {
  await axios.delete(`/study-materials/${id}`);
}

export async function incrementDownloads(id: string) {
  const response = await axios.post<{ downloads: number }>(
    `/study-materials/${id}/download`
  );
  return response.data.downloads;
}
