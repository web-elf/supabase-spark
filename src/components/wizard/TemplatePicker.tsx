import { PROJECT_TEMPLATES, ProjectTemplate } from "@/lib/templates";
import { ProjectConfig } from "@/types/project";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface Props {
  onSelect: (config: ProjectConfig) => void;
  onSkip: () => void;
}

export const TemplatePicker = ({ onSelect, onSkip }: Props) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Start from a Template</h2>
        <p className="text-muted-foreground text-sm">
          Pick a template to pre-fill the wizard, then customize everything to your needs.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PROJECT_TEMPLATES.map((tpl) => (
          <Card
            key={tpl.id}
            className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group"
            onClick={() => onSelect(tpl.config)}
          >
            <CardContent className="pt-5 pb-4 space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{tpl.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                    {tpl.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {tpl.description}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {tpl.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {tpl.config.tables.length} tables · {tpl.config.roles.length} roles
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center pt-2">
        <Button variant="ghost" onClick={onSkip} className="gap-2 text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          Start from scratch
        </Button>
      </div>
    </div>
  );
};
