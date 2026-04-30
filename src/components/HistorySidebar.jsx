import React from 'react';
import { History, LayoutDashboard, Settings, User } from 'lucide-react';

const HistorySidebar = () => {
  return (
    <aside className="w-64 bg-white/5 backdrop-blur-3xl border-r border-white/10 flex flex-col h-screen relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/30 border border-white/20">
            <User className="text-white h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-white tracking-tight drop-shadow-sm">Carol Prospect</h3>
            <p className="text-xs text-blue-300 font-medium">Buscadora Nível 1</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/10 text-white font-medium rounded-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all text-sm shadow-md">
          <LayoutDashboard className="h-5 w-5 text-blue-400" />
          Nova Busca
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 font-medium rounded-xl transition-all text-sm group">
          <History className="h-5 w-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
          Histórico (Em Breve)
        </button>
      </nav>
      
      <div className="p-4 border-t border-white/10 bg-white/5">
        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 font-medium rounded-xl transition-all text-sm group">
          <Settings className="h-5 w-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
          Configurações
        </button>
      </div>
    </aside>
  );
};

export default HistorySidebar;
