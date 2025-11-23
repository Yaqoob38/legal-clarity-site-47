import { Bell, Home, FileText, ArrowRight, UploadCloud, Upload, Check, MoreHorizontal, ChevronRight, ChevronDown, LayoutGrid, List } from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";

const Dashboard = () => {
  return (
    <div className="bg-brand-gray font-sans text-brand-navy antialiased h-screen flex overflow-hidden">
      {/* Sidebar Navigation */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0">
          <div>
            <h1 className="text-2xl font-serif text-brand-navy">Client Portal</h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Welcome back</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Bell className="w-6 h-6 text-gray-400 hover:text-brand-navy cursor-pointer transition-colors" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <button className="bg-brand-navy hover:bg-brand-slate text-white px-5 py-2 rounded text-sm font-medium transition-colors shadow-lg shadow-brand-navy/20">
              + Upload Document
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
                  <span className="text-lg font-serif font-medium text-brand-navy">49 Russell Square</span>
                </div>
                <p className="text-xs text-gray-400 mt-1 pl-7">London, WC1B 4JP</p>
              </div>

              {/* Case Ref */}
              <div className="col-span-1 md:col-span-1 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Case Reference</span>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-gold" />
                  <span className="text-lg font-mono font-medium text-brand-navy">#REF-2294</span>
                </div>
                <p className="text-xs text-gray-400 mt-1 pl-7">Conveyancing - Sale</p>
              </div>

              {/* Stage */}
              <div className="col-span-1 md:col-span-1 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Current Stage</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-lg font-serif font-medium text-brand-navy">First Stage</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 mt-2 rounded-full overflow-hidden">
                  <div className="bg-brand-gold h-full w-1/4 rounded-full"></div>
                </div>
              </div>

              {/* Next Task */}
              <div className="col-span-1 md:col-span-1 bg-brand-navy/5 rounded-lg p-3 flex items-center justify-between group cursor-pointer border border-transparent hover:border-brand-gold/30 transition-all">
                <div>
                  <span className="text-xs font-bold text-brand-gold uppercase tracking-widest block mb-1">Next Task</span>
                  <span className="text-sm font-bold text-brand-navy block">Sign Client Care Letter</span>
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
              <span className="text-xs text-gray-400">Filter by:</span>
              <button className="flex items-center gap-1 text-xs font-medium text-brand-navy bg-white px-3 py-1.5 rounded border border-gray-200 hover:border-brand-gold transition-colors">
                Status <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Kanban Board (Horizontal Scrollable) */}
          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
            
            {/* Column 1: First Stage (Active) */}
            <div className="w-80 flex-shrink-0 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="bg-brand-navy/10 text-brand-navy px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">First Stage</span>
                  <span className="text-gray-400 text-xs font-medium">3</span>
                </div>
                <MoreHorizontal className="w-4 h-4 text-gray-400 cursor-pointer" />
              </div>

              <div className="space-y-3">
                {/* Card: Upload */}
                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-brand-gold hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-brand-gold uppercase tracking-wider">Action Required</span>
                    <UploadCloud className="w-4 h-4 text-gray-400" />
                  </div>
                  <h3 className="text-sm font-bold text-brand-navy mb-3">Upload ID Documents</h3>
                  <div className="flex items-center justify-center border-2 border-dashed border-gray-200 rounded p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="text-center">
                      <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                      <span className="text-xs text-gray-500 block">Click to upload Passport</span>
                    </div>
                  </div>
                </div>

                {/* Card: Waiting for Approval */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">Pending Review</span>
                  </div>
                  <h3 className="text-sm font-bold text-brand-navy mb-1">Source of Funds</h3>
                  <p className="text-xs text-gray-500 mb-3">Waiting for solicitor approval.</p>
                  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-brand-navy text-white text-[10px] flex items-center justify-center border border-white">RS</div>
                    </div>
                    <span className="text-[10px] text-gray-400">Updated 2h ago</span>
                  </div>
                </div>

                {/* Card: Done */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 opacity-75">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white">
                      <Check className="w-3 h-3" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-600 line-through">Client Care Letter</h3>
                  </div>
                  <p className="text-xs text-gray-400 pl-8">Signed digitally on Nov 22</p>
                </div>
              </div>
            </div>

            {/* Column 2: Second Stage */}
            <div className="w-80 flex-shrink-0 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Second Stage</span>
                  <span className="text-gray-400 text-xs font-medium">2</span>
                </div>
                <MoreHorizontal className="w-4 h-4 text-gray-400 cursor-pointer" />
              </div>

              <div className="space-y-3">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer opacity-60">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Locked</span>
                  </div>
                  <h3 className="text-sm font-bold text-brand-navy mb-1">Local Authority Search</h3>
                  <p className="text-xs text-gray-500 mb-3">Will begin after First Stage.</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer opacity-60">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Locked</span>
                  </div>
                  <h3 className="text-sm font-bold text-brand-navy mb-1">Water & Drainage</h3>
                  <p className="text-xs text-gray-500 mb-3">Will begin after First Stage.</p>
                </div>
              </div>
            </div>

            {/* Column 3: Third Stage */}
            <div className="w-80 flex-shrink-0 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Third Stage</span>
                  <span className="text-gray-400 text-xs font-medium">0</span>
                </div>
                <MoreHorizontal className="w-4 h-4 text-gray-400 cursor-pointer" />
              </div>
              
              <div className="border-2 border-dashed border-gray-200 rounded-lg h-32 flex items-center justify-center">
                <span className="text-xs text-gray-400">No tasks visible yet</span>
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
