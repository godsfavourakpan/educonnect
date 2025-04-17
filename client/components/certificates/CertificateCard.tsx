import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Certificate } from "@/api/certificate";
import { Award, Calendar, Download, ExternalLink } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface CertificateCardProps {
  certificate: Certificate;
  showActions?: boolean;
}

export function CertificateCard({
  certificate,
  showActions = true,
}: CertificateCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/5 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="line-clamp-2">{certificate.title}</CardTitle>
            <CardDescription className="mt-1">
              {certificate.courseId.title}
            </CardDescription>
          </div>
          <Badge
            variant={
              certificate.status === "issued" ? "default" : "destructive"
            }
          >
            {certificate.status === "issued" ? "Issued" : "Revoked"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Grade</p>
              <p className="mt-1 flex items-center font-medium">
                <Award className="mr-1 h-4 w-4 text-primary" />
                {certificate.grade} ({certificate.score}%)
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Issue Date
              </p>
              <p className="mt-1 flex items-center">
                <Calendar className="mr-1 h-4 w-4 text-primary" />
                {formatDate(certificate.issueDate)}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Credential ID
            </p>
            <p className="mt-1 truncate font-mono text-xs">
              {certificate.credentialId}
            </p>
          </div>

          {certificate.skills.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Skills
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {certificate.skills.map((skill, index) => (
                  <Badge key={index} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      {showActions && (
        <CardFooter className="border-t bg-muted/30 px-6 py-4">
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-between">
            <Button variant="outline" className="flex items-center">
              <Download className="mr-2 h-4 w-4" />
              <span>Download</span>
            </Button>
            <Link href={`/certificates/${certificate._id}`} passHref>
              <Button className="flex items-center">
                <span>View Certificate</span>
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
