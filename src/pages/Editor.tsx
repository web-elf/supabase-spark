import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ProjectConfig, DEFAULT_CONFIG } from "@/types/project";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Terminal, ArrowLeft, Save, Play, Code } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { StepProjectInfo } from "@/components/wizard/StepProjectInfo";
import { StepTables } from "@/components/wizard/StepTables";
import { StepRelationships } from "@/components/wizard/StepRelationships";
import { StepRoles } from "@/components/wizard/StepRoles";
import { StepApi } from "@/components/wizard/StepApi";
import { StepFrontend } from "@/components/wizard/StepFrontend";
import { JsonEditor } from "@/components/wizard/JsonEditor";
import { TemplatePicker } from "@/components/wizard/TemplatePicker";

const STEPS = [
  { id: "info", label: "Project Info" },
  { id: "tables", label: "Tables" },
  { id: "relationships", label: "Relationships" },
  { id: "roles", label: "Roles & Perms" },
  { id: "api", label: "API" },
  { id: "frontend", label: "Frontend" },
];

const Editor = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [config, setConfig] = useState<ProjectConfig>({ ...DEFAULT_CONFIG });
  const [activeStep, setActiveStep] = useState("info");
  const [jsonMode, setJsonMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(!projectId);
  const [showTemplates, setShowTemplates] = useState(!projectId);

  useEffect(() => {
    if (projectId) {
      supabase
        .from("projects")
        .select("config, name, description")
        .eq("id", projectId)
        .single()
        .then(({ data, error }) => {
          if (error || !data) {
            toast.error("Project not found");
            navigate("/dashboard");
            return;
          }
          const savedConfig = data.config as unknown as ProjectConfig;
          setConfig({
            ...DEFAULT_CONFIG,
            ...savedConfig,
            projectName: data.name || savedConfig?.projectName || "",
            description: data.description || savedConfig?.description || "",
          });
          setLoaded(true);
        });
    }
  }, [projectId, navigate]);

  const handleSave = async () => {
    if (!user) {
      toast.error("Sign in to save projects");
      return;
    }
    if (!config.projectName.trim()) {
      toast.error("Project name is required");
      return;
    }
    setSaving(true);
    try {
      if (projectId) {
        const { error } = await supabase
          .from("projects")
          .update({
            name: config.projectName,
            description: config.description,
            config: JSON.parse(JSON.stringify(config)),
          })
          .eq("id", projectId);
        if (error) throw error;
        toast.success("Project saved!");
      } else {
        const { data, error } = await supabase
          .from("projects")
          .insert([{
            name: config.projectName,
            description: config.description,
            config: JSON.parse(JSON.stringify(config)),
            user_id: user.id,
          }])
          .select("id")
          .single();
        if (error) throw error;
        toast.success("Project created!");
        navigate(`/editor/${data.id}`, { replace: true });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = () => {
    if (!config.projectName.trim()) {
      toast.error("Please set a project name first");
      return;
    }
    if (config.tables.length === 0) {
      toast.error("Add at least one table");
      return;
    }
    // Save config to session for output page
    sessionStorage.setItem("factory_config", JSON.stringify(config));
    navigate("/output");
  };

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground font-mono">Loading project...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <Link to={user ? "/dashboard" : "/"}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-primary" />
              <span className="font-mono text-sm font-semibold truncate max-w-[200px]">
                {config.projectName || "New Project"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setJsonMode(!jsonMode)}
              className="gap-1"
            >
              <Code className="h-3 w-3" />
              {jsonMode ? "Wizard" : "JSON"}
            </Button>
            {user && (
              <Button variant="outline" size="sm" onClick={handleSave} disabled={saving} className="gap-1">
                <Save className="h-3 w-3" />
                {saving ? "Saving..." : "Save"}
              </Button>
            )}
            <Button size="sm" onClick={handleGenerate} className="gap-1">
              <Play className="h-3 w-3" /> Generate
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {showTemplates && !projectId ? (
          <TemplatePicker
            onSelect={(tplConfig) => {
              setConfig({ ...tplConfig });
              setShowTemplates(false);
              toast.success("Template loaded! Customize anything you need.");
            }}
            onSkip={() => setShowTemplates(false)}
          />
        ) : jsonMode ? (
          <JsonEditor config={config} onChange={setConfig} />
        ) : (
          <Tabs value={activeStep} onValueChange={setActiveStep}>
            <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-transparent p-0 mb-6">
              {STEPS.map((step, i) => (
                <TabsTrigger
                  key={step.id}
                  value={step.id}
                  className="flex-1 min-w-[100px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <span className="mr-1 text-xs opacity-60">{i + 1}.</span>
                  {step.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="info">
              <StepProjectInfo config={config} onChange={setConfig} />
            </TabsContent>
            <TabsContent value="tables">
              <StepTables config={config} onChange={setConfig} />
            </TabsContent>
            <TabsContent value="relationships">
              <StepRelationships config={config} onChange={setConfig} />
            </TabsContent>
            <TabsContent value="roles">
              <StepRoles config={config} onChange={setConfig} />
            </TabsContent>
            <TabsContent value="api">
              <StepApi config={config} onChange={setConfig} />
            </TabsContent>
            <TabsContent value="frontend">
              <StepFrontend config={config} onChange={setConfig} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Editor;
