"use client";

import React from "react";
import { UserProfile } from "@clerk/nextjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, Moon, Sun, Shield, User, Laptop } from "lucide-react";
import { useTheme } from "next-themes";
import { ThemePreview } from "@/components/ui/ThemePreview";

export default function SettingsPage() {
  const { setTheme, theme } = useTheme();

  return (
    <div className="max-w-5xl mx-auto py-8 animate-fade-in-up space-y-8 px-4 sm:px-6">
      <div className="flex items-end justify-between border-b border-border/40 pb-6">
        <div>
            <h1 className="text-3xl font-bold font-heading text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-2">Manage your account preferences and application experience.</p>
        </div>
      </div>

      <Tabs defaultValue="account" className="w-full flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-[240px] shrink-0">
            <TabsList className="w-full h-auto flex-col bg-transparent items-stretch gap-1 p-0 text-muted-foreground">
                <TabsTrigger
                    value="account"
                    className="justify-start px-4 py-2.5 data-[state=active]:bg-secondary data-[state=active]:text-foreground rounded-lg transition-colors"
                >
                    <User className="w-4 h-4 mr-2" /> Account
                </TabsTrigger>
                <TabsTrigger
                    value="appearance"
                    className="justify-start px-4 py-2.5 data-[state=active]:bg-secondary data-[state=active]:text-foreground rounded-lg transition-colors"
                >
                    <Sun className="w-4 h-4 mr-2" /> Appearance
                </TabsTrigger>
                <TabsTrigger
                    value="notifications"
                    className="justify-start px-4 py-2.5 data-[state=active]:bg-secondary data-[state=active]:text-foreground rounded-lg transition-colors"
                >
                    <Bell className="w-4 h-4 mr-2" /> Notifications
                </TabsTrigger>
            </TabsList>
        </aside>

        <div className="flex-1 space-y-6">
            {/* Account Tab */}
            <TabsContent value="account" className="mt-0 space-y-6">
            <Card className="shadow-none border border-border/50 bg-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">Profile & Security</CardTitle>
                    <CardDescription>Managed securely by Clerk.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center py-4">
                            <UserProfile
                                path="/settings"
                                appearance={{
                                    elements: {
                                        card: "shadow-none border-none bg-transparent w-full",
                                        navbar: "hidden",
                                        headerTitle: "hidden",
                                        headerSubtitle: "hidden",
                                        rootBox: "w-full"
                                    }
                                }}
                            />
                    </div>
                </CardContent>
            </Card>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="mt-0 space-y-6">
                <Card className="shadow-none border border-border/50 bg-card">
                    <CardHeader>
                        <CardTitle>Interface Theme</CardTitle>
                        <CardDescription>Customize how Examlytics looks for you.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ThemePreview
                                theme="light"
                                selected={theme === 'light'}
                                onClick={() => setTheme('light')}
                            />
                            <ThemePreview
                                theme="dark"
                                selected={theme === 'dark'}
                                onClick={() => setTheme('dark')}
                            />
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-border/40">
                            <div className="space-y-0.5">
                                <Label className="text-base">System Preference</Label>
                                <p className="text-sm text-muted-foreground">Sync with your operating system settings.</p>
                            </div>
                            <Switch
                                checked={theme === 'system'}
                                onCheckedChange={(checked) => setTheme(checked ? 'system' : 'light')}
                            />
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="mt-0 space-y-6">
                <Card className="shadow-none border border-border/50 bg-card">
                    <CardHeader>
                        <CardTitle>Notification Preferences</CardTitle>
                        <CardDescription>Choose what we update you about.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Exam Reminders</Label>
                                <p className="text-sm text-muted-foreground">Get notified when you haven't practiced in 3 days.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Weekly Report</Label>
                                <p className="text-sm text-muted-foreground">Receive a weekly summary of your learning progress.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                             <div className="space-y-0.5">
                                <Label className="text-base">Product Updates</Label>
                                <p className="text-sm text-muted-foreground">Stay informed about new features and improvements.</p>
                            </div>
                            <Switch />
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button variant="outline" disabled>Save Preferences</Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
