import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AuthGuard from "@/components/auth/AuthGuard";

export const dynamic = "force-dynamic";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}
