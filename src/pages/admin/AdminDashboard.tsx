import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, LogOut, Users, FileText, Clock, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [caseToDelete, setCaseToDelete] = useState<string | null>(null);

  const { data: cases, isLoading, error } = useQuery({
    queryKey: ["admin-cases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    retry: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: async (caseId: string) => {
      const { error } = await supabase
        .from("cases")
        .delete()
        .eq("id", caseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cases"] });
      toast.success("Case deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete case");
    },
  });

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/signin");
  };

  const handleDeleteClick = (caseId: string) => {
    setCaseToDelete(caseId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (caseToDelete) {
      await deleteMutation.mutateAsync(caseToDelete);
      setDeleteDialogOpen(false);
      setCaseToDelete(null);
    }
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
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => navigate(`/admin/cases/${caseItem.id}`)}
                  >
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
                        Client: {caseItem.client_email || "Not assigned"}
                      </span>
                      <Badge variant="secondary">{getStageLabel(caseItem.stage)}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right mr-4">
                      <div className="text-sm text-muted-foreground">
                        Progress: {caseItem.progress}%
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/cases/${caseItem.id}/edit`);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(caseItem.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Case</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this case? This action cannot be undone.
              All associated tasks and documents will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
