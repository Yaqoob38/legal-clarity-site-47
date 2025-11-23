import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

const AdminCaseDetail = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: caseData, isLoading: caseLoading } = useQuery({
    queryKey: ["admin-case", caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cases")
        .select(`
          *,
          profiles:client_id(full_name, phone)
        `)
        .eq("id", caseId!)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["admin-case-tasks", caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("case_id", caseId!)
        .order("order_index");

      if (error) throw error;
      return data;
    },
  });

  const approveTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from("tasks")
        .update({ status: "COMPLETE" })
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-case-tasks", caseId] });
      toast.success("Task approved successfully!");
    },
  });

  const rejectTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from("tasks")
        .update({ status: "NOT_STARTED" })
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-case-tasks", caseId] });
      toast.success("Task rejected. Client needs to resubmit.");
    },
  });

  const getStageLabel = (stage: string) => {
    const labels: Record<string, string> = {
      STAGE_1: "Stage 1: Onboarding",
      STAGE_2: "Stage 2: Searches & Contract",
      STAGE_3: "Stage 3: Exchange & Completion",
    };
    return labels[stage] || stage;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      NOT_STARTED: "bg-gray-500",
      IN_PROGRESS: "bg-blue-500",
      PENDING_REVIEW: "bg-yellow-500",
      COMPLETED: "bg-green-500",
      LOCKED: "bg-gray-400",
    };
    return colors[status] || "bg-gray-500";
  };

  if (caseLoading || tasksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto py-8">
        <Button variant="ghost" onClick={() => navigate("/admin/dashboard")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{caseData?.case_reference}</CardTitle>
                <CardDescription>{caseData?.property_address}</CardDescription>
              </div>
              <Badge variant="secondary">{getStageLabel(caseData?.stage || "")}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Client</p>
                <p className="font-medium">
                  {caseData?.client_id
                    ? (caseData?.profiles as any)?.full_name || "Unknown"
                    : caseData?.client_email || "Pending signup"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Property Postcode</p>
                <p className="font-medium">{caseData?.property_postcode}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="font-medium">{caseData?.progress}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Case Type</p>
                <p className="font-medium">{caseData?.case_type}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>Review and approve client tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks?.map((task) => (
                <div key={task.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`} />
                        <h3 className="font-semibold">{task.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                      <Badge variant="outline">{task.status.replace(/_/g, " ")}</Badge>
                    </div>
                    {task.status === "PENDING_REVIEW" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => approveTaskMutation.mutate(task.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectTaskMutation.mutate(task.id)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminCaseDetail;
