
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Upload, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";

interface ExcelImportProps {
    onImport: (candidates: any[]) => void;
}

export default function ExcelImport({ onImport }: ExcelImportProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError("");

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: "binary" });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                // Validation & Parsing
                const parsed = data.map((row: any) => ({
                    id: crypto.randomUUID(),
                    name: row.Name || row.name || "Unknown",
                    role: row.Role || row.role || "Developer",
                    github: row.Github || row.github || row.Username || row.username || "",
                    email: row.Email || row.email || "",
                    status: "Imported",
                    addedAt: new Date().toISOString(),
                    score: null
                })).filter((c: any) => c.github); // Filter out rows without GitHub username

                if (parsed.length === 0) {
                    setError("No valid candidates found. Ensure column 'Github' exists.");
                } else {
                    onImport(parsed);
                }
            } catch (err) {
                console.error(err);
                setError("Failed to parse Excel file.");
            } finally {
                setLoading(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div>
            <input
                type="file"
                accept=".xlsx, .xls, .csv"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
            />
            <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="gap-2 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
            >
                {loading ? <Upload className="w-4 h-4 animate-bounce" /> : <FileSpreadsheet className="w-4 h-4" />}
                Import Excel
            </Button>
            {error && (
                <div className="absolute top-16 right-8 bg-red-500/10 text-red-400 text-xs p-2 rounded border border-red-500/20 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {error}
                </div>
            )}
        </div>
    );
}
