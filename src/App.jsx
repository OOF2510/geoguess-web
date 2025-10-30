import GeoGuess from './pages/GeoGuess.jsx';

function App() {
  return (
    <div className="min-h-screen bg-background text-textPrimary">
      <main className="mx-auto flex max-w-6xl flex-col gap-24 px-6 pb-24 pt-20 sm:px-10 lg:px-16">
        <GeoGuess />
      </main>
    </div>
  );
}

export default App;
