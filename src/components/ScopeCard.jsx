import React from 'react';
import { Star, Phone, Mail, Globe, MapPin, Building2, MessageCircle, AlertTriangle, CheckCircle2, Flame, Megaphone, Clock, DollarSign, Camera } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const ScopeCard = ({ scope }) => {
  if (!scope) return null;

  const isGoodRating = scope.rating >= 4.5;
  const isWarningRating = scope.rating >= 4.0 && scope.rating < 4.5;
  const isBadRating = scope.rating < 4.0;
  const noWebsite = !scope.website;
  const noWhatsapp = !scope.whatsapp;
  
  // Prioridade baseada no Score
  const isHotLead = scope.hotScore >= 50;
  const isWarmLead = scope.hotScore >= 20 && scope.hotScore < 50;
  const isColdLead = scope.hotScore < 20;

  return (
    <div className="bg-white/5 backdrop-blur-[30px] border border-white/20 rounded-[32px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] text-slate-100 transition-all hover:bg-white/10">
      {/* Header Info */}
      <div className="p-7 border-b border-white/10 flex justify-between items-start">
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white flex items-center gap-3 drop-shadow-md">
            <div className="p-2.5 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 border border-white/10 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <Building2 className="text-blue-300 h-6 w-6" />
            </div>
            {scope.name}
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-slate-300 font-medium text-sm pt-1">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-slate-400" /> {scope.address}
            </span>
            <span className={cn(
              "flex items-center gap-1.5 font-bold px-3 py-1 rounded-full text-xs shadow-sm border",
              isGoodRating ? "bg-green-500/20 text-green-300 border-green-500/30" : "",
              isWarningRating ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" : "",
              isBadRating ? "bg-red-500/20 text-red-300 border-red-500/30" : ""
            )}>
              <Star className="h-3.5 w-3.5 fill-current" /> {scope.rating} ({scope.reviews} avaliações)
            </span>
            
            {/* Novas Tags API */}
            {scope.priceLevel !== null && (
              <span className="flex items-center gap-1 text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 text-xs font-bold">
                <DollarSign className="h-3 w-3" /> {'$'.repeat(scope.priceLevel)}
              </span>
            )}
            {scope.openNow !== null && (
              <span className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-bold", scope.openNow ? "text-green-300 bg-green-500/10 border-green-500/20" : "text-rose-300 bg-rose-500/10 border-rose-500/20")}>
                <Clock className="h-3 w-3" /> {scope.openNow ? 'Aberto Agora' : 'Fechado Agora'}
              </span>
            )}
            <span className="flex items-center gap-1 text-slate-300 bg-white/5 px-2 py-0.5 rounded-full border border-white/10 text-xs font-medium">
              <Camera className="h-3 w-3" /> {scope.photoCount} fotos
            </span>
          </div>
        </div>
        
        {/* Priority Badge */}
        <div className="text-right flex flex-col items-end gap-2">
          <span className={cn(
            "inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-bold shadow-[0_0_15px_rgba(0,0,0,0.2)] border",
            isHotLead ? "bg-rose-500/20 border-rose-500/30 text-rose-300" : "",
            isWarmLead ? "bg-amber-500/20 border-amber-500/30 text-amber-300" : "",
            isColdLead ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300" : ""
          )}>
            {isHotLead && <Flame className="h-4 w-4 text-rose-400" />}
            {isWarmLead && <AlertTriangle className="h-4 w-4" />}
            {isColdLead && <CheckCircle2 className="h-4 w-4" />}
            
            {isHotLead ? '👻 Fantasma (Invisível pro Mundo)' : ''}
            {isWarmLead ? '🩹 Sobrevivendo por Aparelhos' : ''}
            {isColdLead ? '😎 O Cara Tá Bem (Estruturado)' : ''}
          </span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-black/20 px-2 py-1 rounded-md">
            Score de Dor: {scope.hotScore} pts
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10">
        {/* Contact Info */}
        <div className="bg-slate-900/70 backdrop-blur-xl p-8 space-y-6">
          <h3 className="text-xs font-black text-blue-300 uppercase tracking-widest mb-6">Dados de Contato</h3>
          
          <div className="space-y-5">
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-[18px] bg-white/10 border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
                <Phone className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">Telefone Fixo (Google)</p>
                {scope.phone ? (
                  <a href={`https://api.whatsapp.com/send/?phone=1${scope.phone.replace(/\D/g, '')}&text&type=phone_number&app_absent=0`} target="_blank" rel="noreferrer" className="font-bold text-white text-lg hover:text-green-400 hover:underline decoration-2 underline-offset-4 transition-colors drop-shadow-md">
                    {scope.phone} <span className="text-[10px] text-green-300 font-bold ml-1 border border-green-500/20 rounded-full px-2 py-0.5 bg-green-500/10">(Testar WhatsApp)</span>
                  </a>
                ) : (
                  <p className="font-bold text-slate-500 text-lg">Não encontrado</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-[18px] bg-green-500/20 border border-green-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/30 transition-colors">
                <MessageCircle className="h-5 w-5 text-green-300" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">WhatsApp Oficial</p>
                {scope.whatsapp ? (
                  <a href={scope.whatsapp} target="_blank" rel="noreferrer" className="font-bold text-green-400 text-lg hover:text-green-300 hover:underline decoration-2 underline-offset-4 drop-shadow-md">Encontrado no site</a>
                ) : (
                  <p className="font-medium text-slate-500">Não possui WhatsApp no site</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-[18px] bg-white/10 border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">E-mail</p>
                <p className="font-bold text-white drop-shadow-md">{scope.email || 'Não encontrado'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Digital Presence */}
        <div className="bg-slate-900/70 backdrop-blur-xl p-8 space-y-6">
          <h3 className="text-xs font-black text-purple-300 uppercase tracking-widest mb-6">Presença Digital</h3>
          
          <div className="space-y-5">
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-[18px] bg-white/10 border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">Website Oficial</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {scope.website ? (
                    <a href={`https://${scope.website}`} target="_blank" rel="noreferrer" className="font-bold text-blue-300 hover:text-blue-200 hover:underline decoration-2 underline-offset-4 text-lg drop-shadow-md">
                      {scope.website}
                    </a>
                  ) : (
                    <p className="font-black text-rose-500 text-lg drop-shadow-md">SEM SITE</p>
                  )}
                  {scope.techStack && (
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm border",
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
                 <p className="text-xs text-rose-200 font-medium leading-relaxed">⚠️ Esta empresa existe no Google Maps, mas não tem um site conectado. O cliente clica e não tem para onde ir.</p>
               </div>
            )}

            <div className="pt-4 border-t border-white/10 mt-6">
              <p className="text-xs font-semibold text-slate-400 mb-3">Links & Ferramentas</p>
              <div className="flex flex-wrap gap-2.5">
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(scope.name + ' ' + scope.address)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] text-white hover:bg-white/20 transition-all text-sm font-bold">
                  <MapPin className="h-4 w-4 text-rose-400" /> Google Maps
                </a>
                
                {/* O Santo Graal (Facebook Ads) */}
                <a href={`https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=${encodeURIComponent(scope.name)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600/60 to-indigo-600/60 border border-blue-400/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_0_15px_rgba(37,99,235,0.3)] text-white hover:brightness-110 transition-all text-sm font-black tracking-wide">
                  <Megaphone className="h-4 w-4" /> Santo Graal (Ads)
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Diagnóstico Automático Baseado no Playbook */}
      <div className="p-7 bg-slate-900/90 border-t border-white/10">
        <h3 className="text-xs font-black text-rose-300 uppercase tracking-widest mb-4 flex items-center gap-2 drop-shadow-md">
          <AlertTriangle className="h-4 w-4" /> Inteligência de Abordagem (Playbook)
        </h3>
        <div className="space-y-3">
          {noWebsite && (
            <div className="p-4 bg-white/5 border border-rose-500/20 rounded-2xl shadow-sm backdrop-blur-md">
              <p className="text-sm text-slate-200 font-medium leading-relaxed">
                <span className="font-bold text-rose-400">🚨 ALVO FÁCIL: Empresa Incompleta.</span> Eles têm ficha no Google Maps, mas **não possuem site**. O cliente americano pesquisa o serviço, os acha no mapa, mas desiste de ligar porque não há um site para passar credibilidade. 
                <br/><br/>
                <span className="text-blue-300 font-bold">O que falar:</span> "Oi! Achei vocês no Google Maps pesquisando [Nicho] em [Cidade]. Vi que vocês têm a ficha, mas estão sem site oficial conectado. O americano que busca no Maps acaba indo pro concorrente porque não acha a tabela de vocês. Posso mostrar como a gente resolve isso?"
              </p>
            </div>
          )}

          {!noWebsite && noWhatsapp && (
            <div className="p-4 bg-white/5 border border-amber-500/20 rounded-2xl shadow-sm backdrop-blur-md">
              <p className="text-sm text-slate-200 font-medium leading-relaxed">
                <span className="font-bold text-amber-400">🟡 Cenário 9 — Sem Número Visível:</span> Eles têm um site ({scope.website}), mas o cliente não tem um botão fácil de WhatsApp para clicar. Dependem de formulários lentos.
                <br/><br/>
                <span className="text-blue-300 font-bold">O que falar:</span> "Oi! Entrei no site de vocês, tá bacana! Mas fiquei com uma dúvida: como o cliente americano chama vocês hoje? Tem que preencher aquele formulário? Porque o americano que tem pressa desiste no meio. A gente instala uma automação que joga o cliente do site direto pro WhatsApp de vocês. Quer ver como funciona?"
              </p>
            </div>
          )}

          {!noWebsite && scope.techStack === 'Wix' && (
            <div className="p-4 bg-white/5 border border-amber-500/20 rounded-2xl shadow-sm backdrop-blur-md">
              <p className="text-sm text-slate-200 font-medium leading-relaxed">
                <span className="font-bold text-amber-400">🟡 Cenário 6 — Site Amador (Wix):</span> O site deles foi feito em Wix. Costuma ser lento e passar imagem de empresa amadora para o cliente high-ticket.
                <br/><br/>
                <span className="text-blue-300 font-bold">O que falar:</span> "Seu site atual tá funcionando ou tá mais como um cartão de visita parado pagando mensalidade? Tem umas estruturas modernas que carregam mais rápido e convertem melhor."
              </p>
            </div>
          )}

          {isBadRating && (
            <div className="p-4 bg-white/5 border border-rose-500/20 rounded-2xl shadow-sm backdrop-blur-md">
              <p className="text-sm text-slate-200 font-medium leading-relaxed">
                <span className="font-bold text-rose-400">📉 Alerta de Reputação:</span> A nota no Google é {scope.rating}. O americano confia em avaliações. 
                <br/><br/>
                <span className="text-blue-300 font-bold">O que falar:</span> "Vi que vocês prestam um bom serviço, mas a nota no Google não reflete isso. A gente pode montar uma automação para pedir avaliação 5 estrelas pros seus melhores clientes e subir essa nota rápido."
              </p>
            </div>
          )}

          {!noWebsite && !noWhatsapp && !isBadRating && (
            <div className="p-4 bg-white/5 border border-emerald-500/20 rounded-2xl shadow-sm backdrop-blur-md">
              <p className="text-sm text-slate-200 font-medium leading-relaxed">
                <span className="font-bold text-emerald-400">🟢 Cenário 7 — Estruturado sem Conversão:</span> A empresa tem site, WhatsApp e boa nota. Eles já entendem de marketing.
                <br/><br/>
                <span className="text-blue-300 font-bold">O que falar:</span> "Vocês estão muito bem posicionados! A pergunta é: dos 10 americanos que entram no site, quantos fecham? Se for pouco, tem algo travando no processo. A gente faz uma consultoria focada só na otimização dessa conversão."
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScopeCard;
