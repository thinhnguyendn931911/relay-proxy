import { Skeleton } from "@/shared/components/Loading";

const BAR_HEIGHTS = [40, 65, 30, 80, 55, 45, 70, 35, 60, 50, 75, 40, 55, 65];

export default function UsagePageSkeleton() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">Usage</h1>

      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-border-subtle bg-card p-4">
            <Skeleton className="mb-2 h-4 w-20" />
            <Skeleton className="h-7 w-24" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border-subtle bg-card p-4">
        <Skeleton className="mb-3 h-4 w-24" />
        <div className="flex items-end gap-1 pb-2">
          {BAR_HEIGHTS.map((h, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <Skeleton className="w-6 rounded" style={{ height: h }} />
              <Skeleton className="h-2 w-5" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border-subtle bg-card">
        <div className="border-b border-border-subtle px-4 py-3">
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="border-b border-border-subtle text-xs uppercase text-text-muted">
              <tr>
                <th className="px-4 py-2">Time</th>
                <th className="px-4 py-2">Model</th>
                <th className="px-4 py-2">Prompt</th>
                <th className="px-4 py-2">Completion</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {[0, 1, 2, 3, 4].map((i) => (
                <tr key={i} className="border-b border-border-subtle last:border-0">
                  <td className="px-4 py-2"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-4 py-2"><Skeleton className="h-4 w-28" /></td>
                  <td className="px-4 py-2"><Skeleton className="h-4 w-12" /></td>
                  <td className="px-4 py-2"><Skeleton className="h-4 w-12" /></td>
                  <td className="px-4 py-2"><Skeleton className="h-4 w-10" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
