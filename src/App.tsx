/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DatabaseProvider } from '@context/DatabaseContext';
import { SRVGlobalDialogProvider } from '@context/SRVGlobalDialogContext';
import { SRVGlobalDialog } from '@components/SRVGlobalDialog';
import { Layout } from '@components/Layout';
import Dashboard from '@pages/Dashboard';
import Transactions from '@pages/Transactions';
import Assets from '@pages/Assets';
import Settings from '@pages/Settings';
import Manual from '@pages/Manual';
import About from '@pages/About';
import Reports from '@pages/Reports';
import Custodians from '@pages/Custodians';
import Calculators from '@pages/Calculators';

export default function App() {
  return (
    <Router>
      <DatabaseProvider>
        <SRVGlobalDialogProvider>
          <SRVGlobalDialog />
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/assets" element={<Assets />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/custodians" element={<Custodians />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/manual" element={<Manual />} />
              <Route path="/about" element={<About />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/calculators" element={<Calculators />} />
            </Routes>
          </Layout>
        </SRVGlobalDialogProvider>
      </DatabaseProvider>
    </Router>
  );
}

