export default function LayananLoading() {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="h-6 w-36 bg-gray-200/70 rounded-lg animate-pulse" />
        <div className="h-4 w-48 bg-gray-200/50 rounded animate-pulse" />
        <div className="h-11 bg-white rounded-xl animate-pulse border border-gray-100" />
        <div className="flex gap-2 pt-1">
          <div className="h-9 w-20 bg-gray-200/70 rounded-full animate-pulse" />
          <div className="h-9 w-24 bg-gray-200/50 rounded-full animate-pulse" />
          <div className="h-9 w-24 bg-gray-200/50 rounded-full animate-pulse" />
        </div>
      </div>

      <div className="space-y-3 pt-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-4 border border-gray-100 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-5 w-20 bg-gray-200/70 rounded-full animate-pulse" />
              <div className="h-4 w-16 bg-gray-200/50 rounded animate-pulse" />
            </div>
            <div className="h-5 w-44 bg-gray-200/80 rounded animate-pulse" />
            <div className="h-4 w-32 bg-gray-200/60 rounded animate-pulse" />
            <div className="h-3 w-56 bg-gray-200/40 rounded animate-pulse" />
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-50">
              <div className="h-8 w-16 bg-gray-200/50 rounded-lg animate-pulse" />
              <div className="h-8 w-24 bg-gray-200/50 rounded-lg animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
