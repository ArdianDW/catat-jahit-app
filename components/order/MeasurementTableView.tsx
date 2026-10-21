import { Ruler } from "lucide-react";

interface MeasurementData {
  lingkar_dada?: number | null;
  lingkar_pinggang?: number | null;
  lingkar_pinggul?: number | null;
  panjang_bahu?: number | null;
  panjang_lengan?: number | null;
  panjang_baju?: number | null;
  panjang_celana?: number | null;
  catatan_ukuran?: string | null;
}

interface MeasurementTableViewProps {
  data: MeasurementData;
  title?: string;
  emptyMessage?: string;
}

const MEASURE_ROWS: { key: keyof Omit<MeasurementData, "catatan_ukuran">; label: string }[] = [
  { key: "lingkar_dada", label: "Lingkar Dada" },
  { key: "lingkar_pinggang", label: "Lingkar Pinggang" },
  { key: "lingkar_pinggul", label: "Lingkar Pinggul" },
  { key: "panjang_bahu", label: "Panjang Bahu" },
  { key: "panjang_lengan", label: "Panjang Lengan" },
  { key: "panjang_baju", label: "Panjang Baju" },
  { key: "panjang_celana", label: "Panjang Celana/Rok" },
];

export default function MeasurementTableView({
  data,
  title = "Ukuran Badan",
  emptyMessage = "Belum ada ukuran yang dicatat",
}: MeasurementTableViewProps) {
  const filledRows = MEASURE_ROWS.filter(({ key }) => {
    const val = data[key];
    return val !== null && val !== undefined && val > 0;
  });

  const isEmpty = filledRows.length === 0;

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center gap-1.5">
        <Ruler className="w-3.5 h-3.5 text-[#6B8F71]" />
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{title}</span>
      </div>

      {isEmpty ? (
        <p className="text-sm text-gray-400 italic py-2">{emptyMessage}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {filledRows.map(({ key, label }) => {
              const val = data[key];
              return (
                <div key={key} className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-gray-400 font-medium">{label}</span>
                  <span className="text-sm font-bold text-gray-800">
                    {val} <span className="text-xs font-normal text-gray-500">cm</span>
                  </span>
                </div>
              );
            })}
          </div>

          {data.catatan_ukuran && (
            <div className="mt-1 p-2.5 rounded-lg bg-amber-50 border border-amber-100">
              <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wide mb-0.5">
                Catatan
              </p>
              <p className="text-xs text-amber-800 leading-relaxed">{data.catatan_ukuran}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
