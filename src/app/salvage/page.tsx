import type { Metadata } from "next";
import { SalvageYard } from "@/components/salvage/SalvageYard";

export const metadata: Metadata = {
  title: "Salvage Yard",
  description: "Reusable components, scripts, datasets and designs pulled from your unfinished projects, all searchable in one place.",
  alternates: { canonical: "/salvage" },
};

export default function SalvagePage() {
  return <SalvageYard />;
}
