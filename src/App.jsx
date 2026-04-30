import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import ScopeCard from './components/ScopeCard';
import HistorySidebar from './components/HistorySidebar';

function App() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentScope, setCurrentScope] = useState(null);

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
    } catch (error) {
      console.error("Failed to fetch scope:", error);
      alert("Erro ao buscar dados da empresa. Verifique sua conexão.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-slate-800">
      <HistorySidebar />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header / Search Bar - Glassmorphism */}
        <header className="bg-white/60 backdrop-blur-xl border-b border-white/40 p-6 flex flex-col gap-4 sticky top-0 z-10 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gerador de Escopos</h1>
            <p className="text-sm text-slate-500 font-medium">Prospecting MVP</p>
          </div>
          
          <form onSubmit={handleSearch} className="flex gap-3 max-w-3xl">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Ex: Joe's Cleaning Services"
                className="block w-full pl-11 pr-4 py-3 bg-white/70 backdrop-blur-md border border-white/60 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition-all"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="w-1/3">
              <input
                type="text"
                placeholder="Cidade/Estado"
                className="block w-full px-4 py-3 bg-white/70 backdrop-blur-md border border-white/60 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition-all"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-apple-blue hover:bg-apple-blue-hover text-white font-semibold rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-apple-blue transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="hidden sm:inline">Analisando Leads (pode levar 20s)...</span>
                  <span className="sm:hidden">Analisando...</span>
                </>
              ) : (
                'Gerar Dossiê'
              )}
            </button>
          </form>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
            {currentScope && Array.isArray(currentScope) ? (
              <div className="space-y-8">
                <div className="flex justify-between items-end px-2">
                  <h2 className="text-lg font-semibold text-slate-700">
                    Encontramos {currentScope.length} empresas
                  </h2>
                  <span className="text-xs text-slate-500 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-slate-100 font-medium">
                    Busca em Lote concluída
                  </span>
                </div>
                
                <div className="space-y-12">
                  {currentScope.map((scope, idx) => (
                    <ScopeCard key={idx} scope={scope} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20 text-slate-400">
                <div className="w-20 h-20 rounded-3xl bg-white/50 backdrop-blur-xl border border-white/60 shadow-sm flex items-center justify-center mb-4">
                  <Search className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-semibold text-slate-600">Busca em Massa Habilitada</h3>
                <p className="max-w-md text-sm font-medium">Digite um nicho (ex: Cleaning) e uma cidade. O robô vai buscar várias empresas de uma vez e diagnosticar todas para você encontrar o melhor lead.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
