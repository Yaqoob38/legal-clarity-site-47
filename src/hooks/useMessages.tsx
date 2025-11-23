import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCase } from "./useCase";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { useEffect } from "react";

export const useMessages = () => {
  const { userCase } = useCase();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["messages", userCase?.id],
    queryFn: async () => {
      if (!userCase?.id) return [];

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("case_id", userCase.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!userCase?.id,
  });

  // Real-time subscription
  useEffect(() => {
    if (!userCase?.id) return;

    const channel = supabase
      .channel("messages-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `case_id=eq.${userCase.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["messages"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userCase?.id, queryClient]);

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!userCase?.id || !user?.id) throw new Error("Missing required data");

      const { error } = await supabase
        .from("messages")
        .insert({
          case_id: userCase.id,
          sender_id: user.id,
          content,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
    onError: () => {
      toast.error("Failed to send message");
    },
  });

  return {
    messages,
    isLoading,
    sendMessage,
  };
};
