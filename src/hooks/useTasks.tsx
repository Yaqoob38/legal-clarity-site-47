import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCase } from "./useCase";
import { toast } from "sonner";

export const useTasks = () => {
  const { userCase } = useCase();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", userCase?.id],
    queryFn: async () => {
      if (!userCase?.id) return [];

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("case_id", userCase.id)
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userCase?.id,
    staleTime: 10000,
  });

  const updateTask = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: any }) => {
      const { error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task updated");
    },
  });

  const getTasksByStage = (stage: string) => {
    return tasks.filter((task) => task.stage === stage);
  };

  return {
    tasks,
    isLoading,
    updateTask,
    getTasksByStage,
  };
};
