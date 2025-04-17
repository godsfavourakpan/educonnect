import { Metadata } from "next";
import { CertificateVerificationPage } from "@/components/certificates/CertificateVerificationPage";

export const metadata: Metadata = {
  title: "Verify Certificate | EduConnect",
  description: "Verify the authenticity of an EduConnect certificate",
};

export default function VerifyCertificate({
  params,
}: {
  params: { id: string };
}) {
  return <CertificateVerificationPage credentialId={params.id} />;
}
