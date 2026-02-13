"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Share2, Printer } from "lucide-react";

export default function ReportsPage() {
    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
                    <p className="text-muted-foreground">Generate comprehensive hiring insights and candidate summaries.</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Generate New Report */}
                    <Card className="bg-gradient-to-br from-blue-900/20 to-background border-blue-500/20">
                        <CardHeader>
                            <CardTitle>Generate New Report</CardTitle>
                            <CardDescription>Select parameters to create a custom analysis.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-blue-500/10 hover:border-blue-500/50">
                                    <FileText className="w-8 h-8 text-blue-400" />
                                    <span>Candidate Summary</span>
                                </Button>
                                <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-green-500/10 hover:border-green-500/50">
                                    <FileText className="w-8 h-8 text-green-400" />
                                    <span>Pipeline Health</span>
                                </Button>
                                <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-purple-500/10 hover:border-purple-500/50">
                                    <FileText className="w-8 h-8 text-purple-400" />
                                    <span>Team Compatibility</span>
                                </Button>
                                <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-orange-500/10 hover:border-orange-500/50">
                                    <FileText className="w-8 h-8 text-orange-400" />
                                    <span>Skill Market Trends</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Reports */}
                    <Card className="bg-card/40 backdrop-blur-sm border-white/5">
                        <CardHeader>
                            <CardTitle>Recent Reports</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {[
                                { name: "Q3 Hiring Summary", date: "Oct 1, 2025", type: "Pipeline" },
                                { name: "Candidate Analysis: Alex Dev", date: "Sep 28, 2025", type: "Individual" },
                                { name: "Backend Role Market Fit", date: "Sep 25, 2025", type: "Market" },
                            ].map((report, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/10 rounded-md text-blue-400">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{report.name}</p>
                                            <p className="text-xs text-muted-foreground">{report.date} • {report.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Download className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Share2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
