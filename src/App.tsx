/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DatabaseProvider } from './context/DatabaseContext';
import { DialogProvider } from './context/DialogContext';
import { GlobalDialog } from './components/GlobalDialog';
import { Layout } from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Assets from './pages/Assets';
import Settings from './pages/Settings';
import Manual from './pages/Manual';
import About from './pages/About';
import Reports from './pages/Reports';

export default function App() {
  return (
    <Router>
      <DatabaseProvider>
        <DialogProvider>
          <GlobalDialog />
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/assets" element={<Assets />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/manual" element={<Manual />} />
              <Route path="/about" element={<About />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </Layout>
        </DialogProvider>
      </DatabaseProvider>
    </Router>
  );
}

