import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAdminCase = (caseId: string | undefined) => {
  const queryClient = useQueryClient();

  const { data: caseData, isLoading: caseLoading } = useQuery({
    queryKey: ["admin-case", caseId],
    queryFn: async () => {
      if (!caseId) return null;
      
      console.log("🔍 Fetching admin case:", caseId);
      
      // Fetch case without nested profile
      const { data: caseData, error: caseError } = await supabase
        .from("cases")
        .select("*")
        .eq("id", caseId)
        .single();

      if (caseError) {
        console.error("❌ Error fetching case:", caseError);
        throw caseError;
      }
      
      // Fetch profile separately if client_id exists
      if (caseData?.client_id) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, phone")
          .eq("id", caseData.client_id)
          .maybeSingle();
        
        return { ...caseData, profiles: profileData };
      }
      
      console.log("✅ Fetched case data:", caseData);
      return caseData;
    },
    enabled: !!caseId,
    staleTime: 2 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["admin-case-tasks", caseId],
    queryFn: async () => {
      if (!caseId) return [];
      
      console.log("🔍 Fetching tasks for case:", caseId);
      
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("case_id", caseId)
        .order("order_index");

      if (error) {
        console.error("❌ Error fetching tasks:", error);
        throw error;
      }
      
      console.log("✅ Fetched tasks:", data?.length || 0);
      return data || [];
    },
    enabled: !!caseId,
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
