import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './components/auth/AuthPage';
import Header from './components/layout/Header';
import TabNavigation from './components/layout/TabNavigation';
import ShowsTab from './components/shows/ShowsTab';
import LiveShow from './components/shows/LiveShow';
import ParticipantsTab from './components/participants/ParticipantsTab';
import ProfileTab from './components/profile/ProfileTab';
import AdminPanel from './components/admin/AdminPanel';
import { Show } from './lib/supabase';
import { Shield } from 'lucide-react';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'shows' | 'participants' | 'profile'>('shows');
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <AuthPage />;
  }

  if (selectedShow) {
    return (
      <LiveShow
        show={selectedShow}
        onBack={() => setSelectedShow(null)}
      />
    );
  }

  if (showAdminPanel && profile.user_type === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => setShowAdminPanel(false)}
            className="text-gray-600 hover:text-gray-900 mb-4"
          >
            ← Back to Main App
          </button>
        </div>
        <AdminPanel />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {profile.user_type === 'admin' && (
        <div className="bg-purple-600 text-white py-2">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4" />
              <span>Admin Mode</span>
            </div>
            <button
              onClick={() => setShowAdminPanel(true)}
              className="bg-white/20 hover:bg-white/30 px-4 py-1 rounded-lg text-sm font-semibold transition-all"
            >
              Open Admin Panel
            </button>
          </div>
        </div>
      )}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="pb-8">
        {activeTab === 'shows' && <ShowsTab onShowSelect={setSelectedShow} />}
        {activeTab === 'participants' && <ParticipantsTab />}
        {activeTab === 'profile' && <ProfileTab />}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
