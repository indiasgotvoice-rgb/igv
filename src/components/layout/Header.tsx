import { Mic2, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Header() {
  const { profile, signOut } = useAuth();

  return (
    <header className="bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
              <Mic2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">India's Got Voice</h1>
              <p className="text-xs text-white/80">Live Entertainment Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {profile && (
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-sm font-semibold">{profile.full_name}</p>
                  <div className="flex items-center gap-1 justify-end">
                    {profile.user_type === 'admin' && (
                      <Shield className="w-3 h-3" />
                    )}
                    <p className="text-xs text-white/80 capitalize">{profile.user_type}</p>
                  </div>
                </div>
                <button
                  onClick={signOut}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all backdrop-blur-sm"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
