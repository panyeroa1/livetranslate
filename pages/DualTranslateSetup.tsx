
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, ArrowRight, Sparkles, Languages, Settings2 } from 'lucide-react';
import { SUPPORTED_LANGUAGES, NEURAL_VOICES } from '../constants';

export const DualTranslateSetup: React.FC = () => {
  const navigate = useNavigate();
  const [clientLang, setClientLang] = useState('auto');
  const [employerLang, setEmployerLang] = useState('English (US - Standard)');
  const [staffVoice, setStaffVoice] = useState('Artemis');
  const [guestVoice, setGuestVoice] = useState('Hestia');

  useEffect(() => {
    const browserLang = navigator.language || (navigator as any).userLanguage || 'en-US';
    const langCode = browserLang.toLowerCase();
    let matchedDialect = '';

    if (langCode.startsWith('nl-be')) matchedDialect = 'Dutch (Flemish/Belgium - Standard)';
    else if (langCode.startsWith('nl')) matchedDialect = 'Dutch (Netherlands - Standard)';
    else if (langCode.startsWith('fr-be')) matchedDialect = 'French (Belgium)';
    else if (langCode.startsWith('fr-ca')) matchedDialect = 'French (Canada - Québécois)';
    else if (langCode.startsWith('fr')) matchedDialect = 'French (France - Standard)';
    else if (langCode.startsWith('de-at')) matchedDialect = 'German (Austria - Standard/Vienna)';
    else if (langCode.startsWith('de-ch')) matchedDialect = 'German (Switzerland - Schwyzerdütsch)';
    else if (langCode.startsWith('de')) matchedDialect = 'German (Germany - Standard)';
    else if (langCode.startsWith('en-gb')) matchedDialect = 'English (UK - Received Pronunciation)';
    else if (langCode.startsWith('en-au')) matchedDialect = 'English (Australia)';
    else if (langCode.startsWith('it')) matchedDialect = 'Italian (Standard)';
    else if (langCode.startsWith('es')) matchedDialect = 'Spanish (Spain - Castilian)';
    
    if (!matchedDialect) {
      try {
        const primaryLangName = new Intl.DisplayNames(['en'], { type: 'language' }).of(langCode.split('-')[0]);
        matchedDialect = SUPPORTED_LANGUAGES.find(l => 
          l.toLowerCase().includes(primaryLangName?.toLowerCase() || '')
        ) || 'English (US - Standard)';
      } catch (e) {
        matchedDialect = 'English (US - Standard)';
      }
    }
    setEmployerLang(matchedDialect);
  }, []);

  const handleStart = () => {
    if (window.navigator.vibrate) window.navigator.vibrate([10, 50, 10]);
    navigate('/translate/live', { state: { clientLang, employerLang, staffVoice, guestVoice } });
  };

  return (
    <div className="animate-fade-in flex flex-col items-center justify-center min-h-[75vh] max-w-7xl mx-auto px-4 py-12">
       
       <div className="mb-14 text-center">
         <div className="inline-flex items-center justify-center gap-3 bg-gray-900 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.25em] mb-8 border border-white/10 shadow-xl">
            <Sparkles className="w-3 h-3 text-red-500 animate-pulse" />
            SUCCESS INVEST NEURAL CORE
         </div>
         <h1 className="text-4xl md:text-7xl font-black text-gray-900 mb-6 tracking-tighter uppercase italic leading-none">
            Universal <span className="text-red-700">Interpreter</span>
         </h1>
         <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed italic">
            Ultra-low latency interpretation powered by the <span className="text-red-700 font-bold uppercase not-italic">Eburon AI Neural core</span>.
         </p>
       </div>

       <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Terminal A Card */}
            <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-gray-200/50 border border-gray-100 flex flex-col items-center group relative overflow-hidden hover:border-red-100 transition-all transition-duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 opacity-40"></div>
                
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-8 relative">
                    <Languages className="w-8 h-8" />
                    <div className="absolute -top-1 -right-1 bg-green-500 w-3.5 h-3.5 rounded-full border-4 border-white animate-pulse"></div>
                </div>
                
                <h3 className="text-gray-400 font-black uppercase tracking-[0.4em] text-[10px] mb-8 italic">TERMINAL A (SOURCE)</h3>
                
                <div className="w-full space-y-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 block">Regional Dialect</label>
                        <select 
                            value={employerLang}
                            onChange={(e) => setEmployerLang(e.target.value)}
                            className="w-full p-6 rounded-[1.8rem] bg-gray-50 border-2 border-transparent text-lg font-black text-gray-900 focus:border-red-500/20 focus:ring-0 cursor-pointer appearance-none text-center shadow-inner"
                        >
                            {SUPPORTED_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 block">Engine Profile (A)</label>
                        <select 
                            value={staffVoice}
                            onChange={(e) => setStaffVoice(e.target.value)}
                            className="w-full p-6 rounded-[1.8rem] bg-red-50 border-2 border-transparent text-lg font-black text-red-700 focus:border-red-500/20 focus:ring-0 cursor-pointer appearance-none text-center shadow-inner"
                        >
                            {NEURAL_VOICES.map(v => <option key={v.id} value={v.id}>{v.id} - {v.description}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Terminal B Card */}
            <div className="bg-gray-900 rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-red-900/10 border border-white/5 flex flex-col items-center text-white relative overflow-hidden group hover:border-blue-900/50 transition-all transition-duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16"></div>
                
                <div className="w-16 h-16 bg-white/5 text-blue-400 rounded-2xl flex items-center justify-center mb-8">
                    <Settings2 className="w-8 h-8" />
                </div>
                
                <h3 className="text-white/20 font-black uppercase tracking-[0.4em] text-[10px] mb-8 italic">TERMINAL B (TARGET)</h3>

                <div className="w-full space-y-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-4 block">Regional Dialect</label>
                        <select 
                            value={clientLang}
                            onChange={(e) => setClientLang(e.target.value)}
                            className="w-full p-6 rounded-[1.8rem] bg-white/5 border-2 border-transparent text-lg font-black text-white focus:border-blue-500/20 focus:ring-0 cursor-pointer appearance-none text-center shadow-inner"
                        >
                            <option value="auto">Neural Auto-Detect</option>
                            {SUPPORTED_LANGUAGES.map(l => <option key={l} value={l} className="bg-gray-900 text-white">{l}</option>)}
                        </select>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-4 block">Engine Profile (B)</label>
                        <select 
                            value={guestVoice}
                            onChange={(e) => setGuestVoice(e.target.value)}
                            className="w-full p-6 rounded-[1.8rem] bg-white/10 border-2 border-transparent text-lg font-black text-blue-400 focus:border-blue-500/20 focus:ring-0 cursor-pointer appearance-none text-center shadow-inner"
                        >
                            {NEURAL_VOICES.map(v => <option key={v.id} value={v.id} className="bg-gray-900">{v.id} - {v.description}</option>)}
                        </select>
                    </div>
                </div>
            </div>
       </div>

       <button 
         onClick={handleStart}
         className="w-full max-w-sm bg-red-700 hover:bg-red-800 text-white font-black text-xl py-6 rounded-[2rem] shadow-[0_25px_60px_-15px_rgba(239,68,68,0.4)] transition-all active:scale-95 flex items-center justify-center gap-6 group mb-10"
       >
         <span className="tracking-tighter uppercase italic">Initialize Neural Link</span>
         <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
       </button>

       <div className="text-[9px] font-black text-gray-300 uppercase tracking-[0.5em] italic">
          © 2025 SUCCESS INVEST GLOBAL • POWERED BY EBURON AI
       </div>
    </div>
  );
};
