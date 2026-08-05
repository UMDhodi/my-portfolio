import type { Metadata } from "next";
import CertificationsClient from "@/app/components/certificate_page";
import { getCertifications } from "@/app/actions/admin";

export const metadata: Metadata = {
  title: "Certifications",
  description:
    "Credentials, hackathon results, and milestones the receipts behind the resume of Mayank Dhodi.",
};

export default async function CertificationsPage() {
  const certs = await getCertifications();
  return <CertificationsClient initialCerts={certs} />;
}
