import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms and conditions",
  description: "The rules for using SecondWind: your content stays yours, verdicts are suggestions, and the service is provided as is.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms and conditions"
      updated="24 October 2026"
      intro="By using SecondWind you agree to these terms. They are written to be read, so they are short."
      sections={[
        {
          id: "service",
          h: "The service",
          body: (
            <p>
              SecondWind helps you record unfinished projects and suggests what to do with them. It is free to use and
              does not require an account. Features may change as we improve the product.
            </p>
          ),
        },
        {
          id: "content",
          h: "Your content",
          body: (
            <p>
              Everything you write about your projects belongs to you. It is stored in your browser and we do not claim
              any rights over it. You are responsible for not entering anything you are not allowed to share, such as
              confidential work from an employer.
            </p>
          ),
        },
        {
          id: "verdicts",
          h: "Verdicts are suggestions",
          body: (
            <p>
              The Resurrection Score and verdicts come from a transparent set of rules applied to your own answers. They
              are guidance, not professional, financial or career advice. The decision about any project is always
              yours.
            </p>
          ),
        },
        {
          id: "use",
          h: "Acceptable use",
          body: (
            <ul>
              <li>Do not try to break, overload or reverse engineer the service.</li>
              <li>Do not use the contact form to send spam or abusive messages.</li>
              <li>Do not use SecondWind for anything unlawful.</li>
            </ul>
          ),
        },
        {
          id: "liability",
          h: "Availability and liability",
          body: (
            <p>
              SecondWind is provided as is, without warranties. Because data lives in your browser, clearing site data
              will remove it, and we cannot recover it. To the extent the law allows, we are not liable for lost data or
              indirect losses from using the service.
            </p>
          ),
        },
        {
          id: "changes",
          h: "Changes and contact",
          body: (
            <p>
              We may update these terms and will change the date above when we do. See the{" "}
              <Link href="/privacy">privacy policy</Link> for how data is handled, or email{" "}
              <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
            </p>
          ),
        },
      ]}
    />
  );
}
