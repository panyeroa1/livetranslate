
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Organizations } from './pages/Organizations';
import { OrganizationDetail } from './pages/OrganizationDetail';
import { DualTranslateSetup } from './pages/DualTranslateSetup';
import { DualTranslateLive } from './pages/DualTranslateLive';
import { ChatLog } from './pages/ChatLog';
import { Archives } from './pages/Archives';
import { LegalGateway } from './components/LegalGateway';

const App: React.FC = () => {
  return (
    <Router>
      <LegalGateway>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/organizations" element={<Organizations />} />
            <Route path="/organizations/:id" element={<OrganizationDetail />} />
            <Route path="/archives" element={<Archives />} />
            <Route path="/payments" element={<div className="p-8">
              <div className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-sm text-center">
                 <h2 className="text-2xl font-black text-gray-900 uppercase mb-4">Billing Central</h2>
                 <p className="text-gray-400 text-sm mb-0">Financial reconciliation for Eburon partners.</p>
              </div>
            </div>} />
            <Route path="/translate" element={<DualTranslateSetup />} />
          </Route>
          
          <Route path="/translate/live" element={<DualTranslateLive />} />
          <Route path="/chat-log/:id" element={<ChatLog />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LegalGateway>
    </Router>
  );
};

export default App;
