import { ProjectConfig, Role, RolePermissions } from "@/types/project";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Shield } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Props {
  config: ProjectConfig;
  onChange: (config: ProjectConfig) => void;
}

const DEFAULT_PERMS: RolePermissions = { select: false, insert: false, update: false, delete: false };

export const StepRoles = ({ config, onChange }: Props) => {
  const addRole = () => {
    const role: Role = {
      id: crypto.randomUUID(),
      name: "",
      permissions: Object.fromEntries(config.tables.map((t) => [t.name, { ...DEFAULT_PERMS }])),
    };
    onChange({ ...config, roles: [...config.roles, role] });
  };

  const updateRole = (idx: number, role: Role) => {
    const roles = [...config.roles];
    roles[idx] = role;
    onChange({ ...config, roles });
  };

  const removeRole = (idx: number) => {
    onChange({ ...config, roles: config.roles.filter((_, i) => i !== idx) });
  };

  const togglePerm = (roleIdx: number, table: string, perm: keyof RolePermissions) => {
    const role = { ...config.roles[roleIdx] };
    const perms = role.permissions[table] || { ...DEFAULT_PERMS };
    role.permissions = { ...role.permissions, [table]: { ...perms, [perm]: !perms[perm] } };
    updateRole(roleIdx, role);
  };

  if (config.tables.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Add tables first to configure role permissions.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {config.roles.map((role, ri) => (
        <Card key={role.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-primary" />
              <Input
                value={role.name}
                onChange={(e) => updateRole(ri, { ...role, name: e.target.value })}
                placeholder="role_name"
                className="font-mono max-w-xs h-8"
              />
              <Button variant="ghost" size="sm" onClick={() => removeRole(ri)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-mono">Table</TableHead>
                    <TableHead className="text-center">Select</TableHead>
                    <TableHead className="text-center">Insert</TableHead>
                    <TableHead className="text-center">Update</TableHead>
                    <TableHead className="text-center">Delete</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {config.tables.map((t) => {
                    const perms = role.permissions[t.name] || DEFAULT_PERMS;
                    return (
                      <TableRow key={t.id}>
                        <TableCell className="font-mono text-sm">{t.name}</TableCell>
                        {(["select", "insert", "update", "delete"] as const).map((p) => (
                          <TableCell key={p} className="text-center">
                            <Checkbox checked={perms[p]} onCheckedChange={() => togglePerm(ri, t.name, p)} />
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button onClick={addRole} variant="outline" className="w-full gap-2 border-dashed">
        <Plus className="h-4 w-4" /> Add Role
      </Button>
    </div>
  );
};
