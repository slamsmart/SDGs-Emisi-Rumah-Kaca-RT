import {
  Bell,
  ChartColumn,
  Gift,
  Home,
  LayoutDashboard,
  MapPinned,
  NotebookText,
  ShieldCheck,
  Users,
} from "lucide-react";

export const citizenNavigation = [
  { href: "/beranda", label: "Beranda", icon: Home },
  { href: "/lapor", label: "Lapor", icon: NotebookText },
  { href: "/riwayat", label: "Riwayat", icon: ChartColumn },
  { href: "/reward", label: "Reward", icon: Gift },
  { href: "/notifikasi", label: "Notif", icon: Bell },
] as const;

export const adminNavigation = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/laporan", label: "Review laporan", icon: NotebookText },
  { href: "/admin/reward", label: "Reward", icon: Gift },
  { href: "/admin/pengguna", label: "Pengguna", icon: Users },
  { href: "/admin/master-data", label: "Master data", icon: MapPinned },
  { href: "/admin/notifikasi", label: "Broadcast", icon: ShieldCheck },
] as const;
