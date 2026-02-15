import { ProjectConfig, FrontendOptions } from "@/types/project";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  config: ProjectConfig;
  onChange: (config: ProjectConfig) => void;
}

const OPTIONS: { key: keyof FrontendOptions; label: string; desc: string }[] = [
  { key: "enabled", label: "Generate Frontend", desc: "Generate a React + Tailwind frontend skeleton" },
  { key: "loginSignup", label: "Auth Pages", desc: "Login and signup pages with Supabase Auth" },
  { key: "roleDashboards", label: "Role Dashboards", desc: "Role-based dashboard layouts" },
  { key: "crudPages", label: "CRUD Pages", desc: "Auto-generated list, create, edit, detail views per table" },
];

export const StepFrontend = ({ config, onChange }: Props) => {
  const update = (key: keyof FrontendOptions, value: boolean) => {
    onChange({
      ...config,
      frontendOptions: { ...config.frontendOptions, [key]: value },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Frontend Skeleton (Optional)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {OPTIONS.map((opt) => (
          <div key={opt.key} className="flex items-center justify-between py-2">
            <div>
              <div className="font-medium text-sm">{opt.label}</div>
              <div className="text-xs text-muted-foreground">{opt.desc}</div>
            </div>
            <Switch
              checked={config.frontendOptions[opt.key]}
              onCheckedChange={(c) => update(opt.key, c)}
              disabled={opt.key !== "enabled" && !config.frontendOptions.enabled}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
