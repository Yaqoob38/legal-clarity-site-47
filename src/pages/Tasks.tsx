import { useNavigate } from "react-router-dom";
import { MoreHorizontal, ChevronDown, LayoutGrid, List, Upload, Check } from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useTasks } from "@/hooks/useTasks";

const getStatusColor = (status: string) => {
  switch (status) {
    case "COMPLETE":
      return "bg-green-500/20 text-green-700";
    case "IN_PROGRESS":
    case "SUBMITTED":
      return "bg-brand-gold/20 text-brand-gold";
    case "PENDING_REVIEW":
      return "bg-orange-500/20 text-orange-700";
    case "REJECTED":
      return "bg-red-500/20 text-red-700";
    case "LOCKED":
      return "bg-gray-400/20 text-gray-600";
    default:
      return "bg-gray-200 text-gray-600";
  }
};

const getStatusLabel = (status: string) => {
  return status.replace(/_/g, " ");
};

const Tasks = () => {
  const navigate = useNavigate();
  const { tasks, isLoading, getTasksByStage } = useTasks();

  const stage1Tasks = getTasksByStage("STAGE_1");
  const stage2Tasks = getTasksByStage("STAGE_2");
  const stage3Tasks = getTasksByStage("STAGE_3");

  if (isLoading) {
    return (
      <div className="bg-brand-gray h-screen flex overflow-hidden">
        <DashboardSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tasks...</p>
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
            <h1 className="text-2xl font-serif text-brand-navy">Tasks</h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Manage Your Case Tasks</p>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-gray p-8">
          
          {/* Task Board Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-serif font-bold text-brand-navy">All Tasks</h2>
              <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                <button className="px-3 py-1.5 rounded bg-brand-navy text-white text-xs font-medium flex items-center gap-2 shadow-sm">
                  <LayoutGrid className="w-3 h-3" /> Board View
                </button>
                <button className="px-3 py-1.5 rounded text-gray-500 hover:bg-gray-50 text-xs font-medium flex items-center gap-2 transition-colors">
                  <List className="w-3 h-3" /> List View
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Filter by:</span>
              <button className="flex items-center gap-1 text-xs font-medium text-brand-navy bg-white px-3 py-1.5 rounded border border-gray-200 hover:border-brand-gold transition-colors">
                Status <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Kanban Board */}
          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
            
            {/* Column 1: First Stage */}
            <div className="w-80 flex-shrink-0 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="bg-brand-navy/10 text-brand-navy px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">First Stage</span>
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
                      task.status === "IN_PROGRESS" ? "border-l-4 border-l-brand-gold" : "border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getStatusColor(task.status)}`}>
                        {getStatusLabel(task.status)}
                      </span>
                      {task.status === "COMPLETE" && (
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-brand-navy mb-1">{task.title}</h3>
                    {task.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Second Stage */}
            <div className="w-80 flex-shrink-0 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Second Stage</span>
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
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}>
                        {getStatusLabel(task.status)}
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
                  <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Third Stage</span>
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
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}>
                          {getStatusLabel(task.status)}
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
                    <span className="text-xs text-gray-400">No tasks visible yet</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Tasks;
