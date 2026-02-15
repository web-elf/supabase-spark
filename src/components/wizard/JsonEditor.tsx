import { ProjectConfig, DEFAULT_CONFIG } from "@/types/project";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Props {
  config: ProjectConfig;
  onChange: (config: ProjectConfig) => void;
}

export const JsonEditor = ({ config, onChange }: Props) => {
  const [text, setText] = useState(JSON.stringify(config, null, 2));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setText(JSON.stringify(config, null, 2));
  }, [config]);

  const handleChange = (value: string) => {
    setText(value);
    try {
      const parsed = JSON.parse(value);
      setError(null);
      onChange({ ...DEFAULT_CONFIG, ...parsed });
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Raw JSON Config</span>
          {error && <span className="text-xs text-destructive font-normal">{error}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          className="font-mono text-sm min-h-[500px]"
          spellCheck={false}
        />
      </CardContent>
    </Card>
  );
};
