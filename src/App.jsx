import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import GeoGuess from './pages/GeoGuess.jsx';
import WebPlay from './pages/WebPlay.jsx';
import AiDuel from './pages/AiDuel.jsx';
import Privacy from './pages/Privacy.jsx';

function App() {
  return (
    <div className="min-h-screen bg-background text-textPrimary">
      <Navbar />
      <main className="mx-auto flex max-w-6xl flex-col gap-24 px-6 pb-24 pt-16 sm:px-10 lg:px-16">
        <Routes>
          <Route path="/" element={<GeoGuess />} />
          <Route path="/play" element={<WebPlay />} />
          <Route path="/play/ai" element={<AiDuel />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;