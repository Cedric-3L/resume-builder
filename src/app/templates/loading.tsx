export default function TemplatesLoading() {
  return (
    <div className="min-h-screen bg-[#f8f4ed]">
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Filter bar skeleton */}
        <div className="border-y border-[#c7c1b8] px-5 py-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[72px] w-[180px] animate-pulse rounded-[22px] bg-slate-100" />
              ))}
            </div>
            <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-9 w-20 animate-pulse rounded-full bg-slate-100" />
              ))}
            </div>
          </div>
        </div>

        {/* Template grid skeleton */}
        <div className="mt-7 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="aspect-[210/297] w-full animate-pulse bg-[#ddd7ce]" />
              <div className="mt-3 w-[284px] space-y-2 xl:w-[258px]">
                <div className="h-5 w-2/3 animate-pulse rounded-full bg-slate-200" />
                <div className="flex gap-2">
                  <div className="h-6 w-16 animate-pulse rounded-full bg-slate-100" />
                  <div className="h-6 w-14 animate-pulse rounded-full bg-slate-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
