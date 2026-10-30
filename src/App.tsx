import { AppProvider, useApp } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LandingPage } from '@/pages/LandingPage';
import { ScanPage } from '@/pages/ScanPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { AssistantPage } from '@/pages/AssistantPage';
import { AboutPage } from '@/pages/AboutPage';
import { DashboardPage } from '@/pages/DashboardPage';

function Router() {
  const { route } = useApp();
  switch (route) {
    case 'home':
      return <LandingPage />;
    case 'scan':
      return <ScanPage />;
    case 'history':
      return <HistoryPage />;
    case 'assistant':
      return <AssistantPage />;
    case 'about':
      return <AboutPage />;
    case 'dashboard':
      return <DashboardPage />;
    default:
      return <LandingPage />;
  }
}

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-mesh">
        <Navbar />
        <main className="flex-1">
          <Router />
        </main>
        <Footer />
      </div>
    </AppProvider>
  );
}

export default App;
