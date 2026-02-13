"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend } from "recharts";

const languageData = [
    { name: 'TypeScript', value: 45, color: '#3178c6' },
    { name: 'Python', value: 25, color: '#3572A5' },
    { name: 'Rust', value: 15, color: '#dea584' },
    { name: 'Go', value: 10, color: '#00ADD8' },
    { name: 'Other', value: 5, color: '#6e7681' },
];

const skillData = [
    { subject: 'System Design', A: 65, fullMark: 100 },
    { subject: 'Algorithms', A: 85, fullMark: 100 },
    { subject: 'Testing', A: 40, fullMark: 100 },
    { subject: 'Documentation', A: 70, fullMark: 100 },
    { subject: 'CI/CD', A: 50, fullMark: 100 },
    { subject: 'Collaboration', A: 90, fullMark: 100 },
];

export default function AnalysisPage() {
    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Deep Analysis</h2>
                    <p className="text-muted-foreground">Comprehensive breakdown of your engineering profile.</p>
                </div>

                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="bg-card/40 border border-white/5">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="skills">Skill Gap</TabsTrigger>
                        <TabsTrigger value="habits">Coding Habits</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="bg-card/40 backdrop-blur-sm border-white/5">
                                <CardHeader>
                                    <CardTitle>Language Breakdown</CardTitle>
                                    <CardDescription>Based on byte count across all repositories.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={languageData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {languageData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                                                <Legend verticalAlign="bottom" height={36} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-card/40 backdrop-blur-sm border-white/5">
                                <CardHeader>
                                    <CardTitle>Impact Summary</CardTitle>
                                    <CardDescription>Your engineering footprint.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-lg">
                                        <span>Total Lines of Code</span>
                                        <span className="font-mono text-xl text-green-400">~145k</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-lg">
                                        <span>Open Source Contribs</span>
                                        <span className="font-mono text-xl text-blue-400">42 Repos</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-lg">
                                        <span>Pull Request Merged</span>
                                        <span className="font-mono text-xl text-purple-400">89%</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="skills" className="space-y-6">
                        <Card className="bg-card/40 backdrop-blur-sm border-white/5">
                            <CardHeader>
                                <CardTitle>Engineering Radar</CardTitle>
                                <CardDescription>Visualizing your strengths vs industry standards (Grey).</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[400px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                                            <PolarGrid stroke="#333" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 12 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                            <Radar name="You" dataKey="A" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                                            <Radar name="Senior Dev Avg" dataKey="fullMark" stroke="#555" fill="#555" fillOpacity={0.1} />
                                            <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
                                            <Legend />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-6 flex gap-4 justify-center">
                                    <Badge variant="outline" className="border-red-500/30 text-red-400">Focus: Testing</Badge>
                                    <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">Focus: CI/CD</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
