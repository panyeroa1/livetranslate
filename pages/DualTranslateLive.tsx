
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Power, History, Terminal, Zap, Wind, AlertCircle, ChevronDown, Save, Loader2, Moon, Sun } from 'lucide-react';
import { createLiveSession, createPcmBlob, decodeAudioData, decodeBase64 } from '../services/gemini';
import { LiveServerMessage } from '@google/genai';
import { supabase } from '../services/supabase';

interface LocationState {
  clientLang: string;
  employerLang: string;
  staffVoice: string;
  guestVoice: string;
}

interface TranscriptEntry {
  id: string;
  text: string;
  role: 'staff' | 'guest';
  timestamp: Date;
}

export const DualTranslateLive: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clientLang, employerLang, staffVoice, guestVoice } = (location.state as LocationState) || { 
    clientLang: 'auto', 
    employerLang: 'English (US - Standard)',
    staffVoice: 'Artemis',
    guestVoice: 'Hestia'
  };
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false); 
  const [usageSeconds, setUsageSeconds] = useState(0);
  const [modelSpeaking, setModelSpeaking] = useState(false);
  const [history, setHistory] = useState<TranscriptEntry[]>([]);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [showTranscriptMobile, setShowTranscriptMobile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [liveStaffText, setLiveStaffText] = useState('');
  const [liveGuestText, setLiveGuestText] = useState('');
  const [activeTurn, setActiveTurn] = useState<'staff' | 'guest' | 'idle'>('idle');

  const [voiceFocus, setVoiceFocus] = useState(true);
  const [noiseRemoval, setNoiseRemoval] = useState(true);

  const inputAccumulator = useRef('');
  const outputAccumulator = useRef('');

  const audioContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  
  const isMicActiveRef = useRef(false);
  const modelSpeakingRef = useRef(false);

  useEffect(() => {
    isMicActiveRef.current = isMicActive;
  }, [isMicActive]);

  useEffect(() => {
    modelSpeakingRef.current = modelSpeaking;
    if (modelSpeaking) setActiveTurn('guest');
    else if (isMicActive) setActiveTurn('staff');
    else setActiveTurn('idle');
  }, [modelSpeaking, isMicActive]);

  useEffect(() => {
    if (showTranscriptMobile) {
      transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, showTranscriptMobile]);

  useEffect(() => {
    let interval: number;
    if (isConnected) interval = window.setInterval(() => setUsageSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isConnected]);

  const initSession = async () => {
    setErrorStatus(null);
    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { noiseSuppression: noiseRemoval, echoCancellation: true, autoGainControl: true } 
      });
      mediaStreamRef.current = stream;

      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      outputContextRef.current = new AudioContext({ sampleRate: 24000 });

      const sessionPromise = createLiveSession(
        employerLang, clientLang, staffVoice, guestVoice,
        { voiceFocus, noiseRemoval },
        () => setIsConnected(true),
        async (msg: LiveServerMessage) => {
          const audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audio && outputContextRef.current) {
            setModelSpeaking(true);
            const buf = await decodeAudioData(decodeBase64(audio), outputContextRef.current, 24000, 1);
            const s = outputContextRef.current.createBufferSource();
            s.buffer = buf;
            s.connect(outputContextRef.current.destination);
            
            const now = outputContextRef.current.currentTime;
            const startTime = Math.max(nextStartTimeRef.current, now);
            s.start(startTime);
            nextStartTimeRef.current = startTime + buf.duration;
            
            s.onended = () => {
              if (outputContextRef.current && outputContextRef.current.currentTime >= nextStartTimeRef.current - 0.1) {
                setModelSpeaking(false);
              }
            };
          }

          if (msg.serverContent?.inputTranscription) {
            inputAccumulator.current += msg.serverContent.inputTranscription.text;
            setLiveStaffText(inputAccumulator.current);
          }
          if (msg.serverContent?.outputTranscription) {
            outputAccumulator.current += msg.serverContent.outputTranscription.text;
            setLiveGuestText(outputAccumulator.current);
          }

          if (msg.serverContent?.turnComplete) {
            if (inputAccumulator.current.trim()) {
              setHistory(prev => [...prev, { 
                id: `eburon-${Date.now()}-in`, 
                text: inputAccumulator.current, 
                role: 'staff', 
                timestamp: new Date() 
              }]);
              inputAccumulator.current = '';
              setTimeout(() => setLiveStaffText(''), 2000);
            }
            if (outputAccumulator.current.trim()) {
              setHistory(prev => [...prev, { 
                id: `eburon-${Date.now()}-out`, 
                text: outputAccumulator.current, 
                role: 'guest', 
                timestamp: new Date() 
              }]);
              outputAccumulator.current = '';
              setTimeout(() => setLiveGuestText(''), 2000);
            }
          }
        },
        (err) => {
          console.error("[Eburon Neural Link Error]", err);
          setErrorStatus("Link Interrupted");
          setIsConnected(false);
        },
        () => setIsConnected(false)
      );

      sessionPromiseRef.current = sessionPromise;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      source.connect(processor);
      processor.connect(audioContextRef.current.destination);

      processor.onaudioprocess = (e) => {
        if (!isMicActiveRef.current || modelSpeakingRef.current) return;
        const pcmBlob = createPcmBlob(e.inputBuffer.getChannelData(0));
        sessionPromiseRef.current?.then(s => s.sendRealtimeInput({ media: pcmBlob }));
      };

    } catch (err: any) { 
      console.error("[Eburon Hardware Error]", err);
      setErrorStatus("Hardware Restricted");
    }
  };

  useEffect(() => {
    initSession();
    return () => {
      mediaStreamRef.current?.getTracks().forEach(t => t.stop());
      audioContextRef.current?.close();
      outputContextRef.current?.close();
      sessionPromiseRef.current?.then(s => s.close());
    };
  }, [voiceFocus, noiseRemoval]);

  const toggleMic = () => {
    if (!isConnected) return;
    setIsMicActive(!isMicActive);
    if (window.navigator.vibrate) window.navigator.vibrate(50);
  };

  const finalizeAndSave = async () => {
    if (history.length === 0) {
      navigate('/translate');
      return;
    }
    
    setIsSaving(true);
    try {
      const { data: sessionData, error: sessionErr } = await supabase
        .from('chat_sessions')
        .insert([{ client_language: clientLang, employer_language: employerLang, start_time: new Date().toISOString() }])
        .select().single();
      
      if (sessionErr) throw sessionErr;

      const messagesToSave = history.map(h => ({
        session_id: sessionData.id,
        role: h.role,
        text: h.text,
        timestamp: h.timestamp.toISOString()
      }));

      const { error: msgErr } = await supabase.from('chat_messages').insert(messagesToSave);
      if (msgErr) throw msgErr;

      navigate('/archives');
    } catch (err) {
      console.error("Save Failure:", err);
      setIsSaving(false);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${isDarkMode ? 'bg-[#020202] text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* Neural Atmosphere - Subtle for light mode */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
         <div className={`absolute top-1/2 left-1/4 w-[50vw] h-[50vw] rounded-full blur-[140px] transition-all duration-1000 ${isDarkMode ? 'bg-red-900/10' : 'bg-red-500/5'}`}></div>
         <div className={`absolute top-1/2 right-1/4 w-[50vw] h-[50vw] rounded-full blur-[140px] transition-all duration-1000 delay-500 ${isDarkMode ? 'bg-blue-900/10' : 'bg-blue-500/5'}`}></div>
      </div>

      {/* STICKY HEADER */}
      <header className={`sticky top-0 z-[100] px-4 md:px-10 py-5 border-b backdrop-blur-3xl flex items-center justify-between transition-colors ${isDarkMode ? 'bg-black/80 border-white/5' : 'bg-white/80 border-gray-100'}`}>
        <div className="flex items-center gap-4 md:gap-8">
          <button onClick={finalizeAndSave} className={`p-3 rounded-2xl transition-all border group ${isDarkMode ? 'hover:bg-white/10 border-white/10' : 'hover:bg-gray-100 border-gray-100'}`}>
            <ArrowLeft className={`w-5 h-5 group-hover:-translate-x-1 transition-transform ${isDarkMode ? 'text-white' : 'text-gray-600'}`} />
          </button>
          <div className="flex flex-col">
              <h1 className="text-xs md:text-base font-black tracking-tighter uppercase italic leading-none flex items-center gap-3">
                SUCCESS INVEST <span className="text-red-700">EBURON</span> 
                <span className={`hidden xs:inline text-[8px] px-2 py-0.5 rounded border ${isDarkMode ? 'bg-red-700/20 text-red-500 border-red-500/20' : 'bg-red-50 text-red-700 border-red-200'}`}>NEURAL CORE</span>
              </h1>
              <div className="flex items-center gap-2 mt-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 animate-pulse'}`} />
                  <span className={`text-[8px] font-black uppercase tracking-[0.25em] opacity-40 italic ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>UPTIME: {Math.floor(usageSeconds/60)}:{(usageSeconds%60).toString().padStart(2,'0')}</span>
              </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className={`p-3 rounded-xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-yellow-400' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={finalizeAndSave} 
              disabled={isSaving}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all ${isDarkMode ? 'bg-white/10 border-white/10 hover:bg-white/20' : 'bg-gray-900 text-white border-transparent hover:bg-black shadow-lg shadow-gray-200'}`}
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span className="hidden sm:inline">Finalize Session</span>
            </button>
        </div>
      </header>

      {/* MAIN TERMINAL GRID - Side-by-Side (A/B) */}
      <main className="flex-1 flex flex-col p-4 md:p-8 lg:p-12 gap-8 relative z-10 max-w-[2200px] mx-auto w-full overflow-hidden">
          
          <div className="flex-1 flex flex-col lg:flex-row gap-6 md:gap-10 items-stretch">
            
            {/* Staff Card (A) */}
            <div className={`flex-1 rounded-[2.5rem] md:rounded-[4rem] border transition-all duration-1000 p-8 md:p-14 flex flex-col justify-between relative overflow-hidden ${activeTurn === 'staff' ? (isDarkMode ? 'bg-red-950/20 border-red-500/50 shadow-2xl' : 'bg-white border-red-200 shadow-[0_20px_60px_-15px_rgba(239,68,68,0.15)]') : (isDarkMode ? 'bg-white/[0.02] border-white/5 opacity-40 grayscale' : 'bg-white border-gray-100 opacity-60')}`}>
               <div className="flex justify-between items-start relative z-10">
                  <div className="flex flex-col">
                    <div className="text-[9px] font-black text-red-600 uppercase tracking-[0.5em] mb-3">LANGUAGE A (SOURCE)</div>
                    <div className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase leading-none truncate max-w-[300px]">{employerLang}</div>
                  </div>
                  <div className={`px-4 py-2 rounded-full font-black text-[9px] uppercase tracking-widest transition-all duration-700 ${activeTurn === 'staff' ? 'bg-red-600 text-white neural-pulse-red' : (isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-400')}`}>
                    {activeTurn === 'staff' ? 'TRANSMITTING...' : 'IDLE'}
                  </div>
               </div>
               
               <div className="flex-1 flex flex-col items-center justify-center py-10 relative z-10">
                  <div className={`transition-all duration-500 w-full text-center ${liveStaffText ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'}`}>
                     <p className={`text-2xl md:text-5xl font-black italic tracking-tight leading-tight px-4 ${isDarkMode ? 'text-white drop-shadow-2xl' : 'text-gray-900'}`}>
                        "{liveStaffText}"
                     </p>
                  </div>
                  {!liveStaffText && (
                    <div className="flex flex-col items-center opacity-10 font-black uppercase tracking-[0.6em] text-[10px] md:text-sm animate-pulse">
                        Awaiting Pulse...
                    </div>
                  )}
               </div>
               <div className="text-[8px] md:text-[10px] font-black opacity-30 uppercase tracking-[0.4em] relative z-10 italic">SUCCESS INVEST ENGINE: {staffVoice}</div>
            </div>

            {/* Guest Card (B) */}
            <div className={`flex-1 rounded-[2.5rem] md:rounded-[4rem] border transition-all duration-1000 p-8 md:p-14 flex flex-col justify-between relative overflow-hidden ${activeTurn === 'guest' ? (isDarkMode ? 'bg-blue-950/20 border-blue-500/50 shadow-2xl' : 'bg-white border-blue-200 shadow-[0_20px_60px_-15px_rgba(59,130,246,0.15)]') : (isDarkMode ? 'bg-white/[0.02] border-white/5 opacity-40 grayscale' : 'bg-white border-gray-100 opacity-60')}`}>
               <div className="flex justify-between items-start relative z-10">
                  <div className="flex flex-col">
                    <div className="text-[9px] font-black text-blue-600 uppercase tracking-[0.5em] mb-3">LANGUAGE B (TARGET)</div>
                    <div className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase leading-none truncate max-w-[300px]">{clientLang === 'auto' ? 'NEURAL AUTO' : clientLang}</div>
                  </div>
                  <div className={`px-4 py-2 rounded-full font-black text-[9px] uppercase tracking-widest transition-all duration-700 ${activeTurn === 'guest' ? 'bg-blue-600 text-white animate-pulse shadow-[0_0_20px_rgba(59,130,246,0.4)]' : (isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-400')}`}>
                    {activeTurn === 'guest' ? 'SYNCHRONIZING...' : 'IDLE'}
                  </div>
               </div>

               <div className="flex-1 flex flex-col items-center justify-center py-10 relative z-10">
                  <div className={`transition-all duration-500 w-full text-center ${liveGuestText ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'}`}>
                     <p className={`text-2xl md:text-5xl font-black italic tracking-tight leading-tight px-4 ${isDarkMode ? 'text-white drop-shadow-2xl' : 'text-gray-900'}`}>
                        "{liveGuestText}"
                     </p>
                  </div>
                  {!liveGuestText && (
                    <div className="flex flex-col items-center opacity-10 font-black uppercase tracking-[0.6em] text-[10px] md:text-sm">
                        Waiting for Inference...
                    </div>
                  )}
               </div>
               <div className="text-[8px] md:text-[10px] font-black opacity-30 uppercase tracking-[0.4em] relative z-10 italic">SUCCESS INVEST ENGINE: {guestVoice}</div>
            </div>
          </div>
      </main>

      {/* FOOTER CONTROLS - Fixed at Bottom */}
      <footer className={`sticky bottom-0 z-[100] h-32 md:h-44 flex flex-col items-center justify-center border-t transition-colors ${isDarkMode ? 'bg-black/90 border-white/5 backdrop-blur-3xl' : 'bg-white/95 border-gray-100 shadow-2xl shadow-black/10'}`}>
          <div className="flex items-center gap-10 md:gap-16">
            
            <button 
              onClick={() => setShowTranscriptMobile(true)}
              className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white/40' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
            >
              <History className="w-6 h-6" />
            </button>

            <button
              onClick={toggleMic}
              disabled={!isConnected}
              className={`w-24 h-24 md:w-36 md:h-36 rounded-[2.5rem] border-2 transition-all duration-700 flex flex-col items-center justify-center relative shadow-2xl ${isMicActive ? 'bg-red-700 border-white scale-110 shadow-[0_0_60px_rgba(239,68,68,0.5)]' : (isDarkMode ? 'bg-white/5 border-white/10 active:scale-95' : 'bg-gray-100 border-gray-200 active:scale-95')} ${!isConnected ? 'opacity-20' : ''}`}
            >
              {isMicActive && !modelSpeaking && <div className="absolute inset-0 bg-red-400/20 animate-ping rounded-[2.5rem]"></div>}
              <Power className={`w-8 h-8 md:w-12 md:h-12 ${isMicActive ? 'text-white' : 'opacity-20'}`} />
              <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] mt-3 md:mt-4 ${isMicActive ? 'opacity-100' : 'opacity-20'}`}>
                {isMicActive ? 'ONLINE' : 'BOOT'}
              </span>
            </button>

            <div className="w-14 h-14"></div>
          </div>
          
          <div className="mt-4 md:mt-6 text-[7px] md:text-[10px] font-black opacity-30 uppercase tracking-[0.6em] text-center italic">
            EBURON NEURAL INTERPRETER • GLOBAL SUCCESS INVEST CORE
          </div>
      </footer>

      {/* TRANSCRIPT OVERLAY - Full screen mobile, slide-out sidebar effect */}
      {showTranscriptMobile && (
        <div className="fixed inset-0 z-[1000] flex justify-end">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in" onClick={() => setShowTranscriptMobile(false)}></div>
           <div className={`w-full max-w-xl h-full shadow-2xl flex flex-col overflow-hidden animate-slide-left transition-colors ${isDarkMode ? 'bg-[#0a0a0a] border-l border-white/10' : 'bg-white'}`}>
             <div className="p-8 border-b flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Terminal className="w-5 h-5 text-red-700" />
                  <span className={`text-sm font-black uppercase tracking-[0.3em] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>SESSION TELEMETRY LOG</span>
                </div>
                <button onClick={() => setShowTranscriptMobile(false)} className={`p-2 rounded-xl border transition-all ${isDarkMode ? 'border-white/10 text-white hover:bg-white/10' : 'border-gray-100 text-gray-900 hover:bg-gray-100'}`}>
                  <ChevronDown className="w-6 h-6" />
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10 scrollbar-hide">
                {history.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-10 py-20">
                     <History className="w-20 h-20 mb-8" />
                     <p className="text-xs font-black uppercase tracking-[0.5em]">Establishing Eburon Link...</p>
                  </div>
                ) : (
                  history.map((entry) => (
                    <div key={entry.id} className="flex flex-col gap-4 animate-fade-in group">
                       <div className="flex items-center justify-between">
                         <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${entry.role === 'staff' ? 'text-red-500 border-red-500/20 bg-red-500/5' : 'text-blue-500 border-blue-500/20 bg-blue-500/5'}`}>
                            {entry.role === 'staff' ? 'Neural Pulse A' : 'Neural Inference B'}
                         </span>
                         <span className="text-[8px] opacity-20 font-mono">{entry.timestamp.toLocaleTimeString()}</span>
                       </div>
                       <div className={`p-6 md:p-8 rounded-[2rem] text-[13px] md:text-[15px] font-black italic border leading-relaxed shadow-sm ${entry.role === 'staff' ? 'bg-red-500/5 border-red-500/10' : 'bg-blue-500/5 border-blue-500/10'}`}>
                          {entry.text}
                       </div>
                    </div>
                  ))
                )}
                <div ref={transcriptEndRef} />
             </div>
           </div>
        </div>
      )}
    </div>
  );
};
