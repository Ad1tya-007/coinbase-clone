'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Loader2,
  User,
  Shield,
  Bell,
  Palette,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { useProfile, useRefreshProfile } from '@/hooks/use-profile';
import { useRefreshPortfolio } from '@/hooks/use-portfolio';
import { useRefreshTransactions } from '@/hooks/use-transactions';
import {
  updateProfileAction,
  changePasswordAction,
  resetPortfolioAction,
} from '@/actions/profile';

// ─── Schemas ─────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  email: z.string().email('Please enter a valid email.'),
});
type ProfileValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(1, 'Please confirm your new password.'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });
type PasswordValues = z.infer<typeof passwordSchema>;

type Feedback = { type: 'success' | 'error'; message: string } | null;

function FeedbackAlert({ state }: { state: Feedback }) {
  if (!state) return null;
  const ok = state.type === 'success';
  return (
    <Alert
      variant={ok ? 'default' : 'destructive'}
      className={
        ok ? 'border-green-500/40 bg-green-50 dark:bg-green-950/20' : ''
      }>
      {ok ? (
        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      <AlertDescription
        className={ok ? 'text-green-800 dark:text-green-300' : ''}>
        {state.message}
      </AlertDescription>
    </Alert>
  );
}

// ─── Profile Tab ─────────────────────────────────────────────────────────────

function ProfileTab() {
  const { data: profile, isPending } = useProfile();
  const refreshProfile = useRefreshProfile();

  const [profileFb, setProfileFb] = useState<Feedback>(null);
  const [savePending, startSaveTransition] = useTransition();

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: '', lastName: '', email: '' },
  });

  // Sync form once profile loads
  useEffect(() => {
    if (profile) {
      form.reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
      });
    }
  }, [profile, form]);

  function flash(
    setter: (v: Feedback) => void,
    type: 'success' | 'error',
    message: string,
  ) {
    setter({ type, message });
    setTimeout(() => setter(null), 5000);
  }

  // ── Profile form submit ────────────────────────────────────────────────────
  function onSaveProfile(values: ProfileValues) {
    startSaveTransition(async () => {
      const result = await updateProfileAction(values);
      if (result.success) {
        refreshProfile();
        flash(setProfileFb, 'success', 'Profile saved successfully.');
      } else {
        flash(setProfileFb, 'error', result.error ?? 'Save failed.');
      }
    });
  }

  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-4 w-72 mt-1" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-3 w-44" />
            </div>
          </div>
          <Separator />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your name, email, and profile photo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Separator />

        {/* ── Profile form ────────────────────────────────────────────────── */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSaveProfile)}
            className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {profile?.createdAt && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Member since</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}

            <FeedbackAlert state={profileFb} />

            <div className="flex justify-end">
              <Button type="submit" disabled={savePending}>
                {savePending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  'Save changes'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────

function SecurityTab() {
  const refreshPortfolio = useRefreshPortfolio();
  const refreshTransactions = useRefreshTransactions();

  const [passwordFb, setPasswordFb] = useState<Feedback>(null);
  const [resetFb, setResetFb] = useState<Feedback>(null);
  const [passwordPending, startPasswordTransition] = useTransition();
  const [resetPending, startResetTransition] = useTransition();

  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  function flash(
    setter: (v: Feedback) => void,
    type: 'success' | 'error',
    message: string,
  ) {
    setter({ type, message });
    setTimeout(() => setter(null), 5000);
  }

  function onChangePassword(values: PasswordValues) {
    startPasswordTransition(async () => {
      const result = await changePasswordAction(values);
      if (result.success) {
        form.reset();
        flash(setPasswordFb, 'success', 'Password updated successfully.');
      } else {
        flash(
          setPasswordFb,
          'error',
          result.error ?? 'Failed to update password.',
        );
      }
    });
  }

  function handleResetPortfolio() {
    startResetTransition(async () => {
      const result = await resetPortfolioAction();
      if (result.success) {
        refreshPortfolio();
        refreshTransactions();
        flash(
          setResetFb,
          'success',
          'Portfolio reset to $10,000. All holdings and transactions cleared.',
        );
      } else {
        flash(setResetFb, 'error', result.error ?? 'Reset failed.');
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Change password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onChangePassword)}
              className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Min. 8 characters"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm new password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FeedbackAlert state={passwordFb} />
              <div className="flex justify-end">
                <Button type="submit" disabled={passwordPending}>
                  {passwordPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating…
                    </>
                  ) : (
                    'Update password'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* 2FA placeholder */}
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
                Use Google Authenticator or Authy.
              </p>
            </div>
            <Badge variant="outline" className="text-muted-foreground">
              Not enabled
            </Badge>
          </div>
          <Separator className="my-4" />
          <Button variant="outline" size="sm" disabled>
            Enable 2FA
          </Button>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions for your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-sm">Reset Portfolio</p>
              <p className="text-sm text-muted-foreground">
                Wipes all holdings and transactions, restores $10,000 cash
                balance.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 text-destructive border-destructive/30 hover:bg-destructive/10"
                  disabled={resetPending}>
                  {resetPending ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      Resetting…
                    </>
                  ) : (
                    <>
                      <RotateCcw className="mr-2 h-3.5 w-3.5" />
                      Reset
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset your portfolio?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all holdings and transaction
                    history, and restore your cash balance to{' '}
                    <strong>$10,000</strong>. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleResetPortfolio}>
                    Yes, reset portfolio
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <FeedbackAlert state={resetFb} />
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function SettingsForm() {
  const [notifications, setNotifications] = useState({
    priceAlerts: true,
    tradeConfirmations: true,
    weeklyReport: false,
    marketing: false,
  });

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
        <TabsTrigger
          value="notifications"
          className="gap-1.5 text-xs sm:text-sm">
          <Bell className="h-3.5 w-3.5" />
          Alerts
        </TabsTrigger>
        <TabsTrigger value="appearance" className="gap-1.5 text-xs sm:text-sm">
          <Palette className="h-3.5 w-3.5" />
          Theme
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <ProfileTab />
      </TabsContent>
      <TabsContent value="security">
        <SecurityTab />
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
                key: 'priceAlerts' as const,
                label: 'Price Alerts',
                description: 'Get notified when assets hit your target prices.',
              },
              {
                key: 'tradeConfirmations' as const,
                label: 'Trade Confirmations',
                description: 'Receive confirmation after each executed trade.',
              },
              {
                key: 'weeklyReport' as const,
                label: 'Weekly Portfolio Report',
                description:
                  'Summary of your portfolio performance every Sunday.',
              },
              {
                key: 'marketing' as const,
                label: 'Product Updates',
                description:
                  'News about new features and platform improvements.',
              },
            ].map((item, i, arr) => (
              <div key={item.key}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {item.description}
                    </p>
                  </div>
                  <Switch
                    checked={notifications[item.key]}
                    onCheckedChange={(v) =>
                      setNotifications((p) => ({ ...p, [item.key]: v }))
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
  );
}
