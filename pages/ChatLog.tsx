
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { ArrowLeft, Loader2, Printer, ShieldCheck, AlertTriangle, Code } from 'lucide-react';

interface ChatMessageRecord {
  id: string;
  role: string;
  text: string;
  timestamp: string;
}

interface ChatSessionRecord {
  id: string;
  client_language: string;
  employer_language: string;
  start_time: string;
}

export const ChatLog: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<ChatSessionRecord | null>(null);
  const [messages, setMessages] = useState<ChatMessageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: sessionData, error: sessionErr } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('id', id)
          .single();
        if (sessionErr) throw sessionErr;
        setSession(sessionData);

        const { data: messagesData, error: messagesErr } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', id)
          .order('timestamp', { ascending: true });
        if (messagesErr) throw messagesErr;
        setMessages(messagesData || []);
      } catch (err: any) {
        console.error('Error loading neural log:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
        <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Reconstructing Neural Transcript...</p>
      </div>
    );
  }

  const isTableError = error?.includes('chat_sessions') || error?.includes('chat_messages') || error?.includes('cache');

  if (error && isTableError) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 md:p-20 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white p-12 rounded-[3rem] shadow-2xl border border-red-100 flex flex-col gap-8">
           <div className="flex items-center gap-6 text-red-600">
             <AlertTriangle className="w-12 h-12" />
             <h1 className="text-3xl font-black uppercase tracking-tighter">Database Initialization Required</h1>
           </div>
           <p className="text-gray-600 font-medium">Success Invest needs the following tables in your Supabase project to store neural transcripts:</p>
           
           <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-900">
                <Code className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Schema Definition</span>
              </div>
              <pre className="bg-gray-900 text-red-400 p-6 rounded-2xl text-[10px] overflow-x-auto font-mono leading-relaxed">
{`CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_language TEXT,
  employer_language TEXT,
  start_time TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id),
  role TEXT,
  text TEXT,
  timestamp TIMESTAMPTZ DEFAULT now()
);`}
              </pre>
           </div>
           
           <Link to="/" className="text-center py-4 bg-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-200 transition-colors">
              Return to Console
           </Link>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white p-12 text-center">
        <h1 className="text-4xl font-black text-gray-900 uppercase mb-4 tracking-tighter">Transcript Access Restricted</h1>
        <p className="text-gray-400 text-sm mb-8">This session identifier is not verified in the Success Invest neural database.</p>
        <Link to="/" className="text-red-700 font-bold uppercase text-xs tracking-[0.2em] border-b-2 border-red-700 pb-1">Return to Console</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 p-8 md:p-20 animate-fade-in print:p-0">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-16 print:hidden">
            <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-red-700 transition-colors font-bold uppercase text-[10px] tracking-widest">
                <ArrowLeft className="w-4 h-4" />
                Back
            </Link>
            <button onClick={() => window.print()} className="flex items-center gap-2 text-gray-400 hover:text-red-700 transition-colors font-bold uppercase text-[10px] tracking-widest">
                <Printer className="w-4 h-4" />
                Print Record
            </button>
        </div>

        <div className="flex items-center gap-4 mb-8">
            <div className="bg-red-700 text-white p-2 rounded-xl font-bold text-xl w-10 h-10 flex items-center justify-center shadow-xl shadow-red-100">S</div>
            <div className="flex flex-col">
                <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">SUCCESS INVEST</h1>
                <span className="text-[10px] font-bold text-red-700 uppercase tracking-widest mt-1">Official Neural Transcript</span>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-12 border-y border-gray-100 py-10 mb-16">
            <div>
                <div className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-4">Neural Session Data</div>
                <div className="space-y-2">
                    <div className="flex justify-between text-xs"><span className="font-bold text-gray-400 uppercase">Link ID:</span> <span className="font-mono text-gray-900">#{session.id.slice(0, 12)}...</span></div>
                    <div className="flex justify-between text-xs"><span className="font-bold text-gray-400 uppercase">Link Opened:</span> <span className="text-gray-900">{new Date(session.start_time).toLocaleString()}</span></div>
                </div>
            </div>
            <div>
                <div className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-4">Neural Configuration</div>
                <div className="space-y-2">
                    <div className="flex justify-between text-xs"><span className="font-bold text-gray-400 uppercase">Staff Dialect:</span> <span className="text-gray-900">{session.employer_language}</span></div>
                    <div className="flex justify-between text-xs"><span className="font-bold text-gray-400 uppercase">Guest Dialect:</span> <span className="text-gray-900">{session.client_language}</span></div>
                </div>
            </div>
        </div>

        <div className="space-y-12">
            {messages.length === 0 ? (
                <div className="py-20 text-center italic text-gray-300 font-medium">No neural turns were recorded during this session.</div>
            ) : (
                messages.map((msg) => (
                    <div key={msg.id} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${msg.role === 'staff' ? 'text-red-700' : 'text-blue-700'}`}>
                                {msg.role === 'staff' ? 'Staff Transmission' : 'Guest Transmission'}
                            </span>
                            <span className="text-[9px] font-mono text-gray-300">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div className="text-xl md:text-2xl font-medium leading-relaxed italic border-l-4 border-gray-100 pl-8 py-2">
                            {msg.text}
                        </div>
                    </div>
                ))
            )}
        </div>

        <div className="mt-24 pt-12 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Success Invest Verified Secure Record</span>
            </div>
            <div className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.4em]">© 2025 SUCCESS INVEST • POWERED BY EBURON AI</div>
        </div>
      </div>
    </div>
  );
};
