import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, FileText, Check, X, Download, ExternalLink } from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useTasks } from "@/hooks/useTasks";
import { useDocuments } from "@/hooks/useDocuments";
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import thirdfortLogo from "@/assets/thirdfort-logo.png";
import { useLanguage } from "@/contexts/LanguageContext";

const TaskDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { tasks, updateTask } = useTasks();
  const { uploadDocument, getDocumentsByTask } = useDocuments();
  const [isDragging, setIsDragging] = useState(false);
  const [notes, setNotes] = useState("");
  const { t } = useLanguage();

  const task = tasks.find((t) => t.id === taskId);
  const taskDocuments = task ? getDocumentsByTask(task.id) : [];

  // Helper to translate task title
  const translateTaskTitle = (title: string) => {
    const translated = t(`task.${title}`);
    return translated !== `task.${title}` ? translated : title;
  };

  // Helper to translate task description
  const translateTaskDesc = (desc: string | null) => {
    if (!desc) return t('taskDetail.noDescription');
    const translated = t(`taskDesc.${desc}`);
    return translated !== `taskDesc.${desc}` ? translated : desc;
  };

  // Helper to translate status
  const translateStatus = (status: string) => {
    return t(`status.${status}`) || status.replace(/_/g, " ");
  };

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
            <p className="text-gray-600 mb-4">{t('taskDetail.taskNotFound')}</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-brand-gold hover:underline"
            >
              {t('taskDetail.returnToDashboard')}
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

  const handleThirdfortClick = async () => {
    if (!task) return;
    
    await updateTask.mutateAsync({
      taskId: task.id,
      updates: { status: "PENDING_REVIEW" }
    });
    
    window.open("https://www.thirdfort.com/", "_blank");
  };

  const isThirdfortTask = task.title.toLowerCase().includes("thirdfort");
  const isLocked = task.status === "LOCKED";

  // Translate stage name
  const translateStage = (stage: string) => {
    if (stage === "STAGE_1") return t('dashboard.firstStage');
    if (stage === "STAGE_2") return t('dashboard.secondStage');
    if (stage === "STAGE_3") return t('dashboard.thirdStage');
    return stage.replace("_", " ");
  };

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
              <h1 className="text-2xl font-serif text-brand-navy">{translateTaskTitle(task.title)}</h1>
              <p className="text-xs text-gray-500 uppercase tracking-widest">
                {translateStage(task.stage)}
              </p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full ${getStatusColor(task.status)} text-white text-sm font-medium`}>
            {translateStatus(task.status)}
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-brand-gray p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Task Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-serif font-bold text-brand-navy mb-3">{t('taskDetail.description')}</h2>
              <p className="text-gray-600 leading-relaxed">
                {translateTaskDesc(task.description)}
              </p>
            </div>

            {/* Awaiting Approval Banner */}
            {task.status === "PENDING_REVIEW" && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-bold text-orange-900 mb-1">{t('taskDetail.awaitingApproval')}</h3>
                    <p className="text-orange-800">
                      {t('taskDetail.awaitingApprovalDesc')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Thirdfort Task Special UI */}
            {isThirdfortTask && !isLocked ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                <div className="max-w-xl mx-auto flex flex-col items-center text-center space-y-6">
                  <img 
                    src={thirdfortLogo} 
                    alt="Thirdfort" 
                    className="h-20 w-auto object-contain"
                  />
                  <div className="space-y-2">
                    <h3 className="text-2xl font-serif font-bold text-brand-navy">{t('taskDetail.completeAmlCheck')}</h3>
                    <p className="text-gray-600">
                      {t('taskDetail.amlCheckDesc')}
                    </p>
                  </div>
                  <button 
                    onClick={handleThirdfortClick}
                    disabled={task.status === "PENDING_REVIEW" || task.status === "COMPLETE"}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-brand-navy hover:bg-brand-slate disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-lg font-medium"
                  >
                    {task.status === "PENDING_REVIEW" || task.status === "COMPLETE" 
                      ? t('taskDetail.amlCheckSubmitted')
                      : t('taskDetail.startAmlCheck')
                    }
                    {task.status !== "PENDING_REVIEW" && task.status !== "COMPLETE" && (
                      <ExternalLink className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            ) : !isLocked && task.downloadable_documents && task.downloadable_documents.length > 0 ? (
              /* Two-Column Layout for tasks with downloadable documents */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Downloadable Documents */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-serif font-bold text-brand-navy mb-4">{t('taskDetail.downloadAndSign')}</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    {t('taskDetail.downloadAndSignDesc')}
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
                          <p className="text-xs text-gray-500">{t('taskDetail.pdfDocument')}</p>
                        </div>
                        <button 
                          onClick={() => handleDownloadDocument(doc)}
                          className="px-4 py-2 bg-brand-navy hover:bg-brand-slate text-white text-sm rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          {t('taskDetail.download')}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Document Upload */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-serif font-bold text-brand-navy mb-4">{t('taskDetail.uploadDocuments')}</h2>
                  
                  {task.required_documents && task.required_documents.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">{t('taskDetail.requiredDocuments')}</p>
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
                      {t('taskDetail.dragAndDrop')}
                    </p>
                    
                    <label className="inline-flex items-center px-6 py-3 bg-brand-navy hover:bg-brand-slate text-white rounded-lg cursor-pointer transition-colors">
                      <Upload className="w-4 h-4 mr-2" />
                      {t('taskDetail.chooseFiles')}
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
            ) : !isLocked && (
              /* Standard Upload Section for tasks without downloadable documents */
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-serif font-bold text-brand-navy mb-3">{t('taskDetail.uploadDocuments')}</h2>
                  
                  {task.required_documents && task.required_documents.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">{t('taskDetail.requiredDocuments')}</p>
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
                      {t('taskDetail.dragAndDrop')}
                    </p>
                    
                    <label className="inline-flex items-center px-6 py-3 bg-brand-navy hover:bg-brand-slate text-white rounded-lg cursor-pointer transition-colors">
                      <Upload className="w-4 h-4 mr-2" />
                      {t('taskDetail.chooseFiles')}
                      <input
                        type="file"
                        multiple
                        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

            {/* Uploaded Documents */}
            {taskDocuments.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-serif font-bold text-brand-navy mb-4">
                  {t('taskDetail.uploadedDocuments')} ({taskDocuments.length})
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
                            {t('taskDetail.approved')}
                          </div>
                        )}
                        {task.status === "REJECTED" && (
                          <div className="flex items-center gap-1 text-xs text-red-600">
                            <X className="w-3 h-3" />
                            {t('taskDetail.rejected')}
                          </div>
                        )}
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-brand-gold hover:underline"
                        >
                          {t('taskDetail.view')}
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
                <h2 className="text-lg font-serif font-bold text-brand-navy mb-3">{t('taskDetail.notes')}</h2>
                <textarea
                  value={notes || task.notes || ""}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('taskDetail.notesPlaceholder')}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold resize-none"
                />
                <button
                  onClick={handleSaveNotes}
                  className="mt-3 px-6 py-2 bg-brand-navy hover:bg-brand-slate text-white rounded-lg transition-colors"
                >
                  {t('taskDetail.saveNotes')}
                </button>
              </div>
            )}

            {/* Locked Message */}
            {isLocked && (
              <div className="bg-gray-100 rounded-xl border border-gray-200 p-6 text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-2">{t('taskDetail.taskLocked')}</p>
                <p className="text-sm text-gray-500">
                  {t('taskDetail.completePreviousTasks')}
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