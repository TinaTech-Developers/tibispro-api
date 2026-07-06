export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="h-8 w-64 rounded bg-slate-800" />

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
          >
            <div className="h-4 w-24 rounded bg-slate-700 mb-4" />
            <div className="h-8 w-20 rounded bg-slate-700 mb-2" />
            <div className="h-3 w-32 rounded bg-slate-800" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="h-5 w-40 rounded bg-slate-700 mb-6" />

          <div className="flex items-end justify-between h-72">
            {[50, 90, 120, 70, 150, 170, 140].map((h, i) => (
              <div
                key={i}
                className="w-8 rounded-t bg-slate-700"
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="h-5 w-32 rounded bg-slate-700 mb-6" />

          <div className="space-y-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i}>
                <div className="mb-2 h-3 w-24 rounded bg-slate-700" />

                <div className="h-3 rounded-full bg-slate-800">
                  <div className="h-full w-1/2 rounded-full bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="border-b border-slate-800 p-5">
          <div className="h-5 w-48 rounded bg-slate-700" />
        </div>

        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="grid grid-cols-4 gap-4 border-b border-slate-800 p-5"
          >
            <div className="h-4 rounded bg-slate-700" />
            <div className="h-4 rounded bg-slate-700" />
            <div className="h-4 rounded bg-slate-700" />
            <div className="h-4 rounded bg-slate-700" />
          </div>
        ))}
      </div>
    </div>
  );
}
