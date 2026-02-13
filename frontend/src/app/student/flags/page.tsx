"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, ShieldAlert, FileWarning, EyeOff, CheckCircle2 } from "lucide-react";

export default function FlagsPage() {
    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-red-500 flex items-center gap-3">
                        <ShieldAlert className="w-8 h-8" />
                        Red Flag Detector
                    </h2>
                    <p className="text-muted-foreground">Critical issues that could cause recruiters to reject your profile immediately.</p>
                </div>

                <div className="grid gap-6">
                    {/* Critical Severity */}
                    <Card className="bg-red-500/5 border-red-500/20">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-red-400 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5" />
                                    High Severity (2 Issues)
                                </CardTitle>
                                <Badge variant="destructive">Immediate Action Required</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 rounded-lg bg-background/50 border border-red-500/10 flex gap-4">
                                <EyeOff className="w-6 h-6 text-red-500 shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-red-400">Exposed Secrets Detected</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        We found a potential API key in `config/default.json` in repository `ecommerce-v1`.
                                    </p>
                                    <div className="mt-3 flex gap-3">
                                        <Button variant="destructive" size="sm">Revoke Key</Button>
                                        <Button variant="outline" size="sm" className="border-red-500/20 text-red-400 hover:bg-red-500/10">View File</Button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-lg bg-background/50 border border-red-500/10 flex gap-4">
                                <FileWarning className="w-6 h-6 text-red-500 shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-red-400">Empty README.md</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Your pinned repository `weather-app` has an empty README. This is a major red flag for recruiters.
                                    </p>
                                    <Button variant="outline" size="sm" className="mt-3 border-red-500/20 text-red-400 hover:bg-red-500/10">Generate with AI</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Medium Severity */}
                    <Card className="bg-yellow-500/5 border-yellow-500/20">
                        <CardHeader>
                            <CardTitle className="text-yellow-400 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                Medium Severity (3 Issues)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 rounded-lg bg-background/50 border border-yellow-500/10 flex gap-4">
                                <CheckCircle2 className="w-6 h-6 text-yellow-500 shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-yellow-500">Inconsistent Commit History</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        You have a 3-week gap in activity. Try to commit at least once every 2-3 days to show consistency.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
