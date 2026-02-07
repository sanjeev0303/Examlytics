"use client";

import React from "react";
import { UserProfile } from "@clerk/nextjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, Moon, Sun, Shield, User } from "lucide-react";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const { setTheme, theme } = useTheme();

  return (
    <div className="max-w-4xl mx-auto py-8 animate-fade-in-up space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your account preferences and application experience.</p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account" className="mt-6 space-y-6">
           <Card>
               <CardHeader>
                   <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-primary" /> Profile & Security</CardTitle>
                   <CardDescription>Managed securely by Clerk.</CardDescription>
               </CardHeader>
               <CardContent>
                   <div className="flex justify-center py-4">
                       {/* Embedding Clerk's UserProfile but styled minimally or just a trigger if preferred.
                           For deep integration, we use <UserProfile /> full component or routing.
                           Here keeping it simple. */}
                        <UserProfile
                            path="/settings"
                            appearance={{
                                elements: {
                                    card: "shadow-none border-none bg-transparent",
                                    navbar: "hidden",
                                    headerTitle: "hidden",
                                    headerSubtitle: "hidden"
                                }
                            }}
                        />
                   </div>
               </CardContent>
           </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="mt-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sun className="w-5 h-5 text-primary" /> Theme Preferences</CardTitle>
                    <CardDescription>Customize how Examlytics looks for you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Dark Mode</Label>
                            <p className="text-sm text-gray-500">Enable a darker, easier-on-the-eyes appearance.</p>
                        </div>
                        <Switch
                            checked={theme === 'dark'}
                            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                        />
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5 text-primary" /> Notification Settings</CardTitle>
                    <CardDescription>Choose what we update you about.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Exam Reminders</Label>
                            <p className="text-sm text-gray-500">Get notified when you haven't practiced in a while.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Weekly Report</Label>
                            <p className="text-sm text-gray-500">Receive a weekly summary of your learning progress.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button variant="outline" disabled>Save Changes (Coming Soon)</Button>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
