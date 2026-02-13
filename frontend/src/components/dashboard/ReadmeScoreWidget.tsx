"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReadmeScoreProps {
    score: number | null;
    feedback: string | null;
}

export default function ReadmeScoreWidget({ score, feedback }: ReadmeScoreProps) {
    const displayScore = score ?? 0;

    const getColor = (s: number) => {
        if (s < 50) return { stroke: "#ef4444", text: "text-red-400", label: "Needs Work" };
        if (s < 80) return { stroke: "#eab308", text: "text-yellow-400", label: "Good Start" };
        return { stroke: "#22c55e", text: "text-emerald-400", label: "Excellent" };
    };

    const { stroke, text, label } = getColor(displayScore);

    // SVG circular progress
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (displayScore / 100) * circumference;

    return (
        <Card className="bg-white/5 backdrop-blur-md border-white/10 h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg">README Score</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
                {score === null ? (
                    <div className="h-36 flex items-center justify-center text-muted-foreground text-sm">
                        Analyze a profile to see score
                    </div>
                ) : (
                    <>
                        {/* Circular Progress */}
                        <div className="relative w-36 h-36">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                                <circle cx="60" cy="60" r={radius} fill="none" stroke="#ffffff08" strokeWidth="8" />
                                <circle
                                    cx="60" cy="60" r={radius} fill="none"
                                    stroke={stroke} strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={offset}
                                    className="transition-all duration-1000 ease-out"
                                    style={{ filter: `drop-shadow(0 0 8px ${stroke}40)` }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-3xl font-black font-mono ${text}`}>{displayScore}</span>
                                <span className="text-xs text-muted-foreground">/100</span>
                            </div>
                        </div>

                        <div className={`text-sm font-semibold mt-3 ${text}`}>{label}</div>
                        {feedback && (
                            <p className="text-xs text-muted-foreground text-center mt-2 max-w-[200px]">
                                {feedback}
                            </p>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
