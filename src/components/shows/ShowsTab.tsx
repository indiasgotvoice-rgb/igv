import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, PlayCircle } from 'lucide-react';
import { supabase, Show } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface ShowsTabProps {
  onShowSelect: (show: Show) => void;
}

export default function ShowsTab({ onShowSelect }: ShowsTabProps) {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    loadShows();
    const interval = setInterval(loadShows, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadShows = async () => {
    try {
      const { data, error } = await supabase
        .from('shows')
        .select('*')
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      setShows(data || []);
    } catch (error) {
      console.error('Error loading shows:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeUntil = (date: string) => {
    const diff = new Date(date).getTime() - Date.now();
    if (diff < 0) return 'Started';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return (
          <span className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
            <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
            LIVE
          </span>
        );
      case 'upcoming':
        return (
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            Upcoming
          </span>
        );
      case 'ended':
        return (
          <span className="bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            Ended
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {profile?.user_type === 'admin' && (
        <div className="mb-6">
          <button
            onClick={() => {}}
            className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-orange-700 transition-all shadow-lg"
          >
            + Create New Show
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shows.map((show) => (
          <div
            key={show.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer"
            onClick={() => onShowSelect(show)}
          >
            <div className="relative h-48 bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              {show.banner_url ? (
                <img src={show.banner_url} alt={show.title} className="w-full h-full object-cover" />
              ) : (
                <PlayCircle className="w-20 h-20 text-white/80" />
              )}
              <div className="absolute top-4 right-4">
                {getStatusBadge(show.status)}
              </div>
            </div>

            <div className="p-5">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{show.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{show.description}</p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-red-600" />
                  <span>{new Date(show.scheduled_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span>
                    {show.status === 'upcoming'
                      ? `Starts in ${getTimeUntil(show.scheduled_at)}`
                      : show.status === 'live'
                      ? 'Live Now'
                      : 'Ended'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>{show.total_seats} seats available</span>
                </div>
              </div>

              {show.status === 'live' && (
                <button className="w-full mt-4 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                  <PlayCircle className="w-5 h-5" />
                  Join Live Show
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {shows.length === 0 && (
        <div className="text-center py-12">
          <PlayCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No shows available at the moment</p>
          <p className="text-gray-400 text-sm mt-2">Check back soon for exciting performances!</p>
        </div>
      )}
    </div>
  );
}
