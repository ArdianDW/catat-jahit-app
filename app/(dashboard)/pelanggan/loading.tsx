export default function PelangganLoading() {
  return (
    <div className="space-y-3">
      <div className="h-11 bg-white rounded-xl animate-pulse border border-gray-100" />

      <div className="space-y-2.5 pt-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3"
          >
            <div className="w-11 h-11 rounded-full bg-gray-100 animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-100 rounded-lg animate-pulse w-1/2" />
              <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-1/3" />
            </div>
            <div className="w-5 h-5 bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
