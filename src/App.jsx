import React, { useState, useEffect } from 'react';
import { Search, Loader2, Gauge } from 'lucide-react';
import ScopeCard from './components/ScopeCard';
import HistorySidebar from './components/HistorySidebar';

function App() {
  const [query, setQuery] = useState(() => localStorage.getItem('lastQuery') || '');
  const [location, setLocation] = useState(() => localStorage.getItem('lastLocation') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [searchCount, setSearchCount] = useState(() => parseInt(localStorage.getItem('searchCount') || '0'));
  const [dailyQuota, setDailyQuota] = useState(() => parseInt(localStorage.getItem('dailyQuota') || '150'));
  const [dismissedLeads, setDismissedLeads] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dismissedLeads') || '[]'); } catch { return []; }
  });
  const [currentScope, setCurrentScope] = useState(() => {
    const saved = localStorage.getItem('currentScope');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });

  useEffect(() => {
    localStorage.setItem('lastQuery', query);
    localStorage.setItem('lastLocation', location);
    localStorage.setItem('searchCount', searchCount);
    localStorage.setItem('dailyQuota', dailyQuota);
    localStorage.setItem('dismissedLeads', JSON.stringify(dismissedLeads));
    if (currentScope) {
      localStorage.setItem('currentScope', JSON.stringify(currentScope));
    }
  }, [query, location, currentScope, searchCount, dailyQuota, dismissedLeads]);

  const handleDismiss = (leadId) => {
    setDismissedLeads(prev => [...new Set([...prev, leadId])]);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/generate-scope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, location })
      });
      
      const data = await response.json();
      setCurrentScope(data);
      
      const leadsFound = data.length || 0;
      setSearchCount(prev => prev + 1);
      setDailyQuota(prev => Math.max(0, prev - leadsFound));
      
      // Save to local history
      const savedHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      const newHistoryItem = { query, location, results: data, type: 'batch_search', time: new Date().toLocaleTimeString() };
      const newHistory = [newHistoryItem, ...savedHistory].slice(0, 20);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      
    } catch (error) {
      console.error("Failed to fetch scope:", error);
      alert("Erro ao buscar dados da empresa. Verifique sua conexão.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-slate-100 bg-[#0f172a] bg-[url('https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=2000')] bg-cover bg-center bg-fixed">
      {/* Dark Overlay for better contrast */}
      <div className="absolute inset-0 bg-slate-950/60 pointer-events-none"></div>

      <div className="relative z-10 flex w-full">
        <HistorySidebar onSelectHistory={setCurrentScope} />
        
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Header / Search Bar - Liquid Glass */}
          <header className="bg-white/5 backdrop-blur-[40px] border-b border-white/10 p-6 flex flex-col gap-4 sticky top-0 z-10 shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-md">Anti-Agência Prospecting 🕵️‍♂️</h1>
                <p className="text-sm text-slate-300 font-medium mt-1">Central de Achados e Perdidos 🛸</p>
              </div>

              {/* Termômetro */}
              <div className="hidden lg:flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 px-5 py-2.5 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all">
                <div className="p-1.5 bg-rose-500/20 rounded-full">
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 text-rose-400 animate-spin" />
                  ) : (
                    <Gauge className="h-5 w-5 text-rose-400" />
                  )}
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 flex items-center gap-2">
                    Termômetro API
                    {searchCount > 0 && <span className="bg-blue-500/20 text-blue-300 px-1.5 py-0 rounded-sm">{searchCount} buscas hoje</span>}
                  </p>
                  <p className="text-sm font-bold text-white flex items-center gap-2">
                    {isLoading ? (
                      <span className="animate-pulse">Calculando consumo...</span>
                    ) : (
                      <>
                        {dailyQuota} Leads restantes <span className="text-xs font-normal text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded-full">(Cota de segurança)</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSearch} className="flex gap-3 max-w-4xl mt-2">
              <div className="flex-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-300 group-focus-within:text-white transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Ex: jardinagem, limpeza, construção..."
                  className="block w-full pl-11 pr-4 py-3.5 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] transition-all font-medium"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="w-1/3">
                <input
                  type="text"
                  placeholder="Cidade/Estado"
                  className="block w-full px-5 py-3.5 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] transition-all font-medium"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3.5 bg-gradient-to-r from-blue-500/80 to-purple-500/80 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-full shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 backdrop-blur-xl"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="hidden sm:inline">Analisando (pode levar 20s)...</span>
                    <span className="sm:hidden">Analisando...</span>
                  </>
                ) : (
                  '🔍 Caçar Leads Perdidões'
                )}
              </button>
            </form>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8 relative">
            <div className="max-w-5xl mx-auto">
              {currentScope && Array.isArray(currentScope) ? (
                <div className="space-y-8">
                  <div className="flex justify-between items-end px-2">
                    <h2 className="text-xl font-bold text-white drop-shadow-md">
                      Encontramos {currentScope.length} empresas
                      {dismissedLeads.length > 0 && (
                        <span className="text-sm font-normal text-emerald-300 ml-2">
                          ({currentScope.filter(s => dismissedLeads.includes(s.id || s.name)).length} já enviadas pro Docs)
                        </span>
                      )}
                    </h2>
                    <span className="text-xs text-white/80 bg-white/10 backdrop-blur-2xl px-4 py-2 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-white/10 font-bold uppercase tracking-wider">
                      Busca em Lote concluída
                    </span>
                  </div>
                  
                  <div className="space-y-12">
                    {currentScope.map((scope, idx) => (
                      <ScopeCard 
                        key={scope.id || idx} 
                        scope={scope} 
                        onDismiss={handleDismiss} 
                        isDismissed={dismissedLeads.includes(scope.id || scope.name)} 
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20 text-slate-300">
                  <div className="w-24 h-24 rounded-full bg-white/5 backdrop-blur-3xl border border-white/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)] flex items-center justify-center mb-4">
                    <Search className="h-10 w-10 text-white/50" />
                  </div>
                  <h3 className="text-3xl font-bold text-white drop-shadow-lg">Radar Pronto</h3>
                  <p className="max-w-md text-base font-medium text-slate-300 drop-shadow-md">
                    Digite um nicho e uma cidade. O robô vai varrer a região e diagnosticar quem precisa de ajuda urgente.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
