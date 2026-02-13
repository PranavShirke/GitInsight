"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, Code, User, Building2, Layers } from "lucide-react";

export default function RecruiterOnboarding({ onFinish }: { onFinish?: () => void }) {
    const [step, setStep] = useState<'select' | 'form'>('select');
    const router = useRouter();

    // Form State
    const [company, setCompany] = useState("");
    const [role, setRole] = useState("Frontend Engineer");
    const [stack, setStack] = useState("");
    const [experience, setExperience] = useState("Mid-Level (3-5y)");

    const handleDeveloper = () => {
        localStorage.removeItem("gitintel_recruiter_context");
        if (onFinish) onFinish();
        else router.push("/dashboard");
    }

    const handleRecruiterSubmit = () => {
        const context = { company, jobRole: role, stack, experience };
        localStorage.setItem("gitintel_recruiter_context", JSON.stringify(context));
        if (onFinish) onFinish();
        else router.push("/dashboard");
    }

    if (step === 'select') {
        return (
            <div className="space-y-8 p-8 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl">
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-white">Select Your Mode</h2>
                    <p className="text-muted-foreground">Tailor the analytics to your needs.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={handleDeveloper}
                        className="flex flex-col items-center justify-center gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-blue-500/10 hover:border-blue-500/50 transition-all group"
                    >
                        <div className="p-4 rounded-full bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                            <Code className="w-8 h-8 text-blue-400" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-white">Developer</h3>
                            <p className="text-xs text-muted-foreground mt-1">Analyze my own profile</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setStep('form')}
                        className="flex flex-col items-center justify-center gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-purple-500/10 hover:border-purple-500/50 transition-all group"
                    >
                        <div className="p-4 rounded-full bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                            <Briefcase className="w-8 h-8 text-purple-400" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-white">Recruiter</h3>
                            <p className="text-xs text-muted-foreground mt-1">Evaluate a candidate</p>
                        </div>
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-8 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl">
            <div className="text-center">
                <h2 className="text-xl font-bold text-white">Recruiter Context</h2>
                <p className="text-sm text-muted-foreground">Tell us what you're looking for to get a custom Fit Score.</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-gray-300">Company Name</Label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                        <Input
                            value={company}
                            onChange={e => setCompany(e.target.value)}
                            placeholder="e.g. Acme Corp"
                            className="pl-9 bg-black/20 border-white/10"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-gray-300">Target Role</Label>
                        <select
                            value={role}
                            onChange={e => setRole(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-md h-10 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        >
                            <option>Frontend Engineer</option>
                            <option>Backend Engineer</option>
                            <option>Full Stack Engineer</option>
                            <option>DevOps Engineer</option>
                            <option>Mobile Developer</option>
                            <option>Data Scientist</option>
                            <option>AI/ML Engineer</option>
                            <option>Engineering Manager</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-gray-300">Experience Level</Label>
                        <select
                            value={experience}
                            onChange={e => setExperience(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-md h-10 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        >
                            <option>Intern</option>
                            <option>Junior (1-2y)</option>
                            <option>Mid-Level (3-5y)</option>
                            <option>Senior (5+ y)</option>
                            <option>Principal / Staff</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-gray-300">Primary Tech Stack</Label>
                    <div className="relative">
                        <Layers className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                        <Input
                            value={stack}
                            onChange={e => setStack(e.target.value)}
                            placeholder="e.g. React, Node.js, AWS, Python"
                            className="pl-9 bg-black/20 border-white/10"
                        />
                    </div>
                </div>

                <Button
                    onClick={handleRecruiterSubmit}
                    className="w-full h-12 mt-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-md font-bold"
                    disabled={!company || !stack}
                >
                    Launch Dashboard as Recruiter
                </Button>

                <button
                    onClick={() => setStep('select')}
                    className="w-full text-xs text-muted-foreground hover:text-white transition-colors"
                >
                    Back to Mode Selection
                </button>
            </div>
        </div>
    )
}
