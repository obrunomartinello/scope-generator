import React from 'react';
import { Star, Phone, Mail, Globe, MapPin, Building2, MessageCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
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
  const needsBetterSite = scope.techStack === 'Wix' || !scope.website;

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
        
        {/* Quick Diagnose Badge */}
        <div className="text-right">
          <span className={cn(
            "inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-bold shadow-sm border",
            needsBetterSite || isBadRating 
              ? "bg-red-50 border-red-100 text-red-600" 
              : "bg-emerald-50 border-emerald-100 text-emerald-600"
          )}>
            {needsBetterSite || isBadRating ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            {needsBetterSite || isBadRating ? 'Oportunidade Forte' : 'Empresa Estruturada'}
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
                <p className="text-xs font-semibold text-slate-400">Telefone Fixo</p>
                <p className="font-bold text-slate-800 text-lg">{scope.phone || 'Não encontrado'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center flex-shrink-0">
                <MessageCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">WhatsApp</p>
                {scope.whatsapp ? (
                  <a href={scope.whatsapp} target="_blank" rel="noreferrer" className="font-bold text-green-600 text-lg hover:underline decoration-2 underline-offset-4">Disponível no site</a>
                ) : (
                  <p className="font-medium text-slate-500">Não encontrado no site</p>
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
                  <a href={`https://${scope.website}`} target="_blank" rel="noreferrer" className="font-bold text-apple-blue hover:underline decoration-2 underline-offset-4 text-lg">
                    {scope.website || 'Sem site'}
                  </a>
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

            <div className="pt-4">
              <p className="text-xs font-semibold text-slate-400 mb-3">Outras Plataformas</p>
              <div className="flex flex-wrap gap-2.5">
                {scope.links?.yelp ? (
                  <a href={scope.links.yelp} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm text-[#FF1A1A] hover:bg-slate-50 transition-colors text-sm font-bold">
                    Yelp
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100/50 border border-slate-200/50 text-slate-400 text-sm font-medium">Sem Yelp</span>
                )}
                
                {scope.links?.facebook ? (
                  <a href={scope.links.facebook} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm text-[#1877F2] hover:bg-slate-50 transition-colors text-sm font-bold">
                    Facebook
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100/50 border border-slate-200/50 text-slate-400 text-sm font-medium">Sem Facebook</span>
                )}

                {scope.links?.thumbtack ? (
                  <a href={scope.links.thumbtack} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm text-emerald-600 hover:bg-slate-50 transition-colors text-sm font-bold">
                    Thumbtack
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100/50 border border-slate-200/50 text-slate-400 text-sm font-medium">Sem Thumbtack</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Diagnóstico Automático */}
      <div className="p-6 bg-apple-blue/5 border-t border-apple-blue/10">
        <h3 className="text-xs font-bold text-apple-blue uppercase tracking-widest mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" /> Diagnóstico & Abordagem
        </h3>
        <p className="text-sm text-slate-700 font-medium leading-relaxed">
          {needsBetterSite && isBadRating && "Empresa com forte vulnerabilidade. O site é amador (Wix ou inexistente) e a nota está baixa. A abordagem deve focar em como a presença digital atual afasta clientes e como uma reestruturação pode reverter a imagem da empresa."}
          {needsBetterSite && !isBadRating && "A empresa presta um bom serviço (boa nota), mas peca na estrutura do site (Wix ou inexistente). A abordagem ideal é: 'Vocês têm um serviço excelente, mas o site atual não reflete essa qualidade e está limitando o crescimento'."}
          {!needsBetterSite && isBadRating && "A empresa tem uma estrutura digital ok, mas a reputação está manchada. O foco da abordagem deve ser em gestão de reputação, captação de novas avaliações positivas e recuperação de clientes."}
          {!needsBetterSite && !isBadRating && !scope.whatsapp && "A empresa está bem posicionada, mas falta um canal de conversão rápida (WhatsApp). A abordagem pode focar em otimização de conversão: 'Vocês têm tráfego e boa nota, mas estão perdendo orçamentos por não ter um atendimento via WhatsApp no site'."}
          {!needsBetterSite && !isBadRating && scope.whatsapp && "Empresa já bem estruturada digitalmente. A abordagem deve ser mais consultiva: analisar o que os concorrentes não estão fazendo ou oferecer otimização de campanhas para escalar ainda mais."}
        </p>
      </div>
    </div>
  );
};

export default ScopeCard;
