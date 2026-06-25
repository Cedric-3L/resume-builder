export default function EditorLoading() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#eee9e1]">
      {/* Top bar skeleton */}
      <div className="border-b border-slate-200/70 bg-white px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 animate-pulse rounded-[16px] bg-slate-200" />
            <div className="h-5 w-48 animate-pulse rounded-full bg-slate-200" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-24 animate-pulse rounded-full bg-emerald-100" />
            <div className="h-8 w-28 animate-pulse rounded-[16px] bg-slate-200" />
          </div>
        </div>
      </div>

      {/* Main grid skeleton */}
      <div className="flex-1 p-2">
        <div className="grid h-full gap-2 xl:grid-cols-[174px_minmax(0,1.08fr)_minmax(0,1.14fr)]">
          <div className="hidden xl:block">
            <div className="h-full rounded-[26px] border border-slate-200 bg-white p-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="mb-2 h-14 animate-pulse rounded-[18px] bg-slate-100" />
              ))}
            </div>
          </div>
          <div className="space-y-2.5 overflow-hidden rounded-2xl bg-white p-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-[20px] border border-slate-100 p-4">
                <div className="mb-3 h-4 w-24 animate-pulse rounded-full bg-slate-200" />
                <div className="space-y-2">
                  <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
                  <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white" />
        </div>
      </div>
    </div>
  );
}
