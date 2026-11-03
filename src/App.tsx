import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BuilderProvider } from './store/BuilderContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Builder from './pages/Builder';
import Templates from './pages/Templates';
import Connectors from './pages/Connectors';
import Share from './pages/Share';
import PublicPage from './pages/PublicPage';
import MyPages from './pages/MyPages';

function App() {
  return (
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
            <Route path="/p/:slug" element={<PublicPage />} />
          </Routes>
        </div>
      </Router>
    </BuilderProvider>
  );
}

export default App;
