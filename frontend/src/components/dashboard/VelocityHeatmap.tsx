"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HeatmapDay {
    date: string;
    count: number;
    level: number; // 0-4
}

interface VelocityHeatmapProps {
    data: HeatmapDay[] | null;
    totalContributions?: number;
}

const LEVEL_COLORS = [
    "bg-white/5",        // 0: no activity
    "bg-emerald-900/60", // 1: low
    "bg-emerald-700/70", // 2: medium
    "bg-emerald-500/80", // 3: high
    "bg-emerald-400",    // 4: very high
];

const LEVEL_SHADOWS = [
    "",
    "",
    "",
    "shadow-[0_0_6px_rgba(16,185,129,0.3)]",
    "shadow-[0_0_10px_rgba(52,211,153,0.5)]",
];

export default function VelocityHeatmap({ data, totalContributions }: VelocityHeatmapProps) {
    // Build weeks grid (last 52 weeks)
    const weeks: HeatmapDay[][] = [];
    if (data && data.length > 0) {
        let currentWeek: HeatmapDay[] = [];
        data.forEach((day, i) => {
            currentWeek.push(day);
            if (currentWeek.length === 7 || i === data.length - 1) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        });
    }

    const displayWeeks = weeks.slice(-52); // last 52 weeks

    return (
        <Card className="bg-white/5 backdrop-blur-md border-white/10 h-full">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg">Velocity Heatmap</CardTitle>
                    <span className="text-sm font-mono text-emerald-400">
                        {totalContributions ?? "—"} contributions
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                {!data ? (
                    <div className="h-32 flex items-center justify-center text-muted-foreground">
                        Analyze a profile to see activity
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <div className="flex gap-[3px] min-w-[700px]">
                            {displayWeeks.map((week, wi) => (
                                <div key={wi} className="flex flex-col gap-[3px]">
                                    {week.map((day, di) => (
                                        <div
                                            key={di}
                                            className={`w-3 h-3 rounded-sm ${LEVEL_COLORS[day.level]} ${LEVEL_SHADOWS[day.level]} transition-all hover:scale-150 cursor-pointer`}
                                            title={`${day.date}: ${day.count} contributions`}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                            <span>Less</span>
                            {LEVEL_COLORS.map((color, i) => (
                                <div key={i} className={`w-3 h-3 rounded-sm ${color}`} />
                            ))}
                            <span>More</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
