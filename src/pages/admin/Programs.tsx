import { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import ProgramForm from "./ProgramForm";
import Swal from "sweetalert2";
import * as LucideIcons from "lucide-react";
import {
  Edit3,
  Trash2,
  GripVertical,
  Info,
  HelpCircle,
  LucideProps,
} from "lucide-react";

// Import Drag and Drop components
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

/* ================= TYPES & STATIC CONFIG ================= */
type Program = {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  order_num: number;
  created_at: string;
};

type LucideIconComponent = React.ForwardRefExoticComponent<
  LucideProps & React.RefAttributes<SVGSVGElement>
>;

const IconsRecord = LucideIcons as unknown as Record<
  string,
  LucideIconComponent
>;

/* ================= SUB-COMPONENT ================= */
const DynamicIcon = ({ name }: { name: string | null }) => {
  if (!name) return <HelpCircle className="text-slate-300" size={24} />;
  const IconComponent = IconsRecord[name];
  if (
    IconComponent &&
    (typeof IconComponent === "function" || typeof IconComponent === "object")
  ) {
    return <IconComponent className="text-emerald-600" size={24} />;
  }
  return <HelpCircle className="text-slate-300" size={24} />;
};

/* ================= MAIN COMPONENT ================= */
export default function Programs() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [editing, setEditing] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("programs")
      .select("*")
      .order("order_num", { ascending: true });

    if (!error) {
      setPrograms((data as Program[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  /* ================= DRAG & DROP LOGIC ================= */
  const onDragEnd = async (result: DropResult) => {
    const { destination, source } = result;

    // Jika dilepas di luar area droppable atau posisi tidak berubah
    if (!destination || destination.index === source.index) return;

    // Reorder array secara lokal agar UI instan
    const reorderedPrograms = Array.from(programs);
    const [removed] = reorderedPrograms.splice(source.index, 1);
    reorderedPrograms.splice(destination.index, 0, removed);

    // Update state lokal
    const updatedWithOrder = reorderedPrograms.map((p, index) => ({
      ...p,
      order_num: index + 1,
    }));
    setPrograms(updatedWithOrder);

    // Update ke Supabase
    try {
      const updates = updatedWithOrder.map((p) => ({
        id: p.id,
        order_num: p.order_num,
        title: p.title, // Sertakan kolom wajib jika perlu
        description: p.description,
        icon: p.icon,
      }));

      // Menggunakan upsert untuk update batch berdasarkan ID
      const { error } = await supabase.from("programs").upsert(updates);

      if (error) throw error;
    } catch (error) {
      console.error("Gagal update urutan:", error);
      Swal.fire("Gagal", "Urutan gagal disimpan ke server", "error");
      fetchPrograms(); // Rollback data dari server
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Hapus Program?",
      text: "Data program yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase.from("programs").delete().eq("id", id);
        if (error) throw error;
        await fetchPrograms();
        Swal.fire({
          icon: "success",
          title: "Terhapus!",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error: unknown) {
        // Ambil pesan error secara aman
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan yang tidak diketahui";

        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: errorMessage,
          confirmButtonColor: "#10b981", // Warna emerald agar serasi dengan tema
        });
      }
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
            Manajemen Program
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola program unggulan. Tarik ikon{" "}
            <GripVertical className="inline h-4 w-4" /> untuk mengurutkan.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8">
          <ProgramForm
            program={editing}
            onSaved={() => {
              fetchPrograms();
              setEditing(null);
            }}
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-emerald-800">
            <Info size={18} />
            <p className="text-sm font-bold uppercase tracking-wider">
              Daftar Program Aktif
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Total: {programs.length}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-20 text-center animate-pulse text-slate-400">
              Memuat data...
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="programs-list">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {programs.map((p, index) => (
                      <Draggable key={p.id} draggableId={p.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`group flex items-center justify-between gap-4 p-5 border-b last:border-0 transition-all ${
                              snapshot.isDragging
                                ? "bg-emerald-50 shadow-md border-emerald-200"
                                : "bg-white hover:bg-slate-50/50"
                            }`}
                          >
                            <div className="flex items-center gap-5">
                              {/* Drag Handle */}
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing"
                              >
                                <GripVertical
                                  className="text-slate-300 group-hover:text-slate-400"
                                  size={20}
                                />
                              </div>

                              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                                <DynamicIcon name={p.icon} />
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                                    No. {p.order_num}
                                  </span>
                                  <h3 className="font-bold text-slate-800 leading-tight">
                                    {p.title}
                                  </h3>
                                </div>
                                <div
                                  className="text-xs text-slate-500 line-clamp-1 max-w-md italic"
                                  dangerouslySetInnerHTML={{
                                    __html: p.description
                                      .substring(0, 120)
                                      .replace(/<[^>]*>/g, ""),
                                  }}
                                />
                              </div>
                            </div>

                            <div className="flex gap-2 shrink-0">
                              <button
                                className="flex items-center gap-1.5 text-xs px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-amber-50 hover:text-amber-700 transition-all font-bold"
                                onClick={() => {
                                  setEditing(p);
                                  window.scrollTo({
                                    top: 0,
                                    behavior: "smooth",
                                  });
                                }}
                              >
                                <Edit3 size={14} /> Edit
                              </button>
                              <button
                                className="flex items-center gap-1.5 text-xs px-4 py-2 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all font-bold"
                                onClick={() => handleDelete(p.id)}
                              >
                                <Trash2 size={14} /> Hapus
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
