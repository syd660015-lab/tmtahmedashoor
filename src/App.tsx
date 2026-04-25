import { useState, useEffect } from 'react';
import { auth } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import TMTCanvas from './components/TMTCanvas';
import ResultDialog from './components/ResultDialog';
import { Toaster } from './components/ui/sonner';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [pendingResult, setPendingResult] = useState<{ type: string; duration: number; errors: number } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleTestComplete = (duration: number, errors: number) => {
    if (activeTest) {
      setPendingResult({ type: activeTest, duration, errors });
      setActiveTest(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 space-y-4">
        <Loader2 className="w-10 h-10 text-stone-900 animate-spin" />
        <p className="text-stone-400 font-medium text-sm animate-pulse tracking-widest uppercase">Initializing TrailMaster</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans selection:bg-stone-900 selection:text-white">
      {!user ? (
        <Auth />
      ) : activeTest ? (
        <div className="h-screen w-full p-4 md:p-8 flex flex-col">
          <header className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-bold text-stone-900">{activeTest}</h2>
              <p className="text-xs text-stone-400">Connect the dots in order as quickly as possible.</p>
            </div>
            <button 
              onClick={() => setActiveTest(null)}
              className="text-stone-400 hover:text-stone-900 text-sm font-bold uppercase tracking-widest"
            >
              Exit Test
            </button>
          </header>
          <div className="flex-1 min-h-0">
            <TMTCanvas 
              type={activeTest} 
              onComplete={handleTestComplete} 
              onCancel={() => setActiveTest(null)} 
            />
          </div>
        </div>
      ) : (
        <Dashboard onStartTest={(type) => setActiveTest(type)} />
      )}

      <ResultDialog 
        result={pendingResult} 
        onDismiss={() => {
          setPendingResult(null);
          // Refresh dashboard data implicit in Dashboard via fetch on mount
          // but we might want to trigger a refresh.
          // For now, simplicity is key.
          window.location.reload(); // Simple refresh for state sync
        }} 
      />
      <Toaster position="top-right" />
    </div>
  );
}
