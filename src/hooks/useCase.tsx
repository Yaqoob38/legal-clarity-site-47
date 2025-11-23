import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useCase = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: userCase, isLoading } = useQuery({
    queryKey: ["case", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      console.log("Fetching case for user:", user.id);
      
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .eq("client_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching case:", error);
        throw error;
      }
      
      console.log("User case data:", data);
      return data;
    },
    enabled: !!user?.id,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const updateCase = useMutation({
    mutationFn: async (updates: any) => {
      if (!userCase?.id) throw new Error("No case found");
      
      const { error } = await supabase
        .from("cases")
        .update(updates)
        .eq("id", userCase.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case"] });
    },
  });

  return {
    userCase,
    isLoading,
    updateCase,
  };
};
