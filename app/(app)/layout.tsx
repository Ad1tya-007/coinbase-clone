import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const initials =
    session.firstName.charAt(0).toUpperCase() +
    (session.email.split('@')[0].charAt(1)?.toUpperCase() ?? '');

  const user = {
    firstName: session.firstName,
    email: session.email,
    initials,
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader user={user} />
        <main className="flex-1 overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
