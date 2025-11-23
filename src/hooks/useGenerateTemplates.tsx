import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useGenerateTemplates = () => {
  const generateTemplates = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke(
        "generate-document-templates"
      );

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const successCount = data.results.filter((r: any) => r.status === "success").length;
      toast.success(`Generated ${successCount} PDF templates successfully!`);
    },
    onError: (error: Error) => {
      toast.error("Failed to generate templates: " + error.message);
      console.error("Error generating templates:", error);
    },
  });

  return { generateTemplates };
};
