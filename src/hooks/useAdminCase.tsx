import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAdminCase = (caseId: string) => {
  const queryClient = useQueryClient();

  const { data: caseData, isLoading: caseLoading } = useQuery({
    queryKey: ["admin-case", caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cases")
        .select(`
          *,
          profiles(full_name, phone)
        `)
        .eq("id", caseId)
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: 2 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["admin-case-tasks", caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("case_id", caseId)
        .order("order_index");

      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const getTasksByStage = (stage: string) => {
    return tasks.filter((task) => task.stage === stage);
  };

  const updateTask = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: any }) => {
      const { error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-case-tasks", caseId] });
    },
  });

  return {
    caseData,
    tasks,
    isLoading: caseLoading || tasksLoading,
    getTasksByStage,
    updateTask,
  };
};
