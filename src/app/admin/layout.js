import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminThemeProvider from "@/components/admin/AdminThemeProvider";

export const metadata = {
  robots: "noindex, nofollow",
};

export default function AdminLayout({ children }) {
  return (
    <AdminThemeProvider>
      <div className="min-h-screen admin-bg flex">
        <AdminSidebar />
        <div className="flex-1 lg:ml-64 min-h-screen flex flex-col">
          <AdminHeader />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </AdminThemeProvider>
  );
}
