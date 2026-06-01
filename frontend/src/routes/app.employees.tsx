import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/app/employees")({
  component: EmployeesPage,
});

const ROLES = ["admin", "sales_manager", "store_keeper"] as const;

function EmployeesPage() {
  const { isAdmin, user } = useAuth();
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ["employees"],
    enabled: isAdmin,
    queryFn: () => api.get("/employees"),
  });

  const assign = async (userId: string, role: string) => {
    try {
      await api.post(`/employees/${userId}/roles`, { role });
      toast.success("Role assigned");
      qc.invalidateQueries({ queryKey: ["employees"] });
    } catch (err: any) {
      toast.error(err.message);
    }
  };
  const removeRole = async (userId: string, role: string) => {
    try {
      await api.del(`/employees/${userId}/roles`, { role });
      qc.invalidateQueries({ queryKey: ["employees"] });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (!isAdmin) return <p className="text-muted-foreground">Only administrators can access this page.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-semibold">Employees</h1>
        <p className="text-muted-foreground mt-1">Assign roles and monitor activity. New users sign up at <code className="bg-muted px-1 rounded">/auth</code>.</p>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-widest text-muted-foreground">
              <tr><th className="text-left p-3">Employee</th><th className="text-left p-3">Email</th><th className="text-left p-3">Roles</th><th className="text-right p-3">Assign</th></tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
              {data.map((e: any) => (
                <tr key={e.id} className="border-t">
                  <td className="p-3 font-medium">{e.full_name || "—"}{e.id === user?.id && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}</td>
                  <td className="p-3 text-muted-foreground">{e.email}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {(e.roles ?? []).length === 0 && <span className="text-xs text-muted-foreground">No role</span>}
                      {(e.roles ?? []).map((r: string) => (
                        <Badge key={r} variant="secondary" className="capitalize gap-1">
                          {r.replace("_"," ")}
                          {e.id !== user?.id && <button onClick={() => removeRole(e.id, r)} className="ml-1 hover:text-destructive">×</button>}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <Select onValueChange={(v) => assign(e.id, v)}>
                      <SelectTrigger className="w-40 ml-auto"><SelectValue placeholder="Add role"/></SelectTrigger>
                      <SelectContent>
                        {ROLES.filter(r => !(e.roles ?? []).includes(r)).map(r => (
                          <SelectItem key={r} value={r} className="capitalize">{r.replace("_"," ")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
