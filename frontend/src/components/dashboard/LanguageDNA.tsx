"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Badge } from "@/components/ui/badge";

interface Language {
    name: string;
    color: string;
    bytes: number;
    percentage: number;
}

interface LanguageDNAProps {
    languages: Language[] | null;
    primaryStack: string | null;
}

export default function LanguageDNA({ languages, primaryStack }: LanguageDNAProps) {
    const top5 = (languages || []).slice(0, 5);

    const radarData = top5.map(lang => ({
        subject: lang.name,
        value: lang.percentage,
        fullMark: 100,
    }));

    return (
        <Card className="bg-white/5 backdrop-blur-md border-white/10 h-full">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg">Language DNA</CardTitle>
                    {primaryStack && (
                        <Badge variant="outline" className="border-cyber-purple/30 text-cyber-purple bg-cyber-purple/10 text-xs">
                            {primaryStack}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {top5.length === 0 ? (
                    <div className="h-48 flex items-center justify-center text-muted-foreground">
                        No data yet
                    </div>
                ) : (
                    <>
                        <div className="h-52">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke="#333" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 11 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar
                                        name="Languages"
                                        dataKey="value"
                                        stroke="#8B5CF6"
                                        fill="#8B5CF6"
                                        fillOpacity={0.3}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Language bars */}
                        <div className="space-y-2 mt-2">
                            {top5.map((lang, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: lang.color || '#666' }}
                                    />
                                    <span className="text-xs text-gray-300 w-20 truncate">{lang.name}</span>
                                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{
                                                width: `${lang.percentage}%`,
                                                backgroundColor: lang.color || '#8B5CF6',
                                            }}
                                        />
                                    </div>
                                    <span className="text-xs font-mono text-muted-foreground w-8 text-right">{lang.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
