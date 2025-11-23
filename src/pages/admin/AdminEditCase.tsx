import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const AdminEditCase = () => {
  const navigate = useNavigate();
  const { caseId } = useParams();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    propertyAddress: "",
    propertyPostcode: "",
    clientEmail: "",
  });

  const { data: caseData, isLoading } = useQuery({
    queryKey: ["case", caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .eq("id", caseId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (caseData) {
      setFormData({
        propertyAddress: caseData.property_address || "",
        propertyPostcode: caseData.property_postcode || "",
        clientEmail: caseData.client_email || "",
      });
    }
  }, [caseData]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("cases")
        .update({
          property_address: formData.propertyAddress,
          property_postcode: formData.propertyPostcode,
          client_email: formData.clientEmail,
        })
        .eq("id", caseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cases"] });
      toast.success("Case updated successfully!");
      navigate("/admin/dashboard");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update case");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await updateMutation.mutateAsync();
    setLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading case...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-2xl py-8">
        <Button variant="ghost" onClick={() => navigate("/admin/dashboard")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Edit Case</CardTitle>
            <CardDescription>
              Update case details for {caseData?.case_reference}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, clientEmail: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="propertyAddress">Property Address</Label>
                <Input
                  id="propertyAddress"
                  value={formData.propertyAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, propertyAddress: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="propertyPostcode">Property Postcode</Label>
                <Input
                  id="propertyPostcode"
                  value={formData.propertyPostcode}
                  onChange={(e) =>
                    setFormData({ ...formData, propertyPostcode: e.target.value })
                  }
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Updating..." : "Update Case"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminEditCase;
