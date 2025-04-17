"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Download,
  Loader2,
  Share2,
  Trophy,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getCertificateById } from "@/api/certificate";
import { formatDate } from "@/lib/utils";

interface CertificateDetailPageProps {
  certificateId: string;
}

export function CertificateDetailPage({
  certificateId,
}: CertificateDetailPageProps) {
  const router = useRouter();

  // Fetch certificate details
  const {
    data: certificateData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["certificate", certificateId],
    queryFn: () => getCertificateById(certificateId),
    enabled: !!certificateId,
  });

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto flex h-[70vh] max-w-5xl items-center justify-center px-4 py-8 sm:px-6">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-lg">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (error || !certificateData?.certificate) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load certificate. The certificate may not exist or you may
            not have permission to view it.
          </AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={handleBack}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Certificates
        </Button>
      </div>
    );
  }

  const certificate = certificateData.certificate;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-2">
        <Button
          variant="outline"
          onClick={handleBack}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader className="bg-primary/5 flex flex-row items-start justify-between pb-4">
              <div>
                <CardTitle className="text-2xl">{certificate.title}</CardTitle>
                <CardDescription className="mt-1 text-base">
                  {certificate.courseId.title}
                </CardDescription>
              </div>
              <Badge
                variant={
                  certificate.status === "issued" ? "default" : "destructive"
                }
                className="ml-2 px-3 py-1.5 text-sm"
              >
                {certificate.status === "issued" ? "Issued" : "Revoked"}
              </Badge>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-8 rounded-lg border bg-card p-4 shadow-sm">
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">
                        Credential ID
                      </div>
                      <div className="break-all font-mono text-sm">
                        {certificate.credentialId}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">
                        Issue Date
                      </div>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-primary" />
                        {formatDate(certificate.issueDate)}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">
                        Grade
                      </div>
                      <div className="flex items-center font-semibold">
                        <Trophy className="mr-2 h-5 w-5 text-primary" />
                        {certificate.grade} ({certificate.score}%)
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">
                        Issued By
                      </div>
                      <div>{certificate.issuer}</div>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="mb-3 text-lg font-semibold">Skills</h3>
              <div className="mb-6 flex flex-wrap gap-2">
                {certificate.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>

              <h3 className="mb-3 text-lg font-semibold">Verification</h3>
              <p className="mb-2 text-sm text-muted-foreground">
                This certificate can be verified using the credential ID. Share
                this ID with employers or educational institutions to verify
                your achievement.
              </p>
              <div className="flex items-center rounded-md bg-primary/5 p-3">
                <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                <span className="font-medium">Verified and Valid</span>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/30 px-6 py-4">
              <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-between">
                <Button variant="outline" className="flex items-center">
                  <Download className="mr-2 h-4 w-4" />
                  <span>Download Certificate</span>
                </Button>
                <Button className="flex items-center">
                  <Share2 className="mr-2 h-4 w-4" />
                  <span>Share Certificate</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Course Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Course
                  </h4>
                  <p className="mt-1 font-medium">
                    {certificate.courseId.title}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Assessment
                  </h4>
                  <p className="mt-1">{certificate.assessmentId.title}</p>
                </div>
                <Button
                  variant="outline"
                  className="mt-2 w-full"
                  onClick={() =>
                    router.push(`/courses/${certificate.courseId._id}`)
                  }
                >
                  View Course
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Verify Certificate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Share this link for others to verify your certificate:
              </p>
              <div className="rounded-md border p-3 font-mono text-xs">
                {`https://educonnect.com/verify/${certificate.credentialId}`}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
