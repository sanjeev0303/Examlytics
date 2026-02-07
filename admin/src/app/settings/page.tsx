"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function SettingsPage() {
    const [difficulty, setDifficulty] = useState(50);
    const [cacheTTL, setCacheTTL] = useState(3600);

    return (
        <div className="p-6 space-y-8 text-white max-w-5xl">
            <h1 className="text-3xl font-bold">Platform Configuration</h1>

            {/* Exam Generation Rules */}
            <Card className="border-white/10 bg-[#18181b]">
                <CardHeader>
                    <CardTitle>Exam Generation Rules</CardTitle>
                    <CardDescription>Tune the global AI behavior for exam creation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <label className="text-sm font-medium">Base Difficulty Modifier</label>
                            <span className="text-sm text-gray-400">{difficulty}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={difficulty}
                            onChange={(e) => setDifficulty(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
                        />
                        <p className="text-xs text-gray-500">Higher values increase the initial complexity of questions for new users.</p>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-white/5">
                        <div>
                            <div className="font-medium">Strict "Weak Topic" Focus</div>
                            <div className="text-sm text-gray-400">Force AI to prioritize weak topics (90% weight) over new topics</div>
                        </div>
                        <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out bg-green-500 rounded-full cursor-pointer">
                            <span className="absolute left-6 top-1 bg-white w-4 h-4 rounded-full transition-transform"></span>
                        </div>
                    </div>
                </CardContent>
                 <CardFooter className="border-t border-white/10 px-6 py-4">
                     <button className="px-4 py-2 bg-white text-black font-medium rounded-md hover:bg-gray-200 transition">Save Changes</button>
                 </CardFooter>
            </Card>

            {/* System Performance */}
             <Card className="border-white/10 bg-[#18181b]">
                <CardHeader>
                    <CardTitle>System Performance</CardTitle>
                    <CardDescription>Cache and Rate Limiting settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Redis Cache TTL (seconds)</label>
                            <input
                                type="number"
                                value={cacheTTL}
                                onChange={(e) => setCacheTTL(parseInt(e.target.value))}
                                className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-white outline-none focus:border-violet-500 transition"
                            />
                        </div>
                         <div className="space-y-2">
                            <label className="text-sm font-medium">Rate Limit (Req/Min)</label>
                            <input
                                type="number"
                                defaultValue={100}
                                className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-white outline-none focus:border-violet-500 transition"
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t border-white/10 px-6 py-4 flex gap-3">
                     <button className="px-4 py-2 bg-white text-black font-medium rounded-md hover:bg-gray-200 transition">Save Changes</button>
                     <button className="px-4 py-2 bg-red-500/10 text-red-400 font-medium rounded-md hover:bg-red-500/20 transition border border-red-500/20">Flush Cache</button>
                 </CardFooter>
            </Card>

            {/* Admins */}
             <Card className="border-white/10 bg-[#18181b]">
                <CardHeader>
                    <CardTitle>Admin Access</CardTitle>
                    <CardDescription>Manage team permissions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold">A</div>
                                <div>
                                    <div className="font-medium">admin@examlytics.com</div>
                                    <div className="text-xs text-gray-500">Super Admin</div>
                                </div>
                            </div>
                            <Badge variant="outline">Owner</Badge>
                        </div>
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-500/20 flex items-center justify-center text-gray-400 font-bold">J</div>
                                <div>
                                    <div className="font-medium">jane@examlytics.com</div>
                                    <div className="text-xs text-gray-500">Content Admin</div>
                                </div>
                            </div>
                            <button className="text-sm text-red-400 hover:underline">Revoke</button>
                        </div>
                    </div>
                </CardContent>
                 <CardFooter className="border-t border-white/10 px-6 py-4">
                      <button className="text-sm text-gray-400 hover:text-white flex items-center gap-2">
                          <span>+ Invite new admin</span>
                      </button>
                 </CardFooter>
            </Card>
        </div>
    );
}
