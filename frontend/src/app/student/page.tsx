"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AreaChart, Area, ResponsiveContainer, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { TrendingUp, Activity, Code, Zap, Trophy, Share2, AlertTriangle, Fingerprint, Github, CheckCircle2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const waveformData = Array.from({ length: 50 }, (_, i) => ({
    value: Math.abs(Math.sin(i * 0.5) * 50 + Math.random() * 30),
}));

const radarData = [
    { subject: 'Documentation', A: 40, fullMark: 100 },
    { subject: 'Consistency', A: 90, fullMark: 100 },
    { subject: 'Code Quality', A: 70, fullMark: 100 },
    { subject: 'Impact', A: 50, fullMark: 100 },
    { subject: 'Technical Depth', A: 85, fullMark: 100 },
];

export default function StudentDashboard() {
    const [analyzed, setAnalyzed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("");

    const handleAnalyze = () => {
        if (!username) return;
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setAnalyzed(true);
        }, 2000);
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 min-h-[calc(100vh-140px)]">

                {/* Header Section */}
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-bold text-white tracking-tight">Portfolio Analysis</h1>
                        <p className="text-muted-foreground mt-2">Objective scoring and recruiter-focused feedback.</p>
                    </div>
                    {analyzed && (
                        <div className="flex gap-3">
                            <Button variant="outline" className="border-white/10 hover:bg-white/5 gap-2 rounded-xl" onClick={() => setAnalyzed(false)}>
                                Analyze Another
                            </Button>
                            <Button variant="destructive" className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 rounded-xl">
                                Download PDF Report
                            </Button>
                        </div>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {!analyzed ? (
                        /* Input State */
                        <motion.div
                            key="input"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex flex-col items-center justify-center h-[60vh] text-center max-w-2xl mx-auto"
                        >
                            <div className="p-4 rounded-full bg-white/5 mb-8 border border-white/10 shadow-[0_0_50px_rgba(34,211,238,0.1)]">
                                <Github className="w-16 h-16 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold mb-4">Paste your GitHub Profile URL</h2>
                            <p className="text-muted-foreground mb-8 text-lg">
                                We'll scan your repositories, commits, and documentation to look for red flags and optimization opportunities.
                            </p>

                            <div className="relative w-full max-w-lg">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-muted-foreground">
                                    <Github className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="github.com/username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                                    className="w-full h-16 pl-12 pr-36 rounded-2xl bg-[#0e0e11] border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-lg shadow-xl"
                                />
                                <Button
                                    className="absolute right-2 top-2 bottom-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 px-8 font-bold text-md transition-all shadow-lg shadow-blue-500/20"
                                    onClick={handleAnalyze}
                                    disabled={loading || !username}
                                >
                                    {loading ? "Scanning..." : "Analyze"}
                                </Button>
                            </div>

                            <div className="flex gap-8 mt-12 opacity-50 grayscale transition-all hover:grayscale-0">
                                <div className="flex flex-col items-center gap-2">
                                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                                    <span className="text-xs font-mono">Documentation Check</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                                    <span className="text-xs font-mono">Activity Pattern</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                                    <span className="text-xs font-mono">Code Quality</span>
                                </div>
                            </div>

                        </motion.div>
                    ) : (
                        /* Analysis Result State */
                        <motion.div
                            key="results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                        >

                            {/* Column 1: Score & Metrics */}
                            <div className="space-y-6">
                                {/* 1. Portfolio Score */}
                                <Card className="bg-[#0e0e11] border-white/5 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-30">
                                        <Trophy className="w-32 h-32 text-white/5 rotate-12" />
                                    </div>
                                    <CardHeader>
                                        <CardTitle className="text-muted-foreground font-medium text-sm">Portfolio Health Score</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                                            72
                                        </div>
                                        <p className="text-sm font-medium text-green-400 mt-2">Good Start</p>
                                        <p className="text-xs text-muted-foreground mt-4">
                                            Your profile is active, but lacks deep documentation and consistent project explanations preferred by recruiters.
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* 2. Recruiter Report Card (Radar) */}
                                <Card className="bg-[#0e0e11] border-white/5">
                                    <CardHeader>
                                        <CardTitle className="text-white text-lg">Recruiter Report Card</CardTitle>
                                    </CardHeader>
                                    <CardContent className="h-[250px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                                <PolarGrid stroke="#333" />
                                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 12 }} />
                                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                                <Radar name="My Profile" dataKey="A" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Column 2: Actionable Feedback */}
                            <div className="lg:col-span-2 space-y-6">

                                {/* 3. Red Flags & Strengths */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    <Card className="bg-[#0e0e11] border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.05)]">
                                        <CardHeader>
                                            <CardTitle className="text-red-400 flex items-center gap-2">
                                                <AlertTriangle className="w-5 h-5" /> Critical Red Flags
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {[
                                                "2 Top Repos have no README",
                                                "Inconsistent commit layout (gaps > 2 weeks)",
                                                "Generic repo names ('test-project', 'temp')"
                                            ].map((flag, i) => (
                                                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                                                    <span className="text-sm text-red-200/80">{flag}</span>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-[#0e0e11] border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.05)]">
                                        <CardHeader>
                                            <CardTitle className="text-green-400 flex items-center gap-2">
                                                <Zap className="w-5 h-5" /> Key Strengths
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {[
                                                "Strong Technical Depth in React/TypeScript",
                                                "Active contribution to Open Source",
                                                "Clean code structure in 'Portfolio-v2'"
                                            ].map((strength, i) => (
                                                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                                                    <span className="text-sm text-green-200/80">{strength}</span>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* 4. Actionable Next Steps */}
                                <Card className="bg-[#0e0e11] border-white/5">
                                    <CardHeader>
                                        <CardTitle className="text-white">Actionable Next Steps</CardTitle>
                                        <CardDescription>Fix these to boost your score to 85+.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {[
                                            { title: "Add README to 'algorithm-visualizer'", desc: "Explain setup, features, and tech stack.", impact: "High" },
                                            { title: "Archive obsolete repositories", desc: "Hide 'hello-world' and 'temp' repos to clean up profile.", impact: "Medium" },
                                            { title: "Pin your best 3 projects", desc: "Guide recruiters to your best work immediately.", impact: "High" }
                                        ].map((step, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm border border-blue-500/30">
                                                        {i + 1}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-200">{step.title}</div>
                                                        <div className="text-xs text-muted-foreground">{step.desc}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <Badge variant="secondary" className="bg-white/10 text-white font-normal">
                                                        {step.impact} Impact
                                                    </Badge>
                                                    <Button size="icon" variant="ghost" className="text-muted-foreground group-hover:text-white">
                                                        <ArrowRight className="w-5 h-5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                {/* Activity Pulse - Consistency Metric */}
                                <Card className="bg-[#0e0e11] border-white/5 pt-6">
                                    <CardContent>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="text-sm font-medium text-muted-foreground">Consistency Analysis</div>
                                            <Badge variant="outline" className="text-yellow-400 border-yellow-500/20 bg-yellow-500/10">Needs Improvement</Badge>
                                        </div>
                                        <div className="h-24 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={waveformData}>
                                                    <defs>
                                                        <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                                                            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <Area
                                                        type="monotone"
                                                        dataKey="value"
                                                        stroke="#22d3ee"
                                                        strokeWidth={2}
                                                        fillOpacity={1}
                                                        fill="url(#colorWave)"
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                            </div>


                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </DashboardLayout>
    );
}
