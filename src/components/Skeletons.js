export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-6 space-y-4">
      <div className="skeleton h-5 w-1/3 rounded-lg" />
      <div className="skeleton h-4 w-full rounded-lg" />
      <div className="skeleton h-4 w-2/3 rounded-lg" />
      <div className="skeleton h-10 w-full rounded-xl mt-4" />
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="bg-white rounded-2xl p-6 space-y-3">
      <div className="skeleton h-8 w-full rounded-lg" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="skeleton h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 space-y-3">
            <div className="skeleton h-4 w-1/2 rounded-lg" />
            <div className="skeleton h-8 w-1/3 rounded-lg" />
          </div>
        ))}
      </div>
      <SkeletonCard />
      <SkeletonTable />
    </div>
  );
}
