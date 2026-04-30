import React from 'react';
import { History, Clock, Building2 } from 'lucide-react';

const mockHistory = [
  { id: 1, name: "Joe's Cleaning Services", time: '10 min atrás', rating: 3.8 },
  { id: 2, name: "Orlando Maids", time: '1 hora atrás', rating: 4.8 },
  { id: 3, name: "Sparkle Cleaners", time: '2 horas atrás', rating: 4.1 },
  { id: 4, name: "Pro Cleaning Solutions", time: 'Ontem', rating: 4.5 },
];

const HistorySidebar = () => {
  return (
    <aside className="w-72 bg-white/40 backdrop-blur-2xl border-r border-white/50 flex flex-col h-screen hidden md:flex shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
      <div className="p-6 border-b border-white/50 bg-white/30">
        <div className="flex items-center gap-3 text-slate-800 font-bold text-lg tracking-tight">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-apple-blue to-blue-600 flex items-center justify-center shadow-md">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          ScopeGen
        </div>
      </div>
      
      <div className="p-5 flex-1 overflow-y-auto">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <History className="h-4 w-4" /> Recentes
        </h3>
        
        <div className="space-y-2">
          {mockHistory.map((item) => (
            <button key={item.id} className="w-full text-left p-3 rounded-xl hover:bg-white/60 hover:shadow-sm transition-all border border-transparent hover:border-white/50 group">
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-slate-700 text-sm group-hover:text-apple-blue truncate pr-2 transition-colors">
                  {item.name}
                </span>
                <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-1.5 shadow-sm ${
                  item.rating >= 4.5 ? 'bg-green-500' : item.rating >= 4.0 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Clock className="h-3 w-3" /> {item.time}
              </div>
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-5 border-t border-white/50 bg-white/20 backdrop-blur-md">
        <div className="bg-white/60 rounded-xl p-4 text-xs text-slate-500 shadow-sm border border-white/50">
          <p className="font-semibold text-slate-700 mb-2">Status do Sistema</p>
          <div className="flex justify-between items-center mt-2">
            <span>Servidor Vercel</span>
            <span className="flex items-center gap-1.5 font-medium text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span> Online</span>
          </div>
          <div className="flex justify-between items-center mt-1.5">
            <span>Banco de Dados</span>
            <span className="flex items-center gap-1.5 font-medium text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span> Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default HistorySidebar;
