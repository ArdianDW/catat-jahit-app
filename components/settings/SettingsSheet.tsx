"use client";

import { useState, useEffect, useTransition } from "react";
import { X, Clock, Calendar, Check, Loader2, LogOut } from "lucide-react";
import {
  getNotificationSettings,
  saveNotificationSettings,
} from "@/lib/actions/settings";
import Toast from "@/components/ui/Toast";

interface SettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onLogoutClick: () => void;
}

const PRESET_HOURS = [
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "13:00",
  "16:00",
  "19:00",
];

const PRESET_DAYS = [1, 2, 3, 4, 5, 7];

export default function SettingsSheet({
  isOpen,
  onClose,
  onLogoutClick,
}: SettingsSheetProps) {
  const [deadlineDays, setDeadlineDays] = useState<number>(3);
  const [notifTime, setNotifTime] = useState<string>("08:00");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    setIsLoadingSettings(true);
    getNotificationSettings()
      .then((res) => {
        if (!mounted || !res.data) return;
        setDeadlineDays(res.data.deadline_days);
        setNotifTime(res.data.notif_time);
      })
      .finally(() => {
        if (mounted) setIsLoadingSettings(false);
      });

    return () => {
      mounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setErrorMessage(null);
    startTransition(async () => {
      const res = await saveNotificationSettings({
        deadline_days: deadlineDays,
        notif_time: notifTime,
        is_active: true,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Gagal menyimpan pengaturan");
        return;
      }

      setToastMessage("Pengaturan berhasil disimpan");
      setTimeout(() => {
        onClose();
      }, 1000);
    });
  };

  return (
    <>
      {toastMessage && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage(null)}
          duration={3000}
        />
      )}

      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
          onClick={() => !isPending && onClose()}
        />

        <div className="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 max-h-[90dvh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-200">
          <div className="p-4 pb-2 border-b border-gray-100 flex items-center justify-between">
            <div className="flex flex-col">
              <h3 className="text-lg font-bold text-gray-800">Pengaturan</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              aria-label="Tutup"
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto p-4 flex flex-col gap-5">
            {isLoadingSettings ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin text-[#6B8F71]" />
                <span className="text-xs">Memuat pengaturan...</span>
              </div>
            ) : (
              <>
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                    {errorMessage}
                  </div>
                )}

                <section className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#6B8F71]" />
                    <label className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Waktu Pengingat Sebelum Deadline
                    </label>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_DAYS.map((days) => {
                      const isSelected = deadlineDays === days;
                      return (
                        <button
                          key={days}
                          type="button"
                          onClick={() => setDeadlineDays(days)}
                          className={`min-h-[44px] py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer select-none active:scale-95 border flex items-center justify-center gap-1.5 ${isSelected
                            ? "bg-[#6B8F71] text-white border-[#6B8F71] shadow-xs"
                            : "bg-[#FAF6EE] text-gray-700 border-gray-200 hover:bg-gray-100"
                            }`}
                        >
                          <span>H-{days}</span>

                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#6B8F71]" />
                    <label className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Jam Pengiriman Notifikasi (WIB)
                    </label>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_HOURS.map((hour) => {
                      const isSelected = notifTime === hour;
                      return (
                        <button
                          key={hour}
                          type="button"
                          onClick={() => setNotifTime(hour)}
                          className={`min-h-[44px] py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none active:scale-95 border flex items-center justify-center ${isSelected
                              ? "bg-[#6B8F71] text-white border-[#6B8F71] shadow-xs"
                              : "bg-[#FAF6EE] text-gray-700 border-gray-200 hover:bg-gray-100"
                            }`}
                        >
                          {hour}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-col gap-1.5 pt-1">
                    <label className="text-xs font-semibold text-gray-600">
                      Atur Jam Kustom:
                    </label>
                    <div className="relative flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                      <input
                        type="time"
                        value={notifTime}
                        onChange={(e) => setNotifTime(e.target.value)}
                        className="w-full min-h-[46px] pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-[#FAF6EE] text-sm font-bold text-gray-800 focus:outline-none focus:border-[#6B8F71] focus:ring-1 focus:ring-[#6B8F71]/30 transition-all cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF6EE] border border-gray-200 text-xs text-gray-600 leading-relaxed">
                    Notifikasi akan otomatis dikirimkan pada{" "}
                    <span className="font-bold text-gray-800">
                      H-{deadlineDays}
                    </span>{" "}
                    pukul{" "}
                    <span className="font-bold text-gray-800">
                      {notifTime} WIB
                    </span>
                    .
                  </div>
                </section>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleSave}
                  className="w-full min-h-[46px] rounded-xl bg-[#6B8F71] hover:bg-[#5a7b5f] text-white font-bold text-sm shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer select-none disabled:opacity-60"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Menyimpan Pengaturan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Simpan Pengaturan</span>
                    </>
                  )}
                </button>

                <div className="border-t border-gray-200 pt-3 flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Sesi Akun
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onLogoutClick();
                    }}
                    className="w-full min-h-[46px] rounded-xl bg-[#BA1A1A] hover:bg-[#9c1515] text-white font-bold text-sm shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
                  >
                    <LogOut className="w-4 h-4 text-white" />
                    <span>Keluar dari Akun</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

