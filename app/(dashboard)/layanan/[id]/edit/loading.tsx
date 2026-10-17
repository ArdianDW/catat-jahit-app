export default function EditLayananLoading() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 bg-gray-200/70 rounded animate-pulse" />
            <div className="h-3 w-10 bg-red-100 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="h-20 bg-[#EDF4FF] rounded-xl animate-pulse" />
            <div className="h-20 bg-[#EDF4FF] rounded-xl animate-pulse" />
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 bg-gray-200/70 rounded animate-pulse" />
            <div className="h-3 w-10 bg-red-100 rounded animate-pulse" />
          </div>
          <div className="h-11 bg-[#EDF4FF] rounded-xl animate-pulse" />
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 bg-gray-200/70 rounded animate-pulse" />
            <div className="h-3 w-10 bg-red-100 rounded animate-pulse" />
          </div>
          <div className="h-11 bg-[#EDF4FF] rounded-xl animate-pulse" />
          <div className="h-3 w-48 bg-gray-200/50 rounded animate-pulse pt-0.5" />
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 bg-gray-200/70 rounded animate-pulse" />
            <div className="h-3 w-14 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="h-20 bg-[#EDF4FF] rounded-xl animate-pulse" />
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="h-4 w-28 bg-gray-200/70 rounded animate-pulse" />
          <div className="grid grid-cols-2 gap-2.5">
            <div className="h-10 bg-[#EDF4FF] rounded-xl animate-pulse" />
            <div className="h-10 bg-[#EDF4FF] rounded-xl animate-pulse" />
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <div className="h-12 bg-[#6B8F71]/30 rounded-xl animate-pulse" />
        <div className="h-12 bg-[#D8E4F3]/50 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}
