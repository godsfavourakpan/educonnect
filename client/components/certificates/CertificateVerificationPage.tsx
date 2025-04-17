"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Home,
  Loader2,
  ShieldCheck,
  XCircle,
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
import { verifyCertificate } from "@/api/certificate";
import { formatDate } from "@/lib/utils";

interface CertificateVerificationPageProps {
  credentialId: string;
}

export function CertificateVerificationPage({
  credentialId,
}: CertificateVerificationPageProps) {
  // Fetch certificate verification data
  const { data, isLoading, error } = useQuery({
    queryKey: ["verify-certificate", credentialId],
    queryFn: () => verifyCertificate(credentialId),
    enabled: !!credentialId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto flex h-[70vh] items-center justify-center px-4 py-8">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-lg">Verifying certificate...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Verification Failed</AlertTitle>
          <AlertDescription>
            We encountered an error while verifying this certificate. Please try
            again later.
          </AlertDescription>
        </Alert>
        <div className="mt-8 text-center">
          <Link href="/">
            <Button variant="outline" className="flex items-center">
              <Home className="mr-2 h-4 w-4" />
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const certificate = data?.certificate;
  const isValid = data?.valid;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 text-center">
        <ShieldCheck className="mx-auto h-16 w-16 text-primary" />
        <h1 className="mt-4 text-3xl font-bold">Certificate Verification</h1>
        <p className="mt-2 text-muted-foreground">
          Verify the authenticity of an EduConnect certificate
        </p>
      </div>

      {!certificate ? (
        <Alert variant="destructive" className="mb-6">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Certificate Not Found</AlertTitle>
          <AlertDescription>
            We couldn&apos;t find a certificate with the provided credential ID.
            Please check the ID and try again.
          </AlertDescription>
        </Alert>
      ) : (
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-col items-center space-y-2 bg-primary/5 text-center">
            <div className="mb-2 rounded-full bg-background p-2">
              {isValid ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <XCircle className="h-8 w-8 text-destructive" />
              )}
            </div>
            <CardTitle className="text-xl">
              {isValid ? "Valid Certificate" : "Invalid Certificate"}
            </CardTitle>
            <CardDescription>
              {isValid
                ? "This certificate is authentic and valid"
                : data?.message || "This certificate is not valid"}
            </CardDescription>
            <Badge
              variant={isValid ? "default" : "destructive"}
              className="mt-2 px-3 py-1 text-sm"
            >
              {certificate.status === "issued" ? "Issued" : certificate.status}
            </Badge>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <h3 className="mb-2 font-semibold">Certificate Details</h3>
                <div className="rounded-lg border bg-card p-4 shadow-sm">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Title
                      </p>
                      <p className="font-medium">{certificate.title}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Course
                      </p>
                      <p>{certificate.courseName}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Recipient
                      </p>
                      <p>{certificate.userName}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Issue Date
                      </p>
                      <p>{formatDate(certificate.issueDate)}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Grade
                      </p>
                      <p>{certificate.grade}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Status
                      </p>
                      <p
                        className={
                          certificate.status === "issued"
                            ? "text-green-600"
                            : "text-destructive"
                        }
                      >
                        {certificate.status.charAt(0).toUpperCase() +
                          certificate.status.slice(1)}
                      </p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Credential ID
                    </p>
                    <p className="break-all font-mono text-xs">
                      {certificate.credentialId}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="border-t bg-muted/30 px-6 py-4">
            <div className="flex w-full flex-col gap-3 text-center sm:flex-row sm:justify-center">
              <Link href="/">
                <Button variant="outline" className="flex items-center">
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Button>
              </Link>

              {isValid && (
                <Link href="/courses">
                  <Button className="flex items-center">
                    <span>Explore Courses</span>
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </CardFooter>
        </Card>
      )}

      <div className="mt-8 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} EduConnect. All rights reserved.
      </div>
    </div>
  );
}
