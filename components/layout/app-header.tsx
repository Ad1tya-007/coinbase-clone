'use client';

import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { UserDropdown } from '@/components/layout/user-dropdown';
import { MobileNav } from '@/components/layout/mobile-nav';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  markets: 'Markets',
  trade: 'Trade',
  transactions: 'Transactions',
  settings: 'Settings',
  portfolio: 'Portfolio',
};

export function AppHeader() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  return (
    <header className="flex h-14 items-center gap-2 border-b bg-background/95 backdrop-blur px-4 sticky top-0 z-10">
      {/* Desktop: sidebar panel toggle */}
      <SidebarTrigger className="-ml-1 hidden md:flex" />
      {/* Mobile: hamburger sheet */}
      <div className="flex md:hidden">
        <MobileNav />
      </div>
      <Separator orientation="vertical" className="h-4" />

      <Breadcrumb className="flex-1">
        <BreadcrumbList>
          {segments.map((segment, index) => {
            const isLast = index === segments.length - 1;
            const href = '/' + segments.slice(0, index + 1).join('/');
            const label =
              routeLabels[segment] ??
              segment.charAt(0).toUpperCase() + segment.slice(1);

            return (
              <BreadcrumbItem key={href}>
                {!isLast ? (
                  <>
                    <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                    <BreadcrumbSeparator />
                  </>
                ) : (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="hidden md:flex items-center gap-1">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="h-4 mx-1" />
        <UserDropdown />
      </div>
    </header>
  );
}
