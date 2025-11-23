import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, FileText, Check, X, Download } from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useTasks } from "@/hooks/useTasks";
import { useDocuments } from "@/hooks/useDocuments";
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const TaskDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { tasks, updateTask } = useTasks();
  const { uploadDocument, getDocumentsByTask } = useDocuments();
  const [isDragging, setIsDragging] = useState(false);
  const [notes, setNotes] = useState("");

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

  const handleSaveNotes = async () => {
    if (!task) return;

    await updateTask.mutateAsync({
      taskId: task.id,
      updates: { notes },
    });
  };

  const handleDownloadDocument = async (fileName: string) => {
    const { data } = supabase.storage
      .from('document-templates')
      .getPublicUrl(fileName);
    
    if (data?.publicUrl) {
      window.open(data.publicUrl, '_blank');
    }
  };

  if (!task) {
    return (
      <div className="bg-brand-gray h-screen flex overflow-hidden">
        <DashboardSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Task not found</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-brand-gold hover:underline"
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
        return "bg-brand-gold";
      case "PENDING_REVIEW":
        return "bg-orange-500";
      case "REJECTED":
        return "bg-red-500";
      case "LOCKED":
        return "bg-gray-400";
      default:
        return "bg-gray-300";
    }
  };

  const isLocked = task.status === "LOCKED";

  return (
    <div className="bg-brand-gray h-screen flex overflow-hidden">
      <DashboardSidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-serif text-brand-navy">{task.title}</h1>
              <p className="text-xs text-gray-500 uppercase tracking-widest">
                {task.stage.replace("_", " ")}
              </p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full ${getStatusColor(task.status)} text-white text-sm font-medium`}>
            {task.status.replace(/_/g, " ")}
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-brand-gray p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Task Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-serif font-bold text-brand-navy mb-3">Description</h2>
              <p className="text-gray-600 leading-relaxed">
                {task.description || "No description provided."}
              </p>
            </div>

            {/* Two-Column Layout for tasks with downloadable documents */}
            {!isLocked && task.downloadable_documents && task.downloadable_documents.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Downloadable Documents */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-serif font-bold text-brand-navy mb-4">Download & Sign</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Download the required documents, complete and sign them, then upload using the form on the right.
                  </p>
                  <div className="space-y-3">
                    {task.downloadable_documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-brand-gold transition-colors"
                      >
                        <div className="w-10 h-10 bg-brand-gold/10 rounded flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-brand-gold" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-brand-navy">{doc}</p>
                          <p className="text-xs text-gray-500">PDF Document</p>
                        </div>
                        <button 
                          onClick={() => handleDownloadDocument(doc)}
                          className="px-4 py-2 bg-brand-navy hover:bg-brand-slate text-white text-sm rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Document Upload */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-serif font-bold text-brand-navy mb-4">Upload Documents</h2>
                  
                  {task.required_documents && task.required_documents.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Required documents:</p>
                      <div className="flex flex-wrap gap-2">
                        {task.required_documents.map((doc, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-brand-navy/10 text-brand-navy text-xs rounded-full"
                          >
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragging ? "border-brand-gold bg-brand-gold/5" : "border-gray-200 hover:border-brand-gold"
                    }`}
                  >
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drag and drop files here, or click to browse
                    </p>
                    
                    <label className="inline-flex items-center px-6 py-3 bg-brand-navy hover:bg-brand-slate text-white rounded-lg cursor-pointer transition-colors">
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Files
                      <input
                        type="file"
                        multiple
                        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              /* Standard Upload Section for tasks without downloadable documents */
              !isLocked && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-serif font-bold text-brand-navy mb-3">Upload Documents</h2>
                  
                  {task.required_documents && task.required_documents.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Required documents:</p>
                      <div className="flex flex-wrap gap-2">
                        {task.required_documents.map((doc, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-brand-navy/10 text-brand-navy text-xs rounded-full"
                          >
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragging ? "border-brand-gold bg-brand-gold/5" : "border-gray-200 hover:border-brand-gold"
                    }`}
                  >
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drag and drop files here, or click to browse
                    </p>
                    
                    <label className="inline-flex items-center px-6 py-3 bg-brand-navy hover:bg-brand-slate text-white rounded-lg cursor-pointer transition-colors">
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Files
                      <input
                        type="file"
                        multiple
                        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )
            )}

            {/* Uploaded Documents */}
            {taskDocuments.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-serif font-bold text-brand-navy mb-4">
                  Uploaded Documents ({taskDocuments.length})
                </h2>
                <div className="space-y-2">
                  {taskDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-8 h-8 bg-brand-navy/10 rounded flex items-center justify-center">
                        <FileText className="w-4 h-4 text-brand-navy" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-brand-navy truncate">{doc.file_name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {task.status === "APPROVED" && (
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <Check className="w-3 h-3" />
                            Approved
                          </div>
                        )}
                        {task.status === "REJECTED" && (
                          <div className="flex items-center gap-1 text-xs text-red-600">
                            <X className="w-3 h-3" />
                            Rejected
                          </div>
                        )}
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-brand-gold hover:underline"
                        >
                          View
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {!isLocked && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-serif font-bold text-brand-navy mb-3">Notes</h2>
                <textarea
                  value={notes || task.notes || ""}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes or comments about this task..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold resize-none"
                />
                <button
                  onClick={handleSaveNotes}
                  className="mt-3 px-6 py-2 bg-brand-navy hover:bg-brand-slate text-white rounded-lg transition-colors"
                >
                  Save Notes
                </button>
              </div>
            )}

            {/* Locked Message */}
            {isLocked && (
              <div className="bg-gray-100 rounded-xl border border-gray-200 p-6 text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-2">This task is currently locked</p>
                <p className="text-sm text-gray-500">
                  Complete the previous stage tasks to unlock this task
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TaskDetail;
