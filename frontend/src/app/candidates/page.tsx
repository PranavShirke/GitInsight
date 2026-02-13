
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Trash2, Search, ArrowRight, ExternalLink
} from "lucide-react";
import AddCandidateDialog from "@/components/candidates/AddCandidateDialog";
import ExcelImport from "@/components/candidates/ExcelImport";

export default function CandidatesPage() {
    const router = useRouter();
    const [candidates, setCandidates] = useState<any[]>([]);
    const [search, setSearch] = useState("");

    // Load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("gitintel_candidates");
        if (saved) {
            try {
                setCandidates(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load candidates", e);
            }
        }
    }, []);

    // Save to localStorage whenever candidates change
    useEffect(() => {
        if (candidates.length > 0) {
            localStorage.setItem("gitintel_candidates", JSON.stringify(candidates));
        }
    }, [candidates]);

    const handleAdd = (candidate: any) => {
        setCandidates(prev => [candidate, ...prev]);
    };

    const handleImport = (imported: any[]) => {
        setCandidates(prev => [...imported, ...prev]);
    };

    const handleDelete = (id: string) => {
        const updated = candidates.filter(c => c.id !== id);
        setCandidates(updated);
        localStorage.setItem("gitintel_candidates", JSON.stringify(updated));
    };

    const handleAnalyze = (candidate: any) => {
        // Set recruiter context for this candidate
        const context = {
            company: "Your Company", // Default, or fetch from settings?
            jobRole: candidate.role,
            experience: candidate.experience || "Mid-Level",
            description: `Analyzing fit for ${candidate.role}`
        };
        localStorage.setItem("gitintel_recruiter_context", JSON.stringify(context));

        // Set target username
        localStorage.setItem("gitintel_username", candidate.github);

        // Redirect
        router.push("/analytics");
    };

    const filtered = candidates.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.github.toLowerCase().includes(search.toLowerCase()) ||
        c.role.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 h-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Candidate Pipeline</h1>
                    <p className="text-muted-foreground mt-1">Manage and screen potential hires.</p>
                </div>
                <div className="flex items-center gap-3">
                    <ExcelImport onImport={handleImport} />
                    <AddCandidateDialog onAdd={handleAdd} />
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                    <input
                        placeholder="Search candidates..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyber-purple/50"
                    />
                </div>
            </div>

            {/* List */}
            <div className="grid gap-4">
                {filtered.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
                        <h3 className="text-lg font-medium text-white">No candidates found</h3>
                        <p className="text-muted-foreground text-sm">Add a candidate or import a list to get started.</p>
                    </div>
                ) : (
                    filtered.map((candidate) => (
                        <Card key={candidate.id} className="bg-white/5 backdrop-blur-md border-white/10 hover:border-white/20 transition-all group">
                            <CardContent className="p-4 flex items-center gap-6">
                                {/* Avatar */}
                                <img
                                    src={`https://github.com/${candidate.github}.png?size=80`}
                                    alt=""
                                    className="w-12 h-12 rounded-full border border-white/10"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                />

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-bold text-white truncate">{candidate.name}</h3>
                                        <Badge variant="secondary" className="bg-white/10 text-xs font-mono">
                                            {candidate.role}
                                        </Badge>
                                        {candidate.score && (
                                            <Badge className={candidate.score >= 70 ? "bg-emerald-500/20 text-emerald-400" : "bg-yellow-500/20 text-yellow-400"}>
                                                Match: {candidate.score}%
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <ExternalLink className="w-3 h-3" />
                                            <a href={`https://github.com/${candidate.github}`} target="_blank" className="hover:text-cyber-purple transition-colors">
                                                @{candidate.github}
                                            </a>
                                        </div>
                                        <span>Added {candidate.addedAt ? new Date(candidate.addedAt).toLocaleDateString() : 'Recently'}</span>
                                        <span className="capitalize px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                                            {candidate.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        size="sm"
                                        onClick={() => handleAnalyze(candidate)}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                                    >
                                        Analyze <ArrowRight className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleDelete(candidate.id)}
                                        className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
