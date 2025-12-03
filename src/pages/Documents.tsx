import { useState, useCallback } from "react";
import { FileText, Download, Trash2, Upload, X } from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useDocuments } from "@/hooks/useDocuments";
import { useTasks } from "@/hooks/useTasks";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const Documents = () => {
  const { documents, isLoading, uploadDocument, deleteDocument } = useDocuments();
  const { tasks } = useTasks();
  const [selectedTask, setSelectedTask] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const { t } = useLanguage();

  // Helper to translate task title
  const translateTaskTitle = (title: string) => {
    const translated = t(`task.${title}`);
    return translated !== `task.${title}` ? translated : title;
  };

  const handleFileUpload = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      
      for (const file of fileArray) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 10MB)`);
          continue;
        }

        await uploadDocument.mutateAsync({
          file,
          taskId: selectedTask || undefined,
        });
      }
    },
    [uploadDocument, selectedTask]
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getTaskName = (taskId: string | null) => {
    if (!taskId) return t('documents.generalDocuments');
    const task = tasks.find((t) => t.id === taskId);
    return task ? translateTaskTitle(task.title) : t('documents.generalDocuments');
  };

  if (isLoading) {
    return (
      <div className="bg-brand-gray h-screen flex overflow-hidden">
        <DashboardSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">{t('documents.loadingDocuments')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-gray h-screen flex overflow-hidden">
      <DashboardSidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0">
          <div>
            <h1 className="text-2xl font-serif text-brand-navy">{t('documents.title')}</h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest">{t('documents.manageCaseFiles')}</p>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-brand-gray p-8">
          
          {/* Upload Area */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-serif font-bold text-brand-navy mb-4">{t('documents.uploadDocuments')}</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('documents.linkToTask')}
              </label>
              <select
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold"
              >
                <option value="">{t('documents.generalDocuments')}</option>
                {tasks.filter((t) => t.status !== "COMPLETE").map((task) => (
                  <option key={task.id} value={task.id}>
                    {translateTaskTitle(task.title)}
                  </option>
                ))}
              </select>
            </div>

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging ? "border-brand-gold bg-brand-gold/5" : "border-gray-200 hover:border-brand-gold"
              }`}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                {t('documents.dragAndDrop')}
              </p>
              <p className="text-xs text-gray-400 mb-4">{t('documents.maxFileSize')}</p>
              
              <label className="inline-flex items-center px-6 py-3 bg-brand-navy hover:bg-brand-slate text-white rounded-lg cursor-pointer transition-colors">
                <Upload className="w-4 h-4 mr-2" />
                {t('documents.chooseFiles')}
                <input
                  type="file"
                  multiple
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Documents List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-serif font-bold text-brand-navy mb-4">
              {t('documents.allDocuments')} ({documents.length})
            </h2>

            {documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">{t('documents.noDocuments')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 bg-brand-navy/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-brand-navy" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-brand-navy truncate">
                          {doc.file_name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500">{getTaskName(doc.task_id)}</span>
                          {doc.file_size && (
                            <>
                              <span className="text-xs text-gray-300">•</span>
                              <span className="text-xs text-gray-500">{formatFileSize(doc.file_size)}</span>
                            </>
                          )}
                          <span className="text-xs text-gray-300">•</span>
                          <span className="text-xs text-gray-500">
                            {new Date(doc.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title={t('documents.download')}
                      >
                        <Download className="w-4 h-4 text-gray-600" />
                      </a>
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this document?")) {
                            deleteDocument.mutate(doc.id);
                          }
                        }}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title={t('common.delete')}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Documents;