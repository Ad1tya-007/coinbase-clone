"use client"

import { useState } from "react"
import { Loader2, User, Shield, Bell, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/layout/theme-toggle"

export function SettingsForm() {
  const [isSaving, setIsSaving] = useState(false)
  const [notifications, setNotifications] = useState({
    priceAlerts: true,
    tradeConfirmations: true,
    weeklyReport: false,
    marketing: false,
  })

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setTimeout(() => setIsSaving(false), 1000)
  }

  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList className="grid grid-cols-4 w-full max-w-lg">
        <TabsTrigger value="profile" className="gap-1.5 text-xs sm:text-sm">
          <User className="h-3.5 w-3.5" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="security" className="gap-1.5 text-xs sm:text-sm">
          <Shield className="h-3.5 w-3.5" />
          Security
        </TabsTrigger>
        <TabsTrigger value="notifications" className="gap-1.5 text-xs sm:text-sm">
          <Bell className="h-3.5 w-3.5" />
          Alerts
        </TabsTrigger>
        <TabsTrigger value="appearance" className="gap-1.5 text-xs sm:text-sm">
          <Palette className="h-3.5 w-3.5" />
          Theme
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal details and account information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                    JD
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm" type="button">
                    Change avatar
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, GIF or PNG. Max 2MB.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" defaultValue="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" defaultValue="Doe" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" defaultValue="john@example.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" defaultValue="johndoe" />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="security">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current password</Label>
                  <Input id="currentPassword" type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New password</Label>
                  <Input id="newPassword" type="password" placeholder="Min. 8 characters" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm new password</Label>
                  <Input id="confirmPassword" type="password" placeholder="••••••••" />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update password"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Authenticator App</p>
                  <p className="text-sm text-muted-foreground">
                    Use an app like Google Authenticator or Authy.
                  </p>
                </div>
                <Badge variant="outline" className="text-muted-foreground">
                  Not enabled
                </Badge>
              </div>
              <Separator className="my-4" />
              <Button variant="outline" size="sm">
                Enable 2FA
              </Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions for your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Reset Portfolio</p>
                  <p className="text-sm text-muted-foreground">
                    Reset your portfolio to the initial $10,000 balance.
                  </p>
                </div>
                <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Choose what updates you want to receive.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              {
                key: "priceAlerts" as const,
                label: "Price Alerts",
                description: "Get notified when assets hit your target prices.",
              },
              {
                key: "tradeConfirmations" as const,
                label: "Trade Confirmations",
                description: "Receive confirmation after each executed trade.",
              },
              {
                key: "weeklyReport" as const,
                label: "Weekly Portfolio Report",
                description: "Summary of your portfolio performance every Sunday.",
              },
              {
                key: "marketing" as const,
                label: "Product Updates",
                description: "News about new features and platform improvements.",
              },
            ].map((item, i, arr) => (
              <div key={item.key}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                  </div>
                  <Switch
                    checked={notifications[item.key]}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, [item.key]: checked }))
                    }
                  />
                </div>
                {i < arr.length - 1 && <Separator className="mt-6" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="appearance">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how the app looks on your device.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Theme</p>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark mode.
                </p>
              </div>
              <ThemeToggle />
            </div>
            <Separator />
            <div className="flex items-center justify-between opacity-60">
              <div>
                <p className="font-medium text-sm">Currency Display</p>
                <p className="text-sm text-muted-foreground">
                  Default currency for displaying prices.
                </p>
              </div>
              <Badge variant="secondary">USD</Badge>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
