import type { Metadata } from "next";
import { BuryWizard } from "@/components/bury/BuryWizard";

export const metadata: Metadata = {
  title: "Bury a project",
  description:
    "Run a two minute autopsy on an unfinished project: what it was, what got built, what is left and why it stopped. Get an explainable verdict at the end.",
  alternates: { canonical: "/bury" },
};

export default function BuryPage() {
  return <BuryWizard />;
}
