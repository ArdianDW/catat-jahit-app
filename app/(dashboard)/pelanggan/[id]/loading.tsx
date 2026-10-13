export default function ProfilPelangganLoading() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-3 pt-2">
        <div className="w-20 h-20 rounded-full bg-gray-100 animate-pulse" />
        <div className="h-5 bg-gray-100 rounded-lg animate-pulse w-40" />
        <div className="h-3 bg-gray-100 rounded animate-pulse w-28" />
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-3">
        <div className="h-4 bg-gray-100 rounded animate-pulse w-1/3" />
        <div className="h-px bg-gray-100" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex justify-between gap-4">
            <div className="h-3 bg-gray-100 rounded animate-pulse w-20" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-36" />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-3">
        <div className="h-4 bg-gray-100 rounded animate-pulse w-1/3" />
        <div className="h-px bg-gray-100" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 bg-gray-100 rounded animate-pulse w-full" />
              <div className="h-5 bg-gray-100 rounded animate-pulse w-2/3" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="h-12 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="h-12 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    </div>
  );
}
