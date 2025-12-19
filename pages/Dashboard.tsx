
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Clock, TrendingUp, Building2, Euro, ShieldCheck, Loader2, AlertTriangle, Code, ArrowRight } from 'lucide-react';
import { Organization } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalMinutes: 0,
    totalIncome: 0,
  });
  const [recentOrgs, setRecentOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: orgs, error } = await supabase.from('organizations').select('*').order('id', { ascending: false });
        
        if (error) {
          throw new Error(error.message);
        }

        if (orgs) {
          const totalMinutes = orgs.reduce((acc, org) => acc + (org.finance?.usedThisMonth || 0), 0);
          const totalIncome = orgs.reduce((acc, org) => acc + (org.finance?.calculatedBill || 0), 0);
          setStats({
            totalCompanies: orgs.length,
            totalMinutes,
            totalIncome,
          });
          setRecentOrgs(orgs.slice(0, 4));
        }
      } catch (err: any) {
        console.error('Error fetching stats:', err);
        setErrorMessage(err.message || 'Failed to aggregate Neural Core telemetry.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
        <p className="mt-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Aggregating Success Invest Telemetry...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 p-6 rounded-[2rem] flex flex-col gap-4 text-red-700 shadow-xl shadow-red-900/5">
          <div className="flex items-center gap-4">
            <AlertTriangle className="w-8 h-8 shrink-0" />
            <div>
              <p className="font-black uppercase text-[10px] tracking-[0.2em]">Neural Database Error</p>
              <p className="text-xs font-medium opacity-80 mt-0.5">{errorMessage}</p>
            </div>
          </div>
          
          <div className="bg-white/50 p-4 rounded-xl border border-red-100">
            <div className="flex items-center gap-2 mb-2 text-gray-900">
               <Code className="w-3.3 h-3.3" />
               <span className="text-[9px] font-black uppercase tracking-widest">Initialization Required</span>
            </div>
            <pre className="bg-gray-900 text-red-400 p-3 rounded-lg text-[9px] overflow-x-auto font-mono leading-relaxed">
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
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tighter uppercase leading-none">System <span className="text-red-700">Health</span></h1>
          <p className="text-gray-500 mt-1 text-xs font-medium italic">Success Invest Universal Interpreter Telemetry.</p>
        </div>
        <div className="px-4 py-2 bg-green-50 text-green-700 rounded-full font-black text-[9px] border border-green-100 flex items-center gap-2 shadow-sm tracking-[0.15em] uppercase">
          <ShieldCheck className="w-3.5 h-3.5" />
          EBURON CORE OPTIMAL
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-500 group">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
            <Building2 className="w-6 h-6" />
          </div>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Licensed Partners</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-gray-900 tracking-tighter">{stats.totalCompanies}</span>
            <span className="text-gray-400 text-[9px] font-bold uppercase tracking-widest">NODES</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-500 group">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Neural Link Load</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-gray-900 tracking-tighter">{stats.totalMinutes.toLocaleString()}</span>
            <span className="text-gray-400 text-[9px] font-bold uppercase tracking-widest">MINS</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 lg:col-span-2 hover:shadow-lg transition-all duration-500 group">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:-rotate-6 transition-transform">
            <Euro className="w-6 h-6" />
          </div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Success Invest Gross Billing</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-gray-900 tracking-tighter">€{stats.totalIncome.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 h-[350px] flex flex-col">
          <div className="flex justify-between items-center mb-8">
              <h3 className="font-black text-gray-900 uppercase tracking-widest text-[9px]">Neural Inference Load (Global Cluster)</h3>
              <div className="flex gap-4">
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-600"></div><span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Live Transmissions</span></div>
              </div>
          </div>
          <div className="flex-1 flex items-end justify-between gap-3 md:gap-4">
              {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group cursor-pointer h-full justify-end">
                  <div className="relative w-full h-full flex items-end">
                      <div className="w-full bg-gray-50 rounded-t-xl absolute bottom-0 h-full"></div>
                      <div 
                      className="w-full bg-red-600 group-hover:bg-red-700 transition-all duration-700 rounded-t-xl absolute bottom-0 shadow-md" 
                      style={{ height: `${15 + Math.random() * 85}%` }}
                      ></div>
                  </div>
                  <span className="text-[8px] font-black text-gray-300 uppercase tracking-tighter group-hover:text-red-700 transition-colors">D{i + 1}</span>
              </div>
              ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-gray-900 uppercase tracking-widest text-[9px]">Active Partners</h3>
              <button onClick={() => navigate('/organizations')} className="text-[8px] font-black text-red-700 uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="flex-1 space-y-4">
            {recentOrgs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                <Building2 className="w-10 h-10 mb-2" />
                <p className="text-[8px] font-black uppercase tracking-widest">No Active Nodes</p>
              </div>
            ) : (
              recentOrgs.map((org) => (
                <div key={org.id} onClick={() => navigate(`/organizations/${org.id}`)} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 hover:bg-red-50 transition-all cursor-pointer group border border-transparent hover:border-red-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white text-gray-900 rounded-lg flex items-center justify-center font-black text-xs shadow-sm group-hover:bg-red-700 group-hover:text-white transition-colors">
                      {org.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-900 uppercase truncate max-w-[120px]">{org.name}</p>
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tight">#{org.id} • {org.finance?.usedThisMonth || 0}m used</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-red-700 transition-colors" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
