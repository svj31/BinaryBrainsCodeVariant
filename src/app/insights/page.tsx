import type { Metadata } from "next";
import { DeathReport } from "@/components/insights/DeathReport";

export const metadata: Metadata = {
  title: "Death Report",
  description: "See why your projects stall: causes of death, average lifespan, verdict mix and the pattern behind them.",
  alternates: { canonical: "/insights" },
};

export default function InsightsPage() {
  return <DeathReport />;
}
