import React, { useState, useEffect } from 'react';
import { History, LayoutDashboard, Settings, User, ClipboardList, Menu, X } from 'lucide-react';

const HistorySidebar = ({ onSelectHistory, onViewSent, currentView }) => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const fetchHistory = () => {
      try {
        const localHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        setHistory(localHistory);
      } catch (err) {
        console.error("Failed to fetch local history", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
    const interval = setInterval(fetchHistory, 3000);
    return () => clearInterval(interval);
  }, []);

  const sentCount = (() => {
    try { return JSON.parse(localStorage.getItem('dismissedLeads') || '[]').length; } catch { return 0; }
  })();

  const sidebarContent = (
    <>
      <div className="p-4 sm:p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/30 border border-white/20">
            <User className="text-white h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <h3 className="font-bold text-white tracking-tight drop-shadow-sm text-sm sm:text-base">Anti-Agência Prospect</h3>
            <p className="text-[10px] sm:text-xs text-blue-300 font-medium">Buscadora Nível 1</p>
          </div>
        </div>
      </div>
      
      <div className="p-3 sm:p-4 border-b border-white/10 space-y-2">
        <button 
          onClick={() => { 
            if (onViewSent) onViewSent('search'); 
            setIsMobileOpen(false);
          }} 
          className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 font-medium rounded-xl border transition-all text-xs sm:text-sm ${currentView === 'search' ? 'bg-white/15 text-white border-white/20 shadow-md' : 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10'}`}
        >
          <LayoutDashboard className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
          Busca de Leads
        </button>
        <button 
          onClick={() => { 
            if (onViewSent) onViewSent('sent'); 
            setIsMobileOpen(false);
          }} 
          className={`w-full flex items-center justify-between gap-3 px-3 sm:px-4 py-2.5 sm:py-3 font-medium rounded-xl border transition-all text-xs sm:text-sm ${currentView === 'sent' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20 shadow-md' : 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10'}`}
        >
          <span className="flex items-center gap-3">
            <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
            Leads Enviados
          </span>
          {sentCount > 0 && (
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">{sentCount}</span>
          )}
        </button>
      </div>

      <nav className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-2">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <History className="h-3 w-3" /> Histórico Recente
        </h4>
        
        {isLoading ? (
          <p className="text-xs text-slate-500 text-center py-4">Carregando...</p>
        ) : history.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">Nenhuma busca recente</p>
        ) : (
          history.filter(item => item.type === 'batch_search').map((item, idx) => (
            <button 
              key={idx}
              onClick={() => { 
                onSelectHistory && item.results && onSelectHistory(item.results);
                if (onViewSent) onViewSent('search');
                setIsMobileOpen(false);
              }}
              className="w-full text-left p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group"
            >
              <p className="font-bold text-slate-200 text-xs sm:text-sm group-hover:text-blue-300 transition-colors truncate">
                {item.query}
              </p>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium truncate mt-0.5">
                em {item.location}
              </p>
              <div className="flex items-center justify-between mt-1.5 sm:mt-2">
                <span className="text-[9px] sm:text-[10px] bg-blue-500/20 text-blue-300 px-1.5 sm:px-2 py-0.5 rounded-full font-bold">
                  {item.results ? item.results.length : 0} leads
                </span>
                <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium">{item.time}</span>
              </div>
            </button>
          ))
        )}
      </nav>
      
      <div className="p-3 sm:p-4 border-t border-white/10 bg-black/20">
        <button className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 text-slate-400 font-medium rounded-xl border border-white/5 transition-all text-xs sm:text-sm hover:bg-white/10 hover:text-white group">
          <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Configurações
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Hamburger */}
      <button 
        onClick={() => setIsMobileOpen(true)} 
        className="fixed top-4 left-4 z-50 sm:hidden p-2.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white shadow-lg"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 sm:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden sm:flex w-64 bg-white/5 backdrop-blur-3xl border-r border-white/10 flex-col h-screen relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar (slide-in) */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-slate-900/95 backdrop-blur-3xl border-r border-white/10 flex flex-col z-50 shadow-[4px_0_24px_rgba(0,0,0,0.4)] transition-transform duration-300 sm:hidden ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <button onClick={() => setIsMobileOpen(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors">
          <X className="h-5 w-5" />
        </button>
        {sidebarContent}
      </aside>
    </>
  );
};

export default HistorySidebar;
