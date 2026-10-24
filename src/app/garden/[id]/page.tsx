import type { Metadata } from "next";
import { ProjectDetail } from "@/components/project/ProjectDetail";
import { SEED } from "@/lib/seed";

export function generateStaticParams() {
  return SEED.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = SEED.find((s) => s.id === id);
  if (!p) return { title: "Project", robots: { index: false } };
  return {
    title: `${p.name}: verdict and revival plan`,
    description: `${p.pitch} See its Resurrection Score, why it stalled, and the suggested path back.`,
    alternates: { canonical: `/garden/${p.id}` },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectDetail id={id} />;
}
