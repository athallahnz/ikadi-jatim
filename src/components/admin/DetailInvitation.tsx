import { Invitation } from "@/pages/admin/InvitationsDataTable";

type Props = {
  data: Invitation | null;
  onClose: () => void;
};

export default function DetailInvitation({ data, onClose }: Props) {
  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b">
          <h3 className="font-bold text-lg text-foreground">
            {data.type === "anggota"
              ? "Detail Pendaftaran Anggota"
              : "Detail Permintaan Da'i"}
          </h3>
        </div>
        <div className="p-6 space-y-4 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">Nama</div>
            <div className="font-medium">{data.name}</div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">WhatsApp</div>
            <div>{data.phone}</div>
          </div>

          {data.email && (
            <div>
              <div className="text-xs text-muted-foreground">Email</div>
              <div>{data.email}</div>
            </div>
          )}

          <div>
            <div className="text-xs text-muted-foreground">Tipe</div>
            <div>
              {data.type === "anggota" ? "Daftar Anggota" : "Undang Da'i"}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">Pesan</div>
            <div className="whitespace-pre-line">{data.message || "-"}</div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">Tanggal</div>
            <div>
              {new Date(data.created_at).toLocaleString("id-ID", {
                timeZone: "Asia/Jakarta",
              })}
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-muted text-sm"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
