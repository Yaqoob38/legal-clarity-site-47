import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAdminDocuments = (caseId: string | undefined) => {
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["admin-documents", caseId],
    queryFn: async () => {
      if (!caseId) return [];

      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!caseId,
  });

  const approveDocument = useMutation({
    mutationFn: async ({ 
      documentId, 
      taskId, 
      caseId 
    }: { 
      documentId: string; 
      taskId: string;
      caseId: string;
    }) => {
      // Update document status (we'll add this column if needed)
      // For now, we'll just update the task status
      
      // Get the current task
      const { data: task, error: taskError } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", taskId)
        .single();

      if (taskError) throw taskError;

      // Update task to COMPLETE
      const { error: updateError } = await supabase
        .from("tasks")
        .update({ status: "COMPLETE" })
        .eq("id", taskId);

      if (updateError) throw updateError;

      // Get all tasks in the same stage
      const { data: stageTasks, error: stageError } = await supabase
        .from("tasks")
        .select("*")
        .eq("case_id", caseId)
        .eq("stage", task.stage)
        .order("order_index");

      if (stageError) throw stageError;

      // Find next task in the stage
      const currentIndex = stageTasks.findIndex(t => t.id === taskId);
      const nextTask = stageTasks[currentIndex + 1];

      if (nextTask && nextTask.status === "LOCKED") {
        // Unlock next task
        await supabase
          .from("tasks")
          .update({ status: "NOT_STARTED" })
          .eq("id", nextTask.id);
      }

      // Check if all tasks in stage are complete
      const allComplete = stageTasks.every((t, idx) => 
        t.id === taskId || idx < currentIndex || t.status === "COMPLETE"
      );

      if (allComplete) {
        // Get all tasks for the case
        const { data: allTasks, error: allTasksError } = await supabase
          .from("tasks")
          .select("*")
          .eq("case_id", caseId)
          .order("stage")
          .order("order_index");

        if (allTasksError) throw allTasksError;

        // Find first task in next stage
        const nextStage = task.stage === "STAGE_1" ? "STAGE_2" : task.stage === "STAGE_2" ? "STAGE_3" : null;
        
        if (nextStage) {
          const firstTaskInNextStage = allTasks.find(t => t.stage === nextStage);
          
          if (firstTaskInNextStage && firstTaskInNextStage.status === "LOCKED") {
            await supabase
              .from("tasks")
              .update({ status: "NOT_STARTED" })
              .eq("id", firstTaskInNextStage.id);
            
            toast.success(`Stage complete! Unlocked ${nextStage.replace("_", " ")}`);
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-documents"] });
      queryClient.invalidateQueries({ queryKey: ["admin-case-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["admin-case"] });
      toast.success("Document approved and task completed!");
    },
    onError: (error) => {
      toast.error("Failed to approve document");
      console.error(error);
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async (documentId: string) => {
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", documentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-documents"] });
      toast.success("Document deleted");
    },
  });

  const getDocumentsByTask = (taskId: string) => {
    return documents.filter((doc) => doc.task_id === taskId);
  };

  return {
    documents,
    isLoading,
    approveDocument,
    deleteDocument,
    getDocumentsByTask,
  };
};
