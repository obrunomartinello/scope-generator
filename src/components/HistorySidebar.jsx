import React, { useState, useEffect } from 'react';
import { History, LayoutDashboard, Settings, User } from 'lucide-react';

const HistorySidebar = ({ onSelectHistory }) => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
    
    // Optional: Refresh history periodically or when localStorage changes
    const interval = setInterval(fetchHistory, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="w-64 bg-white/5 backdrop-blur-3xl border-r border-white/10 flex flex-col h-screen relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/30 border border-white/20">
            <User className="text-white h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-white tracking-tight drop-shadow-sm">Anti-Agência Prospect</h3>
            <p className="text-xs text-blue-300 font-medium">Buscadora Nível 1</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-b border-white/10">
        <button onClick={() => window.location.reload()} className="w-full flex items-center gap-3 px-4 py-3 bg-white/10 text-white font-medium rounded-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all text-sm shadow-md hover:bg-white/20">
          <LayoutDashboard className="h-5 w-5 text-blue-400" />
          Nova Busca
        </button>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto space-y-2">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <History className="h-3 w-3" /> Histórico Recente
        </h4>
        
        {isLoading ? (
          <p className="text-xs text-slate-500 text-center py-4">Carregando histórico...</p>
        ) : history.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">Nenhuma busca recente</p>
        ) : (
          history.filter(item => item.type === 'batch_search').map((item, idx) => (
            <button 
              key={idx}
              onClick={() => onSelectHistory && item.results && onSelectHistory(item.results)}
              className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group"
            >
              <p className="font-bold text-slate-200 text-sm group-hover:text-blue-300 transition-colors truncate">
                {item.query}
              </p>
              <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
                em {item.location}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-bold">
                  {item.results ? item.results.length : 0} leads
                </span>
                <span className="text-[10px] text-slate-500 font-medium">{item.time}</span>
              </div>
            </button>
          ))
        )}
      </nav>
      
      <div className="p-4 border-t border-white/10 bg-black/20">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 text-slate-400 font-medium rounded-xl border border-white/5 transition-all text-sm hover:bg-white/10 hover:text-white group">
          <Settings className="h-4 w-4" />
          Configurações (Inativo)
        </button>
      </div>
    </aside>
  );
};

export default HistorySidebar;
