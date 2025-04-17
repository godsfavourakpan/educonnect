import { requestHandler } from "./handler";
import newRequest from "./newRequest";

export interface Certificate {
  _id: string;
  userId: string;
  courseId: {
    _id: string;
    title: string;
    image?: string;
  };
  assessmentId: {
    _id: string;
    title: string;
    type: string;
  };
  title: string;
  issueDate: string;
  expiryDate?: string;
  credentialId: string;
  grade: string;
  score: number;
  skills: string[];
  issuer: string;
  status: "issued" | "revoked";
}

export interface CertificateResponse {
  certificates: Certificate[];
}

export interface CertificateDetailResponse {
  certificate: Certificate;
}

export interface VerificationResponse {
  valid: boolean;
  certificate?: {
    credentialId: string;
    title: string;
    issueDate: string;
    expiryDate?: string;
    courseName: string;
    userName: string;
    status: string;
    grade: string;
  };
  message: string;
}

// Get all certificates for the current user
export const getUserCertificates = () =>
  requestHandler<CertificateResponse>(newRequest.get("/certificates"));

// Get certificate by ID
export const getCertificateById = (id: string) =>
  requestHandler<CertificateDetailResponse>(
    newRequest.get(`/certificates/${id}`)
  );

// Verify certificate by credential ID (public)
export const verifyCertificate = (credentialId: string) =>
  requestHandler<VerificationResponse>(
    newRequest.get(`/certificates/verify/${credentialId}`)
  );
