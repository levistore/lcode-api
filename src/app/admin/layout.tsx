import { ReactNode } from "react";
import AdminShell from "@/components/admin/AdminShell";

export const metadata = {
  title: "Admin Panel - Lcode API",
  description: "Lcode API Super Admin Management Console",
};

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <AdminShell>{children}</AdminShell>;
}
