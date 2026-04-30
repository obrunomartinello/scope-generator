import React, { useState } from 'react';
import { Star, Phone, Mail, Globe, MapPin, Building2, MessageCircle, AlertTriangle, CheckCircle2, Flame, Megaphone, Clock, DollarSign, Camera, Send, ExternalLink, Eye } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const ScopeCard = ({ scope, onDismiss, isDismissed }) => {
  const [justCopied, setJustCopied] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  if (!scope) return null;

  const isGoodRating = scope.rating >= 4.5;
  const isWarningRating = scope.rating >= 4.0 && scope.rating < 4.5;
  const isBadRating = scope.rating < 4.0;
  const noWebsite = !scope.website;
  const noWhatsapp = !scope.whatsapp;
  
  const isHotLead = scope.hotScore >= 50;
  const isWarmLead = scope.hotScore >= 20 && scope.hotScore < 50;
  const isColdLead = scope.hotScore < 20;

  const GOOGLE_DOC_URL = 'https://docs.google.com/document/d/12HtD8-KwDxqG369PTOTcp1eaBWIInGzZIxLTwcOo-vs/edit';

  const handleSendToDoc = () => {
    const presencaDigital = [
      scope.website ? `https://${scope.website}` : null,
      scope.whatsapp || null,
    ].filter(Boolean).join('\n');

    const contatos = [
      scope.phone || null,
      scope.email || null,
    ].filter(Boolean).join('\n');

    const diagnostico = isHotLead 
      ? `👻 Fantasma (Score: ${scope.hotScore}). Sem site ou presença fraca.`
      : isWarmLead 
        ? `🩹 Sobrevivendo (Score: ${scope.hotScore}). ${scope.techStack === 'Wix' ? 'Site Wix amador.' : 'Sem WhatsApp no site.'}`
        : `😎 Estruturado (Score: ${scope.hotScore}). Possível cliente para tráfego pago/consultoria.`;

    const row = [
      scope.address,
      '',
      scope.name,
      '',
      presencaDigital,
      contatos,
      `⭐ ${scope.rating} (${scope.reviews} avaliações)\n${diagnostico}`,
    ].join('\t');

    navigator.clipboard.writeText(row).then(() => {
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 3000);
      if (onDismiss) onDismiss(scope.id || scope.name);
      window.open(GOOGLE_DOC_URL, '_blank');
    });
  };

  return (
    <div className={cn(
      "relative bg-white/5 backdrop-blur-[30px] border border-white/20 rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] text-slate-100 transition-all",
      isDismissed && !isRevealed ? "opacity-40 scale-[0.98]" : "hover:bg-white/10"
    )}>
      {/* Dismissed Overlay */}
      {isDismissed && !isRevealed && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-[24px] sm:rounded-[32px]">
          <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-2xl px-6 py-4 text-center backdrop-blur-xl">
            <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-emerald-300 font-black text-lg">Enviado pro Docs ✅</p>
            <p className="text-slate-400 text-xs mt-1">Este lead já foi processado</p>
            <div className="flex items-center justify-center gap-3 mt-3">
              <button 
                onClick={() => setIsRevealed(true)} 
                className="inline-flex items-center gap-1.5 text-white text-xs font-bold bg-white/10 border border-white/20 px-4 py-2 rounded-xl hover:bg-white/20 transition-all"
              >
                <Eye className="h-3.5 w-3.5" /> Revelar Info
              </button>
              <a href={GOOGLE_DOC_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-blue-300 text-xs font-bold bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl hover:bg-blue-500/20 transition-all">
                <ExternalLink className="h-3.5 w-3.5" /> Abrir Docs
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Revealed Banner */}
      {isDismissed && isRevealed && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 sm:px-7 py-2.5 flex items-center justify-between">
          <p className="text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Já enviado pro Docs — Visualização temporária
          </p>
          <button 
            onClick={() => setIsRevealed(false)} 
            className="text-xs text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-lg hover:bg-white/10 transition-all font-bold"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Header Info */}
      <div className="p-4 sm:p-7 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="space-y-2 min-w-0 flex-1">
          <h2 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2 sm:gap-3 drop-shadow-md">
            <div className="p-2 sm:p-2.5 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 border border-white/10 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] flex-shrink-0">
              <Building2 className="text-blue-300 h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <span className="truncate">{scope.name}</span>
          </h2>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-slate-300 font-medium text-xs sm:text-sm pt-1">
            <span className="flex items-center gap-1.5 truncate">
              <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 flex-shrink-0" /> <span className="truncate">{scope.address}</span>
            </span>
            <span className={cn(
              "flex items-center gap-1 font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs shadow-sm border flex-shrink-0",
              isGoodRating ? "bg-green-500/20 text-green-300 border-green-500/30" : "",
              isWarningRating ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" : "",
              isBadRating ? "bg-red-500/20 text-red-300 border-red-500/30" : ""
            )}>
              <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current" /> {scope.rating} ({scope.reviews})
            </span>
            
            {scope.priceLevel !== null && (
              <span className="flex items-center gap-1 text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 text-[10px] sm:text-xs font-bold flex-shrink-0">
                <DollarSign className="h-3 w-3" /> {'$'.repeat(scope.priceLevel)}
              </span>
            )}
            {scope.openNow !== null && (
              <span className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] sm:text-xs font-bold flex-shrink-0", scope.openNow ? "text-green-300 bg-green-500/10 border-green-500/20" : "text-rose-300 bg-rose-500/10 border-rose-500/20")}>
                <Clock className="h-3 w-3" /> {scope.openNow ? 'Aberto' : 'Fechado'}
              </span>
            )}
            <span className="flex items-center gap-1 text-slate-300 bg-white/5 px-2 py-0.5 rounded-full border border-white/10 text-[10px] sm:text-xs font-medium flex-shrink-0">
              <Camera className="h-3 w-3" /> {scope.photoCount} fotos
            </span>
          </div>
        </div>
        
        {/* Priority Badge + Action Buttons */}
        <div className="flex sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto flex-shrink-0">
          <span className={cn(
            "inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold shadow-[0_0_15px_rgba(0,0,0,0.2)] border",
            isHotLead ? "bg-rose-500/20 border-rose-500/30 text-rose-300" : "",
            isWarmLead ? "bg-amber-500/20 border-amber-500/30 text-amber-300" : "",
            isColdLead ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300" : ""
          )}>
            {isHotLead && <Flame className="h-4 w-4 text-rose-400" />}
            {isWarmLead && <AlertTriangle className="h-4 w-4" />}
            {isColdLead && <CheckCircle2 className="h-4 w-4" />}
            <span className="hidden sm:inline">
              {isHotLead ? '👻 Fantasma (Invisível pro Mundo)' : ''}
              {isWarmLead ? '🩹 Sobrevivendo por Aparelhos' : ''}
              {isColdLead ? '😎 O Cara Tá Bem (Estruturado)' : ''}
            </span>
            <span className="sm:hidden">
              {isHotLead ? '👻 Fantasma' : ''}
              {isWarmLead ? '🩹 Sobrevivendo' : ''}
              {isColdLead ? '😎 Estruturado' : ''}
            </span>
          </span>
          <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest bg-black/20 px-2 py-1 rounded-md">
            Score: {scope.hotScore} pts
          </span>

          {/* BOTÃO ENVIAR PRO DOCS */}
          {!isDismissed && (
            <button
              onClick={handleSendToDoc}
              className={cn(
                "inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all w-full sm:w-auto justify-center sm:mt-2",
                justCopied 
                  ? "bg-emerald-500/30 border-emerald-500/40 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  : "bg-gradient-to-r from-orange-500/60 to-amber-500/60 border-orange-400/30 text-white hover:brightness-125 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
              )}
            >
              {justCopied ? (
                <><CheckCircle2 className="h-4 w-4" /> Copiado! Cola no Docs ✅</>
              ) : (
                <><Send className="h-4 w-4" /> Enviar pro Docs 📋</>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10">
        {/* Contact Info */}
        <div className="bg-slate-900/70 backdrop-blur-xl p-4 sm:p-8 space-y-4 sm:space-y-6">
          <h3 className="text-xs font-black text-blue-300 uppercase tracking-widest mb-4 sm:mb-6">Dados de Contato</h3>
          
          <div className="space-y-4 sm:space-y-5">
            <div className="flex items-center gap-3 sm:gap-4 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[14px] sm:rounded-[18px] bg-white/10 border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-400">Telefone (Google)</p>
                {scope.phone ? (
                  <a href={`https://api.whatsapp.com/send/?phone=1${scope.phone.replace(/\D/g, '')}&text&type=phone_number&app_absent=0`} target="_blank" rel="noreferrer" className="font-bold text-white text-sm sm:text-lg hover:text-green-400 hover:underline decoration-2 underline-offset-4 transition-colors drop-shadow-md flex flex-wrap items-center gap-1">
                    {scope.phone} <span className="text-[9px] sm:text-[10px] text-green-300 font-bold border border-green-500/20 rounded-full px-1.5 sm:px-2 py-0.5 bg-green-500/10">(Testar WA)</span>
                  </a>
                ) : (
                  <p className="font-bold text-slate-500 text-sm sm:text-lg">Não encontrado</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[14px] sm:rounded-[18px] bg-green-500/20 border border-green-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/30 transition-colors">
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-300" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs font-semibold text-slate-400">WhatsApp Oficial</p>
                {scope.whatsapp ? (
                  <a href={scope.whatsapp} target="_blank" rel="noreferrer" className="font-bold text-green-400 text-sm sm:text-lg hover:text-green-300 hover:underline decoration-2 underline-offset-4 drop-shadow-md">Encontrado no site</a>
                ) : (
                  <p className="font-medium text-slate-500 text-sm">Sem WhatsApp no site</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[14px] sm:rounded-[18px] bg-white/10 border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-400">E-mail</p>
                <p className="font-bold text-white drop-shadow-md text-sm sm:text-base truncate">{scope.email || 'Não encontrado'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Digital Presence */}
        <div className="bg-slate-900/70 backdrop-blur-xl p-4 sm:p-8 space-y-4 sm:space-y-6">
          <h3 className="text-xs font-black text-purple-300 uppercase tracking-widest mb-4 sm:mb-6">Presença Digital</h3>
          
          <div className="space-y-4 sm:space-y-5">
            <div className="flex items-center gap-3 sm:gap-4 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[14px] sm:rounded-[18px] bg-white/10 border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
                <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-400">Website Oficial</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {scope.website ? (
                    <a href={`https://${scope.website}`} target="_blank" rel="noreferrer" className="font-bold text-blue-300 hover:text-blue-200 hover:underline decoration-2 underline-offset-4 text-sm sm:text-lg drop-shadow-md truncate">
                      {scope.website}
                    </a>
                  ) : (
                    <p className="font-black text-rose-500 text-sm sm:text-lg drop-shadow-md">SEM SITE</p>
                  )}
                  {scope.techStack && (
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm border flex-shrink-0",
                      scope.techStack === 'Wix' ? "bg-rose-500/20 text-rose-300 border-rose-500/30" : "bg-white/10 text-slate-300 border-white/20"
                    )}>
                      {scope.techStack}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {!scope.website && (
               <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl mt-4 backdrop-blur-xl">
                 <p className="text-[11px] sm:text-xs text-rose-200 font-medium leading-relaxed">⚠️ Empresa no Google Maps sem site conectado. O cliente não tem para onde ir.</p>
               </div>
            )}

            <div className="pt-3 sm:pt-4 border-t border-white/10 mt-4 sm:mt-6">
              <p className="text-[10px] sm:text-xs font-semibold text-slate-400 mb-2 sm:mb-3">Links & Ferramentas</p>
              <div className="flex flex-wrap gap-2">
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(scope.name + ' ' + scope.address)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white/10 border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] text-white hover:bg-white/20 transition-all text-xs sm:text-sm font-bold">
                  <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-rose-400" /> Maps
                </a>
                
                <a href={`https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=${encodeURIComponent(scope.name)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-blue-600/60 to-indigo-600/60 border border-blue-400/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_0_15px_rgba(37,99,235,0.3)] text-white hover:brightness-110 transition-all text-xs sm:text-sm font-black tracking-wide">
                  <Megaphone className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Santo Graal
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Diagnóstico */}
      <div className="p-4 sm:p-7 bg-slate-900/90 border-t border-white/10">
        <h3 className="text-[10px] sm:text-xs font-black text-rose-300 uppercase tracking-widest mb-3 sm:mb-4 flex items-center gap-2 drop-shadow-md">
          <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Inteligência de Abordagem (Playbook)
        </h3>
        <div className="space-y-3">
          {noWebsite && (
            <div className="p-3 sm:p-4 bg-white/5 border border-rose-500/20 rounded-xl sm:rounded-2xl shadow-sm backdrop-blur-md">
              <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                <span className="font-bold text-rose-400">🚨 ALVO FÁCIL: Empresa Incompleta.</span> Ficha no Maps, mas sem site. O americano desiste.
                <br/><br/>
                <span className="text-blue-300 font-bold">O que falar:</span> "Oi! Achei vocês no Google Maps. Vi que vocês têm a ficha, mas estão sem site oficial conectado. O americano que busca no Maps acaba indo pro concorrente. Posso mostrar como a gente resolve isso?"
              </p>
            </div>
          )}

          {!noWebsite && noWhatsapp && (
            <div className="p-3 sm:p-4 bg-white/5 border border-amber-500/20 rounded-xl sm:rounded-2xl shadow-sm backdrop-blur-md">
              <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                <span className="font-bold text-amber-400">🟡 Sem WhatsApp:</span> Tem site ({scope.website}), mas sem botão de contato rápido. Dependem de formulários.
                <br/><br/>
                <span className="text-blue-300 font-bold">O que falar:</span> "Entrei no site de vocês, tá bacana! Mas como o cliente americano entra em contato? Se depende de formulário, o cliente com pressa desiste. A gente instala uma automação que joga direto pro WhatsApp."
              </p>
            </div>
          )}

          {!noWebsite && scope.techStack === 'Wix' && (
            <div className="p-3 sm:p-4 bg-white/5 border border-amber-500/20 rounded-xl sm:rounded-2xl shadow-sm backdrop-blur-md">
              <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                <span className="font-bold text-amber-400">🟡 Site Amador (Wix):</span> Lento e passa imagem amadora.
                <br/><br/>
                <span className="text-blue-300 font-bold">O que falar:</span> "Seu site atual tá funcionando ou tá mais como um cartão de visita parado? Tem estruturas modernas que carregam mais rápido e convertem melhor."
              </p>
            </div>
          )}

          {isBadRating && (
            <div className="p-3 sm:p-4 bg-white/5 border border-rose-500/20 rounded-xl sm:rounded-2xl shadow-sm backdrop-blur-md">
              <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                <span className="font-bold text-rose-400">📉 Alerta de Reputação:</span> Nota {scope.rating}. O americano confia em avaliações.
                <br/><br/>
                <span className="text-blue-300 font-bold">O que falar:</span> "Vi que vocês prestam um bom serviço, mas a nota no Google não reflete. A gente monta uma automação para pedir avaliação 5 estrelas pros melhores clientes."
              </p>
            </div>
          )}

          {!noWebsite && !noWhatsapp && !isBadRating && (
            <div className="p-3 sm:p-4 bg-white/5 border border-emerald-500/20 rounded-xl sm:rounded-2xl shadow-sm backdrop-blur-md">
              <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                <span className="font-bold text-emerald-400">🟢 Estruturado sem Conversão:</span> Tem site, WhatsApp e boa nota. Já entendem de marketing.
                <br/><br/>
                <span className="text-blue-300 font-bold">O que falar:</span> "Vocês estão muito bem posicionados! Dos 10 americanos que entram no site, quantos fecham? Se for pouco, tem algo travando. A gente faz uma consultoria focada na otimização."
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScopeCard;
