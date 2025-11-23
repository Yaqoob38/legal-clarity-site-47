import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, FileText, Download, CheckCircle, Lock } from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useTasks } from "@/hooks/useTasks";
import { useDocuments } from "@/hooks/useDocuments";
import { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";

const TaskDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { tasks, updateTask } = useTasks();
  const { uploadDocument, getDocumentsByTask } = useDocuments();
  const [isDragging, setIsDragging] = useState(false);

  const task = tasks.find((t) => t.id === taskId);
  const taskDocuments = task ? getDocumentsByTask(task.id) : [];

  const handleFileUpload = useCallback(
    async (files: FileList | File[]) => {
      if (!task) return;

      const fileArray = Array.from(files);
      
      for (const file of fileArray) {
        await uploadDocument.mutateAsync({
          file,
          taskId: task.id,
        });
      }
    },
    [uploadDocument, task]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      
      if (e.dataTransfer.files) {
        handleFileUpload(e.dataTransfer.files);
      }
    },
    [handleFileUpload]
  );

  if (!task) {
    return (
      <div className="bg-background h-screen flex overflow-hidden">
        <DashboardSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Task not found</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-primary hover:underline"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETE":
        return "bg-green-500";
      case "IN_PROGRESS":
      case "SUBMITTED":
        return "bg-amber-500";
      case "PENDING_REVIEW":
        return "bg-orange-500";
      case "REJECTED":
        return "bg-red-500";
      case "LOCKED":
        return "bg-muted";
      default:
        return "bg-muted";
    }
  };

  const isLocked = task.status === "LOCKED";
  const isFirstTask = task.order_index === 0;

  return (
    <div className="bg-background h-screen flex overflow-hidden">
      <DashboardSidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-card border-b border-border flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-serif text-foreground">{task.title}</h1>
                {isFirstTask && (
                  <Badge variant="default" className="text-xs">Start Here</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
                {task.stage.replace("_", " ")}
              </p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full ${getStatusColor(task.status)} text-white text-sm font-medium flex items-center gap-2`}>
            {task.status === "LOCKED" && <Lock className="w-4 h-4" />}
            {task.status === "COMPLETE" && <CheckCircle className="w-4 h-4" />}
            {task.status.replace(/_/g, " ")}
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-background p-8">
          <div className="max-w-6xl mx-auto">
            
            {/* Task Description */}
            <div className="bg-card rounded-xl shadow-sm border border-border p-8 mb-6">
              <p className="text-muted-foreground leading-relaxed text-lg">
                {task.description || "No description provided."}
              </p>
            </div>

            {isLocked ? (
              /* Locked Message */
              <div className="bg-muted/50 rounded-xl border border-border p-12 text-center">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-serif text-foreground mb-2">This task is currently locked</h3>
                <p className="text-muted-foreground">
                  Complete the previous tasks to unlock this step
                </p>
              </div>
            ) : (
              /* Two Column Layout - Document Download & Upload */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left Side - Document to Download */}
                <div className="bg-card rounded-xl shadow-sm border border-border p-8">
                  <h2 className="text-xl font-serif font-bold text-foreground mb-6">Required Documents</h2>
                  
                  {task.required_documents && task.required_documents.length > 0 ? (
                    <div className="space-y-4">
                      {task.required_documents.map((doc, idx) => (
                        <div key={idx} className="bg-muted/30 rounded-lg p-6 text-center">
                          <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-primary" />
                          </div>
                          <h3 className="font-serif text-lg text-foreground mb-2">
                            {doc}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">2.4 MB</p>
                          
                          <button className="w-full px-6 py-3 bg-background hover:bg-accent border-2 border-border rounded-lg font-medium text-foreground transition-colors flex items-center justify-center gap-2">
                            <Download className="w-4 h-4" />
                            DOWNLOAD & SIGN
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-muted/30 rounded-lg p-8 text-center">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No documents required for download</p>
                    </div>
                  )}
                </div>

                {/* Right Side - Upload Area */}
                <div className="bg-card rounded-xl shadow-sm border border-border p-8">
                  <h2 className="text-xl font-serif font-bold text-foreground mb-6">Upload Signed Document</h2>
                  
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-all min-h-[300px] flex flex-col items-center justify-center ${
                      isDragging 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50 hover:bg-accent/50"
                    }`}
                  >
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    
                    <h3 className="text-xl font-serif text-foreground mb-2">Upload Signed Document</h3>
                    <p className="text-muted-foreground mb-6">
                      Drag & drop or click to browse
                    </p>
                    
                    <label className="inline-flex items-center px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg cursor-pointer transition-colors font-medium">
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Files
                      <input
                        type="file"
                        multiple
                        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                        className="hidden"
                      />
                    </label>

                    <p className="text-xs text-muted-foreground mt-4">
                      Supported formats: PDF, DOC, DOCX, JPG, PNG
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Uploaded Documents */}
            {taskDocuments.length > 0 && (
              <div className="bg-card rounded-xl shadow-sm border border-border p-8 mt-6">
                <h2 className="text-xl font-serif font-bold text-foreground mb-6">
                  Uploaded Documents ({taskDocuments.length})
                </h2>
                <div className="space-y-3">
                  {taskDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{doc.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(doc.created_at).toLocaleDateString()} • {doc.file_size ? `${(doc.file_size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {task.status === "APPROVED" && (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approved
                          </Badge>
                        )}
                        {task.status === "REJECTED" && (
                          <Badge variant="destructive">
                            Rejected
                          </Badge>
                        )}
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline font-medium"
                        >
                          View
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TaskDetail;
