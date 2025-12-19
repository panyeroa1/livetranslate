
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export const Legal: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-20 px-6 font-inter text-gray-800">
      <Link to="/" className="inline-flex items-center gap-2 text-red-700 font-black uppercase text-[10px] tracking-widest mb-12">
        <ArrowLeft className="w-4 h-4" />
        Return to Portal
      </Link>

      <div className="flex items-center gap-4 mb-16">
        <div className="bg-red-700 text-white p-2 rounded-xl font-bold w-12 h-12 flex items-center justify-center text-2xl shadow-xl shadow-red-100">S</div>
        <h1 className="text-4xl font-black tracking-tighter uppercase">Success Invest <span className="text-red-700">Compliance</span></h1>
      </div>

      <div className="space-y-16">
        <section>
          <h2 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
            <Shield className="w-5 h-5 text-red-600" />
            Privacy Policy (GDPR Compliance)
          </h2>
          <div className="prose prose-red text-gray-600 leading-relaxed space-y-4">
            <p><strong>Last Updated: May 2025</strong></p>
            <p>At Success Invest, we prioritize the protection of sensitive administrative and medical data. This policy outlines our commitment to Regulation (EU) 2016/679 (General Data Protection Regulation).</p>
            
            <h3 className="text-gray-900 font-bold uppercase text-xs mt-8">1. Neural Core Data Collection</h3>
            <p>We do not store raw audio. Audio is processed via the Eburon Neural Core for transient inference. Once translated, audio fragments are purged instantly from operational memory.</p>
            
            <h3 className="text-gray-900 font-bold uppercase text-xs mt-8">2. Neural Transcript Storage</h3>
            <p>Text transcripts are stored within the Success Invest environment to provide a "Chain of Accuracy" and for usage-based billing. These records are encrypted using AES-256 standards.</p>
            
            <h3 className="text-gray-900 font-bold uppercase text-xs mt-8">3. Data Subject Rights</h3>
            <p>Under GDPR, you have the right to access, rectify, or erase your transcripts. To exercise these rights, contact compliance@success-invest.com.</p>
          </div>
        </section>

        <section className="pt-16 border-t border-gray-100">
          <h2 className="text-xl font-black uppercase tracking-tight mb-6">Terms of Service</h2>
          <div className="prose prose-red text-gray-600 leading-relaxed space-y-4">
            <h3 className="text-gray-900 font-bold uppercase text-xs">1. Authorized Use</h3>
            <p>The Success Invest Universal Interpreter is licensed to organizations for official use by nurses, doctors, city hall staff, and management. Sharing credentials outside the licensed organization is a breach of contract.</p>
            
            <h3 className="text-gray-900 font-bold uppercase text-xs">2. Eburon Engine Accuracy</h3>
            <p>While the Eburon Neural Core targets near-perfect accuracy, linguistic nuances can vary. Success Invest provides this service "as-is" for professional assistance. Professional judgment remains mandatory.</p>
          </div>
        </section>
      </div>
      
      <div className="mt-20 pt-10 border-t border-gray-100 text-center">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">© 2025 SUCCESS INVEST • POWERED BY EBURON AI • EU SOVEREIGN CORE</p>
      </div>
    </div>
  );
};
