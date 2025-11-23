import { LayoutDashboard, CheckSquare, Calendar, FolderOpen, MessageSquare, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";

const DashboardSidebar = () => {
  const { user, signOut } = useAuth();

  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <aside className="w-64 bg-brand-navy flex-shrink-0 flex flex-col transition-all duration-300">
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 border-b border-white/10">
        <a href="/" className="flex items-center gap-2 group">
          <div className="bg-brand-gold text-brand-navy p-1 rounded-sm">
            <span className="font-serif font-bold text-lg">RS</span>
          </div>
          <span className="text-white font-serif text-lg tracking-wide uppercase">
            Riseam <span className="text-brand-gold">Sharples</span>
          </span>
        </a>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <NavLink
          to="/dashboard"
          className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all group"
          activeClassName="bg-white/10 text-white border-l-4 border-brand-gold"
        >
          <LayoutDashboard className="w-5 h-5 group-hover:text-brand-gold transition-colors" />
          <span className="font-medium tracking-wide">Dashboard</span>
        </NavLink>
        
        <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all group">
          <CheckSquare className="w-5 h-5 group-hover:text-brand-gold transition-colors" />
          <span className="font-medium tracking-wide">Tasks</span>
        </a>
        
        <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all group">
          <Calendar className="w-5 h-5 group-hover:text-brand-gold transition-colors" />
          <span className="font-medium tracking-wide">Calendar</span>
        </a>
        
        <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all group">
          <FolderOpen className="w-5 h-5 group-hover:text-brand-gold transition-colors" />
          <span className="font-medium tracking-wide">Documents</span>
        </a>
        
        <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all group">
          <MessageSquare className="w-5 h-5 group-hover:text-brand-gold transition-colors" />
          <span className="font-medium tracking-wide">Messages</span>
        </a>
      </nav>

      {/* User Profile (Bottom Sidebar) */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold border border-brand-gold/50">
            <span className="font-serif font-bold">{getUserInitials()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.email?.split('@')[0] || "Client"}</p>
            <p className="text-gray-500 text-xs">Client Account</p>
          </div>
          <button 
            onClick={signOut}
            className="text-gray-400 hover:text-white transition-colors"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
