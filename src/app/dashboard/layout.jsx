import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function Layout({ children }) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <main className="w-full p-5">{children}</main>
    </SidebarProvider>
  );
}
