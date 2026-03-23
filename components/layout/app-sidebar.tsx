"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  TrendingUp,
  ArrowLeftRight,
  History,
  PieChart,
  Wallet,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Portfolio",
    href: "/portfolio",
    icon: PieChart,
  },
  {
    label: "Markets",
    href: "/markets",
    icon: TrendingUp,
  },
  {
    label: "Trade",
    href: "/trade",
    icon: ArrowLeftRight,
  },
  {
    label: "Transactions",
    href: "/transactions",
    icon: History,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
                  <span className="font-bold text-sm">C</span>
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-semibold text-base">Coinbase</span>
                  <span className="text-xs text-muted-foreground">Demo Trading</span>
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
                    tooltip={item.label}
                  >
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

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Balance</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Portfolio">
                  <Link href="/portfolio">
                    <Wallet />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Total Value</span>
                      <span className="font-semibold text-sm">$20,571.44</span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <div className="px-2 py-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">All-time P&amp;L</span>
                    <Badge
                      variant="secondary"
                      className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 h-5 text-xs"
                    >
                      +14.29%
                    </Badge>
                  </div>
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
