import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useCase = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: userCase, isLoading } = useQuery({
    queryKey: ["case", user?.id],
    queryFn: async () => {
      if (!user?.id || !user?.email) return null;
      
      console.log("🔍 Fetching case for user:", user.id, user.email);
      
      // First try to find by client_id
      let { data, error } = await supabase
        .from("cases")
        .select("*")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error("❌ Error fetching case by client_id:", error);
        throw error;
      }
      
      // If no case found by client_id, try by email
      if (!data) {
        console.log("🔍 No case found by client_id, trying by email...");
        const { data: emailCase, error: emailError } = await supabase
          .from("cases")
          .select("*")
          .eq("client_email", user.email)
          .is("client_id", null)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (emailError && emailError.code !== 'PGRST116') {
          console.error("❌ Error fetching case by email:", emailError);
          throw emailError;
        }

        if (emailCase) {
          console.log("✅ Found case by email, linking to user...");
          // Link the case to the user
          const { error: updateError } = await supabase
            .from("cases")
            .update({ client_id: user.id })
            .eq("id", emailCase.id);

          if (updateError) {
            console.error("❌ Error linking case:", updateError);
          } else {
            data = { ...emailCase, client_id: user.id };
          }
        }
      }
      
      console.log("✅ Fetched case:", data);
      return data;
    },
    enabled: !!user?.id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
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
