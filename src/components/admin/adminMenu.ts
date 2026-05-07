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

export type AdminScope = "jatim" | string;

export interface AdminMenuItem {
  isLabel?: boolean; // Penanda bahwa item ini adalah teks pembatas divisi
  to?: string;
  label: string;
  icon?: LucideIcon; // Dibuat opsional untuk mendukung isLabel
  scopes?: AdminScope[];
  children?: AdminMenuItem[];
}

export const adminMenu: AdminMenuItem[] = [
  {
    isLabel: true,
    label: "Menu Utama",
  },
  {
    to: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/admin/articles",
    label: "Kajian & Artikel",
    icon: Newspaper,
  },
  {
    to: "/admin/events",
    label: "Agenda / Event",
    icon: CalendarDays,
  },
  {
    to: "/admin/gallery",
    label: "Galeri",
    icon: Image,
  },
  {
    to: "/admin/programs",
    label: "Program",
    icon: Layers,
    scopes: ["jatim"],
  },
  {
    to: "/admin/runningtexts",
    label: "Running Text",
    icon: FileText,
    scopes: ["jatim"],
  },
  {
    to: "/admin/invitations",
    label: "Undangan",
    icon: Mail,
    scopes: ["jatim"],
  },

  // --- PEMBATAS MENU KONSULTASI ---
  {
    isLabel: true,
    label: "Ruang Konsultasi",
    scopes: ["jatim"], // Akan disembunyikan jika user bukan jatim
  },
  {
    to: "/admin/consultations",
    label: "Dashboard Konsultasi",
    icon: MessageSquareText,
    scopes: ["jatim"],
  },
  {
    to: "/admin/jawab-konsultasi",
    label: "Jawab Konsultasi",
    icon: HelpCircle,
    scopes: ["jatim"],
  },

  // --- PEMBATAS SISTEM (Opsional, agar rapi) ---
  {
    isLabel: true,
    label: "Sistem",
  },
  {
    label: "Settings",
    icon: Settings,
    children: [
      {
        to: "/admin/settings/profile",
        label: "My Profile",
        icon: User,
      },
      {
        to: "/admin/settings/users",
        label: "Manage Users",
        icon: Users,
        scopes: ["jatim"],
      },
      {
        to: "/admin/settings",
        label: "General",
        icon: Settings,
        scopes: ["jatim"],
      },
    ],
  },
];
