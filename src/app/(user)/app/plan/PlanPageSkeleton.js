import { Skeleton } from "@/shared/components/Loading";

export default function PlanPageSkeleton() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">Plan</h1>

      <div className="rounded-xl border border-border-subtle bg-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>
      </div>

      <div className="rounded-xl border border-border-subtle bg-card p-6">
        <Skeleton className="mb-4 h-4 w-24" />
        <div className="mb-2 flex justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-xl border border-border-subtle bg-card p-4">
            <Skeleton className="mb-2 h-4 w-20" />
            <Skeleton className="h-7 w-16" />
          </div>
        ))}
      </div>
    </main>
  );
}
