"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Github, Save, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RecruiterSettings() {
    const [url, setUrl] = useState("");
    const [saved, setSaved] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Load saved URL if exists
        const savedUsername = localStorage.getItem("recruiter_target_user");
        if (savedUsername) {
            setUrl(`https://github.com/${savedUsername}`);
        }
    }, []);

    const handleSave = () => {
        // Extract username from URL
        // Supported formats: https://github.com/username, github.com/username, username
        let username = url;
        try {
            if (url.includes("github.com")) {
                const parts = url.split("github.com/");
                if (parts.length > 1) {
                    username = parts[1].split("/")[0];
                }
            }
        } catch (e) {
            console.error("Error parsing URL", e);
        }

        // Clean up username
        username = username.replace(/\/$/, "").replace(/^@/, "");

        if (username) {
            localStorage.setItem("recruiter_target_user", username);
            localStorage.setItem("recruiter_target_url", url);
            setSaved(true);
            setTimeout(() => {
                setSaved(false);
                router.push("/recruiter"); // Redirect to dashboard to see analysis
            }, 1000);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto space-y-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Analysis Configuration</h2>
                    <p className="text-muted-foreground">Setup the target profile for the Recruiter Console.</p>
                </div>

                <Card className="bg-white/5 backdrop-blur-md border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Github className="w-5 h-5 text-gray-400" />
                            Target Profile
                        </CardTitle>
                        <CardDescription>
                            Enter the full GitHub URL of the candidate you want to analyze.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="github-url" className="text-gray-300">GitHub Profile URL</Label>
                            <Input
                                id="github-url"
                                placeholder="https://github.com/torvalds"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-cyber-purple/50"
                            />
                        </div>

                        <div className="pt-4 flex items-center justify-end gap-3">
                            {saved && (
                                <span className="text-green-400 text-sm flex items-center gap-1 animate-in fade-in slide-in-from-right-4">
                                    <CheckCircle2 className="w-4 h-4" /> Analyzed! Redirecting...
                                </span>
                            )}
                            <Button
                                onClick={handleSave}
                                className="bg-gradient-to-r from-cyber-purple to-cyber-pink hover:from-cyber-purple/80 hover:to-cyber-pink/80 text-white border-0 min-w-[120px]"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Analyze
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
                    <h4 className="text-blue-400 font-medium mb-2 text-sm">How it works</h4>
                    <p className="text-sm text-blue-200/70">
                        Entering a URL here basically "locks" the Recruiter Console to this candidate.
                        The dashboard will perform a real-time audit of their READMEs, code hygiene, and commit consistency.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
}
