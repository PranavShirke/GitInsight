"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import RecruiterOnboarding from "@/components/RecruiterOnboarding";
import { Github, Code, Search, Zap, Shield, Globe, Cpu, Users, Layers, ArrowRight } from "lucide-react";
import SpaceBackground from "@/components/SpaceBackground";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [username, setUsername] = useState("");
  const router = useRouter();

  const handleAnalyze = () => {
    const parsed = username.replace(/https?:\/\/github\.com\//i, "").replace(/\/.*$/, "").trim();
    if (!parsed) return;
    localStorage.setItem("gitintel_username", parsed);
    router.push("/dashboard");
  };

  return (
    <main className="relative min-h-screen flex flex-col font-sans text-white overflow-x-hidden">
      <SpaceBackground />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              Git Intel.
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/analytics" className="hover:text-white transition-colors">Analytics Lab</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 flex flex-col items-center text-center px-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-600/30 blur-[120px] rounded-full pointer-events-none z-0 opacity-50 mix-blend-screen" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-5xl mx-auto space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            AI-Driven Portfolio Intelligence
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            Your GitHub. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
              Decoded by AI.
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Instant telemetry dashboard, predictive career analytics, and hiring probability — all from your GitHub profile.
          </p>

          <div className="pt-8">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  className="rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 px-10 py-6 text-lg font-bold transition-all shadow-lg shadow-purple-500/20 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                  Launch App <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0e0e11] border-white/10 text-white sm:max-w-[500px]">
                <RecruiterOnboarding />
              </DialogContent>
            </Dialog>
          </div>

          <p className="text-sm text-muted-foreground">
            Free • No signup required • Powered by GitHub GraphQL + AI
          </p>

          {/* Social Proof */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center justify-center gap-2"><Github className="w-6 h-6" /> GitHub</div>
            <div className="flex items-center justify-center gap-2"><Globe className="w-6 h-6" /> Vercel</div>
            <div className="flex items-center justify-center gap-2"><Cpu className="w-6 h-6" /> OpenAI</div>
            <div className="flex items-center justify-center gap-2"><Shield className="w-6 h-6" /> Auth0</div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative container mx-auto px-4 pb-24 z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Two Powerful Interfaces. One Profile.</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The Dashboard gives you instant telemetry. The Analytics Lab gives you predictive AI tools to level up.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Code, title: "Velocity Heatmap", desc: "Enhanced activity graph distinguishing maintenance vs. feature work.", color: "text-emerald-400" },
            { icon: Zap, title: "Language DNA", desc: "Radar chart of your top languages with 'Primary Stack' detection.", color: "text-purple-400" },
            { icon: Layers, title: "Ghost Code Detector", desc: "Spot if your profile is heavy on config vs. real logic code.", color: "text-yellow-400" },
            { icon: Users, title: "Resume Truth Bridge", desc: "Upload your resume. We cross-reference every claim with your GitHub.", color: "text-blue-400" },
            { icon: Shield, title: "Hiring Forecaster", desc: "AI predicts your match % for Senior Engineer roles.", color: "text-red-400" },
            { icon: Cpu, title: "Repo Deep-Dive Audit", desc: "Grade any repo A-F with a checklist of missing standards.", color: "text-cyan-400" },
          ].map((feature, i) => (
            <Card key={i} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-black/50 flex items-center justify-center mb-4 border border-white/5">
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/40 backdrop-blur-md py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>&copy; 2026 Git Intel. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
