import {
  CalendarDays,
  FileText,
  HelpCircle,
  Image,
  Layers,
  LayoutDashboard,
  Mail,
  MessageSquareText,
  Newspaper,
  Settings,
  User,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AdminScope = "jatim" | "daerah";
export type AdminRole = "admin" | "editor" | "konsultan";

export interface AdminMenuItem {
  isLabel?: boolean;
  to?: string;
  label: string;
  icon?: LucideIcon;
  scopes?: AdminScope[];
  roles?: AdminRole[];
  children?: AdminMenuItem[];
}

export const adminMenu: AdminMenuItem[] = [
  {
    isLabel: true,
    label: "Menu Utama",
    roles: ["admin", "editor"], // Sembunyikan label ini dari konsultan
  },
  {
    to: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "editor"],
  },
  {
    to: "/admin/articles",
    label: "Kajian & Artikel",
    icon: Newspaper,
    roles: ["admin", "editor"],
  },
  {
    to: "/admin/events",
    label: "Agenda / Event",
    icon: CalendarDays,
    roles: ["admin", "editor"],
  },
  {
    to: "/admin/gallery",
    label: "Galeri",
    icon: Image,
    roles: ["admin", "editor"],
  },
  {
    to: "/admin/programs",
    label: "Program",
    icon: Layers,
    scopes: ["jatim"],
    roles: ["admin"],
  },
  {
    to: "/admin/runningtexts",
    label: "Running Text",
    icon: FileText,
    scopes: ["jatim"],
    roles: ["admin"],
  },
  {
    to: "/admin/invitations",
    label: "Undangan",
    icon: Mail,
    scopes: ["jatim"],
    roles: ["admin"],
  },

  // --- RUANG KONSULTASI ---
  {
    isLabel: true,
    label: "Ruang Konsultasi",
    scopes: ["jatim"],
    roles: ["admin", "konsultan"], // Hanya Admin & Konsultan yang melihat ini
  },
  {
    to: "/admin/consultations",
    label: "Dashboard Konsultasi",
    icon: MessageSquareText,
    scopes: ["jatim"],
    roles: ["admin", "konsultan"],
  },
  {
    to: "/admin/jawab-konsultasi",
    label: "Jawab Konsultasi",
    icon: HelpCircle,
    scopes: ["jatim"],
    roles: ["admin", "konsultan"],
  },

  // --- SISTEM ---
  {
    isLabel: true,
    label: "Sistem",
    // Tidak diberi roles agar selalu muncul sebagai pembatas untuk My Profile
  },
  {
    to: "/admin/settings/profile",
    label: "My Profile",
    icon: User,
    // Semua role (admin, editor, konsultan) bisa akses profil sendiri
  },
  {
    label: "Settings",
    icon: Settings,
    roles: ["admin"], // Hanya Admin yang bisa melihat dropdown settings sistem
    scopes: ["jatim"],
    children: [
      {
        to: "/admin/settings/users",
        label: "Manage Users",
        icon: Users,
        scopes: ["jatim"],
        roles: ["admin"],
      },
      {
        to: "/admin/settings",
        label: "General",
        icon: Settings,
        scopes: ["jatim"],
        roles: ["admin"],
      },
    ],
  },
];
