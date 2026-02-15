import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ProjectConfig } from "@/types/project";
import { generateProject, GeneratedFile } from "@/lib/generator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Terminal, ArrowLeft, Download, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const CATEGORIES = [
  { id: "sql", label: "SQL" },
  { id: "functions", label: "Functions" },
  { id: "frontend", label: "Frontend" },
  { id: "docs", label: "Docs" },
];

const Output = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [activeCategory, setActiveCategory] = useState("sql");
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [config, setConfig] = useState<ProjectConfig | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("factory_config");
    if (!raw) {
      toast.error("No project config found");
      navigate("/editor");
      return;
    }
    const cfg = JSON.parse(raw) as ProjectConfig;
    setConfig(cfg);
    const generated = generateProject(cfg);
    setFiles(generated);
    if (generated.length > 0) setActiveFile(generated[0].path);
  }, [navigate]);

  const categoryFiles = files.filter((f) => f.category === activeCategory);
  const selectedFile = files.find((f) => f.path === activeFile);

  const handleCopy = (path: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
    toast.success("Copied to clipboard");
  };

  const handleDownloadZip = async () => {
    if (!config) return;
    const zip = new JSZip();
    for (const file of files) {
      zip.file(file.path, file.content);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, `${config.projectName || "project"}.zip`);
    toast.success("ZIP downloaded!");
  };

  if (!config) return null;

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-primary" />
              <span className="font-mono text-sm font-semibold">{config.projectName}</span>
              <span className="text-xs text-muted-foreground">— {files.length} files</span>
            </div>
          </div>
          <Button size="sm" onClick={handleDownloadZip} className="gap-1">
            <Download className="h-3 w-3" /> Download ZIP
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-4 min-h-[calc(100vh-8rem)]">
          {/* Sidebar - file list */}
          <div className="w-full lg:w-64 shrink-0">
            <Tabs value={activeCategory} onValueChange={(v) => { setActiveCategory(v); setActiveFile(null); }}>
              <TabsList className="w-full">
                {CATEGORIES.filter((c) => files.some((f) => f.category === c.id)).map((c) => (
                  <TabsTrigger key={c.id} value={c.id} className="flex-1 text-xs">
                    {c.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="mt-3 space-y-1">
              {categoryFiles.map((f) => (
                <button
                  key={f.path}
                  onClick={() => setActiveFile(f.path)}
                  className={`w-full text-left px-3 py-2 rounded text-sm font-mono truncate transition-colors ${
                    activeFile === f.path ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {f.path.split("/").pop()}
                </button>
              ))}
            </div>
          </div>

          {/* Code viewer */}
          <div className="flex-1 rounded-lg border border-border bg-card overflow-hidden">
            {selectedFile ? (
              <>
                <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50">
                  <span className="text-xs font-mono text-muted-foreground">{selectedFile.path}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(selectedFile.path, selectedFile.content)}
                    className="gap-1 h-7"
                  >
                    {copiedPath === selectedFile.path ? (
                      <><Check className="h-3 w-3" /> Copied</>
                    ) : (
                      <><Copy className="h-3 w-3" /> Copy</>
                    )}
                  </Button>
                </div>
                <pre className="p-4 text-sm font-mono overflow-auto max-h-[70vh]">
                  <code>{selectedFile.content}</code>
                </pre>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Select a file to view
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Output;
