"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowUpDown,
  Award,
  CheckCircle,
  Loader2,
  Search,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/PageHeader";
import { Empty } from "@/components/Empty";
import { getUserCertificates } from "@/api/certificate";
import { CertificateCard } from "./CertificateCard";

export function CertificatesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch certificates
  const {
    data: certificatesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["certificates"],
    queryFn: getUserCertificates,
  });

  // Filter certificates based on search query
  const filteredCertificates = certificatesData?.certificates.filter(
    (certificate) =>
      certificate.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      certificate.courseId.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      certificate.credentialId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        heading="Certificates"
        subheading="View and manage your earned certificates"
        icon={<Award className="h-6 w-6" />}
      />

      {/* Search and filter */}
      <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search certificates..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4" />
          <span>Sort by</span>
        </Button>
      </div>

      {/* Certificates list */}
      <div className="mt-8">
        {isLoading ? (
          <div className="flex h-60 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Loading certificates...</span>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load certificates. Please try again later.
            </AlertDescription>
          </Alert>
        ) : filteredCertificates?.length === 0 ? (
          <div className="mt-8">
            {searchQuery ? (
              <Empty
                icon={<XCircle className="h-12 w-12 text-muted-foreground" />}
                title="No matching certificates"
                description="Try adjusting your search query"
                actionLabel="Clear search"
                onAction={() => setSearchQuery("")}
              />
            ) : (
              <Empty
                icon={<Award className="h-12 w-12 text-muted-foreground" />}
                title="No certificates yet"
                description="Complete courses and pass assessments to earn certificates"
                actionLabel="Browse courses"
                actionHref="/courses"
              />
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCertificates?.map((certificate) => (
              <CertificateCard
                key={certificate._id}
                certificate={certificate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
