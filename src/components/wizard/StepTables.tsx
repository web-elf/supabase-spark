import { ProjectConfig, TableDef, Column, COLUMN_TYPES } from "@/types/project";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Table as TableIcon } from "lucide-react";
import { Label } from "@/components/ui/label";

interface Props {
  config: ProjectConfig;
  onChange: (config: ProjectConfig) => void;
}

const newColumn = (): Column => ({
  id: crypto.randomUUID(),
  name: "",
  type: "text",
  isPrimary: false,
  isRequired: false,
  isUnique: false,
  isIndexed: false,
});

const newTable = (): TableDef => ({
  id: crypto.randomUUID(),
  name: "",
  columns: [
    { id: crypto.randomUUID(), name: "id", type: "uuid", isPrimary: true, isRequired: true, isUnique: true, isIndexed: false },
  ],
});

export const StepTables = ({ config, onChange }: Props) => {
  const addTable = () => onChange({ ...config, tables: [...config.tables, newTable()] });

  const updateTable = (idx: number, table: TableDef) => {
    const tables = [...config.tables];
    tables[idx] = table;
    onChange({ ...config, tables });
  };

  const removeTable = (idx: number) => {
    onChange({ ...config, tables: config.tables.filter((_, i) => i !== idx) });
  };

  const addColumn = (tableIdx: number) => {
    const tables = [...config.tables];
    tables[tableIdx] = { ...tables[tableIdx], columns: [...tables[tableIdx].columns, newColumn()] };
    onChange({ ...config, tables });
  };

  const updateColumn = (tableIdx: number, colIdx: number, col: Column) => {
    const tables = [...config.tables];
    const cols = [...tables[tableIdx].columns];
    cols[colIdx] = col;
    tables[tableIdx] = { ...tables[tableIdx], columns: cols };
    onChange({ ...config, tables });
  };

  const removeColumn = (tableIdx: number, colIdx: number) => {
    const tables = [...config.tables];
    tables[tableIdx] = {
      ...tables[tableIdx],
      columns: tables[tableIdx].columns.filter((_, i) => i !== colIdx),
    };
    onChange({ ...config, tables });
  };

  return (
    <div className="space-y-4">
      {config.tables.map((table, ti) => (
        <Card key={table.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <TableIcon className="h-4 w-4 text-primary" />
              <Input
                value={table.name}
                onChange={(e) => updateTable(ti, { ...table, name: e.target.value })}
                placeholder="table_name"
                className="font-mono max-w-xs h-8"
              />
              <Button variant="ghost" size="sm" onClick={() => removeTable(ti)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_120px_60px_60px_60px_60px_40px] gap-2 text-xs font-medium text-muted-foreground pb-1 border-b border-border">
                <span>Name</span>
                <span>Type</span>
                <span className="text-center">PK</span>
                <span className="text-center">Req</span>
                <span className="text-center">Uniq</span>
                <span className="text-center">Idx</span>
                <span />
              </div>
              {table.columns.map((col, ci) => (
                <div key={col.id} className="grid grid-cols-[1fr_120px_60px_60px_60px_60px_40px] gap-2 items-center">
                  <Input
                    value={col.name}
                    onChange={(e) => updateColumn(ti, ci, { ...col, name: e.target.value })}
                    placeholder="column_name"
                    className="font-mono h-8 text-sm"
                  />
                  <Select
                    value={col.type}
                    onValueChange={(v) => updateColumn(ti, ci, { ...col, type: v as any })}
                  >
                    <SelectTrigger className="h-8 text-xs font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COLUMN_TYPES.map((t) => (
                        <SelectItem key={t} value={t} className="font-mono text-xs">{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex justify-center">
                    <Checkbox checked={col.isPrimary} onCheckedChange={(c) => updateColumn(ti, ci, { ...col, isPrimary: !!c })} />
                  </div>
                  <div className="flex justify-center">
                    <Checkbox checked={col.isRequired} onCheckedChange={(c) => updateColumn(ti, ci, { ...col, isRequired: !!c })} />
                  </div>
                  <div className="flex justify-center">
                    <Checkbox checked={col.isUnique} onCheckedChange={(c) => updateColumn(ti, ci, { ...col, isUnique: !!c })} />
                  </div>
                  <div className="flex justify-center">
                    <Checkbox checked={col.isIndexed} onCheckedChange={(c) => updateColumn(ti, ci, { ...col, isIndexed: !!c })} />
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeColumn(ti, ci)} className="h-8 w-8 p-0">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => addColumn(ti)} className="mt-3 gap-1">
              <Plus className="h-3 w-3" /> Column
            </Button>
          </CardContent>
        </Card>
      ))}

      <Button onClick={addTable} variant="outline" className="w-full gap-2 border-dashed">
        <Plus className="h-4 w-4" /> Add Table
      </Button>
    </div>
  );
};
