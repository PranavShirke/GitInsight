"use client";

import { TrendingUp, Star, Users, Calendar, GitBranch } from "lucide-react";

interface VitalSignsProps {
    vitals: {
        publicRepos: number;
        totalStars: number;
        followers: number;
        accountAge: number;
    } | null;
}

export default function VitalSignsWidget({ vitals }: VitalSignsProps) {
    const stats = [
        {
            label: "Public Repos",
            value: vitals?.publicRepos ?? "—",
            icon: <GitBranch className="w-5 h-5" />,
            color: "text-blue-400",
            bg: "bg-blue-400/10",
            trend: "+3 this month",
        },
        {
            label: "Total Stars",
            value: vitals?.totalStars ?? "—",
            icon: <Star className="w-5 h-5" />,
            color: "text-yellow-400",
            bg: "bg-yellow-400/10",
            trend: "+12 this week",
        },
        {
            label: "Followers",
            value: vitals?.followers ?? "—",
            icon: <Users className="w-5 h-5" />,
            color: "text-purple-400",
            bg: "bg-purple-400/10",
            trend: "+5 this month",
        },
        {
            label: "Account Age",
            value: vitals ? `${vitals.accountAge}y` : "—",
            icon: <Calendar className="w-5 h-5" />,
            color: "text-emerald-400",
            bg: "bg-emerald-400/10",
            trend: "Established",
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
                <div
                    key={i}
                    className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6 hover:bg-white/[0.08] transition-colors group"
                >
                    <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} blur-3xl rounded-full opacity-50 group-hover:opacity-75 transition-opacity`} />
                    <div className="relative z-10">
                        <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-4 ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <div className="text-3xl font-black text-white mb-1 font-mono">{stat.value}</div>
                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                        <div className="flex items-center gap-1 mt-3 text-xs text-emerald-400">
                            <TrendingUp className="w-3 h-3" />
                            {stat.trend}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
