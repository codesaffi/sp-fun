export function ButtonLoader({ label = "Loading..." }) {
  return (
    <span className="inline-flex items-center justify-center gap-2 cursor-wait">
      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      <span>{label}</span>
    </span>
  );
}

export function CardSkeleton({ rows = 3 }) {
  return (
    <article className="animate-pulse rounded-[22px] border border-white/10 bg-[#16131b] p-5">
      <div className="mb-4 h-12 w-12 rounded-2xl bg-white/10" />
      <div className="mb-3 h-4 w-3/4 rounded-full bg-white/10" />
      {Array.from({ length: rows }).map((_, index) => (
        <div
          className="mb-2 h-3 rounded-full bg-white/5"
          key={index}
          style={{ width: `${88 - index * 14}%` }}
        />
      ))}
    </article>
  );
}

export function GridSkeleton({ count = 6 }) {
  return (
    <div className="music-grid">
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}

export function PostSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <article
          key={index}
          className="animate-pulse rounded-[22px] border border-white/10 bg-[#16131b] p-5 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/10 shrink-0" />
            <div className="space-y-2 flex-1 min-w-0">
              <div className="h-4 w-1/3 rounded-full bg-white/10" />
              <div className="h-3 w-1/4 rounded-full bg-white/5" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full rounded-full bg-white/10" />
            <div className="h-4 w-4/5 rounded-full bg-white/5" />
          </div>
          <div className="h-28 rounded-xl bg-white/5 w-full" />
          <div className="flex justify-between items-center pt-2">
            <div className="h-8 w-20 rounded-full bg-white/10" />
            <div className="h-8 w-20 rounded-full bg-white/10" />
          </div>
        </article>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-48 rounded-2xl bg-white/10 w-full relative" />
      <div className="flex items-end gap-4 -mt-12 px-6">
        <div className="h-24 w-24 rounded-full bg-white/20 border-4 border-[#0e0c12]" />
        <div className="space-y-2 pb-2 flex-1">
          <div className="h-6 w-48 rounded-full bg-white/10" />
          <div className="h-4 w-32 rounded-full bg-white/5" />
        </div>
      </div>
      <div className="flex gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-24 rounded-full bg-white/10 shrink-0" />
        ))}
      </div>
      <GridSkeleton count={4} />
    </div>
  );
}

export function CommunitySkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-[22px] border border-white/10 bg-[#16131b] p-5 space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-white/10 shrink-0" />
            <div className="space-y-2 min-w-0 flex-1">
              <div className="h-4 w-3/4 rounded-full bg-white/10" />
              <div className="h-3 w-1/2 rounded-full bg-white/5" />
            </div>
          </div>
          <div className="h-3 w-full rounded-full bg-white/5" />
          <div className="h-3 w-4/5 rounded-full bg-white/5" />
          <div className="flex justify-between items-center pt-2">
            <div className="h-3 w-20 rounded-full bg-white/5" />
            <div className="h-8 w-24 rounded-full bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SearchSkeleton({ count = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-[#16131b]"
        >
          <div className="h-12 w-12 rounded-lg bg-white/10 shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <div className="h-4 w-1/2 rounded-full bg-white/10" />
            <div className="h-3 w-1/3 rounded-full bg-white/5" />
          </div>
          <div className="h-8 w-16 rounded-full bg-white/10 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-[#16131b] p-4 space-y-2">
            <div className="h-3 w-16 rounded-full bg-white/10" />
            <div className="h-6 w-24 rounded-full bg-white/20" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-white/10 bg-[#16131b] p-5 space-y-3">
        <div className="h-5 w-40 rounded-full bg-white/10" />
        <div className="h-32 w-full rounded-xl bg-white/5" />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <main className="dashboard-main">
      <section className="dash-header compact animate-pulse">
        <div className="mb-3 h-3 w-32 rounded-full bg-white/10" />
        <div className="mb-3 h-8 w-72 max-w-full rounded-full bg-white/10" />
        <div className="h-4 w-96 max-w-full rounded-full bg-white/5" />
      </section>
      <GridSkeleton />
    </main>
  );
}

export function ListSkeleton({ count = 5 }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          className="flex animate-pulse gap-3 rounded-[22px] border border-white/10 bg-[#16131b] p-4"
          key={index}
        >
          <div className="h-16 w-16 shrink-0 rounded-xl bg-white/10" />
          <div className="min-w-0 flex-1 pt-1">
            <div className="mb-3 h-4 w-2/3 rounded-full bg-white/10" />
            <div className="mb-2 h-3 w-1/2 rounded-full bg-white/5" />
            <div className="h-3 w-1/3 rounded-full bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
