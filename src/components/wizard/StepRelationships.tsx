import { ProjectConfig, Relationship, RelationshipType } from "@/types/project";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ArrowRight } from "lucide-react";

interface Props {
  config: ProjectConfig;
  onChange: (config: ProjectConfig) => void;
}

const TYPES: RelationshipType[] = ["1:1", "1:N", "N:N"];

export const StepRelationships = ({ config, onChange }: Props) => {
  const tables = config.tables;

  const addRelationship = () => {
    if (tables.length < 2) return;
    const rel: Relationship = {
      id: crypto.randomUUID(),
      from: { table: tables[0]?.name || "", column: "id" },
      to: { table: tables[1]?.name || "", column: "id" },
      type: "1:N",
    };
    onChange({ ...config, relationships: [...config.relationships, rel] });
  };

  const update = (idx: number, rel: Relationship) => {
    const rels = [...config.relationships];
    rels[idx] = rel;
    onChange({ ...config, relationships: rels });
  };

  const remove = (idx: number) => {
    onChange({ ...config, relationships: config.relationships.filter((_, i) => i !== idx) });
  };

  if (tables.length < 2) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Add at least 2 tables to define relationships.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {config.relationships.map((rel, i) => (
        <Card key={rel.id}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Select value={rel.from.table} onValueChange={(v) => update(i, { ...rel, from: { ...rel.from, table: v } })}>
                <SelectTrigger className="w-[160px] font-mono text-sm">
                  <SelectValue placeholder="From table" />
                </SelectTrigger>
                <SelectContent>
                  {tables.map((t) => (
                    <SelectItem key={t.id} value={t.name} className="font-mono">{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Select value={rel.type} onValueChange={(v) => update(i, { ...rel, type: v as RelationshipType })}>
                <SelectTrigger className="w-[100px] font-mono text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="font-mono">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Select value={rel.to.table} onValueChange={(v) => update(i, { ...rel, to: { ...rel.to, table: v } })}>
                <SelectTrigger className="w-[160px] font-mono text-sm">
                  <SelectValue placeholder="To table" />
                </SelectTrigger>
                <SelectContent>
                  {tables.map((t) => (
                    <SelectItem key={t.id} value={t.name} className="font-mono">{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" onClick={() => remove(i)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            {rel.type === "N:N" && (
              <p className="text-xs text-muted-foreground mt-2">
                Junction table <span className="font-mono">{rel.from.table}_{rel.to.table}</span> will be auto-generated.
              </p>
            )}
          </CardContent>
        </Card>
      ))}

      <Button onClick={addRelationship} variant="outline" className="w-full gap-2 border-dashed">
        <Plus className="h-4 w-4" /> Add Relationship
      </Button>
    </div>
  );
};
