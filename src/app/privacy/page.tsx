import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What SecondWind stores, where it lives, and the choices you have. Your projects stay in your browser.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      updated="24 October 2026"
      intro="SecondWind is built so that your unfinished projects stay yours. This page explains exactly what we store, where it is stored, and how to remove it."
      sections={[
        {
          id: "summary",
          h: "The short version",
          body: (
            <ul>
              <li>Projects you record are saved in your own browser (local storage). They are not sent to our servers.</li>
              <li>We do not sell or share personal data, and we do not run advertising.</li>
              <li>Analytics only run if you opt in, and they do not use cookies or identify you.</li>
              <li>If you use the contact form, we receive your name, email and message so we can reply.</li>
            </ul>
          ),
        },
        {
          id: "stored",
          h: "What we store and where",
          body: (
            <>
              <p>
                <strong className="text-ink">In your browser:</strong> your projects, autopsy drafts, sprint progress and
                your cookie choice. This data never leaves your device unless you copy it out yourself. Clearing your
                browser data, or using “Reset to sample data” in the Garden, removes it.
              </p>
              <p>
                <strong className="text-ink">On our side:</strong> messages sent through the contact form, kept only as
                long as needed to answer and then deleted within 12 months. Standard server logs (IP address, browser
                type, time of request) are kept by our hosting provider for up to 30 days for security.
              </p>
            </>
          ),
        },
        {
          id: "cookies",
          h: "Cookies and analytics",
          body: (
            <>
              <p>
                SecondWind does not set tracking cookies. The only essential storage is local storage for your garden
                and your consent choice.
              </p>
              <p>
                If you choose “Allow analytics”, we load a privacy-focused, cookie-free analytics script that counts page
                visits and a few anonymous events (for example, “a project was buried”). It does not record what you
                write. If you choose “Essential only”, no analytics script is loaded at all.
              </p>
              <p>You can change your choice at any time from “Cookie settings” in the footer.</p>
            </>
          ),
        },
        {
          id: "rights",
          h: "Your rights",
          body: (
            <p>
              You can ask us to access, correct or delete any message you sent us. Since your projects live in your
              browser, you are already in full control of them. Email{" "}
              <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a> for anything else.
            </p>
          ),
        },
        {
          id: "children",
          h: "Children",
          body: <p>SecondWind is meant for people aged 13 and over. We do not knowingly collect data from younger children.</p>,
        },
        {
          id: "security",
          h: "Security",
          body: (
            <p>
              The site is served only over HTTPS with strict transport security. No passwords or payment details are
              collected. Server-side keys are never exposed to the browser.
            </p>
          ),
        },
        {
          id: "changes",
          h: "Changes and contact",
          body: (
            <p>
              If this policy changes, we will update the date at the top. Questions are welcome through the{" "}
              <Link href="/contact">contact page</Link>.
            </p>
          ),
        },
      ]}
    />
  );
}
