"use client";

import { useState, useEffect } from "react";
import { Github, Sparkles, RefreshCw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import VitalSignsWidget from "@/components/dashboard/VitalSignsWidget";
import VelocityHeatmap from "@/components/dashboard/VelocityHeatmap";
import LanguageDNA from "@/components/dashboard/LanguageDNA";
import ReadmeScoreWidget from "@/components/dashboard/ReadmeScoreWidget";
import GhostCodeWidget from "@/components/dashboard/GhostCodeWidget";

const API_URL = "http://localhost:5000/api/analyze-all";

export default function DashboardPage() {
    const [username, setUsername] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState("");
    const [aiScore, setAiScore] = useState<any>(null);
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        const savedUser = localStorage.getItem("gitintel_username");
        const savedData = localStorage.getItem("gitintel_data");

        if (savedUser) {
            setUsername(savedUser);

            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    // Validate that the saved data belongs to the saved user
                    if (parsed.profile?.login?.toLowerCase() === savedUser.toLowerCase()) {
                        setData(parsed);
                        if (parsed.aiAnalysis) {
                            setAiScore(parsed.aiAnalysis);
                        }
                        return; // Skip fetch if we have valid persisted data
                    }
                } catch (e) {
                    console.error("Failed to parse saved dashboard data", e);
                }
            }

            // Fallback to fetch if no valid data found
            fetchData(savedUser);
        }
    }, []);

    const fetchData = async (user: string) => {
        setLoading(true);
        setError("");
        setAiScore(null);
        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: user }),
            });
            if (!res.ok) throw new Error("Analysis failed");
            const result = await res.json();
            setData(result);
            if (result.aiAnalysis) {
                setAiScore(result.aiAnalysis);
            }
            localStorage.setItem("gitintel_username", user);
            // Store data for analytics page
            localStorage.setItem("gitintel_data", JSON.stringify(result));
        } catch (err: any) {
            setError(err.message || "Failed to analyze");
        } finally {
            setLoading(false);
        }
    };

    const generateAiScore = async () => {
        setAiLoading(true);
        try {
            const res = await fetch(`${API_URL}/ai-profile`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username }),
            });
            if (res.ok) {
                const result = await res.json();
                setAiScore(result);
                // Store for analytics page
                const stored = JSON.parse(localStorage.getItem("gitintel_data") || "{}");
                stored.aiAnalysis = result;
                localStorage.setItem("gitintel_data", JSON.stringify(stored));
            }
        } catch (err) { console.error(err); }
        finally { setAiLoading(false); }
    };

    const handleAnalyze = () => {
        const parsed = username.replace(/https?:\/\/github\.com\//i, "").replace(/\/.*$/, "").trim();
        if (!parsed) return;
        setUsername(parsed);
        fetchData(parsed);
    };

    return (
        <div className="space-y-8 min-h-[calc(100vh-140px)]">
            <AnimatePresence mode="wait">
                {!data && !loading ? (
                    <motion.div
                        key="input"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col items-center justify-center h-[65vh] text-center max-w-2xl mx-auto"
                    >
                        <div className="p-4 rounded-full bg-white/5 mb-8 border border-white/10 shadow-[0_0_50px_rgba(139,92,246,0.15)]">
                            <Github className="w-16 h-16 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold mb-4 text-white">Enter GitHub Profile</h2>
                        <p className="text-muted-foreground mb-8 text-lg">
                            We&apos;ll scan repos, commits, docs, and code quality to generate your telemetry dashboard.
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
                                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                                className="w-full h-16 pl-12 pr-36 rounded-2xl bg-[#0e0e11] border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyber-purple/50 transition-all text-lg shadow-xl"
                            />
                            <Button
                                className="absolute right-2 top-2 bottom-2 rounded-xl bg-gradient-to-r from-cyber-purple to-blue-600 hover:from-cyber-purple/80 hover:to-blue-600/80 px-8 font-bold text-md transition-all shadow-lg shadow-cyber-purple/20"
                                onClick={handleAnalyze}
                                disabled={loading || !username}
                            >
                                {loading ? "Scanning..." : "Analyze"}
                            </Button>
                        </div>

                        {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
                    </motion.div>
                ) : loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center h-[65vh]"
                    >
                        <div className="w-16 h-16 border-4 border-cyber-purple/30 border-t-cyber-purple rounded-full animate-spin" />
                        <p className="text-muted-foreground mt-6 text-lg">Analyzing <span className="text-white font-mono">@{username}</span>...</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                {data.profile?.avatarUrl && (
                                    <img src={data.profile.avatarUrl} className="w-12 h-12 rounded-full border border-white/10" alt="" />
                                )}
                                <div>
                                    <h1 className="text-2xl font-bold text-white">{data.profile?.name || data.profile?.login}</h1>
                                    <p className="text-muted-foreground text-sm">{data.profile?.bio || "No bio"}</p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                className="border-white/10 hover:bg-white/5 text-white"
                                onClick={() => { setData(null); setUsername(""); setAiScore(null); localStorage.removeItem("gitintel_username"); localStorage.removeItem("gitintel_data"); }}
                            >
                                Analyze Another
                            </Button>
                        </div>

                        {/* AI Profile Score — On Demand */}
                        {aiScore ? (
                            <div className="relative group/score">
                                <div className="flex items-center gap-6 p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
                                    <div className="text-center">
                                        <div className={`text-5xl font-black font-mono ${(aiScore.overallScore ?? aiScore.engineeringScore ?? 0) >= 70 ? "text-emerald-400" :
                                            (aiScore.overallScore ?? aiScore.engineeringScore ?? 0) >= 45 ? "text-yellow-400" : "text-red-400"
                                            }`}>
                                            {aiScore.overallScore ?? aiScore.engineeringScore ?? "—"}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">Profile Score</div>
                                    </div>
                                    <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{
                                                width: `${aiScore.overallScore ?? aiScore.engineeringScore ?? 0}%`,
                                                background: (aiScore.overallScore ?? aiScore.engineeringScore ?? 0) >= 70
                                                    ? "linear-gradient(90deg, #22c55e, #10b981)"
                                                    : (aiScore.overallScore ?? aiScore.engineeringScore ?? 0) >= 45
                                                        ? "linear-gradient(90deg, #eab308, #f59e0b)"
                                                        : "linear-gradient(90deg, #ef4444, #f87171)"
                                            }}
                                        />
                                    </div>
                                    <div className="text-sm text-muted-foreground max-w-xs">
                                        AI-assessed composite score based on code quality, consistency, documentation, and community impact.
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => { setAiScore(null); generateAiScore(); }}
                                    className="absolute top-4 right-4 opacity-0 group-hover/score:opacity-100 transition-opacity text-muted-foreground hover:text-white hover:bg-white/10"
                                    title="Regenerate Score"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <button
                                onClick={generateAiScore}
                                disabled={aiLoading}
                                className="w-full flex items-center justify-center gap-3 p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-dashed border-white/10 hover:border-cyber-purple/40 hover:bg-white/[0.07] transition-all group"
                            >
                                {aiLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-cyber-purple/30 border-t-cyber-purple rounded-full animate-spin" />
                                        <span className="text-muted-foreground">Generating AI Profile Score...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5 text-cyber-purple group-hover:scale-110 transition-transform" />
                                        <span className="text-muted-foreground group-hover:text-white transition-colors">Generate AI Profile Score</span>
                                    </>
                                )}
                            </button>
                        )}

                        {/* Bento Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-3">
                                <VitalSignsWidget vitals={data.vitals} />
                            </div>

                            <div className="lg:col-span-2">
                                <VelocityHeatmap
                                    data={data.heatmapData}
                                    totalContributions={data.heatmapData?.reduce((a: number, d: any) => a + d.count, 0)}
                                />
                            </div>
                            <div className="lg:col-span-1">
                                <LanguageDNA languages={data.languages} primaryStack={data.primaryStack} />
                            </div>

                            <div className="lg:col-span-1">
                                <ReadmeScoreWidget
                                    score={data.readmeScore?.score ?? null}
                                    feedback={data.readmeScore?.feedback ?? null}
                                />
                            </div>
                            <div className="lg:col-span-2">
                                <GhostCodeWidget ghostCode={data.ghostCode} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
