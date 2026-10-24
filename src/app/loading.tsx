import { GraveLoader } from "@/components/ui/GraveLoader";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <GraveLoader />
    </div>
  );
}
