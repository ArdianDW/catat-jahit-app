export default function OrderLoading() {
  return (
    <div className="space-y-3">
      <div className="h-11 bg-white rounded-xl animate-pulse border border-gray-100" />

      <div className="flex gap-2 overflow-hidden">
        {[80, 64, 72, 56].map((w, i) => (
          <div
            key={i}
            className="h-8 bg-white rounded-full animate-pulse shrink-0 border border-gray-100"
            style={{ width: w }}
          />
        ))}
      </div>

      <div className="space-y-3 pt-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-4 border border-gray-100 space-y-3"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-100 rounded-lg animate-pulse w-2/3" />
                <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-1/2" />
              </div>
              <div className="h-6 w-16 bg-gray-100 rounded-full animate-pulse" />
            </div>
            <div className="h-px bg-gray-100" />
            <div className="flex gap-2">
              <div className="h-3 bg-gray-100 rounded animate-pulse w-24" />
              <div className="h-3 bg-gray-100 rounded animate-pulse w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
