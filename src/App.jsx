import React, { useState, useEffect } from 'react';
import { Search, Loader2, Gauge, CheckCircle2, Building2, MapPin, Star, Phone, Mail, Globe, ExternalLink, ChevronDown, ChevronUp, MessageSquare, Save, Flame, AlertTriangle, Megaphone } from 'lucide-react';
import ScopeCard from './components/ScopeCard';
import HistorySidebar from './components/HistorySidebar';

function App() {
  const [query, setQuery] = useState(() => localStorage.getItem('lastQuery') || '');
  const [location, setLocation] = useState(() => localStorage.getItem('lastLocation') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [searchCount, setSearchCount] = useState(() => parseInt(localStorage.getItem('searchCount') || '0'));
  const [dailyQuota, setDailyQuota] = useState(() => parseInt(localStorage.getItem('dailyQuota') || '150'));
  const [currentView, setCurrentView] = useState('search');
  const [dismissedLeads, setDismissedLeads] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dismissedLeads') || '[]'); } catch { return []; }
  });
  const [currentScope, setCurrentScope] = useState(() => {
    const saved = localStorage.getItem('currentScope');
    if (saved) { try { return JSON.parse(saved); } catch { return null; } }
    return null;
  });
  const [sentLeads, setSentLeads] = useState([]);
  const [expandedSent, setExpandedSent] = useState({});
  const [observations, setObservations] = useState({});
  const [savingObs, setSavingObs] = useState({});

  useEffect(() => {
    localStorage.setItem('lastQuery', query);
    localStorage.setItem('lastLocation', location);
    localStorage.setItem('searchCount', searchCount);
    localStorage.setItem('dailyQuota', dailyQuota);
    localStorage.setItem('dismissedLeads', JSON.stringify(dismissedLeads));
    if (currentScope) localStorage.setItem('currentScope', JSON.stringify(currentScope));
  }, [query, location, currentScope, searchCount, dailyQuota, dismissedLeads]);

  // Fetch sent leads from Supabase
  const fetchSentLeads = async () => {
    try {
      const res = await fetch('/api/sent-leads');
      const data = await res.json();
      if (Array.isArray(data)) {
        setSentLeads(data);
        const obs = {};
        data.forEach(item => { obs[item.id] = item.observation || ''; });
        setObservations(prev => ({ ...obs, ...prev }));
      }
    } catch (e) { console.error('Failed to fetch sent leads', e); }
  };

  useEffect(() => { fetchSentLeads(); }, [currentView]);

  const handleDismiss = async (leadId) => {
    setDismissedLeads(prev => [...new Set([...prev, leadId])]);
    // Find the lead data
    if (currentScope && Array.isArray(currentScope)) {
      const lead = currentScope.find(s => (s.id || s.name) === leadId);
      if (lead) {
        try {
          await fetch('/api/sent-leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lead, observation: '' })
          });
          fetchSentLeads();
        } catch (e) { console.error('Failed to save to Supabase', e); }
      }
    }
  };

  const handleSaveObservation = async (id) => {
    setSavingObs(prev => ({ ...prev, [id]: true }));
    try {
      await fetch('/api/sent-leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, observation: observations[id] || '' })
      });
    } catch (e) { console.error('Failed to save observation', e); }
    setSavingObs(prev => ({ ...prev, [id]: false }));
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
      localStorage.setItem('searchHistory', JSON.stringify([newHistoryItem, ...savedHistory].slice(0, 20)));
    } catch (error) {
      console.error("Failed to fetch scope:", error);
      alert("Erro ao buscar dados da empresa. Verifique sua conexão.");
    } finally {
      setIsLoading(false);
    }
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
              {/* Search Header */}
              <header className="bg-white/5 backdrop-blur-[40px] border-b border-white/10 p-3 sm:p-6 flex flex-col gap-3 sm:gap-4 sticky top-0 z-10 shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
                <div className="flex justify-between items-center ml-8 sm:ml-0">
                  <div>
                    <h1 className="text-lg sm:text-3xl font-black text-white tracking-tight drop-shadow-md">Anti-Agência Prospecting 🕵️‍♂️</h1>
                    <p className="text-[10px] sm:text-sm text-slate-300 font-medium mt-0.5">Central de Achados e Perdidos 🛸</p>
                  </div>
                  <div className="hidden lg:flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 px-5 py-2.5 rounded-full">
                    <div className="p-1.5 bg-rose-500/20 rounded-full">
                      {isLoading ? <Loader2 className="h-5 w-5 text-rose-400 animate-spin" /> : <Gauge className="h-5 w-5 text-rose-400" />}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 flex items-center gap-2">
                        Termômetro API
                        {searchCount > 0 && <span className="bg-blue-500/20 text-blue-300 px-1.5 rounded-sm">{searchCount} buscas</span>}
                      </p>
                      <p className="text-sm font-bold text-white">
                        {isLoading ? <span className="animate-pulse">Calculando...</span> : <>{dailyQuota} Leads restantes</>}
                      </p>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 sm:gap-3 max-w-4xl ml-8 sm:ml-0">
                  <div className="flex-1 relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 sm:h-5 sm:w-5 text-slate-300" />
                    </div>
                    <input type="text" placeholder="Ex: jardinagem, limpeza..." className="block w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all font-medium text-sm sm:text-base" value={query} onChange={(e) => setQuery(e.target.value)} />
                  </div>
                  <div className="flex gap-2 sm:gap-3">
                    <input type="text" placeholder="Cidade/Estado" className="flex-1 sm:w-48 px-4 py-3 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all font-medium text-sm sm:text-base" value={location} onChange={(e) => setLocation(e.target.value)} />
                    <button type="submit" disabled={isLoading} className="px-5 sm:px-8 py-3 bg-gradient-to-r from-blue-500/80 to-purple-500/80 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-full border border-white/20 transition-all disabled:opacity-50 flex items-center gap-2 text-sm whitespace-nowrap">
                      {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /><span className="hidden sm:inline">Analisando...</span></> : <>🔍 <span className="hidden sm:inline">Caçar Leads</span><span className="sm:hidden">Buscar</span></>}
                    </button>
                  </div>
                </form>
              </header>

              {/* Search Results */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-8 relative">
                <div className="max-w-5xl mx-auto">
                  {currentScope && Array.isArray(currentScope) ? (
                    <div className="space-y-6 sm:space-y-8">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end px-2 gap-2">
                        <h2 className="text-lg sm:text-xl font-bold text-white">
                          {currentScope.length} empresas
                          {currentScope.filter(s => dismissedLeads.includes(s.id || s.name)).length > 0 && (
                            <span className="text-xs sm:text-sm font-normal text-emerald-300 ml-2">
                              ({currentScope.filter(s => dismissedLeads.includes(s.id || s.name)).length} enviadas)
                            </span>
                          )}
                        </h2>
                        <span className="text-[10px] sm:text-xs text-white/80 bg-white/10 px-3 py-1.5 rounded-full border border-white/10 font-bold uppercase tracking-wider">Busca concluída</span>
                      </div>
                      <div className="space-y-8 sm:space-y-12">
                        {currentScope.map((scope, idx) => (
                          <ScopeCard key={scope.id || idx} scope={scope} onDismiss={handleDismiss} isDismissed={dismissedLeads.includes(scope.id || scope.name)} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center space-y-4 py-20 px-4">
                      <div className="w-20 h-20 rounded-full bg-white/5 border border-white/20 flex items-center justify-center mb-4">
                        <Search className="h-8 w-8 text-white/50" />
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-white">Radar Pronto</h3>
                      <p className="max-w-md text-sm font-medium text-slate-300">Digite um nicho e uma cidade para começar.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* ===== SENT LEADS VIEW ===== */
            <>
              <header className="bg-white/5 backdrop-blur-[40px] border-b border-white/10 p-4 sm:p-6 sticky top-0 z-10">
                <div className="ml-8 sm:ml-0">
                  <h1 className="text-lg sm:text-3xl font-black text-white flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-400" />
                    Leads Enviados 📋
                  </h1>
                  <p className="text-[10px] sm:text-sm text-slate-300 font-medium mt-1">Leads processados e salvos na nuvem. Visível em todos os dispositivos.</p>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto p-3 sm:p-8 relative">
                <div className="max-w-5xl mx-auto">
                  {sentLeads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center space-y-4 py-20 px-4">
                      <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500/50" />
                      </div>
                      <h3 className="text-2xl font-bold text-white">Nenhum lead enviado ainda</h3>
                      <p className="max-w-md text-sm font-medium text-slate-400">Quando clicar em "Enviar pro Docs", o lead aparece aqui.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 sm:space-y-6">
                      <div className="flex justify-between items-end px-2">
                        <h2 className="text-lg sm:text-xl font-bold text-emerald-300">{sentLeads.length} leads enviados</h2>
                      </div>

                      <div className="space-y-3">
                        {sentLeads.map((item) => {
                          const lead = item.lead;
                          if (!lead) return null;
                          const isExpanded = expandedSent[item.id];
                          const isHotLead = lead.hotScore >= 50;
                          const isWarmLead = lead.hotScore >= 20 && lead.hotScore < 50;

                          return (
                            <div key={item.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:bg-white/[0.07] transition-all">
                              {/* Compact Row */}
                              <div className="p-3 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                    <Building2 className="h-5 w-5 text-emerald-400" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-black text-white text-sm sm:text-base truncate">{lead.name}</p>
                                    <p className="text-[10px] sm:text-xs text-slate-400 font-medium flex items-center gap-1 truncate">
                                      <MapPin className="h-3 w-3 flex-shrink-0" /> {lead.address}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                                  <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded-lg text-slate-300 font-bold flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> {lead.rating}
                                  </span>
                                  {lead.phone && (
                                    <a href={`https://api.whatsapp.com/send/?phone=1${lead.phone.replace(/\D/g, '')}&text&type=phone_number&app_absent=0`} target="_blank" rel="noreferrer" className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded-lg text-slate-300 font-medium flex items-center gap-1 truncate hover:bg-green-500/10 hover:text-green-300 transition-all">
                                      <Phone className="h-3 w-3 flex-shrink-0" /> {lead.phone}
                                    </a>
                                  )}
                                  <button onClick={() => setExpandedSent(prev => ({ ...prev, [item.id]: !prev[item.id] }))} className="text-[10px] bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-lg text-blue-300 font-bold flex items-center gap-1 hover:bg-blue-500/20 transition-all ml-auto sm:ml-0">
                                    {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                    {isExpanded ? 'Fechar' : 'Ver Mais'}
                                  </button>
                                </div>
                              </div>

                              {/* Expanded Details */}
                              {isExpanded && (
                                <div className="border-t border-white/10 bg-slate-900/50">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-6">
                                    {/* Contact */}
                                    <div className="space-y-3">
                                      <h4 className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Contato</h4>
                                      <div className="space-y-2 text-sm">
                                        <p className="flex items-center gap-2 text-slate-300"><Phone className="h-4 w-4 text-slate-400" /> {lead.phone || 'Sem telefone'}</p>
                                        <p className="flex items-center gap-2 text-slate-300"><Mail className="h-4 w-4 text-slate-400" /> {lead.email || 'Sem email'}</p>
                                        <p className="flex items-center gap-2 text-slate-300">
                                          <Globe className="h-4 w-4 text-slate-400" /> 
                                          {lead.website ? <a href={`https://${lead.website}`} target="_blank" rel="noreferrer" className="text-blue-300 hover:underline">{lead.website}</a> : <span className="text-rose-400 font-bold">SEM SITE</span>}
                                          {lead.techStack && <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded-full font-bold">{lead.techStack}</span>}
                                        </p>
                                      </div>
                                    </div>
                                    {/* Diagnosis */}
                                    <div className="space-y-3">
                                      <h4 className="text-[10px] font-black text-purple-300 uppercase tracking-widest">Diagnóstico</h4>
                                      <div className="space-y-2">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${isHotLead ? 'bg-rose-500/20 border-rose-500/30 text-rose-300' : isWarmLead ? 'bg-amber-500/20 border-amber-500/30 text-amber-300' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'}`}>
                                          {isHotLead ? <><Flame className="h-3.5 w-3.5" /> Fantasma</> : isWarmLead ? <><AlertTriangle className="h-3.5 w-3.5" /> Sobrevivendo</> : <><CheckCircle2 className="h-3.5 w-3.5" /> Estruturado</>}
                                          <span className="text-[10px] opacity-70">({lead.hotScore} pts)</span>
                                        </span>
                                        <p className="text-xs text-slate-400">{lead.whatsapp ? '✅ WhatsApp no site' : '❌ Sem WhatsApp no site'}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Links */}
                                  <div className="px-4 sm:px-6 pb-2 flex flex-wrap gap-2">
                                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.name + ' ' + lead.address)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold hover:bg-white/20 transition-all">
                                      <MapPin className="h-3.5 w-3.5 text-rose-400" /> Google Maps
                                    </a>
                                    <a href={`https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=${encodeURIComponent(lead.name)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/40 border border-blue-400/30 text-white text-xs font-black hover:brightness-125 transition-all">
                                      <Megaphone className="h-3.5 w-3.5" /> Santo Graal
                                    </a>
                                    {lead.phone && (
                                      <a href={`https://api.whatsapp.com/send/?phone=1${lead.phone.replace(/\D/g, '')}&text&type=phone_number&app_absent=0`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-600/30 border border-green-400/30 text-green-300 text-xs font-bold hover:bg-green-600/40 transition-all">
                                        Testar WhatsApp
                                      </a>
                                    )}
                                  </div>

                                  {/* Observation Field */}
                                  <div className="p-4 sm:p-6 border-t border-white/10">
                                    <div className="flex items-center justify-between mb-2">
                                      <h4 className="text-[10px] font-black text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
                                        <MessageSquare className="h-3.5 w-3.5" /> Observações
                                      </h4>
                                      <button onClick={() => handleSaveObservation(item.id)} disabled={savingObs[item.id]} className="text-[10px] bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-lg text-blue-300 font-bold hover:bg-blue-500/20 transition-all flex items-center gap-1 disabled:opacity-50">
                                        <Save className="h-3 w-3" /> {savingObs[item.id] ? 'Salvando...' : 'Salvar'}
                                      </button>
                                    </div>
                                    <textarea
                                      rows={3}
                                      placeholder="Ex: Mandei mensagem dia 30/04. Sem WhatsApp, tentar pelo Thumbtack..."
                                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 resize-none transition-all"
                                      value={observations[item.id] || ''}
                                      onChange={(e) => setObservations(prev => ({ ...prev, [item.id]: e.target.value }))}
                                    />
                                    {item.sentAt && (
                                      <p className="text-[10px] text-slate-500 mt-2">Enviado em: {new Date(item.sentAt).toLocaleString('pt-BR')}</p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
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
