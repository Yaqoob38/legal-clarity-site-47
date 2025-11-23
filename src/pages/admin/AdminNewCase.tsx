import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Copy } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const AdminNewCase = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [invitationLink, setInvitationLink] = useState("");
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    propertyAddress: "",
    propertyPostcode: "",
  });

  const generateCaseReference = () => {
    return `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  };

  const generateInvitationToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const caseReference = generateCaseReference();
      const invitationToken = generateInvitationToken();

      const { data: caseData, error: caseError } = await supabase
        .from("cases")
        .insert({
          admin_id: user?.id,
          case_reference: caseReference,
          property_address: formData.propertyAddress,
          property_postcode: formData.propertyPostcode,
          client_email: formData.clientEmail,
          invitation_token: invitationToken,
          stage: "STAGE_1",
          progress: 0,
        })
        .select()
        .single();

      if (caseError) throw caseError;

      // Create tasks for the case
      const { error: tasksError } = await supabase.from("tasks").insert([
        {
          case_id: caseData.id,
          stage: "STAGE_1",
          title: "Client Care Letter & ID",
          description: "Review and sign the client care letter and upload identification documents.",
          status: "NOT_STARTED",
          order_index: 0,
          required_documents: ["Signed Client Care Letter", "Passport or Driving Licence"],
          downloadable_documents: ["Client_Care_Letter.pdf", "Terms_of_Engagement.pdf"],
        },
        {
          case_id: caseData.id,
          stage: "STAGE_1",
          title: "Complete Thirdfort AML Check",
          description: "Complete identity verification through Thirdfort.",
          status: "LOCKED",
          order_index: 1,
        },
        {
          case_id: caseData.id,
          stage: "STAGE_1",
          title: "Client Information Form",
          description: "Complete the comprehensive client information form.",
          status: "LOCKED",
          order_index: 2,
          required_documents: ["Completed Client Information Form"],
          downloadable_documents: ["Client_Information_Form.pdf", "ID_Verification_Guide.pdf"],
        },
      ]);

      if (tasksError) throw tasksError;

      const link = `${window.location.origin}/signup?invite=${invitationToken}`;
      setInvitationLink(link);

      toast.success("Case created successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to create case");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(invitationLink);
    toast.success("Invitation link copied to clipboard!");
  };

  if (invitationLink) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto max-w-2xl py-8">
          <Button variant="ghost" onClick={() => navigate("/admin/dashboard")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Case Created Successfully!</CardTitle>
              <CardDescription>
                Share this invitation link with your client
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-mono break-all">{invitationLink}</p>
              </div>
              <Button onClick={copyToClipboard} className="w-full">
                <Copy className="w-4 h-4 mr-2" />
                Copy Invitation Link
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/admin/dashboard")}
                className="w-full"
              >
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
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
            <CardTitle>Create New Case</CardTitle>
            <CardDescription>
              Enter client and property details to create a new case
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) =>
                    setFormData({ ...formData, clientName: e.target.value })
                  }
                  required
                />
              </div>
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
                {loading ? "Creating Case..." : "Create Case & Generate Invitation"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminNewCase;
