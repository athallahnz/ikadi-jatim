import {
  CalendarDays,
  Image,
  Layers,
  LayoutDashboard,
  MessageSquareText,
  Newspaper,
  Settings,
  User,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AdminScope = "jatim" | string;

export type AdminMenuItem = {
  to?: string;
  label: string;
  icon: LucideIcon;
  scopes?: AdminScope[];
  children?: AdminMenuItem[];
};

export const adminMenu: AdminMenuItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },

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

  { to: "/admin/programs", label: "Program", icon: Layers, scopes: ["jatim"] },

  {
    to: "/admin/runningtexts",
    label: "Running Text",
    icon: MessageSquareText,
    scopes: ["jatim"],
  },

  {
    to: "/admin/invitations",
    label: "Undangan",
    icon: Layers,
    scopes: ["jatim"],
  },

  {
    to: "/admin/consultations",
    label: "Konsultasi",
    icon: MessageSquareText,
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
