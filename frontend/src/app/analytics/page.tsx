"use client";

import { useState, useEffect, useCallback } from "react";
import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    FileSearch, Brain, GitBranch, Gauge, ListChecks,
    Upload, CheckCircle2, XCircle, AlertTriangle,
    ChevronRight, Trash2, RefreshCw, FileText, Briefcase, ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import RecruiterReport from "@/components/analytics/RecruiterReport";
import RecruiterOnboarding from "@/components/RecruiterOnboarding";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

const API_BASE = "http://localhost:5000/api/analyze-all";

type Tab = "resume" | "swot" | "repo" | "hiring" | "tickets";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "resume", label: "Resume Truth Bridge", icon: <FileSearch className="w-4 h-4" /> },
    { id: "swot", label: "SWOT Analysis", icon: <Brain className="w-4 h-4" /> },
    { id: "repo", label: "Repo Audit", icon: <GitBranch className="w-4 h-4" /> },
    { id: "hiring", label: "Hiring Forecaster", icon: <Gauge className="w-4 h-4" /> },
    { id: "tickets", label: "Action Tickets", icon: <ListChecks className="w-4 h-4" /> },
];

export default function AnalyticsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("resume");
    const [profileData, setProfileData] = useState<any>(null);
    const [username, setUsername] = useState("");
    const [swotData, setSwotData] = useState<any>(null);
    const [aiAnalysis, setAiAnalysis] = useState<any>(null);

    // Recruiter Mode State
    const [recruiterContext, setRecruiterContext] = useState<any>(null);
    const [recruiterAnalysis, setRecruiterAnalysis] = useState<any>(null);
    const [repoAuditData, setRepoAuditData] = useState<any>(null);
    const [showReport, setShowReport] = useState(false);

    const refreshRecruiterContext = useCallback(() => {
        const rCtx = localStorage.getItem("gitintel_recruiter_context");
        if (rCtx) {
            setRecruiterContext(JSON.parse(rCtx));
        } else {
            setRecruiterContext(null);
            setRecruiterAnalysis(null);
        }
    }, []);

    useEffect(() => {
        const saved = localStorage.getItem("gitintel_username");
        if (saved) {
            setUsername(saved);
            fetchProfile(saved);
        }

        refreshRecruiterContext();

        // Load persisted AI data
        const savedData = localStorage.getItem("gitintel_data");
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (parsed.swot) setSwotData(parsed.swot);
                if (parsed.aiAnalysis) setAiAnalysis(parsed.aiAnalysis);
            } catch (e) {
                console.error("Failed to parse saved data", e);
            }
        }
    }, [refreshRecruiterContext]);

    const handleSwotGenerated = (data: any) => {
        setSwotData(data);
        const saved = JSON.parse(localStorage.getItem("gitintel_data") || "{}");
        saved.swot = data;
        localStorage.setItem("gitintel_data", JSON.stringify(saved));
    };

    const handleTicketsGenerated = (data: any) => {
        setAiAnalysis(data);
        const saved = JSON.parse(localStorage.getItem("gitintel_data") || "{}");
        saved.aiAnalysis = data;
        localStorage.setItem("gitintel_data", JSON.stringify(saved));
    };

    const fetchProfile = async (user: string) => {
        try {
            // Get user preferences
            const difficulty = localStorage.getItem("gitintel_difficulty") || "medium";
            const strictness = localStorage.getItem("gitintel_strictness") || "normal";

            const res = await fetch(API_BASE, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: user,
                    difficulty,
                    strictness
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setProfileData(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (showReport) {
        return (
            <RecruiterReport
                userData={profileData}
                recruiterContext={recruiterContext}
                recruiterAnalysis={recruiterAnalysis}
                swotAnalysis={swotData}
                hiringOdds={profileData?.hiringOdds}
                repoAudit={repoAuditData}
                onClose={() => setShowReport(false)}
            />
        );
    }

    if (!username) {
        return (
            <div className="flex flex-col items-center justify-center h-[65vh] text-center">
                <Brain className="w-16 h-16 text-cyber-purple mb-6 opacity-50" />
                <h2 className="text-2xl font-bold text-white mb-3">No Profile Loaded</h2>
                <p className="text-muted-foreground">Go to the <a href="/dashboard" className="text-cyber-purple underline">Dashboard</a> first to analyze a GitHub profile.</p>
            </div>
        );
    }

    return (
        <div className="flex gap-6 min-h-[calc(100vh-140px)]">
            {/* Internal Sidebar Tabs */}
            <div className="w-56 flex-shrink-0 space-y-1">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-4 font-mono">Features</div>
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${activeTab === tab.id
                            ? "bg-cyber-purple/10 text-cyber-purple font-medium border border-cyber-purple/20"
                            : "text-muted-foreground hover:bg-white/5 hover:text-white"
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}

                {/* Recruiter Report Action */}
                {recruiterContext && recruiterAnalysis && (
                    <div className="pt-4 mt-4 border-t border-white/10 px-3">
                        <button
                            onClick={() => setShowReport(true)}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30 hover:bg-white/5 transition-all"
                        >
                            <FileText className="w-4 h-4 text-blue-400" />
                            Generate Report
                        </button>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === "resume" && <ResumeTruthBridge profile={profileData} />}
                        {activeTab === "swot" && (
                            <SWOTReport
                                swotData={swotData}
                                onGenerated={handleSwotGenerated}
                                username={username}
                                profileSummary={profileData ? {
                                    bio: profileData.bio,
                                    repos: profileData.repositories?.nodes?.length,
                                    languages: profileData.repositories?.nodes,
                                    contributions: profileData.contributionsCollection
                                } : null}
                            />
                        )}
                        {activeTab === "repo" && <RepoAudit repos={profileData?.repositories?.nodes} username={username} onAuditComplete={setRepoAuditData} />}
                        {activeTab === "hiring" && (
                            <HiringForecaster
                                hiringOdds={profileData?.hiringOdds}
                                recruiterContext={recruiterContext}
                                setRecruiterContext={setRecruiterContext}
                                recruiterAnalysis={recruiterAnalysis}
                                onAnalysisUpdate={setRecruiterAnalysis}
                                onGenerateReport={() => setShowReport(true)}
                            />
                        )}
                        {activeTab === "tickets" && (
                            <TicketSystem
                                username={username}
                                aiAnalysis={aiAnalysis}
                                onGenerated={handleTicketsGenerated}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

// ─── Feature 1: Resume Viewer (Simplified) ───
function ResumeTruthBridge({ profile }: { profile: any }) {
    const [resumeText, setResumeText] = useState("");
    const [resumeUrl, setResumeUrl] = useState<string | null>(null);
    const [fileType, setFileType] = useState<string>("");

    // File upload handler
    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    }, []);

    const processFile = (file: File) => {
        setFileType(file.type);
        if (file.type === "application/pdf") {
            const url = URL.createObjectURL(file);
            setResumeUrl(url);
            setResumeText("");
        } else {
            setResumeUrl(null);
            const reader = new FileReader();
            reader.onload = (ev) => setResumeText(ev.target?.result as string);
            reader.readAsText(file);
        }
    };

    const handleBrowseClick = () => {
        document.getElementById("resume-upload")?.click();
    };

    return (
        <div className="space-y-4 h-full flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Resume Viewer</h2>
                    <p className="text-muted-foreground">Upload and view candidate resume.</p>
                </div>
                {resumeUrl && (
                    <Button
                        variant="outline"
                        onClick={() => window.open(resumeUrl, '_blank')}
                        className="gap-2 border-cyber-purple/50 text-cyber-purple hover:bg-cyber-purple/10"
                    >
                        <ExternalLink className="w-4 h-4" /> Open in New Tab
                    </Button>
                )}
            </div>

            <Card className="bg-white/5 backdrop-blur-md border-white/10 flex-1 flex flex-col overflow-hidden">
                <CardContent className="p-0 flex flex-col h-full">
                    {/* Top Bar: Upload */}
                    <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-4">
                        <div
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            onClick={handleBrowseClick}
                            className="flex-1 border border-dashed border-white/20 rounded-lg p-3 flex items-center justify-center gap-3 hover:bg-white/5 cursor-pointer transition-colors"
                        >
                            <Upload className="w-5 h-5 text-muted-foreground" />
                            <span className="text-sm text-gray-300">Click to upload or drag resume (PDF/Text)</span>
                            <input type="file" accept=".txt,.pdf,.doc,.docx" onChange={handleFile} className="hidden" id="resume-upload" />
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 bg-black/20 relative min-h-[600px]">
                        {resumeUrl && fileType === "application/pdf" ? (
                            <embed
                                src={resumeUrl}
                                type="application/pdf"
                                className="w-full h-full absolute inset-0 block"
                            />
                        ) : resumeText ? (
                            <textarea
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                                className="w-full h-full bg-transparent p-6 text-sm text-gray-300 font-mono resize-none focus:outline-none"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2 opacity-50">
                                <FileText className="w-16 h-16" />
                                <p>No document loaded</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// ─── Feature 2: SWOT Report ───
function SWOTReport({ username, profileSummary, swotData, onGenerated }: { username: string; profileSummary: any; swotData: any; onGenerated: (data: any) => void }) {
    const swot = swotData; // Alias for internal use
    const [loading, setLoading] = useState(false);

    const generateSwot = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/swot`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username }),
            });
            if (res.ok) onGenerated(await res.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    if (!swot) {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Deep Profile Analysis</h2>
                    <p className="text-muted-foreground">AI-generated SWOT analysis for <span className="text-white font-mono">@{username}</span></p>
                </div>
                <button
                    onClick={generateSwot}
                    disabled={loading}
                    className="w-full flex flex-col items-center justify-center gap-4 p-12 rounded-2xl bg-white/5 backdrop-blur-md border border-dashed border-white/10 hover:border-cyber-purple/40 hover:bg-white/[0.07] transition-all group"
                >
                    {loading ? (
                        <>
                            <div className="w-8 h-8 border-3 border-cyber-purple/30 border-t-cyber-purple rounded-full animate-spin" />
                            <span className="text-muted-foreground">Generating SWOT Analysis...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-8 h-8 text-cyber-purple group-hover:scale-110 transition-transform" />
                            <span className="text-lg text-muted-foreground group-hover:text-white transition-colors">Generate SWOT Analysis</span>
                            <span className="text-xs text-muted-foreground/60">Uses AI to deeply analyze strengths, weaknesses, opportunities, and threats</span>
                        </>
                    )}
                </button>
            </div>
        );
    }

    const sections = [
        { title: "Strengths", items: swot.strengths, color: "emerald", icon: "💪" },
        { title: "Weaknesses", items: swot.weaknesses, color: "red", icon: "⚠️" },
        { title: "Opportunities", items: swot.opportunities, color: "blue", icon: "🚀" },
        { title: "Threats", items: swot.threats, color: "orange", icon: "🔥" },
    ];

    const scoreColor = (swot.profileScore ?? 0) >= 70 ? "text-emerald-400" : (swot.profileScore ?? 0) >= 45 ? "text-yellow-400" : "text-red-400";
    const tierColors: Record<string, string> = {
        "Elite": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        "Strong": "bg-blue-500/20 text-blue-300 border-blue-500/30",
        "Promising": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
        "Developing": "bg-orange-500/20 text-orange-300 border-orange-500/30",
        "Needs Work": "bg-red-500/20 text-red-300 border-red-500/30",
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-white">Deep Profile Analysis</h2>
                    <p className="text-muted-foreground">AI-generated SWOT analysis for <span className="text-white font-mono">@{username}</span></p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { onGenerated(null); generateSwot(); }}
                    className="gap-2 border-white/10 text-muted-foreground hover:text-white"
                >
                    <RefreshCw className="w-4 h-4" /> Regenerate
                </Button>
            </div>

            {/* Profile Score Hero */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">
                    <div className="text-center">
                        <div className={`text-6xl font-black font-mono ${scoreColor}`}>
                            {swot.profileScore ?? "—"}
                        </div>
                        <div className="text-muted-foreground mt-1 text-sm">Profile Score</div>
                        {swot.profileTier && (
                            <Badge className={`mt-2 ${tierColors[swot.profileTier] || "bg-white/10 text-white"}`}>
                                {swot.profileTier}
                            </Badge>
                        )}
                    </div>
                    <div className="flex-1 space-y-3">
                        <div>
                            <div className="text-xs text-muted-foreground uppercase mb-1">First Impression</div>
                            <p className="text-gray-300 text-sm">{swot.firstImpression}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Detailed Insights Grid */}
            <div className="grid md:grid-cols-2 gap-4">
                {[
                    { label: "Code Quality", value: swot.codeQuality, icon: "🔧" },
                    { label: "Documentation Habits", value: swot.documentationHabits, icon: "📝" },
                    { label: "Career Trajectory", value: swot.careerTrajectory, icon: "📈" },
                    { label: "Interview Readiness", value: swot.interviewReadiness, icon: "🎯" },
                ].filter(p => p.value).map((panel, i) => (
                    <Card key={i} className="bg-white/5 backdrop-blur-md border-white/10">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <span>{panel.icon}</span>
                                <span className="text-xs text-muted-foreground uppercase font-semibold">{panel.label}</span>
                            </div>
                            <p className="text-sm text-gray-300 leading-relaxed">{panel.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* SWOT Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {sections.map((section) => (
                    <Card key={section.title} className={`bg-white/5 backdrop-blur-md border-${section.color}-500/20`}>
                        <CardHeader>
                            <CardTitle className={`text-${section.color}-400 flex items-center gap-2`}>
                                <span>{section.icon}</span> {section.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {(section.items || []).map((item: string, i: number) => (
                                <div key={i} className={`flex items-start gap-2 p-2 rounded-lg bg-${section.color}-500/5`}>
                                    <ChevronRight className={`w-4 h-4 mt-0.5 text-${section.color}-400 flex-shrink-0`} />
                                    <span className="text-sm text-gray-300">{item}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

// ─── Feature 3: Repo Audit ───
function RepoAudit({ repos, username, onAuditComplete }: { repos: any[]; username: string; onAuditComplete?: (data: any) => void }) {
    const [selectedRepo, setSelectedRepo] = useState("");
    const [audit, setAudit] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleAudit = async () => {
        if (!selectedRepo) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/repo`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, repoName: selectedRepo }),
            });
            if (res.ok) {
                const data = await res.json();
                setAudit(data);
                if (onAuditComplete) onAuditComplete(data);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const gradeColors: Record<string, string> = {
        A: "text-emerald-400", B: "text-blue-400", C: "text-yellow-400",
        D: "text-orange-400", F: "text-red-400",
    };

    const priorityStyles: Record<string, string> = {
        critical: "border-red-500/30 text-red-400 bg-red-500/10",
        high: "border-orange-500/30 text-orange-400 bg-orange-500/10",
        medium: "border-yellow-500/30 text-yellow-400 bg-yellow-500/10",
        low: "border-white/10 text-muted-foreground",
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white">Repository Deep-Dive Audit</h2>
                <p className="text-muted-foreground">Select a repository to get a detailed quality grade with actionable feedback.</p>
            </div>

            <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardContent className="p-6">
                    <div className="flex gap-4">
                        <select
                            value={selectedRepo}
                            onChange={(e) => setSelectedRepo(e.target.value)}
                            className="flex-1 h-12 bg-black/20 border border-white/10 rounded-xl text-white px-4 focus:outline-none focus:ring-2 focus:ring-cyber-purple/50"
                        >
                            <option value="">Select a repository...</option>
                            {(repos || []).map((r: any, i: number) => (
                                <option key={`${r.name}-${i}`} value={r.name}>{r.name} — ⭐{r.stars}</option>
                            ))}
                        </select>
                        <Button
                            onClick={handleAudit}
                            disabled={!selectedRepo || loading}
                            className="bg-gradient-to-r from-cyber-purple to-blue-600"
                        >
                            {loading ? "Auditing..." : "Audit"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {audit && (
                <div className="space-y-6">
                    {/* Grade + Summary */}
                    <Card className="bg-white/5 backdrop-blur-md border-white/10">
                        <CardContent className="p-8 flex items-start gap-8">
                            <div className={`text-7xl font-black font-mono ${gradeColors[audit.grade] || "text-gray-400"}`}>
                                {audit.grade}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white">{audit.repo}</h3>
                                <p className="text-muted-foreground mt-1">{audit.summary}</p>
                                {audit.gradeExplanation && (
                                    <p className="text-sm text-gray-400 mt-2 italic">{audit.gradeExplanation}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Technical Debt + Production Readiness */}
                    {(audit.technicalDebt || audit.productionReadiness) && (
                        <div className="grid md:grid-cols-2 gap-4">
                            {audit.technicalDebt && (
                                <Card className="bg-white/5 backdrop-blur-md border-yellow-500/20">
                                    <CardContent className="p-5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <AlertTriangle className="w-4 h-4 text-yellow-400" />
                                            <span className="text-xs text-yellow-400 uppercase font-semibold">Technical Debt</span>
                                        </div>
                                        <p className="text-sm text-gray-300 leading-relaxed">{audit.technicalDebt}</p>
                                    </CardContent>
                                </Card>
                            )}
                            {audit.productionReadiness && (
                                <Card className="bg-white/5 backdrop-blur-md border-blue-500/20">
                                    <CardContent className="p-5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Gauge className="w-4 h-4 text-blue-400" />
                                            <span className="text-xs text-blue-400 uppercase font-semibold">Production Readiness</span>
                                        </div>
                                        <p className="text-sm text-gray-300 leading-relaxed">{audit.productionReadiness}</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* Quality Checklist */}
                    <Card className="bg-white/5 backdrop-blur-md border-white/10">
                        <CardHeader><CardTitle className="text-white">Quality Checklist</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            {(audit.checklist || []).map((item: any, i: number) => (
                                <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {item.found
                                                ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                                : <XCircle className="w-5 h-5 text-red-400" />
                                            }
                                            <span className="text-sm text-gray-200 font-medium">{item.item}</span>
                                        </div>
                                        <Badge variant="outline" className={`text-xs ${priorityStyles[item.priority] || priorityStyles.low}`}>
                                            {item.priority}
                                        </Badge>
                                    </div>
                                    {item.detail && (
                                        <p className="text-xs text-muted-foreground mt-2 ml-8">{item.detail}</p>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Recommendations */}
                    {audit.recommendations && audit.recommendations.length > 0 && (
                        <Card className="bg-white/5 backdrop-blur-md border-cyber-purple/20">
                            <CardHeader><CardTitle className="text-cyber-purple flex items-center gap-2">🎯 Next Steps to Improve</CardTitle></CardHeader>
                            <CardContent className="space-y-2">
                                {audit.recommendations.map((rec: string | any, i: number) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-cyber-purple/5">
                                        <span className="text-cyber-purple font-bold font-mono text-sm mt-0.5">{i + 1}.</span>
                                        <div className="flex flex-col gap-1">
                                            {(() => {
                                                if (typeof rec === 'string') return <span className="text-sm text-gray-300">{rec}</span>;
                                                const title = rec.improvement || rec.recommendation || rec.item || rec.title || "Recommendation";
                                                const detail = rec.action || rec.detail || rec.description || "";
                                                return (
                                                    <>
                                                        <span className="text-sm font-medium text-white">{typeof title === 'string' ? title : JSON.stringify(title)}</span>
                                                        {detail && <span className="text-xs text-muted-foreground">{typeof detail === 'string' ? detail : JSON.stringify(detail)}</span>}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Feature 4: Hiring Forecaster ───
function HiringForecaster({
    hiringOdds,
    recruiterContext,
    setRecruiterContext,
    recruiterAnalysis,
    onAnalysisUpdate,
    onGenerateReport
}: {
    hiringOdds: any;
    recruiterContext: any;
    setRecruiterContext: (ctx: any) => void;
    recruiterAnalysis: any;
    onAnalysisUpdate?: (data: any) => void;
    onGenerateReport?: () => void;
}) {
    const [activeRole, setActiveRole] = useState<"senior" | "junior">("senior");
    const [loadingAnalysis, setLoadingAnalysis] = useState(false);

    const fetchRecruiterAnalysis = async (ctx: any) => {
        const username = localStorage.getItem("gitintel_username");
        if (!username || !ctx) return;

        setLoadingAnalysis(true);
        try {
            const strictness = localStorage.getItem("gitintel_strictness") || "normal";

            const res = await fetch(`${API_BASE}/match-role`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,
                    ...ctx,
                    strictness
                }),
            });
            if (res.ok) {
                const data = await res.json();
                if (onAnalysisUpdate) onAnalysisUpdate(data);
            }
        } catch (err) { console.error(err); }
        finally { setLoadingAnalysis(false); }
    };

    const getGaugeColor = (s: number) => {
        if (s < 40) return "#ef4444";
        if (s < 70) return "#eab308";
        return "#22c55e";
    };

    const getGaugeTextColor = (s: number) => {
        if (s < 40) return "text-red-400";
        if (s < 70) return "text-yellow-400";
        return "text-emerald-400";
    };

    // Support both new nested format and legacy flat format
    const roleData = hiringOdds?.[activeRole] || hiringOdds || {};
    const score = roleData.score ?? hiringOdds?.score ?? 0;
    const bottleneck = roleData.bottleneck ?? hiringOdds?.bottleneck ?? "Load a profile first";
    const consistencyVal = roleData.consistencyComponent ?? hiringOdds?.consistencyComponent ?? 0;
    const complexityVal = roleData.complexityComponent ?? hiringOdds?.complexityComponent ?? 0;
    const impactVal = roleData.impactComponent ?? hiringOdds?.impactComponent ?? 0;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Hiring Probability Forecaster</h2>
                    <p className="text-muted-foreground">How your GitHub profile compares for different engineering roles.</p>
                </div>
                {!recruiterContext && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2 border-purple-500/30 text-purple-300 hover:bg-purple-500/10">
                                <Briefcase className="w-4 h-4" /> Enter Recruiter Mode
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="p-0 border-none bg-transparent max-w-2xl">
                            <RecruiterOnboarding onFinish={() => {
                                const ctx = localStorage.getItem("gitintel_recruiter_context");
                                if (ctx) {
                                    const parsed = JSON.parse(ctx);
                                    setRecruiterContext(parsed);
                                    fetchRecruiterAnalysis(parsed);
                                }
                            }} />
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Recruiter Context Alert */}
            {recruiterContext && (
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
                    <div>
                        <h3 className="text-purple-400 font-bold flex items-center gap-2">
                            Reviewing for {recruiterContext.company}
                        </h3>
                        <p className="text-sm text-gray-400">Role: {recruiterContext.jobRole} ({recruiterContext.experience})</p>
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            localStorage.removeItem("gitintel_recruiter_context");
                            setRecruiterContext(null);
                        }}
                        className="bg-black/20 border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                    >
                        Exit Recruiter Mode
                    </Button>
                </div>
            )}

            {/* Recruiter Analysis Result */}
            {recruiterContext && (
                <Card className="bg-gradient-to-br from-purple-900/20 to-black border-purple-500/30">
                    <CardHeader><CardTitle className="text-white">🎯 Role Fit Analysis</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        {loadingAnalysis ? (
                            <div className="flex items-center justify-center p-8 text-purple-400 animate-pulse">
                                Analyzing candidate fit against {recruiterContext.company} requirements...
                            </div>
                        ) : recruiterAnalysis ? (
                            <div className="space-y-6">
                                <div className="flex items-center gap-6">
                                    <div className={`text-5xl font-black ${getGaugeTextColor(recruiterAnalysis.fitScore)}`}>
                                        {recruiterAnalysis.fitScore}%
                                    </div>
                                    <div>
                                        <h4 className={`text-xl font-bold ${getGaugeTextColor(recruiterAnalysis.fitScore)}`}>{recruiterAnalysis.fitTier}</h4>
                                        <p className="text-sm text-gray-300">{recruiterAnalysis.analysis}</p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                        <h5 className="text-emerald-400 font-bold mb-2 text-sm">MATCHING STRENGTHS</h5>
                                        <ul className="list-disc pl-4 space-y-1">
                                            {recruiterAnalysis.strengths?.map((s: string, i: number) => (
                                                <li key={i} className="text-xs text-gray-300">{s}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/10">
                                        <h5 className="text-red-400 font-bold mb-2 text-sm">CRITICAL GAPS</h5>
                                        <ul className="list-disc pl-4 space-y-1">
                                            {recruiterAnalysis.gaps?.map((s: string, i: number) => (
                                                <li key={i} className="text-xs text-gray-300">{s}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {recruiterAnalysis.interviewQuestion && (
                                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                        <h5 className="text-white font-bold mb-1 text-sm">💡 Recommended Interview Question</h5>
                                        <p className="text-sm text-gray-400 italic">"{recruiterAnalysis.interviewQuestion}"</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center p-4">
                                <Button onClick={() => fetchRecruiterAnalysis(recruiterContext)}>Analyze Fit</Button>
                            </div>
                        )}

                        {/* Generate Report Button */}
                        {recruiterAnalysis && (
                            <div className="pt-4 border-t border-white/10 mt-4 flex justify-end">
                                <Button variant="outline" size="sm" onClick={onGenerateReport} className="gap-2 border-white/10 text-gray-300 hover:text-white">
                                    <FileText className="w-4 h-4" /> View Full Report
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Standard Forecaster (Legacy) */}
            {!recruiterContext && (
                <>
                    {/* Role Toggle */}
                    <div className="flex gap-2">
                        {(["junior", "senior"] as const).map((role) => (
                            <button
                                key={role}
                                onClick={() => setActiveRole(role)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeRole === role
                                    ? "bg-gradient-to-r from-cyber-purple to-blue-600 text-white shadow-lg shadow-cyber-purple/20"
                                    : "bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10 border border-white/5"
                                    }`}
                            >
                                {role === "junior" ? "🌱 Junior Engineer" : "🚀 Senior Engineer"}
                            </button>
                        ))}
                    </div>

                    <Card className="bg-white/5 backdrop-blur-md border-white/10">
                        <CardContent className="p-8">
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                {/* Gauge */}
                                <div className="relative w-56 h-28 flex-shrink-0">
                                    <svg viewBox="0 0 200 100" className="w-full h-full">
                                        <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="#ffffff08" strokeWidth="16" strokeLinecap="round" />
                                        <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke={getGaugeColor(score)} strokeWidth="16" strokeLinecap="round"
                                            strokeDasharray={`${(score / 100) * 283} 283`}
                                            style={{ filter: `drop-shadow(0 0 10px ${getGaugeColor(score)}40)`, transition: "all 0.5s ease" }}
                                        />
                                    </svg>
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                                        <div className={`text-4xl font-black font-mono ${getGaugeTextColor(score)}`}>{score}%</div>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <p className="text-lg text-white font-medium">
                                            <span className={`font-bold ${getGaugeTextColor(score)}`}>{score}%</span> match for {activeRole === "junior" ? "Junior" : "Senior"} Engineer roles
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {activeRole === "junior"
                                                ? "Junior roles prioritize learning trajectory, consistency, and foundational project variety."
                                                : "Senior roles weigh code complexity, architectural depth, and community impact most heavily."
                                            }
                                        </p>
                                    </div>

                                    {/* Bottleneck */}
                                    <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                                        <div className="text-xs text-yellow-400 uppercase mb-1 font-semibold">⚠ Primary Bottleneck</div>
                                        <p className="text-sm text-yellow-200">{bottleneck}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Component Breakdown */}
                            <div className="grid grid-cols-3 gap-4 mt-8">
                                {[
                                    { label: "Consistency", desc: "Weekly commit regularity", score: consistencyVal, weight: activeRole === "junior" ? "40%" : "30%" },
                                    { label: "Code Complexity", desc: "Project depth & diversity", score: complexityVal, weight: activeRole === "junior" ? "30%" : "40%" },
                                    { label: "Community Impact", desc: "Stars, PRs, followers", score: impactVal, weight: "30%" },
                                ].map((item, i) => (
                                    <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <div className="text-xs text-muted-foreground">{item.label}</div>
                                        <div className="text-xs text-muted-foreground/60 mt-0.5">{item.desc}</div>
                                        <div className={`text-2xl font-bold font-mono mt-2 ${getGaugeTextColor(item.score)}`}>{item.score}</div>
                                        <div className="w-full bg-white/5 rounded-full h-1.5 mt-2">
                                            <div className="h-1.5 rounded-full transition-all duration-500"
                                                style={{ width: `${item.score}%`, backgroundColor: getGaugeColor(item.score) }} />
                                        </div>
                                        <div className="text-xs text-muted-foreground/60 mt-1">Weight: {item.weight}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}

// ─── Feature 5: Ticket System ───
function TicketSystem({ username, aiAnalysis, onGenerated }: { username: string; aiAnalysis: any; onGenerated: (data: any) => void }) {
    const [generating, setGenerating] = useState(false);
    const [tickets, setTickets] = useState<{ id: number; text: string; reason: string; priority: string; done: boolean }[]>([]);

    const generateTickets = async () => {
        setGenerating(true);
        try {
            const res = await fetch(`${API_BASE}/ai-profile`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username }),
            });
            if (res.ok) {
                const data = await res.json();
                onGenerated(data);
            }
        } catch (err) { console.error(err); }
        finally { setGenerating(false); }
    };

    useEffect(() => {
        if (!aiAnalysis) return;

        const newTickets: any[] = [];
        let id = 1;

        (aiAnalysis.redFlags || []).forEach((flag: string) => {
            newTickets.push({ id: id++, text: `Fix: ${flag}`, reason: "This is flagged as a red flag that recruiters will notice.", priority: "critical", done: false });
        });

        (aiAnalysis.improvements || []).forEach((imp: any) => {
            if (typeof imp === "string") {
                newTickets.push({ id: id++, text: imp, reason: "", priority: "medium", done: false });
            } else {
                newTickets.push({
                    id: id++,
                    text: imp.action || imp.text || String(imp),
                    reason: imp.reason || "",
                    priority: imp.priority || "medium",
                    done: false
                });
            }
        });

        setTickets(newTickets);
    }, [aiAnalysis]);

    const toggleDone = (id: number) => {
        setTickets(tickets.map(t => t.id === id ? { ...t, done: !t.done } : t));
    };

    const removeTicket = (id: number) => {
        setTickets(tickets.filter(t => t.id !== id));
    };

    if (!aiAnalysis) {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Actionable Tickets</h2>
                    <p className="text-muted-foreground">AI-generated tasks based on red flags and improvement areas.</p>
                </div>
                <button
                    onClick={generateTickets}
                    disabled={generating}
                    className="w-full flex flex-col items-center justify-center gap-4 p-12 rounded-2xl bg-white/5 backdrop-blur-md border border-dashed border-white/10 hover:border-cyber-purple/40 hover:bg-white/[0.07] transition-all group"
                >
                    {generating ? (
                        <>
                            <div className="w-8 h-8 border-3 border-cyber-purple/30 border-t-cyber-purple rounded-full animate-spin" />
                            <span className="text-muted-foreground">Generating Action Tickets...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-8 h-8 text-cyber-purple group-hover:scale-110 transition-transform" />
                            <span className="text-lg text-muted-foreground group-hover:text-white transition-colors">Generate Action Tickets</span>
                            <span className="text-xs text-muted-foreground/60">Uses AI to identify red flags and create improvement tasks</span>
                        </>
                    )}
                </button>
            </div>
        );
    }

    const priorityStyles: Record<string, string> = {
        critical: "border-red-500/30 text-red-400 bg-red-500/10",
        high: "border-orange-500/30 text-orange-400 bg-orange-500/10",
        medium: "border-yellow-500/30 text-yellow-400 bg-yellow-500/10",
        low: "border-white/10 text-muted-foreground",
    };

    const doneCount = tickets.filter(t => t.done).length;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-white">Actionable Tickets</h2>
                    <p className="text-muted-foreground">Red flags and improvements converted into detailed tasks. Check them off as you fix them.</p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { onGenerated(null); generateTickets(); }}
                    className="gap-2 border-white/10 text-muted-foreground hover:text-white"
                >
                    <RefreshCw className="w-4 h-4" /> Regenerate
                </Button>
            </div>

            {/* Progress */}
            {tickets.length > 0 && (
                <div className="flex items-center gap-4">
                    <Progress value={(doneCount / tickets.length) * 100} className="flex-1 h-2" />
                    <span className="text-sm text-muted-foreground font-mono">{doneCount}/{tickets.length}</span>
                </div>
            )}

            <div className="space-y-3">
                {tickets.map((ticket) => (
                    <Card
                        key={ticket.id}
                        className={`backdrop-blur-md border-white/10 transition-all ${ticket.done ? "bg-white/[0.02] opacity-60" : "bg-white/5"
                            }`}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                                <button
                                    onClick={() => toggleDone(ticket.id)}
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${ticket.done
                                        ? "bg-emerald-500 border-emerald-500"
                                        : "border-white/20 hover:border-cyber-purple"
                                        }`}
                                >
                                    {ticket.done && <CheckCircle2 className="w-4 h-4 text-white" />}
                                </button>

                                <div className="flex-1 min-w-0">
                                    <div className={`text-sm font-medium ${ticket.done ? "line-through text-muted-foreground" : "text-gray-200"}`}>
                                        {ticket.text}
                                    </div>
                                    {ticket.reason && !ticket.done && (
                                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                            💡 {ticket.reason}
                                        </p>
                                    )}
                                </div>

                                <Badge variant="outline" className={`text-xs flex-shrink-0 ${priorityStyles[ticket.priority] || priorityStyles.medium}`}>
                                    {ticket.priority}
                                </Badge>

                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => removeTicket(ticket.id)}
                                    className="text-muted-foreground hover:text-red-400 h-8 w-8 flex-shrink-0"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {tickets.length === 0 && (
                    <div className="text-center text-muted-foreground py-12">
                        🎉 No tickets — your profile is looking clean!
                    </div>
                )}
            </div>
        </div>
    );
}
