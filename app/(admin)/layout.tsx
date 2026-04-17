import { AdminNavbar } from "@/components/features/admin-navbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col flex-1">
      <AdminNavbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
