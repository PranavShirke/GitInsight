"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    FlaskConical,
    Settings,
    LogOut,
    Search,
    Menu,
    Zap,
    Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import SpaceBackground from "@/components/SpaceBackground";

interface SidebarItem {
    icon: ReactNode;
    label: string;
    href: string;
}

const navItems: SidebarItem[] = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", href: "/dashboard" },
    { icon: <FlaskConical className="w-5 h-5" />, label: "Analytics Lab", href: "/analytics" },
    { icon: <Users className="w-5 h-5" />, label: "Candidates", href: "/candidates" },
    { icon: <Settings className="w-5 h-5" />, label: "Settings", href: "/settings" },
];

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();

    return (
        <div className="flex min-h-screen bg-transparent text-foreground font-sans selection:bg-cyber-cyan/30 relative">
            <SpaceBackground />

            {/* Sidebar */}
            <aside className="hidden md:flex flex-col fixed left-4 top-4 bottom-4 w-72 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl z-40 overflow-hidden">

                {/* Logo */}
                <div className="flex items-center gap-3 px-8 py-8">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyber-cyan to-cyber-purple flex items-center justify-center shadow-lg shadow-cyber-cyan/20">
                        <Zap className="text-white w-5 h-5 fill-white" />
                    </div>
                    <span className="font-bold text-xl tracking-wide text-white">Git Intel.</span>
                </div>

                {/* Navigation */}
                <div className="flex-1 px-4 py-4 space-y-1">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-4 mt-2 font-mono">Menu</div>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                                    isActive
                                        ? "bg-white/10 text-cyber-cyan border border-white/5"
                                        : "text-muted-foreground hover:text-white hover:bg-white/5"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyber-cyan to-cyber-purple rounded-r-full" />
                                )}
                                <span className={cn("transition-colors", isActive ? "text-cyber-cyan" : "group-hover:text-white")}>
                                    {item.icon}
                                </span>
                                {item.label}
                            </Link>
                        );
                    })}
                </div>

                {/* User Mini */}
                <div className="p-4 mt-auto border-t border-white/5 bg-black/20">
                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group">
                        <Avatar className="w-10 h-10 border border-white/10">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>GI</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">Git Intel User</p>
                            <p className="text-xs text-muted-foreground truncate font-mono">PRO MEMBER</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            localStorage.removeItem("gitintel_username");
                            localStorage.removeItem("gitintel_data");
                            window.location.href = "/";
                        }}
                        className="mt-3 w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all border border-white/5 hover:border-red-500/20"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Log Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col md:ml-80 mr-4 my-4 relative h-[calc(100vh-2rem)] overflow-hidden rounded-3xl bg-black/5 backdrop-blur-md border border-white/10 shadow-2xl">

                {/* Header */}
                <header className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-transparent backdrop-blur-sm sticky top-0 z-30">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative w-full max-w-md hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by username, skill, or repo..."
                                className="pl-10 bg-white/5 border-white/10 focus-visible:ring-cyber-cyan/50 rounded-xl h-10 text-white placeholder:text-muted-foreground"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md bg-white/10 text-[10px] font-mono text-muted-foreground">⌘K</div>
                        </div>
                        <Button variant="ghost" size="icon" className="md:hidden text-white">
                            <Menu className="w-5 h-5" />
                        </Button>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-8 relative scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyber-purple/10 blur-[150px] pointer-events-none rounded-full" />
                    <div className="relative z-10">
                        {children}
                    </div>
                </main>
            </div>

        </div>
    );
}
