export default function DetailOrderLoading() {
  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div className="h-8 w-28 bg-gray-100 rounded-full animate-pulse" />
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-3">
        <div className="h-4 bg-gray-100 rounded animate-pulse w-1/3" />
        <div className="h-px bg-gray-100" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex justify-between gap-4">
            <div className="h-3 bg-gray-100 rounded animate-pulse w-24" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-32" />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-3">
        <div className="h-4 bg-gray-100 rounded animate-pulse w-1/4" />
        <div className="h-px bg-gray-100" />
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-2 py-2">
            <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-1/4" />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="h-12 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="h-12 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    </div>
  );
}
