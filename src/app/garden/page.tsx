import type { Metadata } from "next";
import { Suspense } from "react";
import { GardenApp } from "@/components/garden/GardenApp";
import { GraveLoader } from "@/components/ui/GraveLoader";

export const metadata: Metadata = {
  title: "The Garden",
  description:
    "Every unfinished project in one place. Browse your graveyard as a 3D garden, cards, a sortable ledger or a timeline of lifespans.",
  alternates: { canonical: "/garden" },
};

export default function GardenPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <GraveLoader label="Growing the garden" />
        </div>
      }
    >
      <GardenApp />
    </Suspense>
  );
}
