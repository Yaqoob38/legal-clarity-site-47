import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, LogOut, Users, FileText, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const { data: cases, isLoading, error } = useQuery({
    queryKey: ["admin-cases"],
    queryFn: async () => {
      console.log("Fetching admin cases...");
      const { data, error } = await supabase
        .from("cases")
        .select(`
          *,
          profiles!cases_client_id_fkey(full_name)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching cases:", error);
        throw error;
      }
      console.log("Fetched cases:", data);
      return data;
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/signin");
  };

  const getStageLabel = (stage: string) => {
    const labels: Record<string, string> = {
      STAGE_1: "Stage 1: Onboarding",
      STAGE_2: "Stage 2: Searches & Contract",
      STAGE_3: "Stage 3: Exchange & Completion",
    };
    return labels[stage] || stage;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading dashboard</p>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage cases and clients</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate("/admin/cases/new")}>
              <Plus className="w-4 h-4 mr-2" />
              New Case
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cases?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {cases?.filter((c) => c.client_id).length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {cases?.filter((c) => !c.client_id && c.invitation_token).length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Cases</CardTitle>
            <CardDescription>View and manage all client cases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cases?.map((caseItem) => (
                <div
                  key={caseItem.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => navigate(`/admin/cases/${caseItem.id}`)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{caseItem.case_reference}</h3>
                      {!caseItem.client_id && (
                        <Badge variant="outline">Pending Invite</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {caseItem.property_address}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Client:{" "}
                        {caseItem.client_id && 
                         caseItem.profiles &&
                         typeof caseItem.profiles === 'object' && 
                         'full_name' in (caseItem.profiles || {})
                          ? (caseItem.profiles as { full_name: string }).full_name
                          : caseItem.client_email || "Not assigned"}
                      </span>
                      <Badge variant="secondary">{getStageLabel(caseItem.stage)}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      Progress: {caseItem.progress}%
                    </div>
                  </div>
                </div>
              ))}
              {cases?.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No cases yet. Create your first case to get started.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
