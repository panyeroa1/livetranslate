
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Organization } from '../types';
import { Building2, Plus, Search, Loader2, AlertTriangle, Code, X, Check, Mail, Phone, MapPin } from 'lucide-react';

export const Organizations: React.FC = () => {
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [newOrg, setNewOrg] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    tariff: 0.15
  });

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('organizations').select('*').order('id', { ascending: false });
      if (error) throw error;
      setOrgs(data as Organization[] || []);
    } catch (err: any) {
      console.error('Error fetching organizations:', err);
      setError(err.message || 'Failed to access neural database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const { data, error } = await supabase.from('organizations').insert([{
        name: newOrg.name,
        email: newOrg.email,
        phone: newOrg.phone,
        address: newOrg.address,
        finance: {
          tariffPerMinute: newOrg.tariff,
          usedThisMonth: 0,
          calculatedBill: 0
        }
      }]).select();

      if (error) throw error;
      
      setShowCreateModal(false);
      setNewOrg({ name: '', email: '', phone: '', address: '', tariff: 0.15 });
      fetchOrgs();
    } catch (err: any) {
      alert("Creation Failed: " + err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const isTableError = error?.includes('organizations') || error?.includes('cache');

  return (
    <div className="animate-fade-in space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Partners</h1>
          <p className="text-gray-400 text-[11px] font-medium">Manage Success Invest verified organizations.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-red-700 hover:bg-red-800 text-white px-6 py-3 rounded-xl shadow-lg text-[10px] font-black transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>ONBOARD PARTNER</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-6 rounded-[2rem] flex flex-col gap-4 text-red-700">
          <div className="flex items-center gap-4">
            <AlertTriangle className="w-8 h-8 shrink-0" />
            <div>
              <p className="font-black uppercase text-[10px] tracking-[0.2em]">Neural Database Error</p>
              <p className="text-xs font-medium opacity-80">{error}</p>
            </div>
          </div>
          {isTableError && (
            <div className="bg-white/50 p-4 rounded-xl border border-red-100">
              <div className="flex items-center gap-2 mb-2 text-gray-900">
                 <Code className="w-4 h-4" />
                 <span className="text-[9px] font-black uppercase tracking-widest">Initialization Required</span>
              </div>
              <pre className="bg-gray-900 text-red-400 p-3 rounded-lg text-[9px] overflow-x-auto font-mono">
{`CREATE TABLE organizations (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  finance JSONB DEFAULT '{"tariffPerMinute": 0.15, "usedThisMonth": 0, "calculatedBill": 0}'::jsonb
);`}
              </pre>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex items-center gap-4">
           <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search Success Invest partners..." 
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 border-none text-[11px] font-medium"
              />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="p-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] w-16 text-center">ID</th>
                <th className="p-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Partner Identity</th>
                <th className="p-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Primary Endpoint</th>
                <th className="p-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Billing Status</th>
                <th className="p-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Load</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && orgs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center">
                    <Loader2 className="w-8 h-8 text-red-600 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : orgs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center opacity-30 italic text-xs font-bold uppercase tracking-widest">
                    No nodes connected to neural core.
                  </td>
                </tr>
              ) : orgs.map((org) => (
                  <tr key={org.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => navigate(`/organizations/${org.id}`)}>
                    <td className="p-4 text-[11px] font-black text-gray-300 text-center">#{org.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-red-50 text-red-700 rounded-xl flex items-center justify-center font-black text-sm shadow-sm">
                          {org.name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <div className="font-black text-gray-900 text-[11px] uppercase tracking-tight">{org.name}</div>
                          <div className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">{org.address || 'Global Terminal'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-[10px] font-bold text-gray-500 uppercase">{org.email}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-green-700">Verified</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-[11px] font-black text-gray-900">{org.finance?.usedThisMonth || 0}m</span>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
              <div className="p-8 bg-gray-900 text-white flex justify-between items-center">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-red-700 rounded-xl flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-white" />
                   </div>
                   <div>
                     <h2 className="text-sm font-black uppercase tracking-widest leading-none">Onboard Partner</h2>
                     <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">Register New Neural Node</p>
                   </div>
                 </div>
                 <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              
              <form onSubmit={handleCreateOrg} className="p-10 space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                       <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block ml-1">Company Name</label>
                       <div className="relative">
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                          <input 
                            required
                            type="text" 
                            className="w-full pl-11 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-[11px] font-bold focus:ring-2 focus:ring-red-700/10 transition-all"
                            placeholder="e.g. Antwerp City Hospital"
                            value={newOrg.name}
                            onChange={e => setNewOrg({...newOrg, name: e.target.value})}
                          />
                       </div>
                    </div>
                    
                    <div>
                       <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block ml-1">Admin Email</label>
                       <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                          <input 
                            required
                            type="email" 
                            className="w-full pl-11 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-[11px] font-bold focus:ring-2 focus:ring-red-700/10 transition-all"
                            placeholder="admin@partner.com"
                            value={newOrg.email}
                            onChange={e => setNewOrg({...newOrg, email: e.target.value})}
                          />
                       </div>
                    </div>

                    <div>
                       <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block ml-1">Contact Phone</label>
                       <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                          <input 
                            type="tel" 
                            className="w-full pl-11 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-[11px] font-bold focus:ring-2 focus:ring-red-700/10 transition-all"
                            placeholder="+32 ..."
                            value={newOrg.phone}
                            onChange={e => setNewOrg({...newOrg, phone: e.target.value})}
                          />
                       </div>
                    </div>

                    <div className="col-span-2">
                       <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block ml-1">Physical Address</label>
                       <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                          <input 
                            type="text" 
                            className="w-full pl-11 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-[11px] font-bold focus:ring-2 focus:ring-red-700/10 transition-all"
                            placeholder="Street, City, Country"
                            value={newOrg.address}
                            onChange={e => setNewOrg({...newOrg, address: e.target.value})}
                          />
                       </div>
                    </div>
                 </div>

                 <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={isCreating}
                      className="w-full bg-red-700 hover:bg-red-800 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-red-900/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                      <span>{isCreating ? 'Authorizing Node...' : 'Initialize Partner'}</span>
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
