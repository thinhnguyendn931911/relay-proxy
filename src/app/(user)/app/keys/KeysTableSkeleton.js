import { Skeleton } from "@/shared/components/Loading";

export default function KeysTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead className="border-b border-border-subtle text-xs uppercase text-text-muted">
          <tr>
            <th className="px-3 py-2 font-semibold">Name</th>
            <th className="px-3 py-2 font-semibold">Created</th>
            <th className="px-3 py-2 font-semibold">Last Used</th>
            <th className="px-3 py-2 font-semibold">Status</th>
            <th className="px-3 py-2 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {[0, 1, 2].map((i) => (
            <tr key={i} className="border-b border-border-subtle last:border-0">
              <td className="px-3 py-3"><Skeleton className="h-4 w-24" /></td>
              <td className="px-3 py-3"><Skeleton className="h-4 w-32" /></td>
              <td className="px-3 py-3"><Skeleton className="h-4 w-32" /></td>
              <td className="px-3 py-3"><Skeleton className="h-4 w-14" /></td>
              <td className="px-3 py-3 text-right"><Skeleton className="ml-auto h-8 w-20" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
