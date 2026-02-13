"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Brain, Code, FileText, ExternalLink, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from "recharts";
import Link from "next/link";

export default function RecruiterDashboard() {
    const [loading, setLoading] = useState(true);
    const [targetUser, setTargetUser] = useState<string | null>(null);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("recruiter_target_user");
        if (storedUser) {
            setTargetUser(storedUser);
            fetchAnalysis(storedUser);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchAnalysis = async (username: string) => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/analysis/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            const result = await res.json();
            setData(result);
        } catch (error) {
            console.error("Analysis failed", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="h-[60vh] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 text-cyber-cyan animate-spin" />
                        <p className="text-muted-foreground font-mono">Running Git Intel Analysis...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!targetUser || !data) {
        return (
            <DashboardLayout>
                <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
                    <div className="p-6 rounded-full bg-white/5 border border-white/10">
                        <Brain className="w-12 h-12 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white">No Candidate Selected</h2>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Configure a GitHub URL in settings to start the deep analysis engine.
                        </p>
                    </div>
                    <Link href="/recruiter/settings">
                        <Button className="bg-cyber-cyan text-black hover:bg-cyber-cyan/90">
                            Configure Target Profile
                        </Button>
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    // Transform API data for Radar Chart (Mocking depth based on languages for now or using AI stats)
    const radarData = [
        { subject: 'Impact', A: data.stats.impact, fullMark: 100 },
        { subject: 'Quality', A: data.stats.quality, fullMark: 100 },
        { subject: 'Consistency', A: data.stats.consistency, fullMark: 100 },
        { subject: 'Docs', A: data.stats.documentation, fullMark: 100 },
        { subject: 'Collab', A: data.aiFeedback?.collaboration || 50, fullMark: 100 },
        { subject: 'Depth', A: data.aiFeedback?.technicalDepth || 50, fullMark: 100 },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in duration-500">

                {/* Header Profile Section - Ultra Clean */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-white/5">
                    <div className="flex items-center gap-6">
                        <Avatar className="w-24 h-24 border-2 border-white/10 shadow-2xl shadow-cyber-purple/20">
                            <AvatarImage src={data.avatarUrl} />
                            <AvatarFallback>{targetUser.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">{targetUser}</h1>
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className={`border-0 px-3 py-1 text-sm font-mono ${data.gitIntelScore > 80 ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                    SCORE: {data.gitIntelScore}/100
                                </Badge>
                                <a href={`https://github.com/${targetUser}`} target="_blank" className="text-muted-foreground hover:text-white transition-colors">
                                    <ExternalLink className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Link href="/recruiter/settings">
                            <Button variant="outline" className="border-white/10 text-muted-foreground hover:text-white hover:bg-white/5 bg-transparent backdrop-blur-sm">
                                Change Target
                            </Button>
                        </Link>
                        <Button className="bg-white/5 hover:bg-white/10 border border-white/10 text-cyber-cyan shadow-[0_0_15px_rgba(34,211,238,0.15)]">
                            <FileText className="w-4 h-4 mr-2" /> Download Report
                        </Button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Left Column: Tech Depth & Radar */}
                    <div className="space-y-8">
                        {/* Radar Chart Container - Max Transparency */}
                        <Card className="bg-transparent border border-white/10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-cyber-purple/5 to-transparent pointer-events-none" />
                            <CardHeader>
                                <CardTitle className="text-lg text-white font-mono flex items-center gap-2">
                                    <Brain className="w-4 h-4 text-cyber-purple" />
                                    ENGINEERING_DNA
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px] flex items-center justify-center">
                                <div className="w-full h-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                            <PolarGrid stroke="rgba(255,255,255,0.05)" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'var(--font-jetbrains-mono)' }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                            <Radar
                                                name={targetUser}
                                                dataKey="A"
                                                stroke="#8B5CF6"
                                                strokeWidth={2}
                                                fill="#8B5CF6"
                                                fillOpacity={0.2}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff', fontFamily: 'var(--font-jetbrains-mono)' }}
                                                itemStyle={{ color: '#8B5CF6' }}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Ghost to Code */}
                        <Card className="bg-transparent border border-white/10">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2 font-mono">
                                    <Code className="w-4 h-4 text-cyber-cyan" /> GHOST_TO_CODE_RATIO
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-end gap-2 mb-2">
                                    <span className="text-3xl font-bold text-white font-mono">0.88</span>
                                    <span className="text-xs text-green-400 font-mono mb-1">OPTIMAL</span>
                                </div>
                                <div className="h-1 w-full bg-white/5 overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-cyber-cyan to-green-400 w-[88%] shadow-[0_0_10px_#22d3ee]" />
                                </div>
                                <p className="text-xs text-muted-foreground mt-3 font-mono">
                                    Lines of Code / Total Commits
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Middle & Right: Analysis & Hygiene */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Red Flags & Hygiene */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="bg-red-500/5 border border-red-500/20 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-red-400 text-lg flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5" /> Red Flags Detectors
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {data.redFlags && data.redFlags.length > 0 ? (
                                        data.redFlags.map((flag: string, i: number) => (
                                            <div key={i} className="flex items-start gap-3 text-sm text-red-200/80 bg-red-500/10 p-2 rounded">
                                                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                                                {flag}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-green-400 text-sm flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4" /> No critical issues found.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="bg-cyber-cyan/5 border border-cyber-cyan/20 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-cyber-cyan text-lg flex items-center gap-2">
                                        <Brain className="w-5 h-5" /> AI Feedback
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h4 className="text-xs font-mono text-cyan-200/50 uppercase mb-2">Technical Strengths</h4>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline" className="border-cyber-cyan/30 text-cyber-cyan">Solid Documentation</Badge>
                                            <Badge variant="outline" className="border-cyber-cyan/30 text-cyber-cyan">Consistent History</Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-mono text-cyan-200/50 uppercase mb-2">Recommended Actions</h4>
                                        <ul className="text-sm text-cyan-100/80 space-y-1 list-disc pl-4">
                                            {data.improvements?.slice(0, 2).map((imp: string, i: number) => (
                                                <li key={i}>{imp}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Detailed Hygiene Table */}
                        <Card className="bg-transparent border border-white/10">
                            <CardHeader>
                                <CardTitle className="text-white">Repo Hygiene Audit</CardTitle>
                                <CardDescription>Structural analysis of top repositories.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 border border-white/5 rounded-lg bg-white/5">
                                        <span className="text-sm font-medium text-gray-300">README Existence</span>
                                        <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">PASS</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 border border-white/5 rounded-lg bg-white/5">
                                        <span className="text-sm font-medium text-gray-300">CI/CD Workflows</span>
                                        <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30">PARTIAL</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 border border-white/5 rounded-lg bg-white/5">
                                        <span className="text-sm font-medium text-gray-300">Generic Repo Names</span>
                                        <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">PASS</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
