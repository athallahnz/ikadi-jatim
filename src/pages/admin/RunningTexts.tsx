import { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import RunningTextForm from "./RunningTextForm";
import { GripVertical, Edit3, Trash2, Info, Pencil } from "lucide-react";
import Swal from "sweetalert2";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

type RunningText = {
  id: string;
  content: string;
  link: string | null;
  is_published: boolean;
  order_num: number;
};

export default function RunningTexts() {
  const [items, setItems] = useState<RunningText[]>([]);
  const [editing, setEditing] = useState<RunningText | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("running_texts")
      .select("*")
      .order("sort_order");

    if (!error) {
      setItems((data as RunningText[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const reordered = Array.from(items);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    const updated = reordered.map((i, idx) => ({
      ...i,
      order_num: idx + 1,
    }));

    setItems(updated);

    await supabase.from("running_texts").upsert(updated);
  };

  const handleDelete = async (id: string) => {
    const ok = await Swal.fire({
      title: "Hapus Running Text?",
      icon: "warning",
      showCancelButton: true,
    });

    if (!ok.isConfirmed) return;

    await supabase.from("running_texts").delete().eq("id", id);
    fetchItems();
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800 uppercase">
          Running Text Header
        </h1>
        <p className="text-sm text-slate-500">
          Kelola teks berjalan di header website
        </p>
      </div>

      <div className="bg-white border rounded-2xl p-6 mb-8">
        <RunningTextForm
          item={editing}
          onSaved={() => {
            fetchItems();
            setEditing(null);
          }}
        />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-emerald-800">
          <Info size={18} />
          <p className="text-sm font-bold uppercase tracking-wider">
            Daftar Running Text Aktif
          </p>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          Total: {items.length}
        </span>
      </div>

      <div className="bg-white border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-20 text-center animate-pulse text-slate-400">
            Memuat data...
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="runningtexts">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {items.map((i, index) => (
                    <Draggable key={i.id} draggableId={i.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center justify-between p-4 border-b ${
                            snapshot.isDragging ? "bg-emerald-50" : "bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div {...provided.dragHandleProps}>
                              <GripVertical size={18} />
                            </div>

                            <div>
                              <div className="font-semibold">{i.content}</div>
                              {i.link && (
                                <div className="text-xs text-emerald-600">
                                  {i.link}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditing(i);
                                window.scrollTo({
                                  top: 0,
                                  behavior: "smooth",
                                });
                              }}
                              className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(i.id)}
                              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                              title="Hapus"
                            >
                              <Trash2 size={16} />
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
    </AdminLayout>
  );
}
