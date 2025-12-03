import { Bell, Home, FileText, ArrowRight, UploadCloud, Upload, Check, MoreHorizontal, ChevronRight, ChevronDown, LayoutGrid, List } from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import NotificationsPanel from "@/components/NotificationsPanel";
import { useNavigate } from "react-router-dom";
import { useCase } from "@/hooks/useCase";
import { useTasks } from "@/hooks/useTasks";
import { useLanguage } from "@/contexts/LanguageContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { userCase, isLoading: caseLoading } = useCase();
  const { tasks, isLoading: tasksLoading, getTasksByStage } = useTasks();
  const { t } = useLanguage();

  const stage1Tasks = getTasksByStage("STAGE_1");
  const stage2Tasks = getTasksByStage("STAGE_2");
  const stage3Tasks = getTasksByStage("STAGE_3");

  const nextTask = tasks.find((t) => t.status === "IN_PROGRESS") || tasks.find((t) => t.status === "NOT_STARTED");

  if (caseLoading || tasksLoading) {
    return (
      <div className="bg-brand-gray h-screen flex overflow-hidden">
        <DashboardSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">{t('dashboard.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show message if no case is assigned
  if (!userCase) {
    return (
      <div className="bg-brand-gray h-screen flex overflow-hidden">
        <DashboardSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <Home className="w-16 h-16 text-brand-gold mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold text-brand-navy mb-2">{t('dashboard.welcome')}</h2>
            <p className="text-gray-600 mb-4">
              {t('dashboard.caseSetup')}
            </p>
            <p className="text-sm text-gray-500">
              {t('dashboard.contactSolicitor')}
            </p>
          </div>
        </div>
      </div>
    );
  }
  // Helper function to translate task status
  const translateStatus = (status: string) => {
    return t(`status.${status}`) || status.replace(/_/g, " ");
  };

  return (
    <div className="bg-brand-gray font-sans text-brand-navy antialiased h-screen flex overflow-hidden">
      {/* Sidebar Navigation */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0">
          <div>
            <h1 className="text-2xl font-serif text-brand-navy">{t('dashboard.clientPortal')}</h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest">{t('dashboard.welcomeBack')}</p>
          </div>
          <div className="flex items-center gap-6">
            <NotificationsPanel />
            <div className="h-8 w-px bg-gray-200"></div>
            <button 
              onClick={() => navigate("/dashboard/documents")}
              className="bg-brand-navy hover:bg-brand-slate text-white px-5 py-2 rounded text-sm font-medium transition-colors shadow-lg shadow-brand-navy/20"
            >
              {t('dashboard.uploadDocument')}
            </button>
          </div>
        </header>

        {/* Scrollable Dashboard Content */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-gray p-8">
          
          {/* Case Overview Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Property */}
              <div className="col-span-1 md:col-span-1 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">{t('dashboard.property')}</span>
                <div className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-brand-gold" />
                  <span className="text-lg font-serif font-medium text-brand-navy">
                    {userCase?.property_address || t('common.loading')}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 pl-7">
                  {userCase?.property_postcode || ""}
                </p>
              </div>

              {/* Case Ref */}
              <div className="col-span-1 md:col-span-1 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">{t('dashboard.caseReference')}</span>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-gold" />
                  <span className="text-lg font-mono font-medium text-brand-navy">
                    #{userCase?.case_reference || t('common.loading')}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 pl-7">
                  {userCase?.case_type || ""}
                </p>
              </div>

              {/* Stage */}
              <div className="col-span-1 md:col-span-1 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">{t('dashboard.currentStage')}</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-lg font-serif font-medium text-brand-navy">{t('dashboard.firstStage')}</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 mt-2 rounded-full overflow-hidden">
                  <div className="bg-brand-gold h-full rounded-full" style={{ width: `${userCase?.progress || 25}%` }}></div>
                </div>
              </div>

              <div className="col-span-1 md:col-span-1 bg-brand-navy/5 rounded-lg p-3 flex items-center justify-between group cursor-pointer border border-transparent hover:border-brand-gold/30 transition-all"
                onClick={() => nextTask && navigate(`/dashboard/task/${nextTask.id}`)}
              >
                <div>
                  <span className="text-xs font-bold text-brand-gold uppercase tracking-widest block mb-1">{t('dashboard.nextTask')}</span>
                  <span className="text-sm font-bold text-brand-navy block">{nextTask?.title || t('dashboard.allTasksComplete')}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <ArrowRight className="w-4 h-4 text-brand-gold" />
                </div>
              </div>
            </div>
          </div>

          {/* Task Board Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-serif font-bold text-brand-navy">{t('tasks.title')}</h2>
              <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                <button className="px-3 py-1.5 rounded bg-brand-navy text-white text-xs font-medium flex items-center gap-2 shadow-sm">
                  <LayoutGrid className="w-3 h-3" /> {t('dashboard.boardView')}
                </button>
                <button className="px-3 py-1.5 rounded text-gray-500 hover:bg-gray-50 text-xs font-medium flex items-center gap-2 transition-colors">
                  <List className="w-3 h-3" /> {t('dashboard.listView')}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{t('dashboard.filterBy')}</span>
              <button className="flex items-center gap-1 text-xs font-medium text-brand-navy bg-white px-3 py-1.5 rounded border border-gray-200 hover:border-brand-gold transition-colors">
                {t('dashboard.status')} <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Kanban Board (Horizontal Scrollable) */}
          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
            
            {/* Column 1: First Stage (Active) */}
            <div className="w-80 flex-shrink-0 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="bg-brand-navy/10 text-brand-navy px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">{t('dashboard.firstStage')}</span>
                  <span className="text-gray-400 text-xs font-medium">{stage1Tasks.length}</span>
                </div>
                <MoreHorizontal className="w-4 h-4 text-gray-400 cursor-pointer" />
              </div>

              <div className="space-y-3">
                {stage1Tasks.map((task) => (
                  <div 
                    key={task.id}
                    onClick={() => navigate(`/dashboard/task/${task.id}`)}
                    className={`bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer ${
                      task.status === "IN_PROGRESS" ? "border-l-4 border-l-brand-gold" : task.status === "COMPLETE" ? "bg-gray-50 border-gray-200 opacity-75" : "border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs font-bold uppercase tracking-wider ${
                        task.status === "IN_PROGRESS" ? "text-brand-gold" :
                        task.status === "COMPLETE" ? "text-green-700 bg-green-50 px-2 py-0.5 rounded-full" :
                        task.status === "SUBMITTED" ? "text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full" :
                        "text-gray-500"
                      }`}>
                        {translateStatus(task.status)}
                      </span>
                      {task.status === "COMPLETE" && (
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      {task.status === "IN_PROGRESS" && (
                        <UploadCloud className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-brand-navy mb-1">{task.title}</h3>
                    {task.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>
                    )}
                    {task.status === "COMPLETE" && (
                      <p className="text-xs text-gray-400 mt-2">{t('dashboard.completed')}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Second Stage */}
            <div className="w-80 flex-shrink-0 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">{t('dashboard.secondStage')}</span>
                  <span className="text-gray-400 text-xs font-medium">{stage2Tasks.length}</span>
                </div>
                <MoreHorizontal className="w-4 h-4 text-gray-400 cursor-pointer" />
              </div>

              <div className="space-y-3">
                {stage2Tasks.map((task) => (
                  <div 
                    key={task.id}
                    onClick={() => navigate(`/dashboard/task/${task.id}`)}
                    className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer ${
                      task.status === "LOCKED" ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        task.status === "LOCKED" ? "bg-gray-100 text-gray-400" : "bg-orange-50 text-orange-500"
                      }`}>
                        {translateStatus(task.status)}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-brand-navy mb-1">{task.title}</h3>
                    {task.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Third Stage */}
            <div className="w-80 flex-shrink-0 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">{t('dashboard.thirdStage')}</span>
                  <span className="text-gray-400 text-xs font-medium">{stage3Tasks.length}</span>
                </div>
                <MoreHorizontal className="w-4 h-4 text-gray-400 cursor-pointer" />
              </div>
              <div className="space-y-3">
                {stage3Tasks.length > 0 ? (
                  stage3Tasks.map((task) => (
                    <div 
                      key={task.id}
                      onClick={() => navigate(`/dashboard/task/${task.id}`)}
                      className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer ${
                        task.status === "LOCKED" ? "opacity-60" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          task.status === "LOCKED" ? "bg-gray-100 text-gray-400" : "bg-orange-50 text-orange-500"
                        }`}>
                          {translateStatus(task.status)}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-brand-navy mb-1">{task.title}</h3>
                      {task.description && (
                        <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="border-2 border-dashed border-gray-200 rounded-lg h-32 flex items-center justify-center">
                    <span className="text-xs text-gray-400">{t('dashboard.noTasksYet')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Arrow Connector */}
            <div className="flex flex-col justify-center">
              <div className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 hover:text-brand-gold hover:border-brand-gold cursor-pointer transition-colors">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
