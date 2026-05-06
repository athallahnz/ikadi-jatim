import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Send,
  Loader2,
  ShieldCheck,
  Heart,
  ArrowRight,
  CheckCircle,
  Info,
  ArrowLeft,
  User,
  MapPin,
  MessageSquare,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import Swal from "sweetalert2";
import { supabase } from "@/lib/supabase";

// --- Types & Interfaces ---
export interface ConsultationFormProps {
  onGoToPortal?: () => void;
}

interface Category {
  id: number;
  name: string;
}

type StepType = "form" | "donation" | "qris" | "success";

const PRESET_DONATIONS: number[] = [10000, 25000, 50000, 100000];
const TEMP_STATIC_QRIS =
  "00020101021126570011ID.DANA.WWW011893600915302435873202090243587320303UMI51440014ID.CO.QRIS.WWW0215ID10265155141430303UMI5204737253033605802ID5913AnzArt Studio6013Kab. Ponorogo6105634136304BD34";

const generateDynamicQRIS = (staticData: string, amount: number): string => {
  let qrisData = staticData.substring(0, staticData.length - 4);
  const amountStr = amount.toString();
  const amountTag = `54${amountStr.length.toString().padStart(2, "0")}${amountStr}`;
  if (qrisData.includes("5802ID"))
    qrisData = qrisData.replace("5802ID", amountTag + "5802ID");
  const calcCRC16 = (str: string): string => {
    let crc = 0xffff;
    for (let i = 0; i < str.length; i++) {
      crc ^= str.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if ((crc & 0x8000) !== 0) crc = (crc << 1) ^ 0x1021;
        else crc = crc << 1;
      }
    }
    return (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0");
  };
  return qrisData + calcCRC16(qrisData);
};

const ConsultationForm: React.FC<ConsultationFormProps> = ({
  onGoToPortal,
}) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<StepType>("form");
  const [isSending, setIsSending] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    contact_info: "",
    city: "",
    subject: "",
    category_id: "",
    message: "",
  });
  const [donationAmount, setDonationAmount] = useState<number>(0);
  const [customDonation, setCustomDonation] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const { data, error } = await supabase
          .from("consultation_categories")
          .select("id, name")
          .order("id", { ascending: true });
        if (error) throw error;
        if (data) setCategories(data as Category[]);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmitForm = async () => {
    if (!formData.message.trim() || !formData.contact_info.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Data Tidak Lengkap",
        text: "Nomor WhatsApp dan Pesan wajib diisi.",
        confirmButtonColor: "#059669",
      });
      return;
    }
    setIsSending(true);
    try {
      const { error } = await supabase.from("inbox_consultations").insert([
        {
          name: formData.name || "Hamba Allah",
          contact_info: formData.contact_info,
          city: formData.city,
          subject: formData.subject || "Konsultasi Umum",
          message: formData.message,
          category_id: formData.category_id
            ? parseInt(formData.category_id, 10)
            : null,
          status: "pending",
        },
      ]);
      if (error) throw error;
      setStep("donation");
    } catch (err) {
      Swal.fire({
        title: "Gagal",
        text: "Terjadi kendala saat mengirim.",
        icon: "error",
        confirmButtonColor: "#059669",
      });
    } finally {
      setIsSending(false);
    }
  };

  const steps = ["form", "donation", "success"];
  const currentIdx = step === "qris" ? 1 : steps.indexOf(step);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-emerald-950 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-900 shadow-2xl shadow-emerald-900/10 transition-all duration-500 overflow-hidden">
        <div className="p-6 md:p-12">
          {/* 2. Dot Stepper (No Labels) */}
          <div className="flex items-center justify-center gap-3 mb-12">
            {[0, 1, 2].map((i) => {
              const isActive = i === currentIdx;
              const isDone = i < currentIdx;
              return (
                <div
                  key={i}
                  className={`relative transition-all duration-500 ease-out rounded-full ${
                    isActive
                      ? "w-10 h-2.5 bg-emerald-600 shadow-[0_0_15px_rgba(5,150,105,0.3)]"
                      : isDone
                        ? "w-2.5 h-2.5 bg-emerald-400"
                        : "w-2.5 h-2.5 bg-emerald-200 dark:bg-emerald-900" // Kontras dinaikkan
                  }`}
                >
                  {isActive && (
                    <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-20" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="relative min-h-[400px]">
            {/* STEP: FORM */}
            {step === "form" && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-black text-emerald-950 dark:text-white mb-2 tracking-tight">
                    Form Konsultasi
                  </h2>
                  {/* Deskripsi: emerald-800/50 -> emerald-800 */}
                  <p className="text-emerald-800 dark:text-emerald-400/60 text-sm font-bold">
                    Lengkapi data di bawah untuk terhubung dengan asatidz kami.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Identitas Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-white mb-2">
                      <User size={18} strokeWidth={3} />
                      <h4 className="text-[14px] font-black">
                        Data Personal
                      </h4>
                    </div>

                    <div className="space-y-4">
                      <div className="group space-y-1">
                        {/* Label: emerald-800/40 -> emerald-900 */}
                        <label className="text-[10px] font-black text-emerald-950 dark:text-white uppercase ml-1 transition-colors group-focus-within:text-emerald-600">
                          Nama Lengkap / Samaran
                        </label>
                        <input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Masukkan nama lengkap atau samaran..."
                          className="w-full bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50 rounded-xl px-4 py-3.5 text-sm font-medium text-emerald-950 dark:text-white placeholder:text-foreground focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                        />
                      </div>

                      <div className="group space-y-1">
                        <label className="text-[10px] font-black text-emerald-950 dark:text-white uppercase ml-1 transition-colors group-focus-within:text-emerald-600">
                          Nomor WhatsApp (Wajib)
                        </label>
                        <input
                          name="contact_info"
                          value={formData.contact_info}
                          onChange={handleInputChange}
                          placeholder="0812...."
                          className="w-full bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50 rounded-xl px-4 py-3.5 text-sm font-bold text-emerald-950 dark:text-white placeholder:text-foreground focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all border-l-4 border-l-emerald-600"
                        />
                      </div>

                      <div className="group space-y-1">
                        <label className="text-[10px] font-black text-emerald-950 dark:text-white uppercase ml-1 transition-colors group-focus-within:text-emerald-600">
                          Kota Domisili
                        </label>
                        <div className="relative">
                          <MapPin
                            size={14}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600"
                          />
                          <input
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder="Masukkan kota domisili Anda..."
                            className="w-full bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50 rounded-xl pl-10 pr-4 py-3.5 text-sm font-medium text-emerald-950 dark:text-white placeholder:text-foreground focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detail Pertanyaan Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-white mb-2">
                      <MessageSquare size={18} strokeWidth={3} />
                      <h4 className="text-[14px] font-black">
                        Detail Masalah
                      </h4>
                    </div>

                    <div className="space-y-4">
                      <div className="group space-y-1">
                        <label className="text-[10px] font-black text-emerald-950 dark:text-white uppercase ml-1 transition-colors group-focus-within:text-emerald-600">
                          Topik Ringkas
                        </label>
                        <input
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          placeholder="Misal: Hukum Waris"
                          className="w-full bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50 rounded-xl px-4 py-3.5 text-sm font-medium text-emerald-950 dark:text-white placeholder:text-foreground focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                        />
                      </div>

                      <div className="group space-y-1">
                        <label className="text-[10px] font-black text-emerald-950 dark:text-white uppercase ml-1 transition-colors group-focus-within:text-emerald-600">
                          Kategori
                        </label>
                        <div className="relative">
                          <Tag
                            size={14}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none"
                          />
                          <select
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleInputChange}
                            className="w-full bg-emerald-50/50 dark:bg-emerald-900 border border-emerald-200 dark:border-emerald-800/50 rounded-xl pl-10 pr-4 py-3.5 text-sm font-bold text-emerald-950 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none appearance-none cursor-pointer transition-all"
                          >
                            <option value="" className="text-emerald-950">
                              {isLoadingCategories
                                ? "Memuat..."
                                : "Pilih Kategori"}
                            </option>
                            {categories.map((cat) => (
                              <option
                                key={cat.id}
                                value={cat.id}
                                className="text-emerald-950"
                              >
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="group space-y-1">
                        <label className="text-[10px] font-black text-emerald-950 dark:text-white uppercase ml-1 transition-colors group-focus-within:text-emerald-600">
                          Isi Pertanyaan
                        </label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Ceritakan detail masalah Anda secara akurat..."
                          className="w-full bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-5 text-sm font-medium text-emerald-950 dark:text-white placeholder:text-foreground min-h-[120px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none transition-all border-l-4 border-l-emerald-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl border border-emerald-200 dark:border-emerald-800/30">
                  <div className="flex items-start gap-3 max-w-sm text-left">
                    <Info
                      className="text-emerald-700 shrink-0 mt-0.5"
                      size={16}
                    />
                    {/* Info Text: emerald-900/60 -> emerald-900 */}
                    <p className="text-[11px] text-emerald-900 dark:text-emerald-400 font-bold leading-relaxed">
                      Privasi Anda terjamin. Nomor WA digunakan sebagai akses
                      masuk portal konsultasi pribadi Anda.
                    </p>
                  </div>

                  <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <Button
                      variant="ghost"
                      onClick={() =>
                        onGoToPortal
                          ? onGoToPortal()
                          : navigate("/konsultasi/portal")
                      }
                      className="h-12 px-6 rounded-xl font-black text-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all w-full md:w-auto"
                    >
                      Cek Status
                    </Button>
                    <Button
                      onClick={handleSubmitForm}
                      disabled={isSending}
                      className="h-12 px-8 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black shadow-lg shadow-emerald-600/20 transition-all active:scale-95 gap-3 w-full md:w-auto"
                    >
                      {isSending ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <Send size={18} strokeWidth={3} />
                      )}
                      Kirim Sekarang
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP: DONATION (Warna Preset dikoordinasikan ke emerald-950) */}
            {step === "donation" && (
              <div className="animate-in fade-in zoom-in-95 duration-500 text-center space-y-8 max-w-lg mx-auto py-8">
                <div className="space-y-4">
                  <div className="inline-flex p-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 rounded-full animate-bounce">
                    <Heart size={32} fill="currentColor" />
                  </div>
                  <h3 className="text-3xl font-black text-emerald-950 dark:text-white tracking-tight leading-none">
                    Dukung Dakwah Kami
                  </h3>
                  <p className="text-emerald-900 dark:text-emerald-400 text-sm leading-relaxed font-bold">
                    Infaq Anda membantu keberlangsungan operasional asatidz dan
                    sistem informasi dakwah gratis ini agar tetap eksis.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {PRESET_DONATIONS.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => {
                        setDonationAmount(amount);
                        setCustomDonation("");
                      }}
                      className={`group relative py-4 rounded-2xl border-2 font-black text-sm transition-all overflow-hidden ${donationAmount === amount ? "border-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-900 shadow-md scale-105" : "border-emerald-200 dark:border-emerald-900/50 hover:border-emerald-400 text-emerald-900/60"}`}
                    >
                      Rp {amount.toLocaleString("id-ID")}
                      {donationAmount === amount && (
                        <CheckCircle
                          size={14}
                          className="absolute top-2 right-2 text-emerald-700"
                        />
                      )}
                    </button>
                  ))}
                </div>

                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-emerald-950 group-focus-within:text-emerald-700 transition-colors">
                    Rp
                  </div>
                  <input
                    type="number"
                    value={customDonation}
                    onChange={(e) => {
                      setCustomDonation(e.target.value);
                      setDonationAmount(Number(e.target.value));
                    }}
                    placeholder="Nominal Infaq Lainnya..."
                    className="w-full bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl pl-12 pr-6 py-4 text-center font-black text-emerald-950 dark:text-white focus:border-emerald-700 outline-none transition-all no-spinner placeholder:text-emerald-900/20"
                  />
                </div>

                <div className="flex flex-col gap-4 pt-4">
                  <Button
                    onClick={() => setStep("qris")}
                    disabled={donationAmount < 1000}
                    className="h-14 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-600/20 gap-3 transition-all active:scale-95"
                  >
                    Konfirmasi Infaq <ArrowRight size={20} strokeWidth={3} />
                  </Button>
                  <button
                    onClick={() => setStep("success")}
                    className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-950/40 hover:text-emerald-700 transition-colors"
                  >
                    Lewati & Selesai
                  </button>
                </div>
              </div>
            )}

            {/* STEP: QRIS (Text total dipertegas) */}
            {step === "qris" && (
              <div className="animate-in slide-in-from-right-8 duration-500 text-center space-y-8 py-8 max-w-sm mx-auto">
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-emerald-950 dark:text-white tracking-tight">
                    Scan Pembayaran
                  </h3>
                  <div className="inline-block px-5 py-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <span className="text-emerald-950 dark:text-emerald-400 font-black text-sm">
                      Total: Rp {donationAmount.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {/* QR Container */}
                <div className="relative group p-8 bg-white rounded-[0.5rem] border-2 border-dashed border-emerald-300 shadow-2xl shadow-emerald-900/10 transition-transform hover:scale-105">
                  <div className="relative z-10 w-full aspect-square flex items-center justify-center overflow-hidden rounded">
                    <QRCodeSVG
                      value={generateDynamicQRIS(
                        TEMP_STATIC_QRIS,
                        donationAmount,
                      )}
                      size={256}
                      level="H"
                      includeMargin={false}
                      className="w-full h-full"
                    />
                  </div>
                  {/* Decorative Borders dipertegas */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 border-t-4 border-l-4 border-emerald-700 rounded-tl-2xl" />
                  <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-4 border-r-4 border-emerald-700 rounded-br-2xl" />
                  <div className="absolute -top-4 -right-4 w-12 h-12 border-t-4 border-r-4 border-emerald-700 rounded-tr-2xl" />
                  <div className="absolute -bottom-4 -left-4 w-12 h-12 border-b-4 border-l-4 border-emerald-700 rounded-bl-2xl" />
                </div>

                <div className="space-y-6">
                  {/* Caption dipertegas */}
                  <p className="text-[11px] text-emerald-950 dark:text-emerald-400/50 px-6 font-black italic leading-relaxed uppercase tracking-wider">
                    Sistem otomatis menghasilkan QR khusus sesuai nominal
                    pilihan Anda. Pastikan nama "Ikadi Jawa Timur" tertera saat
                    scan.
                  </p>
                  <div className="space-y-3">
                    <Button
                      onClick={() => setStep("success")}
                      className="w-full h-14 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-black shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                    >
                      Saya Sudah Bayar
                    </Button>
                    <button
                      onClick={() => setStep("donation")}
                      className="flex items-center gap-2 mx-auto text-[11px] font-black uppercase text-emerald-950/40 hover:text-emerald-700 transition-colors tracking-[0.3em]"
                    >
                      <ArrowLeft size={14} strokeWidth={3} /> Kembali
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP: SUCCESS */}
            {step === "success" && (
              <div className="animate-in zoom-in-95 duration-700 text-center space-y-10 py-16 max-w-md mx-auto">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" />
                  <div className="relative w-24 h-24 bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-600/40">
                    <CheckCircle size={48} strokeWidth={3} />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-4xl font-black text-emerald-950 dark:text-white tracking-tighter leading-none">
                    Jazakumullah Khair!
                  </h3>
                  <p className="text-emerald-900 dark:text-emerald-400 text-sm leading-relaxed px-6 font-bold italic">
                    Pertanyaan Anda telah kami terima. Dewan asatidz akan segera
                    meninjau dan menjawab. Pantau portal pribadi untuk melihat
                    jawaban.
                  </p>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={() =>
                      onGoToPortal
                        ? onGoToPortal()
                        : navigate("/konsultasi/portal")
                    }
                    className="w-full h-16 bg-emerald-950 dark:bg-white dark:text-emerald-950 text-white rounded-2xl font-black text-lg shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Masuk Ruang Konsultasi
                  </Button>
                  <p className="text-[11px] uppercase font-black tracking-[0.3em] text-emerald-950">
                    ID Akses: {formData.contact_info || "Nomor WA Anda"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info (Contrast Upgrade) */}
        {step === "form" && (
          <div className="bg-emerald-100/50 dark:bg-emerald-900/30 py-6 border-t border-emerald-200 dark:border-emerald-800/50">
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-5 text-emerald-950 dark:text-emerald-500/30">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-700" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  End-to-End Encryption
                </span>
              </div>

              <div className="hidden md:block h-1 w-1 bg-emerald-300 dark:bg-emerald-800 rounded-full" />

              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-center">
                Syariah Compliant Service
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationForm;
