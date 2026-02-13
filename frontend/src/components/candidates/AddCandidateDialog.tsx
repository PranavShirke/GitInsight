
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, Github, Mail, Briefcase } from "lucide-react";

interface AddCandidateDialogProps {
    onAdd: (candidate: any) => void;
}

export default function AddCandidateDialog({ onAdd }: AddCandidateDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "",
        github: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.github) return;

        onAdd({
            id: crypto.randomUUID(),
            ...formData,
            status: "New",
            addedAt: new Date().toISOString(),
            score: null
        });

        setFormData({ name: "", email: "", role: "", github: "" });
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-cyber-purple hover:bg-cyber-purple/80 text-white">
                    <UserPlus className="w-4 h-4" /> Add Candidate
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0a0a0a] border border-white/10 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Candidate</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Full Name</label>
                        <Input
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="bg-white/5 border-white/10 focus-visible:ring-cyber-purple/50"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Target Role</label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Frontend Developer"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="pl-9 bg-white/5 border-white/10 focus-visible:ring-cyber-purple/50"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">GitHub Username</label>
                        <div className="relative">
                            <Github className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="johndoe"
                                value={formData.github}
                                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                                className="pl-9 bg-white/5 border-white/10 focus-visible:ring-cyber-purple/50"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Email (Optional)</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="email"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="pl-9 bg-white/5 border-white/10 focus-visible:ring-cyber-purple/50"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="hover:bg-white/5">
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-gradient-to-r from-cyber-purple to-blue-600">
                            Add Candidate
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
