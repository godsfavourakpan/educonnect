import { Metadata } from "next";
import { CertificateDetailPage } from "@/components/certificates/CertificateDetailPage";

export const metadata: Metadata = {
  title: "Certificate Details | EduConnect",
  description: "View certificate details and verification status",
};

export default function CertificateDetail({
  params,
}: {
  params: { id: string };
}) {
  return <CertificateDetailPage certificateId={params.id} />;
}
