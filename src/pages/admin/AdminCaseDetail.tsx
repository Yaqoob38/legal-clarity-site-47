import { Bell, Home, FileText, ArrowRight, UploadCloud, Upload, Check, MoreHorizontal, ChevronRight, ChevronDown, LayoutGrid, List, ArrowLeft, Edit2, Trash2, Plus, CheckCircle, XCircle, Unlock } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAdminCase } from "@/hooks/useAdminCase";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useQueryClient } from "@tanstack/react-query";

const AdminCaseDetail = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  console.log("📋 AdminCaseDetail - caseId:", caseId);
  
  const { caseData, tasks, isLoading, getTasksByStage } = useAdminCase(caseId);
  const [addTaskDialog, setAddTaskDialog] = useState(false);
  const [editTaskDialog, setEditTaskDialog] = useState(false);
  const [deleteTaskDialog, setDeleteTaskDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [newTask, setNewTask] = useState<{
    title: string;
    description: string;
    stage: Database["public"]["Enums"]["case_stage"];
    status: Database["public"]["Enums"]["task_status"];
  }>({
    title: "",
    description: "",
    stage: "STAGE_1",
    status: "NOT_STARTED",
  });

  const stage1Tasks = getTasksByStage("STAGE_1");
  const stage2Tasks = getTasksByStage("STAGE_2");
  const stage3Tasks = getTasksByStage("STAGE_3");

  const nextTask = tasks.find((t) => t.status === "IN_PROGRESS") || tasks.find((t) => t.status === "NOT_STARTED");

  const handleApproveTask = async (taskId: string) => {
    const { error } = await supabase
      .from("tasks")
      .update({ status: "COMPLETE" })
      .eq("id", taskId);

    if (error) {
      toast.error("Failed to approve task");
    } else {
      queryClient.invalidateQueries({ queryKey: ["admin-case-tasks", caseId] });
      toast.success("Task approved!");
    }
  };

  const handleRejectTask = async (taskId: string) => {
    const { error } = await supabase
      .from("tasks")
      .update({ status: "NOT_STARTED" })
      .eq("id", taskId);

    if (error) {
      toast.error("Failed to reject task");
    } else {
      queryClient.invalidateQueries({ queryKey: ["admin-case-tasks", caseId] });
      toast.success("Task rejected. Client needs to resubmit.");
    }
  };

  const handleUnlockTask = async (taskId: string) => {
    const { error } = await supabase
      .from("tasks")
      .update({ status: "NOT_STARTED" })
      .eq("id", taskId);

    if (error) {
      toast.error("Failed to unlock task");
    } else {
      queryClient.invalidateQueries({ queryKey: ["admin-case-tasks", caseId] });
      toast.success("Task unlocked!");
    }
  };

  const handleEditTask = (task: any) => {
    setSelectedTask(task);
    setEditTaskDialog(true);
  };

  const handleDeleteTask = (task: any) => {
    setSelectedTask(task);
    setDeleteTaskDialog(true);
  };

  const handleSaveEditTask = async () => {
    if (!selectedTask) return;
    
    const { error } = await supabase
      .from("tasks")
      .update({
        title: selectedTask.title,
        description: selectedTask.description,
        stage: selectedTask.stage,
        status: selectedTask.status,
      })
      .eq("id", selectedTask.id);

    if (error) {
      toast.error("Failed to update task");
    } else {
      queryClient.invalidateQueries({ queryKey: ["admin-case-tasks", caseId] });
      toast.success("Task updated successfully!");
      setEditTaskDialog(false);
      setSelectedTask(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedTask) return;
    
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", selectedTask.id);

    if (error) {
      toast.error("Failed to delete task");
    } else {
      queryClient.invalidateQueries({ queryKey: ["admin-case-tasks", caseId] });
      toast.success("Task deleted successfully!");
      setDeleteTaskDialog(false);
      setSelectedTask(null);
    }
  };

  const handleAddTask = async () => {
    const maxOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.order_index)) : -1;
    
    const { error } = await supabase
      .from("tasks")
      .insert({
        case_id: caseId!,
        title: newTask.title,
        description: newTask.description,
        stage: newTask.stage,
        status: newTask.status,
        order_index: maxOrder + 1,
      });

    if (error) {
      toast.error("Failed to add task");
    } else {
      queryClient.invalidateQueries({ queryKey: ["admin-case-tasks", caseId] });
      toast.success("Task added successfully!");
      setAddTaskDialog(false);
      setNewTask({ title: "", description: "", stage: "STAGE_1", status: "NOT_STARTED" });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-brand-gray h-screen flex overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  console.log("📊 Case data:", caseData);
  console.log("📝 Tasks:", tasks?.length);
  
  const clientName = caseData?.client_id 
    ? ((caseData as any)?.profiles?.full_name || "Unknown Client")
    : (caseData?.client_email ? `Invited: ${caseData.client_email}` : "No Client");

  return (
    <div className="bg-brand-gray font-sans text-brand-navy antialiased h-screen flex overflow-hidden">
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-serif text-brand-navy">Admin Case Dashboard</h1>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Case Management</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="h-8 w-px bg-gray-200"></div>
            <button 
              onClick={() => setAddTaskDialog(true)}
              className="bg-brand-navy hover:bg-brand-slate text-white px-5 py-2 rounded text-sm font-medium transition-colors shadow-lg shadow-brand-navy/20"
            >
              + Add Task
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
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Property</span>
                <div className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-brand-gold" />
                  <span className="text-lg font-serif font-medium text-brand-navy">
                    {caseData?.property_address || "Loading..."}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 pl-7">
                  {caseData?.property_postcode || ""}
                </p>
              </div>

              {/* Case Ref */}
              <div className="col-span-1 md:col-span-1 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Case Reference</span>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-gold" />
                  <span className="text-lg font-mono font-medium text-brand-navy">
                    #{caseData?.case_reference || "Loading..."}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 pl-7">
                  {caseData?.case_type || ""}
                </p>
              </div>

              {/* Client Info */}
              <div className="col-span-1 md:col-span-1 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Client</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${caseData?.client_id ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`}></div>
                  <span className="text-lg font-serif font-medium text-brand-navy">{clientName}</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 mt-2 rounded-full overflow-hidden">
                  <div className="bg-brand-gold h-full rounded-full" style={{ width: `${caseData?.progress || 25}%` }}></div>
                </div>
              </div>

              <div className="col-span-1 md:col-span-1 bg-brand-navy/5 rounded-lg p-3 flex items-center justify-between group cursor-pointer border border-transparent hover:border-brand-gold/30 transition-all"
                onClick={() => nextTask && navigate(`/dashboard/task/${nextTask.id}`)}
              >
                <div>
                  <span className="text-xs font-bold text-brand-gold uppercase tracking-widest block mb-1">Next Task</span>
                  <span className="text-sm font-bold text-brand-navy block">{nextTask?.title || "All tasks complete!"}</span>
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
              <h2 className="text-xl font-serif font-bold text-brand-navy">Tasks</h2>
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
              <span className="text-xs text-gray-400">Admin Controls Enabled</span>
            </div>
          </div>

          {/* Kanban Board (Horizontal Scrollable) */}
          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
            
            {/* Column 1: First Stage (Active) */}
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
                    className={`bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow ${
                      task.status === "IN_PROGRESS" ? "border-l-4 border-l-brand-gold" : task.status === "COMPLETE" ? "bg-gray-50 border-gray-200 opacity-75" : "border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs font-bold uppercase tracking-wider ${
                        task.status === "IN_PROGRESS" ? "text-brand-gold" :
                        task.status === "COMPLETE" ? "text-green-700 bg-green-50 px-2 py-0.5 rounded-full" :
                        task.status === "SUBMITTED" || task.status === "PENDING_REVIEW" ? "text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full" :
                        "text-gray-500"
                      }`}>
                        {task.status.replace(/_/g, " ")}
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
                      <p className="text-xs text-gray-400 mt-2">Completed</p>
                    )}
                    
                    {/* Admin Action Buttons */}
                    <div className="flex gap-1 mt-3 pt-3 border-t border-gray-100">
                      {task.status === "PENDING_REVIEW" && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            className="flex-1 text-xs h-7"
                            onClick={() => handleApproveTask(task.id)}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1 text-xs h-7"
                            onClick={() => handleRejectTask(task.id)}
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      {task.status === "LOCKED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs h-7"
                          onClick={() => handleUnlockTask(task.id)}
                        >
                          <Unlock className="w-3 h-3 mr-1" />
                          Unlock
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs h-7 px-2"
                        onClick={() => handleEditTask(task)}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs h-7 px-2 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteTask(task)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
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
                    className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${
                      task.status === "LOCKED" ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        task.status === "LOCKED" ? "bg-gray-100 text-gray-400" : 
                        task.status === "COMPLETE" ? "bg-green-50 text-green-700" :
                        task.status === "PENDING_REVIEW" ? "bg-orange-50 text-orange-500" :
                        "bg-orange-50 text-orange-500"
                      }`}>
                        {task.status.replace(/_/g, " ")}
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
                    
                    {/* Admin Action Buttons */}
                    <div className="flex gap-1 mt-3 pt-3 border-t border-gray-100">
                      {task.status === "PENDING_REVIEW" && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            className="flex-1 text-xs h-7"
                            onClick={() => handleApproveTask(task.id)}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1 text-xs h-7"
                            onClick={() => handleRejectTask(task.id)}
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      {task.status === "LOCKED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs h-7"
                          onClick={() => handleUnlockTask(task.id)}
                        >
                          <Unlock className="w-3 h-3 mr-1" />
                          Unlock
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs h-7 px-2"
                        onClick={() => handleEditTask(task)}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs h-7 px-2 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteTask(task)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
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
                      className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${
                        task.status === "LOCKED" ? "opacity-60" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          task.status === "LOCKED" ? "bg-gray-100 text-gray-400" : 
                          task.status === "COMPLETE" ? "bg-green-50 text-green-700" :
                          task.status === "PENDING_REVIEW" ? "bg-orange-50 text-orange-500" :
                          "bg-orange-50 text-orange-500"
                        }`}>
                          {task.status.replace(/_/g, " ")}
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
                      
                      {/* Admin Action Buttons */}
                      <div className="flex gap-1 mt-3 pt-3 border-t border-gray-100">
                        {task.status === "PENDING_REVIEW" && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              className="flex-1 text-xs h-7"
                              onClick={() => handleApproveTask(task.id)}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="flex-1 text-xs h-7"
                              onClick={() => handleRejectTask(task.id)}
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {task.status === "LOCKED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs h-7"
                            onClick={() => handleUnlockTask(task.id)}
                          >
                            <Unlock className="w-3 h-3 mr-1" />
                            Unlock
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs h-7 px-2"
                          onClick={() => handleEditTask(task)}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs h-7 px-2 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteTask(task)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="border-2 border-dashed border-gray-200 rounded-lg h-32 flex items-center justify-center">
                    <span className="text-xs text-gray-400">No tasks visible yet</span>
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

      {/* Add Task Dialog */}
      <Dialog open={addTaskDialog} onOpenChange={setAddTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>Create a new task for this case</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Enter task description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stage">Stage</Label>
              <Select
                value={newTask.stage}
                onValueChange={(value: any) => setNewTask({ ...newTask, stage: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STAGE_1">Stage 1: Onboarding</SelectItem>
                  <SelectItem value="STAGE_2">Stage 2: Searches & Contract</SelectItem>
                  <SelectItem value="STAGE_3">Stage 3: Exchange & Completion</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Initial Status</Label>
              <Select
                value={newTask.status}
                onValueChange={(value: any) => setNewTask({ ...newTask, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                  <SelectItem value="LOCKED">Locked</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddTaskDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddTask}
              disabled={!newTask.title}
            >
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={editTaskDialog} onOpenChange={setEditTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update task details</DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Task Title</Label>
                <Input
                  id="edit-title"
                  value={selectedTask.title}
                  onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={selectedTask.description || ""}
                  onChange={(e) => setSelectedTask({ ...selectedTask, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-stage">Stage</Label>
                <Select
                  value={selectedTask.stage}
                  onValueChange={(value: any) => setSelectedTask({ ...selectedTask, stage: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STAGE_1">Stage 1: Onboarding</SelectItem>
                    <SelectItem value="STAGE_2">Stage 2: Searches & Contract</SelectItem>
                    <SelectItem value="STAGE_3">Stage 3: Exchange & Completion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={selectedTask.status}
                  onValueChange={(value: any) => setSelectedTask({ ...selectedTask, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                    <SelectItem value="LOCKED">Locked</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="SUBMITTED">Submitted</SelectItem>
                    <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
                    <SelectItem value="COMPLETE">Complete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTaskDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEditTask}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Task Dialog */}
      <AlertDialog open={deleteTaskDialog} onOpenChange={setDeleteTaskDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedTask?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminCaseDetail;
