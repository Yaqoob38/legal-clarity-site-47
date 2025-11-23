import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Home, FileText, MoreHorizontal, Check, X, Plus, Edit, 
  MessageSquare, Calendar, CheckCircle, XCircle, Lock, ChevronRight,
  LayoutGrid, List, Upload
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useState } from "react";

const AdminCaseDetail = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [addTaskDialog, setAddTaskDialog] = useState(false);
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

  const { data: caseData, isLoading: caseLoading } = useQuery({
    queryKey: ["admin-case", caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cases")
        .select(`
          *,
          profiles(full_name, phone)
        `)
        .eq("id", caseId!)
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: 2 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["admin-case-tasks", caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("case_id", caseId!)
        .order("order_index");

      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const approveTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from("tasks")
        .update({ status: "COMPLETE" })
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-case-tasks", caseId] });
      toast.success("Task approved!");
    },
  });

  const rejectTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from("tasks")
        .update({ status: "NOT_STARTED" })
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-case-tasks", caseId] });
      toast.success("Task rejected. Client needs to resubmit.");
    },
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: Database["public"]["Enums"]["task_status"] }) => {
      const { error } = await supabase
        .from("tasks")
        .update({ status })
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-case-tasks", caseId] });
      toast.success("Task updated!");
    },
  });

  const addTaskMutation = useMutation({
    mutationFn: async () => {
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

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-case-tasks", caseId] });
      toast.success("Task added successfully!");
      setAddTaskDialog(false);
      setNewTask({ title: "", description: "", stage: "STAGE_1", status: "NOT_STARTED" });
    },
  });

  const getTasksByStage = (stage: string) => {
    return tasks.filter((task) => task.stage === stage);
  };

  const stage1Tasks = getTasksByStage("STAGE_1");
  const stage2Tasks = getTasksByStage("STAGE_2");
  const stage3Tasks = getTasksByStage("STAGE_3");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETE":
        return "text-green-700 bg-green-50";
      case "IN_PROGRESS":
        return "text-brand-gold bg-brand-gold/10";
      case "SUBMITTED":
      case "PENDING_REVIEW":
        return "text-orange-500 bg-orange-50";
      case "LOCKED":
        return "text-gray-400 bg-gray-100";
      default:
        return "text-gray-500";
    }
  };

  if (caseLoading || tasksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-gray">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading case dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-gray font-sans text-brand-navy antialiased min-h-screen">
      {/* Top Header */}
      <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-serif text-brand-navy">Case Dashboard</h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Admin View</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setAddTaskDialog(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
          <Button onClick={() => navigate(`/admin/cases/${caseId}/edit`)} variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit Case
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-8">
        {/* Case Overview Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Property */}
            <div className="col-span-1 md:col-span-1 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Property</span>
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-brand-gold" />
                <span className="text-lg font-serif font-medium text-brand-navy">
                  {caseData?.property_address || "N/A"}
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
                  #{caseData?.case_reference || "N/A"}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1 pl-7">
                {caseData?.case_type || ""}
              </p>
            </div>

            {/* Client Info */}
            <div className="col-span-1 md:col-span-1 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Client</span>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="min-w-0">
                  <span className="text-lg font-serif font-medium text-brand-navy block truncate">
                    {caseData?.client_id
                      ? (caseData?.profiles as any)?.full_name || "Unknown"
                      : "Pending signup"}
                  </span>
                  <p className="text-xs text-gray-400 truncate">
                    {caseData?.client_email || "No email"}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="col-span-1 md:col-span-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Progress</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-brand-navy">{caseData?.progress || 0}%</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 mt-2 rounded-full overflow-hidden">
                <div className="bg-brand-gold h-full rounded-full" style={{ width: `${caseData?.progress || 0}%` }}></div>
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
        </div>

        {/* Kanban Board */}
        <div className="flex gap-6 overflow-x-auto pb-6">
          {/* Stage 1 */}
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
                    task.status === "PENDING_REVIEW" ? "border-l-4 border-l-orange-500" : 
                    task.status === "COMPLETE" ? "bg-gray-50 border-gray-200 opacity-75" : "border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}>
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
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{task.description}</p>
                  )}
                  
                  {/* Admin Actions */}
                  {task.status === "PENDING_REVIEW" && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                      <Button
                        size="sm"
                        variant="default"
                        className="flex-1 text-xs"
                        onClick={() => approveTaskMutation.mutate(task.id)}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1 text-xs"
                        onClick={() => rejectTaskMutation.mutate(task.id)}
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                  {task.status !== "PENDING_REVIEW" && task.status !== "COMPLETE" && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={() => updateTaskStatusMutation.mutate({ taskId: task.id, status: "LOCKED" })}
                      >
                        <Lock className="w-3 h-3 mr-1" />
                        Lock
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Stage 2 */}
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
                  className={`bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow ${
                    task.status === "PENDING_REVIEW" ? "border-l-4 border-l-orange-500" : 
                    task.status === "COMPLETE" ? "bg-gray-50 border-gray-200 opacity-75" : "border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}>
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
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{task.description}</p>
                  )}
                  
                  {/* Admin Actions */}
                  {task.status === "PENDING_REVIEW" && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                      <Button
                        size="sm"
                        variant="default"
                        className="flex-1 text-xs"
                        onClick={() => approveTaskMutation.mutate(task.id)}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1 text-xs"
                        onClick={() => rejectTaskMutation.mutate(task.id)}
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                  {task.status !== "PENDING_REVIEW" && task.status !== "COMPLETE" && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={() => updateTaskStatusMutation.mutate({ taskId: task.id, status: "LOCKED" })}
                      >
                        <Lock className="w-3 h-3 mr-1" />
                        Lock
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Stage 3 */}
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
                    className={`bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow ${
                      task.status === "PENDING_REVIEW" ? "border-l-4 border-l-orange-500" : 
                      task.status === "COMPLETE" ? "bg-gray-50 border-gray-200 opacity-75" : "border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}>
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
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{task.description}</p>
                    )}
                    
                    {/* Admin Actions */}
                    {task.status === "PENDING_REVIEW" && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                        <Button
                          size="sm"
                          variant="default"
                          className="flex-1 text-xs"
                          onClick={() => approveTaskMutation.mutate(task.id)}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1 text-xs"
                          onClick={() => rejectTaskMutation.mutate(task.id)}
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                    {task.status !== "PENDING_REVIEW" && task.status !== "COMPLETE" && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs"
                          onClick={() => updateTaskStatusMutation.mutate({ taskId: task.id, status: "LOCKED" })}
                        >
                          <Lock className="w-3 h-3 mr-1" />
                          Lock
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-lg h-32 flex items-center justify-center">
                  <span className="text-xs text-gray-400">No tasks in this stage yet</span>
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
              onClick={() => addTaskMutation.mutate()}
              disabled={!newTask.title}
            >
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCaseDetail;
