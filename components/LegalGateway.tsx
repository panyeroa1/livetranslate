
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Scale, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export const LegalGateway: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasAccepted, setHasAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    const consent = localStorage.getItem('success_invest_legal_v1');
    setHasAccepted(!!consent);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('success_invest_legal_v1', new Date().toISOString());
    setHasAccepted(true);
  };

  if (hasAccepted === null) return null;

  if (!hasAccepted) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-950 p-4 md:p-8 font-inter">
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-600 rounded-full blur-[120px]"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[900px]">
          <div className="w-full md:w-1/3 bg-gray-900 p-10 text-white flex flex-col justify-between">
            <div>
              <div className="bg-red-700 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black mb-8 shadow-xl">S</div>
              <h1 className="text-3xl font-black tracking-tighter uppercase mb-4 leading-none">Success <span className="text-red-700">Invest</span></h1>
              <p className="text-gray-400 text-sm font-medium leading-relaxed">
                You are initializing the <span className="text-white font-bold italic">Eburon AI Neural Core</span>, the world-class interpretation engine of Success Invest.
              </p>
            </div>
            
            <div className="space-y-6">
               <div className="flex items-center gap-4">
                  <ShieldCheck className="w-6 h-6 text-green-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">GDPR Compliant</span>
               </div>
               <div className="flex items-center gap-4">
                  <Scale className="w-6 h-6 text-blue-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">EU Data Sovereignty</span>
               </div>
            </div>
          </div>

          <div className="flex-1 p-8 md:p-12 overflow-y-auto flex flex-col">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-8">Service Compliance Agreement</h2>
            
            <div className="space-y-8 flex-1 overflow-y-auto pr-4 scrollbar-hide text-sm text-gray-600 leading-relaxed mb-10">
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-red-600" />
                  <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">1. Eburon Neural Privacy</h3>
                </div>
                <p>
                  Success Invest utilizes the Eburon Neural Core for real-time translation. In compliance with EU GDPR 2016/679, voice data is processed using transient inference and is NOT stored as raw audio files.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-red-600" />
                  <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">2. Native Dialect Liability</h3>
                </div>
                <p>
                  The Eburon engine targets native regional accuracy. Success Invest provides this tool for professional assistance; human operators maintain final responsibility for critical medical or legal decisions.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">3. Metered Deployment</h3>
                </div>
                <p>
                  Usage is billed per minute. By accepting, you authorize the Success Invest Billing Core to meter your neural sessions.
                </p>
              </section>
            </div>

            <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight text-center md:text-left">
                Agreed to the <span className="text-red-600">Success Invest Privacy Policy</span> and Master Agreement.
              </div>
              <button 
                onClick={handleAccept}
                className="w-full md:w-auto bg-gray-900 hover:bg-black text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-gray-200"
              >
                Accept & Initialize
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
