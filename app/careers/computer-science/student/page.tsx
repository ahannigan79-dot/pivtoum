import type { Metadata } from "next";
import Link from "next/link";
import CSStudent from "@/content/full/computer-science-student.mdx";
import { getCareer } from "@/data/careers";
import { SITE } from "@/lib/site";
import { SiteFooter } from "@/components/SiteFooter";

const career = getCareer("computer-science")!;

export const metadata: Metadata = {
  title: "The Student Version — Computer Science",
  description:
    "The Pivotum student profile for computer science — the short version, written directly to the student. Free to read in full.",
  alternates: { canonical: "/careers/computer-science/student" },
  openGraph: {
    title: "Computer science — the student version",
    description: "The short version, written directly to the student. Free to read in full.",
    type: "article",
    url: `${SITE.url}/careers/computer-science/student`,
  },
};

/**
 * The free student-version companion to the free computer-science full profile.
 * Same free-sample purpose: lets a family see exactly what the student receives.
 */
export default function ComputerScienceStudentPage() {
  return (
    <div className="page">
      <div className="body">
        <div className="crumb" style={{ paddingTop: "1.5rem" }}>
          <span>
            <Link href="/">Pivotum</Link>
          </span>
          <i>/</i>
          <Link href="/careers/computer-science">Computer science</Link>
          <i>/</i>
          <span>Student version</span>
        </div>
        <p className="kicker" style={{ marginTop: "1rem" }}>
          The student version — published free, in full. This is the short profile written
          directly to the student; every paid career includes one.{" "}
          <Link href="/careers/computer-science">Read the full parent profile →</Link>
        </p>
        <CSStudent />
        <SiteFooter />
      </div>
    </div>
  );
}
