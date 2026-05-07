import {
  CalendarDays,
  FileText, // Tambahan Icon
  HelpCircle, // Tambahan Icon
  Image,
  Layers,
  LayoutDashboard,
  Mail, // Tambahan Icon
  MessageSquareText,
  Newspaper,
  Settings,
  User,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AdminScope = "jatim" | string;

export interface AdminMenuItem {
  to?: string;
  label: string;
  icon: LucideIcon;
  scopes?: AdminScope[];
  children?: AdminMenuItem[];
}

export const adminMenu: AdminMenuItem[] = [
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
    icon: FileText, // Ikon diperbarui
    scopes: ["jatim"],
  },
  {
    to: "/admin/invitations",
    label: "Undangan",
    icon: Mail, // Ikon diperbarui agar tidak sama dengan Programs
    scopes: ["jatim"],
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
    icon: HelpCircle, // Ikon diperbarui agar tidak sama dengan Dashboard Konsultasi
    scopes: ["jatim"],
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
