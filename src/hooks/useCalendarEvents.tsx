import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCase } from "./useCase";

export const useCalendarEvents = () => {
  const { userCase } = useCase();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["calendar_events", userCase?.id],
    queryFn: async () => {
      if (!userCase?.id) return [];

      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("case_id", userCase.id)
        .order("event_date", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!userCase?.id,
  });

  return {
    events,
    isLoading,
  };
};
