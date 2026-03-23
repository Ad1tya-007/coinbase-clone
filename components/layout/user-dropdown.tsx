"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import {
  Settings,
  LogOut,
  User,
  Moon,
  Sun,
  ChevronDown,
  Wallet,
  LifeBuoy,
  Monitor,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function UserDropdown() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full pl-1 pr-2.5 py-1 hover:bg-accent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
              JD
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium hidden sm:block">John</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-60" align="end" sideOffset={8}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3 py-1">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                JD
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <p className="font-semibold text-sm leading-none">John Doe</p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">john@example.com</p>
              <Badge variant="secondary" className="mt-1.5 w-fit text-xs h-4 px-1.5 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30">
                Demo Account
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/portfolio" className="cursor-pointer">
              <Wallet className="h-4 w-4 mr-2 text-muted-foreground" />
              Portfolio
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="cursor-pointer">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              Profile &amp; Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            {theme === "dark" ? (
              <Moon className="h-4 w-4 mr-2 text-muted-foreground" />
            ) : theme === "light" ? (
              <Sun className="h-4 w-4 mr-2 text-muted-foreground" />
            ) : (
              <Monitor className="h-4 w-4 mr-2 text-muted-foreground" />
            )}
            <span>Theme</span>
            <span className="ml-auto text-xs text-muted-foreground capitalize">{theme}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="h-4 w-4 mr-2" />
                Light
                {theme === "light" && <span className="ml-auto text-primary">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="h-4 w-4 mr-2" />
                Dark
                {theme === "dark" && <span className="ml-auto text-primary">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="h-4 w-4 mr-2" />
                System
                {theme === "system" && <span className="ml-auto text-primary">✓</span>}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuItem>
          <LifeBuoy className="h-4 w-4 mr-2 text-muted-foreground" />
          Help &amp; Support
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
