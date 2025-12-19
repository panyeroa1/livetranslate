
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Database, Search, Clock, Globe, ArrowRight, Loader2, Trash2, Calendar, FileText } from 'lucide-react';

interface Session {
  id: string;
  client_language: string;
  employer_language: string;
  start_time: string;
}

export const Archives: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('start_time', { ascending: false });
      if (error) throw error;
      setSessions(data || []);
    } catch (err) {
      console.error('Archive Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to purge this neural record?")) return;
    try {
      await supabase.from('chat_messages').delete().eq('session_id', id);
      await supabase.from('chat_sessions').delete().eq('id', id);
      fetchSessions();
    } catch (err) {
      alert("Purge failed.");
    }
  };

  const filtered = sessions.filter(s => 
    s.client_language.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.employer_language.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Neural <span className="text-red-700">Archives</span></h1>
          <p className="text-gray-400 text-[11px] font-black uppercase tracking-widest mt-1">Eburon Session History logs</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
           <Search className="w-4 h-4 text-gray-300 ml-3" />
           <input 
            type="text" 
            placeholder="FILTER BY DIALECT..." 
            className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-gray-900 placeholder:text-gray-300 focus:ring-0 w-48"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-32 flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-red-700 animate-spin" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-300 mt-4">Accessing Neural Records...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-32 text-center opacity-20">
            <Database className="w-16 h-16 mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em]">No sessions indexed in the Eburon Core.</p>
          </div>
        ) : (
          filtered.map((session) => (
            <div 
              key={session.id} 
              onClick={() => navigate(`/chat-log/${session.id}`)}
              className="bg-white rounded-[2.5rem] border border-gray-100 p-8 hover:shadow-2xl hover:shadow-red-900/5 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="w-12 h-12 bg-red-50 text-red-700 rounded-2xl flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <button 
                  onClick={(e) => handleDelete(e, session.id)}
                  className="p-2 text-gray-200 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <Calendar className="w-3.5 h-3.5 text-gray-300" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    {new Date(session.start_time).toLocaleDateString()} • {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                </div>
                <div className="space-y-1">
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                      <span className="text-xs font-black text-gray-900 uppercase truncate">{session.employer_language}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                      <span className="text-xs font-black text-gray-900 uppercase truncate">{session.client_language === 'auto' ? 'NEURAL AUTO' : session.client_language}</span>
                   </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between group-hover:translate-x-2 transition-transform">
                <span className="text-[9px] font-black uppercase tracking-widest text-red-700">Open Transcript</span>
                <ArrowRight className="w-4 h-4 text-red-700" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
