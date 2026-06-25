export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#f8f4ed]">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid lg:grid-cols-[260px_1fr]">
          {/* Sidebar skeleton */}
          <aside className="border-r border-[#c7c1b8] px-7 py-10">
            <div className="flex flex-col items-center">
              <div className="h-24 w-24 animate-pulse rounded-full bg-slate-200" />
              <div className="mt-4 h-5 w-20 animate-pulse rounded-full bg-slate-200" />
              <div className="mt-2 h-3 w-32 animate-pulse rounded-full bg-slate-100" />
              <div className="mt-5 h-10 w-full animate-pulse rounded-xl bg-slate-200" />
            </div>
            <div className="my-6 h-px bg-slate-100" />
            <div className="space-y-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-11 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          </aside>

          {/* Main skeleton */}
          <main className="p-10">
            <div className="h-12 w-56 animate-pulse bg-[#ddd7ce]" />
            <div className="mt-10 border-t border-[#c7c1b8] pt-8">
              <div className="h-6 w-28 animate-pulse rounded-full bg-slate-200" />
              <div className="mt-2 h-4 w-64 animate-pulse rounded-full bg-slate-100" />
              <div className="mt-8 space-y-4">
                <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
