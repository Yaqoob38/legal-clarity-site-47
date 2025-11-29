import { LayoutDashboard, CheckSquare, Calendar, FolderOpen, MessageSquare, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";

const DashboardSidebar = () => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();

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
          <span className="font-medium tracking-wide">{t('nav.dashboard')}</span>
        </NavLink>
        <NavLink
          to="/dashboard/tasks"
          className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all group"
          activeClassName="bg-white/10 text-white border-l-4 border-brand-gold"
        >
          <CheckSquare className="w-5 h-5 group-hover:text-brand-gold transition-colors" />
          <span className="font-medium tracking-wide">{t('nav.tasks')}</span>
        </NavLink>
        
        <NavLink
          to="/dashboard/calendar"
          className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all group"
          activeClassName="bg-white/10 text-white border-l-4 border-brand-gold"
        >
          <Calendar className="w-5 h-5 group-hover:text-brand-gold transition-colors" />
          <span className="font-medium tracking-wide">{t('nav.calendar')}</span>
        </NavLink>
        
        <NavLink
          to="/dashboard/documents"
          className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all group"
          activeClassName="bg-white/10 text-white border-l-4 border-brand-gold"
        >
          <FolderOpen className="w-5 h-5 group-hover:text-brand-gold transition-colors" />
          <span className="font-medium tracking-wide">{t('nav.documents')}</span>
        </NavLink>
        
        <NavLink
          to="/dashboard/messages"
          className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all group"
          activeClassName="bg-white/10 text-white border-l-4 border-brand-gold"
        >
          <MessageSquare className="w-5 h-5 group-hover:text-brand-gold transition-colors" />
          <span className="font-medium tracking-wide">{t('nav.messages')}</span>
        </NavLink>
      </nav>

      {/* User Profile (Bottom Sidebar) */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-between px-2 mb-3">
          <LanguageToggle />
        </div>
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold border border-brand-gold/50">
            <span className="font-serif font-bold">{getUserInitials()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.email?.split('@')[0] || t('common.client')}</p>
            <p className="text-gray-500 text-xs">{t('common.client')} {t('common.account')}</p>
          </div>
          <button 
            onClick={signOut}
            className="text-gray-400 hover:text-white transition-colors"
            title={t('auth.signOut')}
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
