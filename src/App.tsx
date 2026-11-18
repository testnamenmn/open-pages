import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BuilderProvider } from './store/BuilderContext';
import { AuthProvider } from './store/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Builder from './pages/Builder';
import Templates from './pages/Templates';
import Connectors from './pages/Connectors';
import Share from './pages/Share';
import PublicPage from './pages/PublicPage';
import MyPages from './pages/MyPages';
import Metrics from './pages/Metrics';

function App() {
  return (
    <AuthProvider>
    <BuilderProvider>
      <Router>
        <div className="min-h-screen bg-surface text-gray-200">
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/builder" element={<Builder />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/connectors" element={<Connectors />} />
            <Route path="/share" element={<Share />} />
            <Route path="/my-pages" element={<MyPages />} />
            <Route path="/metrics" element={<Metrics />} />
            <Route path="/p/:slug" element={<PublicPage />} />
          </Routes>
        </div>
      </Router>
    </BuilderProvider>
    </AuthProvider>
  );
}

export default App;
