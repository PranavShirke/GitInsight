"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Code } from "lucide-react";

interface GhostCodeProps {
    ghostCode: {
        configBytes: number;
        codeBytes: number;
        totalBytes: number;
        ghostRatio: number;
        isWarning: boolean;
    } | null;
}

export default function GhostCodeWidget({ ghostCode }: GhostCodeProps) {
    const ratio = ghostCode?.ghostRatio ?? 0;
    const isWarning = ghostCode?.isWarning ?? false;

    return (
        <Card className={`backdrop-blur-md border-white/10 h-full ${isWarning ? 'bg-red-500/5 border-red-500/20' : 'bg-white/5'}`}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Code className="w-5 h-5" /> Ghost Code Detector
                    </CardTitle>
                    {ghostCode && (
                        isWarning
                            ? <AlertTriangle className="w-5 h-5 text-red-400" />
                            : <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {!ghostCode ? (
                    <div className="h-20 flex items-center justify-center text-muted-foreground text-sm">
                        Analyze a profile to detect ghost code
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-end gap-4">
                            <div className="text-4xl font-black font-mono text-white">{ratio}%</div>
                            <div className="text-sm text-muted-foreground pb-1">
                                of code is config/text
                            </div>
                        </div>

                        {/* Ratio bar */}
                        <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden flex">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-cyber-cyan rounded-l-full transition-all duration-700"
                                style={{ width: `${100 - ratio}%` }}
                            />
                            <div
                                className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-r-full transition-all duration-700"
                                style={{ width: `${ratio}%` }}
                            />
                        </div>

                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-blue-500" /> Logic Code
                            </span>
                            <span className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-orange-500" /> Config/Text
                            </span>
                        </div>

                        {isWarning && (
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300">
                                ⚠️ Over 40% of your code is configuration or text files. Consider adding more logic-heavy projects.
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
