import { ProjectConfig, ProjectFeatures } from "@/types/project";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FEATURE_LABELS: { key: keyof ProjectFeatures; label: string; desc: string }[] = [
  { key: "auth", label: "Authentication", desc: "Email/password auth with Supabase Auth" },
  { key: "timestamps", label: "Timestamps", desc: "Auto created_at & updated_at columns" },
  { key: "softDelete", label: "Soft Delete", desc: "deleted_at column + filtered views" },
  { key: "auditLogs", label: "Audit Logs", desc: "Log all data changes to audit table" },
  { key: "notifications", label: "Notifications", desc: "Trigger-based notification system" },
  { key: "fileUploads", label: "File Uploads", desc: "Storage bucket setup with RLS" },
  { key: "searchPagination", label: "Search & Pagination", desc: "Built-in search and pagination helpers" },
];

interface Props {
  config: ProjectConfig;
  onChange: (config: ProjectConfig) => void;
}

export const StepProjectInfo = ({ config, onChange }: Props) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              value={config.projectName}
              onChange={(e) => onChange({ ...config, projectName: e.target.value })}
              placeholder="my-saas-app"
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              value={config.description}
              onChange={(e) => onChange({ ...config, description: e.target.value })}
              placeholder="A brief description of your project..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {FEATURE_LABELS.map((f) => (
            <div key={f.key} className="flex items-center justify-between py-2">
              <div>
                <div className="font-medium text-sm">{f.label}</div>
                <div className="text-xs text-muted-foreground">{f.desc}</div>
              </div>
              <Switch
                checked={config.features[f.key]}
                onCheckedChange={(checked) =>
                  onChange({
                    ...config,
                    features: { ...config.features, [f.key]: checked },
                  })
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
