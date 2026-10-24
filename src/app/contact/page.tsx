import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions, feedback or a project that refuses to stay buried. Send the SecondWind team a message.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 pt-10 pb-10 sm:px-6 md:grid-cols-[1fr_1.3fr]">
      <div>
        <p className="eyebrow">Contact</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Talk to us</h1>
        <p className="mt-3 leading-relaxed text-ink-2">
          Found a bug, have an idea for a new verdict, or want SecondWind for your college club? Send a note.
        </p>
        <p className="mt-6 text-sm text-ink-2">
          Prefer email? <a className="font-medium text-moss underline underline-offset-2" href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
        </p>
      </div>
      <ContactForm />
    </div>
  );
}
