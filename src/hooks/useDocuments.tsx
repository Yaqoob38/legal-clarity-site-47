import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCase } from "./useCase";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export const useDocuments = () => {
  const { userCase } = useCase();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["documents", userCase?.id],
    queryFn: async () => {
      if (!userCase?.id) return [];

      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("case_id", userCase.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userCase?.id,
  });

  const uploadDocument = useMutation({
    mutationFn: async ({ 
      file, 
      taskId 
    }: { 
      file: File; 
      taskId?: string;
    }) => {
      if (!userCase?.id || !user?.id) throw new Error("Missing required data");

      // Upload to storage
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("case-documents")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("case-documents")
        .getPublicUrl(fileName);

      // Create document record
      const { error: dbError } = await supabase
        .from("documents")
        .insert({
          case_id: userCase.id,
          task_id: taskId || null,
          file_name: file.name,
          file_url: publicUrl,
          file_size: file.size,
          file_type: file.type,
          uploaded_by: user.id,
        });

      if (dbError) throw dbError;

      // Update task status if linked to task
      if (taskId) {
        await supabase
          .from("tasks")
          .update({ status: "SUBMITTED" })
          .eq("id", taskId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Document uploaded successfully");
    },
    onError: (error) => {
      toast.error("Failed to upload document");
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
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document deleted");
    },
  });

  const getDocumentsByTask = (taskId: string) => {
    return documents.filter((doc) => doc.task_id === taskId);
  };

  return {
    documents,
    isLoading,
    uploadDocument,
    deleteDocument,
    getDocumentsByTask,
  };
};
