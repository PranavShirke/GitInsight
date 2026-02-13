"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, ArrowRight } from "lucide-react";

export default function ResumePage() {
    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Resume Optimizer</h2>
                    <p className="text-muted-foreground">Align your resume with your GitHub activity to pass ATS checks.</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Upload Section */}
                    <Card className="lg:col-span-1 border-dashed border-2 border-white/10 bg-card/20 h-fit">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                            <div className="p-4 bg-primary/10 rounded-full text-primary">
                                <Upload className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Upload Resume</h3>
                                <p className="text-sm text-muted-foreground mt-1">PDF or DOCX up to 5MB</p>
                            </div>
                            <Button variant="outline" className="w-full max-w-xs">Select File</Button>
                        </CardContent>
                    </Card>

                    {/* Analysis Result */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="bg-card/40 backdrop-blur-sm border-white/5">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>Resume vs GitHub Logic</CardTitle>
                                    <Badge className="bg-orange-500/20 text-orange-400 hover:bg-orange-500/20">Match Score: 65%</Badge>
                                </div>
                                <CardDescription>We found discrepancies between your code and your resume.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">

                                <div className="space-y-4">
                                    <div className="flex items-start gap-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                        <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-semibold text-red-400">Missing Key Technologies</h4>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Your GitHub shows extensive use of <strong>TypeScript</strong> and <strong>Docker</strong>, but these are missing from your resume's "Skills" section.
                                            </p>
                                            <Button size="sm" variant="link" className="text-red-400 px-0 mt-2">Auto-fix Resume</Button>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-semibold text-green-400">Strong Project Alignment</h4>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Your featured project "E-Commerce-Api" is well described in your resume.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                        <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-semibold text-blue-400">Impact Quantification</h4>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                GitHub stats show you reduced build times by 40%. Add this metric to your resume's experience section.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                            </CardContent>
                        </Card>

                        {/* Keyword Cloud Mock */}
                        <Card className="bg-card/40 backdrop-blur-sm border-white/5">
                            <CardHeader>
                                <CardTitle>Suggested Keywords</CardTitle>
                                <CardDescription>Add these high-value keywords based on your industry.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {["CI/CD", "Microservices", "Jest", "PostgreSQL", "Next.js 14", "Tailwind CSS", "System Design", "Agile"].map((word) => (
                                        <Badge key={word} variant="secondary" className="px-3 py-1 text-sm border-white/10">{word}</Badge>
                                    ))}
                                    <Badge variant="outline" className="px-3 py-1 text-sm border-dashed text-muted-foreground">+ 5 more</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
