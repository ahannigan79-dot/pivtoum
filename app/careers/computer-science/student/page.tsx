import type { Metadata } from "next";
import Link from "next/link";
import CSStudent from "@/content/full/computer-science-student.mdx";
import { getCareer } from "@/data/careers";
import { SITE } from "@/lib/site";
import { SiteFooter } from "@/components/SiteFooter";
import { GatedBlur } from "@/components/GatedBlur";
import { EmailSignup } from "@/components/EmailSignup";

const career = getCareer("computer-science")!;

export const metadata: Metadata = {
  title: "The Student Version — Computer Science",
  description:
    "The Pivotum student version for computer science — the Career Value Guide written directly to the student. Free to read in full.",
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
          The student version — the short read written directly to the student; every Career Value
          Guide includes one.{" "}
          <Link href="/careers/computer-science">See the full guide →</Link>
        </p>
        <GatedBlur
          label="The student version — read it free"
          cta="The short version written straight to the student. Get the free Career Map to read it in full."
        >
          <CSStudent />
        </GatedBlur>
        <EmailSignup
          label="Parents: get the test behind our scores"
          sub="The free Starter Kit — the three-question test to size up any career, plus each new article and edition. Free, no spam."
        />
        <SiteFooter />
      </div>
    </div>
  );
}
