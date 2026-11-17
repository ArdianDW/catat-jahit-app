"use client";

import { useState, useEffect, useTransition } from "react";
import {
  X,
  Clock,
  Calendar,
  Check,
  Loader2,
  LogOut,
  User,
  KeyRound,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import {
  getNotificationSettings,
  saveNotificationSettings,
} from "@/lib/actions/settings";
import {
  getCurrentUser,
  changePassword,
} from "@/lib/actions/auth";
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
  // Notification state
  const [deadlineDays, setDeadlineDays] = useState<number>(3);
  const [notifTime, setNotifTime] = useState<string>("08:00");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);

  // User state (read-only)
  const [currentUsername, setCurrentUsername] = useState<string>("");

  // Password state
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isPendingPassword, startPasswordTransition] = useTransition();

  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    setIsLoadingSettings(true);

    Promise.all([
      getNotificationSettings(),
      getCurrentUser(),
    ])
      .then(([notifRes, userRes]) => {
        if (!mounted) return;
        if (notifRes.data) {
          setDeadlineDays(notifRes.data.deadline_days);
          setNotifTime(notifRes.data.notif_time);
        }
        if (userRes.username) {
          setCurrentUsername(userRes.username);
        }
      })
      .finally(() => {
        if (mounted) setIsLoadingSettings(false);
      });

    return () => {
      mounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveNotif = () => {
    setErrorMessage(null);
    startTransition(async () => {
      const res = await saveNotificationSettings({
        deadline_days: deadlineDays,
        notif_time: notifTime,
        is_active: true,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Gagal menyimpan pengaturan pengingat");
        return;
      }

      setToastMessage("Pengaturan pengingat berhasil disimpan");
    });
  };

  const handleSavePassword = () => {
    setPasswordError(null);
    if (!currentPassword) {
      setPasswordError("Kata sandi lama wajib diisi");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setPasswordError("Kata sandi baru minimal 8 karakter");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi kata sandi baru tidak cocok");
      return;
    }

    startPasswordTransition(async () => {
      const res = await changePassword(currentPassword, newPassword);
      if (!res.success) {
        setPasswordError(res.error || "Gagal memperbarui kata sandi");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsChangingPassword(false);
      setToastMessage("Kata sandi berhasil diperbarui");
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
          onClick={() => !isPending && !isPendingPassword && onClose()}
        />

        <div className="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 max-h-[90dvh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-200">
          <div className="p-4 pb-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex flex-col">
              <h3 className="text-lg font-bold text-gray-800">Pengaturan</h3>
              <p className="text-xs text-gray-500">Kelola akun dan preferensi pengingat</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isPending || isPendingPassword}
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
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* 1. SEKSI INFORMASI AKUN (READ-ONLY) */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF6EE] border border-gray-200">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#6B8F71]" />
                    <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Akun
                    </span>
                  </div>
                  <span className="text-xs font-bold text-gray-800 bg-white px-2.5 py-1 rounded-full border border-gray-200">
                    @{currentUsername || "rusliyati"}
                  </span>
                </div>

                {/* 2. SEKSI KEAMANAN AKUN (UBAH KATA SANDI) */}
                <section className="flex flex-col gap-2.5 p-3.5 rounded-2xl bg-[#FAF6EE] border border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword((prev) => !prev);
                      setPasswordError(null);
                    }}
                    className="w-full flex items-center justify-between text-left cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-[#6B8F71]" />
                      <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                        Keamanan & Kata Sandi
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-[#6B8F71]">
                      <span>{isChangingPassword ? "Tutup" : "Ubah Sandi"}</span>
                      {isChangingPassword ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </button>

                  {isChangingPassword && (
                    <div className="flex flex-col gap-3 pt-2 border-t border-gray-200/80 animate-in fade-in duration-150">
                      {/* Kata Sandi Lama */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-semibold text-gray-600">
                          Kata Sandi Lama *
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => {
                              setCurrentPassword(e.target.value);
                              if (passwordError) setPasswordError(null);
                            }}
                            maxLength={100}
                            placeholder="Masukkan kata sandi saat ini"
                            className="w-full min-h-[42px] px-3 pr-10 rounded-xl border border-gray-300 bg-white text-sm text-gray-800 focus:outline-none focus:border-[#6B8F71] focus:ring-1 focus:ring-[#6B8F71]/30"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword((p) => !p)}
                            className="absolute right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                          >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Kata Sandi Baru */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-semibold text-gray-600">
                          Kata Sandi Baru (Minimal 8 Karakter) *
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => {
                              setNewPassword(e.target.value);
                              if (passwordError) setPasswordError(null);
                            }}
                            maxLength={100}
                            placeholder="Minimal 8 karakter"
                            className="w-full min-h-[42px] px-3 pr-10 rounded-xl border border-gray-300 bg-white text-sm text-gray-800 focus:outline-none focus:border-[#6B8F71] focus:ring-1 focus:ring-[#6B8F71]/30"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword((p) => !p)}
                            className="absolute right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Konfirmasi Kata Sandi Baru */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-semibold text-gray-600">
                          Konfirmasi Kata Sandi Baru *
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              if (passwordError) setPasswordError(null);
                            }}
                            maxLength={100}
                            placeholder="Ulangi kata sandi baru"
                            className="w-full min-h-[42px] px-3 pr-10 rounded-xl border border-gray-300 bg-white text-sm text-gray-800 focus:outline-none focus:border-[#6B8F71] focus:ring-1 focus:ring-[#6B8F71]/30"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword((p) => !p)}
                            className="absolute right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {passwordError && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {passwordError}
                        </p>
                      )}

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsChangingPassword(false);
                            setCurrentPassword("");
                            setNewPassword("");
                            setConfirmPassword("");
                            setPasswordError(null);
                          }}
                          disabled={isPendingPassword}
                          className="flex-1 min-h-[38px] rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleSavePassword}
                          disabled={isPendingPassword}
                          className="flex-1 min-h-[38px] rounded-xl bg-[#6B8F71] hover:bg-[#5a7b5f] text-white text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isPendingPassword ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Menyimpan...</span>
                            </>
                          ) : (
                            <span>Simpan Sandi Baru</span>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </section>

                {/* 3. SEKSI PREFERENSI PENGINGAT DEADLINE */}
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
                          className={`min-h-[44px] py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer select-none active:scale-95 border flex items-center justify-center gap-1.5 ${
                            isSelected
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
                          className={`min-h-[44px] py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none active:scale-95 border flex items-center justify-center ${
                            isSelected
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
                  onClick={handleSaveNotif}
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
                      <span>Simpan Pengaturan Pengingat</span>
                    </>
                  )}
                </button>

                {/* 4. SEKSI KELUAR AKUN */}
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

