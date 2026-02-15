import { ProjectConfig, ApiEndpoint } from "@/types/project";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";

interface Props {
  config: ProjectConfig;
  onChange: (config: ProjectConfig) => void;
}

export const StepApi = ({ config, onChange }: Props) => {
  // Sync endpoints with tables
  useEffect(() => {
    const existing = new Set(config.apiEndpoints.map((e) => e.table));
    const tables = config.tables.map((t) => t.name).filter(Boolean);
    const needsUpdate = tables.some((t) => !existing.has(t));
    if (needsUpdate) {
      const endpoints: ApiEndpoint[] = tables.map((t) => {
        const ex = config.apiEndpoints.find((e) => e.table === t);
        return ex || { table: t, crud: true, search: false, filters: false, pagination: false };
      });
      onChange({ ...config, apiEndpoints: endpoints });
    }
  }, [config.tables]);

  if (config.tables.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Add tables first to configure API endpoints.
        </CardContent>
      </Card>
    );
  }

  const toggleField = (idx: number, field: keyof Omit<ApiEndpoint, "table">) => {
    const eps = [...config.apiEndpoints];
    eps[idx] = { ...eps[idx], [field]: !eps[idx][field] };
    onChange({ ...config, apiEndpoints: eps });
  };

  return (
    <div className="space-y-3">
      {config.apiEndpoints.map((ep, i) => (
        <Card key={ep.table}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono font-semibold text-sm">{ep.table}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(["crud", "search", "filters", "pagination"] as const).map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <Switch checked={ep[f]} onCheckedChange={() => toggleField(i, f)} id={`${ep.table}-${f}`} />
                  <Label htmlFor={`${ep.table}-${f}`} className="text-sm capitalize">{f}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
