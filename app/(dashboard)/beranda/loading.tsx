export default function BerandaLoading() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 space-y-2">
            <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
            <div className="h-7 bg-gray-100 rounded-lg animate-pulse w-1/2" />
          </div>
        ))}
      </div>

      <div className="h-5 bg-gray-100 rounded animate-pulse w-40" />

      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-100 rounded-lg animate-pulse w-2/3" />
                <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-1/2" />
              </div>
              <div className="h-6 w-16 bg-gray-100 rounded-full animate-pulse" />
            </div>
            <div className="h-px bg-gray-100" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}
