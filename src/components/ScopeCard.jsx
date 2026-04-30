import React from 'react';
import { Star, Phone, Mail, Globe, MapPin, Building2, MessageCircle, AlertTriangle, CheckCircle2, Flame } from 'lucide-react';
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
    <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      {/* Header Info */}
      <div className="p-6 border-b border-white/50 bg-white/40 flex justify-between items-start">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <div className="p-2 bg-apple-blue/10 rounded-xl">
              <Building2 className="text-apple-blue h-6 w-6" />
            </div>
            {scope.name}
          </h2>
          <div className="flex items-center gap-4 text-slate-500 font-medium text-sm">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-slate-400" /> {scope.address}
            </span>
            <span className={cn(
              "flex items-center gap-1.5 font-bold px-3 py-1 rounded-full text-xs shadow-sm",
              isGoodRating ? "bg-green-100 text-green-700 border border-green-200" : "",
              isWarningRating ? "bg-yellow-100 text-yellow-700 border border-yellow-200" : "",
              isBadRating ? "bg-red-100 text-red-700 border border-red-200" : ""
            )}>
              <Star className="h-3.5 w-3.5 fill-current" /> {scope.rating} ({scope.reviews} avaliações)
            </span>
          </div>
        </div>
        
        {/* Priority Badge */}
        <div className="text-right flex flex-col items-end gap-2">
          <span className={cn(
            "inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-bold shadow-sm border",
            isHotLead ? "bg-red-50 border-red-200 text-red-600" : "",
            isWarmLead ? "bg-amber-50 border-amber-200 text-amber-600" : "",
            isColdLead ? "bg-emerald-50 border-emerald-200 text-emerald-600" : ""
          )}>
            {isHotLead && <Flame className="h-4 w-4" />}
            {isWarmLead && <AlertTriangle className="h-4 w-4" />}
            {isColdLead && <CheckCircle2 className="h-4 w-4" />}
            
            {isHotLead ? '👻 Fantasma (Invisível pro Mundo)' : ''}
            {isWarmLead ? '🩹 Sobrevivendo por Aparelhos' : ''}
            {isColdLead ? '😎 O Cara Tá Bem (Estruturado)' : ''}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Score de Dor: {scope.hotScore} pts
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-200/50">
        {/* Contact Info */}
        <div className="bg-white/50 backdrop-blur-md p-8 space-y-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Dados de Contato</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center flex-shrink-0">
                <Phone className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">Telefone Fixo (Google)</p>
                {scope.phone ? (
                  <a href={`https://wa.me/1${scope.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="font-bold text-slate-800 text-lg hover:text-green-600 hover:underline decoration-2 underline-offset-4 transition-colors">
                    {scope.phone} <span className="text-xs text-slate-400 font-normal ml-1">(Tentar WhatsApp)</span>
                  </a>
                ) : (
                  <p className="font-bold text-slate-800 text-lg">Não encontrado</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center flex-shrink-0">
                <MessageCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">WhatsApp Oficial</p>
                {scope.whatsapp ? (
                  <a href={scope.whatsapp} target="_blank" rel="noreferrer" className="font-bold text-green-600 text-lg hover:underline decoration-2 underline-offset-4">Encontrado no site</a>
                ) : (
                  <p className="font-medium text-slate-500">Não possui WhatsApp no site</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center flex-shrink-0">
                <Mail className="h-5 w-5 text-apple-blue" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">E-mail</p>
                <p className="font-bold text-slate-800">{scope.email || 'Não encontrado'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Digital Presence */}
        <div className="bg-white/50 backdrop-blur-md p-8 space-y-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Presença Digital</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center flex-shrink-0">
                <Globe className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">Website Oficial</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {scope.website ? (
                    <a href={`https://${scope.website}`} target="_blank" rel="noreferrer" className="font-bold text-apple-blue hover:underline decoration-2 underline-offset-4 text-lg">
                      {scope.website}
                    </a>
                  ) : (
                    <p className="font-bold text-red-500 text-lg">SEM SITE</p>
                  )}
                  {scope.techStack && (
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm border",
                      scope.techStack === 'Wix' ? "bg-red-50 text-red-600 border-red-100" : "bg-slate-100 text-slate-600 border-slate-200"
                    )}>
                      {scope.techStack}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {!scope.website && (
               <div className="p-3 bg-red-50 border border-red-100 rounded-xl mt-4">
                 <p className="text-xs text-red-600 font-medium">⚠️ Esta empresa existe no Google Maps, mas não tem um site conectado. O cliente clica e não tem para onde ir.</p>
               </div>
            )}

            <div className="pt-4">
              <p className="text-xs font-semibold text-slate-400 mb-3">Links & Plataformas</p>
              <div className="flex flex-wrap gap-2.5">
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(scope.name + ' ' + scope.address)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-800 hover:bg-slate-50 transition-colors text-sm font-bold">
                  <MapPin className="h-4 w-4" /> Ver no Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Diagnóstico Automático Baseado no Playbook */}
      <div className="p-6 bg-slate-50 border-t border-slate-100">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" /> Inteligência de Abordagem (Playbook)
        </h3>
        <div className="space-y-3">
          {noWebsite && (
            <div className="p-4 bg-white border border-red-100 rounded-2xl shadow-sm">
              <p className="text-sm text-slate-700 font-medium leading-relaxed">
                <span className="font-bold text-red-600">🚨 ALVO FÁCIL: Empresa Incompleta.</span> Eles têm ficha no Google Maps, mas **não possuem site**. O cliente americano pesquisa o serviço, os acha no mapa, mas desiste de ligar porque não há um site para passar credibilidade. 
                <br/><br/>
                **O que falar:** "Oi! Achei vocês no Google Maps pesquisando [Nicho] em [Cidade]. Vi que vocês têm a ficha, mas estão sem site oficial conectado. O americano que busca no Maps acaba indo pro concorrente porque não acha a tabela de vocês. Posso mostrar como a gente resolve isso?"
              </p>
            </div>
          )}

          {!noWebsite && noWhatsapp && (
            <div className="p-4 bg-white border border-amber-100 rounded-2xl shadow-sm">
              <p className="text-sm text-slate-700 font-medium leading-relaxed">
                <span className="font-bold text-amber-600">🟡 Cenário 9 — Sem Número Visível:</span> Eles têm um site ({scope.website}), mas o cliente não tem um botão fácil de WhatsApp para clicar. Dependem de formulários lentos.
                <br/><br/>
                **O que falar:** "Oi! Entrei no site de vocês, tá bacana! Mas fiquei com uma dúvida: como o cliente americano chama vocês hoje? Tem que preencher aquele formulário? Porque o americano que tem pressa desiste no meio. A gente instala uma automação que joga o cliente do site direto pro WhatsApp de vocês. Quer ver como funciona?"
              </p>
            </div>
          )}

          {!noWebsite && scope.techStack === 'Wix' && (
            <div className="p-4 bg-white border border-amber-100 rounded-2xl shadow-sm">
              <p className="text-sm text-slate-700 font-medium leading-relaxed">
                <span className="font-bold text-amber-600">🟡 Cenário 6 — Site Amador (Wix):</span> O site deles foi feito em Wix. Costuma ser lento e passar imagem de empresa amadora para o cliente high-ticket.
                <br/><br/>
                **O que falar:** "Seu site atual tá funcionando ou tá mais como um cartão de visita parado pagando mensalidade? Tem umas estruturas modernas que carregam mais rápido e convertem melhor."
              </p>
            </div>
          )}

          {isBadRating && (
            <div className="p-4 bg-white border border-red-100 rounded-2xl shadow-sm">
              <p className="text-sm text-slate-700 font-medium leading-relaxed">
                <span className="font-bold text-red-600">📉 Alerta de Reputação:</span> A nota no Google é {scope.rating}. O americano confia em avaliações. Use isso: "Vi que vocês prestam um bom serviço, mas a nota no Google não reflete isso. A gente pode montar uma automação para pedir avaliação 5 estrelas pros seus melhores clientes e subir essa nota rápido."
              </p>
            </div>
          )}

          {!noWebsite && !noWhatsapp && !isBadRating && (
            <div className="p-4 bg-white border border-emerald-100 rounded-2xl shadow-sm">
              <p className="text-sm text-slate-700 font-medium leading-relaxed">
                <span className="font-bold text-emerald-600">🟢 Cenário 7 — Estruturado sem Conversão:</span> A empresa tem site, WhatsApp e boa nota. Eles já entendem de marketing.
                <br/><br/>
                **O que falar:** "Vocês estão muito bem posicionados! A pergunta é: dos 10 americanos que entram no site, quantos fecham? Se for pouco, tem algo travando no processo. A gente faz uma consultoria focada só na otimização dessa conversão."
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScopeCard;
