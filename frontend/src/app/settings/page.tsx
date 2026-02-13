"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Github, Save, Trash2, Moon, Sun, Bell, BellOff,
    Globe, Shield, Palette, KeyRound, CheckCircle2, ExternalLink,
    Key, Target, Activity, Brain
} from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
    const [username, setUsername] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [savedUsername, setSavedUsername] = useState("");
    const [apiUrl, setApiUrl] = useState("http://localhost:5000");
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(true);
    const [saved, setSaved] = useState(false);
    const [difficulty, setDifficulty] = useState("medium");
    const [strictness, setStrictness] = useState("normal");

    useEffect(() => {
        const stored = localStorage.getItem("gitintel_username") || "";
        const storedApi = localStorage.getItem("gitintel_api_url") || "http://localhost:5000";
        const storedNotifs = localStorage.getItem("gitintel_notifications");
        setUsername(stored);
        setSavedUsername(stored);
        setApiUrl(storedApi);
        if (storedNotifs !== null) setNotifications(storedNotifs === "true");

        const savedDiff = localStorage.getItem("gitintel_difficulty");
        if (savedDiff) setDifficulty(savedDiff);

        const savedStrict = localStorage.getItem("gitintel_strictness");
        if (savedStrict) setStrictness(savedStrict);
    }, []);

    const handleSaveProfile = () => {
        const parsed = username.replace(/https?:\/\/github\.com\//i, "").replace(/\/.*$/, "").trim();
        if (parsed) {
            localStorage.setItem("gitintel_username", parsed);
            setUsername(parsed);
            setSavedUsername(parsed);
            flashSaved();
        }
    };

    const handleClearProfile = () => {
        localStorage.removeItem("gitintel_username");
        setUsername("");
        setSavedUsername("");
    };

    const handleSavePreferences = () => {
        localStorage.setItem("gitintel_api_url", apiUrl);
        localStorage.setItem("gitintel_notifications", String(notifications));
        localStorage.setItem("gitintel_difficulty", difficulty);
        localStorage.setItem("gitintel_strictness", strictness);
        flashSaved();
    };

    const flashSaved = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-8 max-w-3xl">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your profile, preferences, and configuration.</p>
            </div>

            {/* Save Toast */}
            {saved && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 backdrop-blur-md shadow-lg"
                >
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Settings saved</span>
                </motion.div>
            )}

            {/* GitHub Profile */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <Github className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-white text-lg">GitHub Profile</CardTitle>
                            <CardDescription>The username used for all Dashboard and Analytics analysis.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-muted-foreground">
                                <Github className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                placeholder="github.com/username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSaveProfile()}
                                className="w-full h-12 pl-11 pr-4 rounded-xl bg-black/20 border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyber-purple/50"
                            />
                        </div>
                        <Button
                            onClick={handleSaveProfile}
                            disabled={!username.trim()}
                            className="h-12 px-6 bg-gradient-to-r from-cyber-purple to-blue-600 hover:from-cyber-purple/80 hover:to-blue-600/80 rounded-xl"
                        >
                            <Save className="w-4 h-4 mr-2" /> Save
                        </Button>
                    </div>

                    {savedUsername && (
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="flex items-center gap-3">
                                <img
                                    src={`https://github.com/${savedUsername}.png?size=80`}
                                    alt=""
                                    className="w-10 h-10 rounded-full border border-white/10"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                />
                                <div>
                                    <div className="text-sm font-medium text-white font-mono">@{savedUsername}</div>
                                    <div className="text-xs text-muted-foreground">Active profile</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={`https://github.com/${savedUsername}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-white transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={handleClearProfile}
                                    className="text-muted-foreground hover:text-red-400 h-8 w-8"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Appearance */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <Palette className="w-5 h-5 text-cyber-purple" />
                        </div>
                        <div>
                            <CardTitle className="text-white text-lg">Appearance</CardTitle>
                            <CardDescription>Customize your visual experience.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Theme */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3">
                            {darkMode ? <Moon className="w-5 h-5 text-cyber-purple" /> : <Sun className="w-5 h-5 text-yellow-400" />}
                            <div>
                                <div className="text-sm font-medium text-white">Theme</div>
                                <div className="text-xs text-muted-foreground">Currently using Deep Space (dark) theme</div>
                            </div>
                        </div>
                        <Badge variant="outline" className="border-cyber-purple/30 text-cyber-purple bg-cyber-purple/10">
                            Dark Mode
                        </Badge>
                    </div>

                    {/* Notifications */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3">
                            {notifications ? <Bell className="w-5 h-5 text-blue-400" /> : <BellOff className="w-5 h-5 text-muted-foreground" />}
                            <div>
                                <div className="text-sm font-medium text-white">Notifications</div>
                                <div className="text-xs text-muted-foreground">Analysis completion alerts</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setNotifications(!notifications)}
                            className={`relative w-12 h-7 rounded-full transition-colors ${notifications ? "bg-cyber-purple" : "bg-white/10"}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${notifications ? "left-6" : "left-1"}`} />
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* API Configuration */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <Globe className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <CardTitle className="text-white text-lg">API Configuration</CardTitle>
                            <CardDescription>Backend server URL for analysis requests.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="http://localhost:5000"
                            value={apiUrl}
                            onChange={(e) => setApiUrl(e.target.value)}
                            className="flex-1 h-12 px-4 rounded-xl bg-black/20 border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono text-sm"
                        />
                        <Button
                            onClick={handleSavePreferences}
                            variant="outline"
                            className="h-12 px-6 border-white/10 text-white hover:bg-white/5 rounded-xl"
                        >
                            <Save className="w-4 h-4 mr-2" /> Save
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Make sure the backend is running before analyzing. Default: <code className="text-white/60">http://localhost:5000</code>
                    </p>
                </CardContent>
            </Card>

            {/* Evaluation Criteria */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <Target className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <CardTitle className="text-white text-lg">Evaluation Criteria</CardTitle>
                            <CardDescription>Tune how candidates are scored.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Scoring Difficulty */}
                    <div className="space-y-4">
                        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-emerald-400" /> Scoring Difficulty
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {['easy', 'medium', 'hard'].map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setDifficulty(level)}
                                    className={`px-4 py-3 rounded-xl border capitalize text-sm font-medium transition-all ${difficulty === level
                                            ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                                            : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                                        }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {difficulty === 'easy' && "Boosts scores slightly. Good for junior roles."}
                            {difficulty === 'medium' && "Standard scoring. Balanced for most roles."}
                            {difficulty === 'hard' && "Strict penalties. Best for senior/lead roles."}
                        </p>
                    </div>

                    <div className="h-px bg-white/10" />

                    {/* AI Strictness */}
                    <div className="space-y-4">
                        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                            <Brain className="w-4 h-4 text-blue-400" /> AI Analysis Strictness
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {['lenient', 'normal', 'strict'].map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setStrictness(level)}
                                    className={`px-4 py-3 rounded-xl border capitalize text-sm font-medium transition-all ${strictness === level
                                            ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                                            : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                                        }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {strictness === 'lenient' && "Optimistic analysis. Highlights potential."}
                            {strictness === 'normal' && "Balanced framing. Neutral tone."}
                            {strictness === 'strict' && "Critical analysis. Highlights every gap."}
                        </p>
                    </div>

                    <Button
                        onClick={handleSavePreferences}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
                    >
                        Save Settings
                    </Button>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="bg-red-500/5 backdrop-blur-md border-red-500/20">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <CardTitle className="text-red-400 text-lg">Danger Zone</CardTitle>
                            <CardDescription>Irreversible actions.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                        <div>
                            <div className="text-sm font-medium text-white">Clear All Data</div>
                            <div className="text-xs text-muted-foreground">Remove all saved settings and cached analysis from localStorage.</div>
                        </div>
                        <Button
                            variant="outline"
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl"
                            onClick={() => {
                                localStorage.clear();
                                setUsername("");
                                setSavedUsername("");
                                setApiUrl("http://localhost:5000");
                                setNotifications(true);
                                flashSaved();
                            }}
                        >
                            <Trash2 className="w-4 h-4 mr-2" /> Clear All
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
