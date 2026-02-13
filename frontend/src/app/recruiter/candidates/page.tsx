"use client";

import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, FileSpreadsheet, Trash2, Save, X, Search, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// Initial Mock Data
const initialCandidates = [
    { id: 1, name: "John Doe", role: "React Developer", status: "Screening", date: "2023-10-25" },
    { id: 2, name: "Jane Smith", role: "UX Designer", status: "Interview", date: "2023-10-26" },
    { id: 3, name: "Alex Johnson", role: "Backend Engineer", status: "Offer", date: "2023-10-27" },
];

export default function CandidatesPage() {
    const [candidates, setCandidates] = useState(initialCandidates);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // New Candidate Form State
    const [newName, setNewName] = useState("");
    const [newRole, setNewRole] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const stored = localStorage.getItem("recruiter_candidates");
        if (stored) {
            setCandidates(JSON.parse(stored));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("recruiter_candidates", JSON.stringify(candidates));
    }, [candidates]);

    const handleAddCandidate = () => {
        if (!newName || !newRole) return;

        const newCandidate = {
            id: Date.now(),
            name: newName,
            role: newRole,
            status: "Applied",
            date: new Date().toISOString().split('T')[0]
        };

        setCandidates([newCandidate, ...candidates]);
        setNewName("");
        setNewRole("");
        setIsAddOpen(false);
    };

    const handleDelete = (id: number) => {
        setCandidates(candidates.filter(c => c.id !== id));
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Simulated Import
            setTimeout(() => {
                const mockImported = [
                    { id: Date.now() + 1, name: "Imported User 1", role: "Full Stack", status: "Applied", date: new Date().toISOString().split('T')[0] },
                    { id: Date.now() + 2, name: "Imported User 2", role: "DevOps", status: "Applied", date: new Date().toISOString().split('T')[0] },
                ];
                setCandidates([...mockImported, ...candidates]);
                alert(`Successfully imported 2 candidates from ${file.name}`);
            }, 1000);
        }
    };

    const filteredCandidates = candidates.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-white">Candidate List</h2>
                        <p className="text-muted-foreground">Simple candidate management.</p>
                    </div>
                    <div className="flex gap-3">
                        <Input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".csv,.xlsx,.xls"
                            onChange={handleFileChange}
                        />
                        <Button variant="outline" onClick={handleImportClick} className="border-white/10 text-white hover:bg-white/5 bg-white/5 backdrop-blur-md">
                            <FileSpreadsheet className="w-4 h-4 mr-2 text-green-400" /> Import Excel
                        </Button>

                        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-to-r from-cyber-cyan to-blue-600 hover:from-cyber-cyan/80 hover:to-blue-600/80 border-0 shadow-lg shadow-cyber-cyan/20">
                                    <Plus className="w-4 h-4 mr-2" /> Add Candidate
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-[#0e0e11] border-white/10 text-white">
                                <DialogHeader>
                                    <DialogTitle>Add New Candidate</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Full Name</Label>
                                        <Input
                                            placeholder="e.g. Michael Scott"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Role Applied For</Label>
                                        <Input
                                            placeholder="e.g. Regional Manager"
                                            value={newRole}
                                            onChange={(e) => setNewRole(e.target.value)}
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </div>
                                    <Button onClick={handleAddCandidate} className="w-full bg-cyber-cyan text-black hover:bg-cyber-cyan/90">
                                        Save Candidate
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Card className="bg-white/5 backdrop-blur-md border-white/10">
                    <CardHeader className="pb-4 border-b border-white/5">
                        <div className="flex items-center gap-4">
                            <Search className="w-5 h-5 text-muted-foreground" />
                            <Input
                                placeholder="Search candidates..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-transparent border-0 focus-visible:ring-0 text-white placeholder:text-muted-foreground h-auto p-0"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="[&_tr]:border-white/5 bg-white/5">
                                <TableRow className="hover:bg-transparent border-0">
                                    <TableHead className="text-muted-foreground font-medium pl-6">Name</TableHead>
                                    <TableHead className="text-muted-foreground font-medium">Role</TableHead>
                                    <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                                    <TableHead className="text-muted-foreground font-medium">Date Added</TableHead>
                                    <TableHead className="text-right text-muted-foreground font-medium pr-6">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="[&_tr]:border-white/5">
                                {filteredCandidates.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            No candidates found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCandidates.map((c) => (
                                        <TableRow key={c.id} className="hover:bg-white/5 transition-colors border-white/5">
                                            <TableCell className="pl-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="w-9 h-9 border border-white/10 bg-white/5">
                                                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${c.name}`} />
                                                        <AvatarFallback>{c.name[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium text-white">{c.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-300">{c.role}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="border-white/10 text-cyber-cyan bg-cyber-cyan/10">
                                                    {c.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{c.date}</TableCell>
                                            <TableCell className="text-right pr-6">
                                                <Button size="icon" variant="ghost" onClick={() => handleDelete(c.id)} className="text-muted-foreground hover:text-red-400 hover:bg-red-400/10 h-8 w-8">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}

