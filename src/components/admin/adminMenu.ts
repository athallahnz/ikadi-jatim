import {
  LayoutDashboard,
  Newspaper,
  CalendarDays,
  Image,
  Layers,
  MessageSquareText,
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

  { to: "/admin/articles", label: "Kajian & Artikel", icon: Newspaper },

  { to: "/admin/events", label: "Agenda / Event", icon: CalendarDays },

  { to: "/admin/gallery", label: "Galeri", icon: Image },

  { to: "/admin/programs", label: "Program", icon: Layers },

  { to: "/admin/runningtexts", label: "Running Text", icon: MessageSquareText },

  { to: "/admin/invitations", label: "Undangan", icon: Layers },

  {
    to: "/admin/settings",
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
