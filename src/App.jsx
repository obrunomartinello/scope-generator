import React, { useState, useEffect } from 'react';
import { Search, Loader2, Gauge, CheckCircle2, Building2, MapPin, Star, Phone, Mail, Globe, ExternalLink } from 'lucide-react';
import ScopeCard from './components/ScopeCard';
import HistorySidebar from './components/HistorySidebar';

function App() {
  const [query, setQuery] = useState(() => localStorage.getItem('lastQuery') || '');
  const [location, setLocation] = useState(() => localStorage.getItem('lastLocation') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [searchCount, setSearchCount] = useState(() => parseInt(localStorage.getItem('searchCount') || '0'));
  const [dailyQuota, setDailyQuota] = useState(() => parseInt(localStorage.getItem('dailyQuota') || '150'));
  const [currentView, setCurrentView] = useState('search'); // 'search' | 'sent'
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

  // Collect ALL sent leads from ALL search history
  const getSentLeads = () => {
    const allHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    const allLeads = [];
    allHistory.forEach(h => {
      if (h.results && Array.isArray(h.results)) {
        h.results.forEach(lead => {
          if (dismissedLeads.includes(lead.id || lead.name)) {
            if (!allLeads.find(l => (l.id || l.name) === (lead.id || lead.name))) {
              allLeads.push({ ...lead, _searchQuery: h.query, _searchLocation: h.location });
            }
          }
        });
      }
    });
    // Also check current scope
    if (currentScope && Array.isArray(currentScope)) {
      currentScope.forEach(lead => {
        if (dismissedLeads.includes(lead.id || lead.name)) {
          if (!allLeads.find(l => (l.id || l.name) === (lead.id || lead.name))) {
            allLeads.push(lead);
          }
        }
      });
    }
    return allLeads;
  };

  return (
    <div className="min-h-screen flex text-slate-100 bg-[#0f172a] bg-[url('https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=2000')] bg-cover bg-center bg-fixed">
      <div className="absolute inset-0 bg-slate-950/60 pointer-events-none"></div>

      <div className="relative z-10 flex w-full">
        <HistorySidebar 
          onSelectHistory={(data) => { setCurrentScope(data); setCurrentView('search'); }} 
          onViewSent={setCurrentView}
          currentView={currentView}
        />
        
        <main className="flex-1 flex flex-col h-screen overflow-hidden">

          {currentView === 'search' ? (
            <>
              {/* Header / Search Bar */}
              <header className="bg-white/5 backdrop-blur-[40px] border-b border-white/10 p-3 sm:p-6 flex flex-col gap-3 sm:gap-4 sticky top-0 z-10 shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
                <div className="flex justify-between items-center pl-10 sm:pl-0">
                  <div>
                    <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">Anti-Agência Prospecting 🕵️‍♂️</h1>
                    <p className="text-[11px] sm:text-sm text-slate-300 font-medium mt-0.5 sm:mt-1">Central de Achados e Perdidos 🛸</p>
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
                
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 sm:gap-3 max-w-4xl mt-1 sm:mt-2 pl-10 sm:pl-0">
                  <div className="flex-1 relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 sm:h-5 sm:w-5 text-slate-300 group-focus-within:text-white transition-colors" />
                    </div>
                    <input
                      type="text"
                      placeholder="Ex: jardinagem, limpeza, construção..."
                      className="block w-full pl-10 sm:pl-11 pr-4 py-3 sm:py-3.5 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] transition-all font-medium text-sm sm:text-base"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 sm:gap-3">
                    <input
                      type="text"
                      placeholder="Cidade/Estado"
                      className="flex-1 sm:w-48 px-4 sm:px-5 py-3 sm:py-3.5 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] transition-all font-medium text-sm sm:text-base"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-5 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-blue-500/80 to-purple-500/80 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-full shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-white/20 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 backdrop-blur-xl text-sm sm:text-base whitespace-nowrap"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                          <span className="hidden sm:inline">Analisando...</span>
                        </>
                      ) : (
                        <>🔍 <span className="hidden sm:inline">Caçar Leads</span><span className="sm:hidden">Buscar</span></>
                      )}
                    </button>
                  </div>
                </form>
              </header>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-8 relative">
                <div className="max-w-5xl mx-auto">
                  {currentScope && Array.isArray(currentScope) ? (
                    <div className="space-y-6 sm:space-y-8">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end px-2 gap-2">
                        <h2 className="text-lg sm:text-xl font-bold text-white drop-shadow-md">
                          Encontramos {currentScope.length} empresas
                          {dismissedLeads.length > 0 && (
                            <span className="text-xs sm:text-sm font-normal text-emerald-300 ml-2">
                              ({currentScope.filter(s => dismissedLeads.includes(s.id || s.name)).length} enviadas)
                            </span>
                          )}
                        </h2>
                        <span className="text-[10px] sm:text-xs text-white/80 bg-white/10 backdrop-blur-2xl px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-white/10 font-bold uppercase tracking-wider">
                          Busca concluída
                        </span>
                      </div>
                      
                      <div className="space-y-8 sm:space-y-12">
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
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 sm:space-y-6 py-20 text-slate-300 px-4">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/5 backdrop-blur-3xl border border-white/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)] flex items-center justify-center mb-4">
                        <Search className="h-8 w-8 sm:h-10 sm:w-10 text-white/50" />
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">Radar Pronto</h3>
                      <p className="max-w-md text-sm sm:text-base font-medium text-slate-300 drop-shadow-md">
                        Digite um nicho e uma cidade. O robô vai varrer a região e diagnosticar quem precisa de ajuda urgente.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* ===== SENT LEADS VIEW ===== */
            <>
              <header className="bg-white/5 backdrop-blur-[40px] border-b border-white/10 p-4 sm:p-6 sticky top-0 z-10 shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
                <div className="pl-10 sm:pl-0">
                  <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-400" />
                    Leads Enviados pro Docs 📋
                  </h1>
                  <p className="text-[11px] sm:text-sm text-slate-300 font-medium mt-1">Todos os leads que já foram copiados e enviados para a planilha de prospecção.</p>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto p-3 sm:p-8 relative">
                <div className="max-w-5xl mx-auto">
                  {getSentLeads().length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20 text-slate-300 px-4">
                      <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500/50" />
                      </div>
                      <h3 className="text-2xl font-bold text-white drop-shadow-lg">Nenhum lead enviado ainda</h3>
                      <p className="max-w-md text-sm font-medium text-slate-400">
                        Quando você clicar em "Enviar pro Docs" em algum lead, ele vai aparecer aqui para conferência.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex justify-between items-end px-2">
                        <h2 className="text-lg sm:text-xl font-bold text-emerald-300 drop-shadow-md">
                          {getSentLeads().length} leads enviados
                        </h2>
                        <a href="https://docs.google.com/document/d/12HtD8-KwDxqG369PTOTcp1eaBWIInGzZIxLTwcOo-vs/edit" target="_blank" rel="noreferrer" className="text-xs text-blue-300 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full font-bold hover:bg-blue-500/20 transition-all flex items-center gap-1.5">
                          <ExternalLink className="h-3.5 w-3.5" /> Abrir Google Docs
                        </a>
                      </div>

                      <div className="space-y-3">
                        {getSentLeads().map((lead, idx) => (
                          <div key={lead.id || idx} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-white/10 transition-all">
                            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-black text-white text-sm sm:text-base truncate">{lead.name}</p>
                                <p className="text-[11px] sm:text-xs text-slate-400 font-medium flex items-center gap-1.5 truncate">
                                  <MapPin className="h-3 w-3 flex-shrink-0" /> {lead.address}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                              <span className="text-[10px] sm:text-xs bg-white/5 border border-white/10 px-2 py-1 rounded-lg text-slate-300 font-bold flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> {lead.rating}
                              </span>
                              {lead.phone && (
                                <span className="text-[10px] sm:text-xs bg-white/5 border border-white/10 px-2 py-1 rounded-lg text-slate-300 font-medium flex items-center gap-1 truncate">
                                  <Phone className="h-3 w-3 flex-shrink-0" /> {lead.phone}
                                </span>
                              )}
                              {lead.email && (
                                <span className="text-[10px] sm:text-xs bg-white/5 border border-white/10 px-2 py-1 rounded-lg text-slate-300 font-medium flex items-center gap-1 truncate">
                                  <Mail className="h-3 w-3 flex-shrink-0" /> <span className="truncate">{lead.email}</span>
                                </span>
                              )}
                              {lead.website && (
                                <a href={`https://${lead.website}`} target="_blank" rel="noreferrer" className="text-[10px] sm:text-xs bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-lg text-blue-300 font-medium flex items-center gap-1 truncate hover:bg-blue-500/20 transition-all">
                                  <Globe className="h-3 w-3 flex-shrink-0" /> <span className="truncate">{lead.website}</span>
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

        </main>
      </div>
    </div>
  );
}

export default App;
