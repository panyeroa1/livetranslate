
import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Mic, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight,
  Settings,
  Database
} from 'lucide-react';

const SidebarItem = ({ to, icon: Icon, label, collapsed }: { to: string; icon: any; label: string; collapsed: boolean }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center px-6 py-3.5 text-sm font-medium transition-all duration-300 relative group ${
          isActive
            ? 'bg-red-50 text-red-700 border-l-4 border-red-700 shadow-sm shadow-red-100/50'
            : 'text-gray-500 hover:bg-gray-100/80 hover:text-gray-900'
        }`
      }
    >
      <Icon className={`shrink-0 w-5 h-5 transition-all duration-300 ${collapsed ? 'mx-auto' : 'mr-3'} ${collapsed ? 'group-hover:scale-110' : ''}`} />
      <span className={`transition-all duration-300 origin-left overflow-hidden whitespace-nowrap font-black uppercase tracking-tight ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
        {label}
      </span>
      {collapsed && (
        <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 shadow-2xl translate-x-[-10px] group-hover:translate-x-0">
          {label}
        </div>
      )}
    </NavLink>
  );
};

const BottomNavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
          isActive ? 'text-red-700' : 'text-gray-400'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={`w-6 h-6 mb-1 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
          {label}
        </>
      )}
    </NavLink>
  );
};

export const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-[100] flex items-center justify-between px-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="bg-red-700 text-white p-1.5 rounded-lg font-bold w-10 h-10 flex items-center justify-center shadow-lg">S</div>
            <span className="font-black text-gray-900 text-lg tracking-tighter uppercase italic leading-none">SUCCESS <span className="text-red-700">INVEST</span></span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-600">
             {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-[90] md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed md:relative inset-y-0 left-0 z-[100] bg-white border-r border-gray-200 flex flex-col shadow-xl md:shadow-none transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className={`p-6 border-b border-gray-100 transition-all duration-300 ${isCollapsed ? 'items-center' : ''}`}>
           <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="bg-red-700 text-white p-2 rounded-xl font-bold text-2xl w-12 h-12 flex items-center justify-center shadow-red-200 shadow-xl shrink-0">S</div>
            <div className={`flex flex-col leading-none transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 pointer-events-none' : 'w-auto opacity-100'}`}>
                <span className="font-black text-gray-900 text-xl tracking-tighter uppercase italic leading-none">Success <span className="text-red-700">Invest</span></span>
                <span className="text-gray-400 font-bold text-[8px] tracking-[0.2em] uppercase mt-1 whitespace-nowrap italic">Eburon Neural Core</span>
            </div>
           </div>
        </div>
        
        <nav className="flex-1 mt-6 overflow-x-hidden scrollbar-hide">
          <div className={`px-6 py-2 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-2 transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
            Terminal Console
          </div>
          <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" collapsed={isCollapsed} />
          <SidebarItem to="/organizations" icon={Users} label="Partners" collapsed={isCollapsed} />
          <SidebarItem to="/payments" icon={CreditCard} label="Billing" collapsed={isCollapsed} />
          
          <div className={`mt-8 px-6 py-2 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-2 transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
            Neural Core
          </div>
          <SidebarItem to="/translate" icon={Mic} label="Universal Link" collapsed={isCollapsed} />
          <SidebarItem to="/archives" icon={Database} label="Neural Archives" collapsed={isCollapsed} />
          <SidebarItem to="/settings" icon={Settings} label="Engine Config" collapsed={isCollapsed} />
        </nav>

        <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden md:flex items-center justify-center py-4 border-t border-gray-100 text-gray-400 hover:text-red-700 transition-colors group">
          {isCollapsed ? <ChevronRight className="w-6 h-6" /> : <div className="flex items-center gap-2"><ChevronLeft className="w-5 h-5" /><span className="text-[10px] font-black uppercase tracking-widest">Collapse View</span></div>}
        </button>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
           <div className={`mb-4 px-4 py-3 bg-white rounded-xl border border-gray-200 flex items-center gap-3 transition-all duration-300 ${isCollapsed ? 'justify-center' : 'shadow-sm'}`}>
              <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
              <div className={`text-[9px] text-gray-500 font-black uppercase tracking-widest transition-opacity duration-300 ${isCollapsed ? 'hidden' : 'block'}`}>AES-256 SECURE</div>
           </div>
           <button className={`flex items-center w-full px-4 py-2 text-xs text-gray-400 hover:text-red-700 transition-colors font-black uppercase tracking-widest ${isCollapsed ? 'justify-center' : ''}`}>
             <LogOut className={`w-4 h-4 shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
             <span className={`${isCollapsed ? 'hidden' : 'block'}`}>Logout</span>
           </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-gray-100 relative pt-16 md:pt-0 pb-20 md:pb-0 scroll-smooth">
         <div className="px-4 py-6 md:px-12 md:py-10 max-w-[1600px] mx-auto">
            <Outlet />
         </div>
      </main>

      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-gray-200 flex items-center justify-around z-[100] px-2">
        <BottomNavItem to="/" icon={LayoutDashboard} label="Home" />
        <BottomNavItem to="/translate" icon={Mic} label="Interpret" />
        <BottomNavItem to="/archives" icon={Database} label="Logs" />
        <BottomNavItem to="/payments" icon={CreditCard} label="Bill" />
      </div>
    </div>
  );
};
