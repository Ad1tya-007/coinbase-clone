'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  ArrowLeftRight,
  History,
  PieChart,
  Wallet,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { usePortfolio } from '@/hooks/use-portfolio';
import { useMarketData } from '@/hooks/use-market-data';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Portfolio', href: '/portfolio', icon: PieChart },
  { label: 'Markets', href: '/markets', icon: TrendingUp },
  { label: 'Trade', href: '/trade', icon: ArrowLeftRight },
  { label: 'Transactions', href: '/transactions', icon: History },
];

function formatCurrency(value: number) {
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function PortfolioFooter() {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const { data: portfolioData, isPending: portfolioPending } = usePortfolio();
  const { data: coins, isPending: coinsPending } = useMarketData();

  const isLoading = portfolioPending || coinsPending;

  // Compute totals from live data
  const cashBalance = portfolioData?.cashBalance ?? 0;
  const holdings = portfolioData?.holdings ?? [];

  const totalHoldingsValue = holdings.reduce((sum, h) => {
    const price = coins?.find((c) => c.id === h.coinId)?.price ?? 0;
    return sum + h.amount * price;
  }, 0);

  const totalValue = cashBalance + totalHoldingsValue;
  const totalInvested = holdings.reduce(
    (s, h) => s + h.amount * h.avgBuyPrice,
    0,
  );
  const pnl = totalHoldingsValue - totalInvested;
  const pnlPercent = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;
  const isPositive = pnlPercent >= 0;

  // ── Collapsed: single icon button with tooltip ──────────────────────────
  if (isCollapsed) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            tooltip={
              isLoading
                ? 'Loading portfolio…'
                : `${formatCurrency(totalValue)} · P&L ${isPositive ? '+' : ''}${pnlPercent.toFixed(2)}%`
            }
            className="relative flex items-center justify-center">
            <Link href="/portfolio">
              <div className="relative">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Wallet size={10} />
                </div>
                {/* Live P&L dot */}
                {!isLoading && (
                  <span
                    className={`absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-sidebar ${
                      isPositive ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                )}
              </div>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // ── Expanded: full portfolio summary card ────────────────────────────────
  return (
    <div className="px-3 pb-3">
      <Separator className="mb-3" />
      <Link
        href="/portfolio"
        className="group flex flex-col gap-2.5 rounded-xl border bg-muted/30 px-3 py-2.5 hover:bg-muted/60 transition-colors">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
              <Wallet size={13} />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              Portfolio
            </span>
          </div>
          {isLoading ? (
            <Skeleton className="h-4 w-16" />
          ) : (
            <span className="text-sm font-bold tabular-nums">
              {formatCurrency(totalValue)}
            </span>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-muted-foreground leading-none">Cash</p>
              {isLoading ? (
                <Skeleton className="h-3.5 w-14 mt-0.5" />
              ) : (
                <p className="font-medium mt-0.5 tabular-nums">
                  {formatCurrency(cashBalance)}
                </p>
              )}
            </div>
            <div>
              <p className="text-muted-foreground leading-none">Assets</p>
              {isLoading ? (
                <Skeleton className="h-3.5 w-14 mt-0.5" />
              ) : (
                <p className="font-medium mt-0.5 tabular-nums">
                  {formatCurrency(totalHoldingsValue)}
                </p>
              )}
            </div>
          </div>

          {isLoading ? (
            <Skeleton className="h-5 w-14" />
          ) : (
            <Badge
              variant="secondary"
              className={`h-5 text-xs shrink-0 ${
                isPositive
                  ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30'
                  : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30'
              }`}>
              {isPositive ? '+' : ''}
              {pnlPercent.toFixed(2)}%
            </Badge>
          )}
        </div>
      </Link>
    </div>
  );
}

export function AppSidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Coinbase Demo">
              <Link href="/dashboard">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
                  <span className="font-bold text-sm">C</span>
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-semibold text-base">Coinbase</span>
                  <span className="text-xs text-muted-foreground">
                    Demo Trading
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.label}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <PortfolioFooter />
      </SidebarFooter>
    </Sidebar>
  );
}
