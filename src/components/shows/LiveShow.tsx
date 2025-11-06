import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Eye, ThumbsUp, Trophy, Armchair } from 'lucide-react';
import { supabase, Show, Participant, VirtualSeat } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface LiveShowProps {
  show: Show;
  onBack: () => void;
}

export default function LiveShow({ show, onBack }: LiveShowProps) {
  const { user } = useAuth();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [viewerCount, setViewerCount] = useState(0);
  const [userSeat, setUserSeat] = useState<VirtualSeat | null>(null);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShowData();
    const interval = setInterval(loadShowData, 5000);
    return () => clearInterval(interval);
  }, [show.id]);

  const loadShowData = async () => {
    try {
      const [participantsRes, seatsRes, votesRes] = await Promise.all([
        supabase
          .from('participants')
          .select('*, user_profiles(full_name, avatar_url)')
          .eq('show_id', show.id)
          .in('status', ['approved', 'performing'])
          .order('total_votes', { ascending: false }),
        supabase
          .from('virtual_seats')
          .select('*')
          .eq('show_id', show.id),
        user ? supabase
          .from('votes')
          .select('participant_id')
          .eq('show_id', show.id)
          .eq('user_id', user.id) : null,
      ]);

      if (participantsRes.error) throw participantsRes.error;
      setParticipants(participantsRes.data || []);

      if (seatsRes.error) throw seatsRes.error;
      setViewerCount(seatsRes.data?.length || 0);

      const mySeat = seatsRes.data?.find(s => s.user_id === user?.id);
      setUserSeat(mySeat || null);

      if (votesRes && !votesRes.error) {
        setUserVotes(new Set(votesRes.data?.map(v => v.participant_id) || []));
      }
    } catch (error) {
      console.error('Error loading show data:', error);
    } finally {
      setLoading(false);
    }
  };

  const takeSeat = async () => {
    if (!user || userSeat) return;

    try {
      const availableSeats = await supabase
        .from('virtual_seats')
        .select('seat_number')
        .eq('show_id', show.id)
        .order('seat_number', { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextSeatNumber = availableSeats.data ? availableSeats.data.seat_number + 1 : 1;

      if (nextSeatNumber > show.total_seats) {
        alert('Show is full!');
        return;
      }

      const { error } = await supabase
        .from('virtual_seats')
        .insert({
          show_id: show.id,
          user_id: user.id,
          seat_number: nextSeatNumber,
        });

      if (error) throw error;
      await loadShowData();
    } catch (error) {
      console.error('Error taking seat:', error);
      alert('Failed to join show');
    }
  };

  const leaveSeat = async () => {
    if (!userSeat) return;

    try {
      const { error } = await supabase
        .from('virtual_seats')
        .delete()
        .eq('id', userSeat.id);

      if (error) throw error;
      await loadShowData();
    } catch (error) {
      console.error('Error leaving seat:', error);
    }
  };

  const handleVote = async (participantId: string) => {
    if (!user || userVotes.has(participantId)) return;

    try {
      const { error } = await supabase
        .from('votes')
        .insert({
          participant_id: participantId,
          user_id: user.id,
          show_id: show.id,
        });

      if (error) throw error;
      setUserVotes(new Set([...userVotes, participantId]));
      await loadShowData();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold">{show.title}</h2>
              <div className="flex items-center gap-4 mt-1 text-sm">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{viewerCount} viewers</span>
                </div>
                {show.status === 'live' && (
                  <div className="flex items-center gap-1 animate-pulse">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                    <span>LIVE</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {!userSeat ? (
            <button
              onClick={takeSeat}
              className="bg-white text-red-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all flex items-center gap-2"
            >
              <Armchair className="w-5 h-5" />
              Join Show
            </button>
          ) : (
            <button
              onClick={leaveSeat}
              className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-lg font-semibold transition-all"
            >
              Leave Show
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Live Leaderboard
              </h3>
              <div className="space-y-4">
                {participants.map((participant, index) => (
                  <div
                    key={participant.id}
                    className="bg-slate-700 rounded-lg p-4 flex items-center justify-between hover:bg-slate-600 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-300 text-gray-800' :
                        index === 2 ? 'bg-orange-600 text-white' :
                        'bg-slate-600 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{participant.stage_name}</p>
                        <p className="text-gray-400 text-sm">{participant.total_votes} votes</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleVote(participant.id)}
                      disabled={userVotes.has(participant.id) || !userSeat}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                        userVotes.has(participant.id)
                          ? 'bg-green-600 text-white cursor-not-allowed'
                          : userSeat
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      {userVotes.has(participant.id) ? 'Voted' : 'Vote'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Show Stats
              </h3>
              <div className="space-y-4">
                <div className="bg-slate-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Total Viewers</p>
                  <p className="text-white text-2xl font-bold">{viewerCount}</p>
                </div>
                <div className="bg-slate-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Participants</p>
                  <p className="text-white text-2xl font-bold">{participants.length}</p>
                </div>
                <div className="bg-slate-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Available Seats</p>
                  <p className="text-white text-2xl font-bold">{show.total_seats - viewerCount}</p>
                </div>
              </div>
            </div>

            {!userSeat && (
              <div className="bg-yellow-600/20 border border-yellow-600 rounded-xl p-4">
                <p className="text-yellow-200 text-sm">
                  <strong>Join the show</strong> to vote for your favorite participants!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
