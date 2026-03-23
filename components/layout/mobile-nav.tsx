"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Menu,
  LayoutDashboard,
  TrendingUp,
  ArrowLeftRight,
  History,
  PieChart,
  Wallet,
  Settings,
  LogOut,
  X,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Portfolio", href: "/portfolio", icon: PieChart },
  { label: "Markets", href: "/markets", icon: TrendingUp },
  { label: "Trade", href: "/trade", icon: ArrowLeftRight },
  { label: "Transactions", href: "/transactions", icon: History },
]

const bottomNavItems = [
  { label: "Settings", href: "/settings", icon: Settings },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/")
  }

  function handleNavClick() {
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="-ml-1" aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-72 p-0 flex flex-col">
        <SheetHeader className="px-4 py-4 border-b">
          <SheetTitle asChild>
            <Link
              href="/dashboard"
              className="flex items-center gap-3"
              onClick={handleNavClick}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
                <span className="font-bold">C</span>
              </div>
              <div className="flex flex-col leading-none text-left">
                <span className="font-semibold text-base text-foreground">Coinbase</span>
                <span className="text-xs text-muted-foreground">Demo Trading</span>
              </div>
            </Link>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
          <p className="px-3 pb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Navigation
          </p>
          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <item.icon className={`h-4 w-4 shrink-0 ${active ? "text-primary" : ""}`} />
                {item.label}
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </Link>
            )
          })}

          <Separator className="my-3" />

          <div className="mx-2 rounded-xl border bg-muted/30 p-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground">Portfolio Value</span>
            </div>
            <p className="text-xl font-bold pl-6">$20,571.44</p>
            <div className="flex items-center justify-between pl-6">
              <span className="text-xs text-muted-foreground">All-time P&amp;L</span>
              <Badge
                variant="secondary"
                className="text-xs h-5 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30"
              >
                +14.29%
              </Badge>
            </div>
          </div>

          <Separator className="my-3" />

          <p className="px-3 pb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Account
          </p>
          {bottomNavItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}

          <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </div>

        <div className="border-t p-4">
          <Link
            href="/settings"
            onClick={handleNavClick}
            className="flex items-center gap-3 rounded-xl hover:bg-accent transition-colors p-2 -m-2"
          >
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">
                JD
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-none truncate">John Doe</p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                john@example.com
              </p>
            </div>
            <Settings className="h-4 w-4 text-muted-foreground shrink-0" />
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  )
}
