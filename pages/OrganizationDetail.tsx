
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Organization } from '../types';
import { ArrowLeft, Loader2, ShieldCheck, Mail, Phone, MapPin, Euro, Clock } from 'lucide-react';

export const OrganizationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const { data, error } = await supabase.from('organizations').select('*').eq('id', id).single();
        if (error) throw error;
        setOrg(data as Organization);
      } catch (err) {
        console.error('Error fetching organization:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrg();
  }, [id]);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
        <p className="mt-4 text-xs font-black text-gray-400 uppercase tracking-widest">Syncing Neural Node...</p>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200">
        <h1 className="text-2xl font-black text-gray-900 uppercase">Node Access Restricted</h1>
        <p className="text-gray-400 text-sm mt-2 mb-6">This node identifier is not recognized by the neural core.</p>
        <Link to="/organizations" className="inline-flex items-center gap-2 text-red-700 font-bold uppercase text-xs tracking-widest bg-red-50 px-6 py-3 rounded-xl hover:bg-red-100 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Node Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-10 pb-20">
      <div className="flex items-center gap-4">
        <Link to="/organizations" className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">{org.name}</h1>
          <p className="text-gray-500 text-sm font-medium">Neural Node Identifier: #{org.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
              <ShieldCheck className="w-12 h-12 text-red-500 opacity-10" />
            </div>
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8">Node Identity</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Communication Channel</div>
                  <div className="text-xl font-bold text-gray-900 group-hover:text-red-700 transition-colors">{org.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Physical Node Location</div>
                  <div className="text-xl font-bold text-gray-900">{org.address}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Direct Access Line</div>
                  <div className="text-xl font-bold text-gray-900">{org.phone}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Licensed Neural Operators</h2>
              <span className="px-4 py-1 bg-gray-100 text-gray-900 rounded-full text-[10px] font-black uppercase tracking-widest">{org.users?.length || 0} TOTAL</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Operator Name</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Classification</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Neural Load</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(org.users || []).map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-6 text-sm font-black text-gray-300">#{user.id}</td>
                      <td className="p-6">
                        <div className="font-bold text-gray-900">{user.fullName}</div>
                        <div className="text-[10px] font-medium text-gray-400">{user.email}</div>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${user.role === 'Admin' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-gray-900">{user.minutesUsed}</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">MINS</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-red-900/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-20"><Euro className="w-12 h-12" /></div>
              <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-10">Usage & Billing</h2>
              <div className="space-y-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><Clock className="w-5 h-5" /></div>
                    <span className="text-sm font-bold text-white/60">Neural Time Used</span>
                  </div>
                  <span className="text-2xl font-black">{org.finance?.usedThisMonth || 0}m</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><Euro className="w-5 h-5" /></div>
                    <span className="text-sm font-bold text-white/60">Tariff per Min</span>
                  </div>
                  <span className="text-xl font-bold">€{(org.finance?.tariffPerMinute || 0).toFixed(2)}</span>
                </div>
                <div className="pt-8 border-t border-white/10">
                   <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Projected Monthly Cost</div>
                   <div className="text-5xl font-black text-red-500 tracking-tighter">€{(org.finance?.calculatedBill || 0).toFixed(2).replace('.', ',')}</div>
                </div>
                <button className="w-full bg-white text-gray-900 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-100 active:scale-95 transition-all">
                  Generate Eburon Report
                </button>
              </div>
           </div>

           <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Security Level</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center"><ShieldCheck className="w-6 h-6" /></div>
                <div>
                  <div className="text-sm font-black text-gray-900 uppercase">Eburon AES-256</div>
                  <div className="text-[10px] font-medium text-gray-400">Node traffic is encrypted end-to-end.</div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
