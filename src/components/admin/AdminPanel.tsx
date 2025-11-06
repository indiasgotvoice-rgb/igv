import { useState, useEffect } from 'react';
import { Plus, Play, Square, Trash2, Users, CheckCircle, XCircle, Eye } from 'lucide-react';
import { supabase, Show, Participant } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminPanel() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'shows' | 'participants'>('shows');
  const [shows, setShows] = useState<Show[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduled_at: '',
    total_seats: 1000,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile?.user_type === 'admin') {
      loadShows();
      loadParticipants();
    }
  }, [profile]);

  const loadShows = async () => {
    try {
      const { data, error } = await supabase
        .from('shows')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShows(data || []);
    } catch (error) {
      console.error('Error loading shows:', error);
    }
  };

  const loadParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('*, user_profiles(full_name), shows(title)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setParticipants(data || []);
    } catch (error) {
      console.error('Error loading participants:', error);
    }
  };

  const handleCreateShow = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('shows')
        .insert({
          ...formData,
          created_by: profile?.id,
        });

      if (error) throw error;

      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        scheduled_at: '',
        total_seats: 1000,
      });
      await loadShows();
    } catch (error) {
      console.error('Error creating show:', error);
      alert('Failed to create show');
    } finally {
      setLoading(false);
    }
  };

  const updateShowStatus = async (showId: string, status: 'upcoming' | 'live' | 'ended') => {
    try {
      const updateData: any = { status };

      if (status === 'live' && !shows.find(s => s.id === showId)?.started_at) {
        updateData.started_at = new Date().toISOString();
      } else if (status === 'ended' && !shows.find(s => s.id === showId)?.ended_at) {
        updateData.ended_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('shows')
        .update(updateData)
        .eq('id', showId);

      if (error) throw error;
      await loadShows();
    } catch (error) {
      console.error('Error updating show status:', error);
    }
  };

  const deleteShow = async (showId: string) => {
    if (!confirm('Are you sure you want to delete this show?')) return;

    try {
      const { error } = await supabase
        .from('shows')
        .delete()
        .eq('id', showId);

      if (error) throw error;
      await loadShows();
    } catch (error) {
      console.error('Error deleting show:', error);
    }
  };

  const updateParticipantStatus = async (participantId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('participants')
        .update({ status })
        .eq('id', participantId);

      if (error) throw error;
      await loadParticipants();
    } catch (error) {
      console.error('Error updating participant:', error);
    }
  };

  if (profile?.user_type !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-600 text-lg">You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-6 mb-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-2">Admin Dashboard</h2>
        <p className="text-white/90">Manage shows, participants, and platform settings</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('shows')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'shows'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Manage Shows
        </button>
        <button
          onClick={() => setActiveTab('participants')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'participants'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Manage Participants
        </button>
      </div>

      {activeTab === 'shows' && (
        <div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold mb-6 flex items-center gap-2 transition-all"
          >
            <Plus className="w-5 h-5" />
            Create New Show
          </button>

          {showForm && (
            <form onSubmit={handleCreateShow} className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">New Show Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Show Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduled_at}
                    onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Seats
                </label>
                <input
                  type="number"
                  value={formData.total_seats}
                  onChange={(e) => setFormData({ ...formData, total_seats: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  min="1"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Show'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {shows.map((show) => (
              <div key={show.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{show.title}</h3>
                    <p className="text-gray-600 text-sm">{show.description}</p>
                    <p className="text-gray-500 text-sm mt-2">
                      Scheduled: {new Date(show.scheduled_at).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    show.status === 'live' ? 'bg-red-100 text-red-800' :
                    show.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {show.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {show.status === 'upcoming' && (
                    <button
                      onClick={() => updateShowStatus(show.id, 'live')}
                      className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all text-sm"
                    >
                      <Play className="w-4 h-4" />
                      Start Show
                    </button>
                  )}
                  {show.status === 'live' && (
                    <button
                      onClick={() => updateShowStatus(show.id, 'ended')}
                      className="flex items-center gap-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold transition-all text-sm"
                    >
                      <Square className="w-4 h-4" />
                      End Show
                    </button>
                  )}
                  <button
                    onClick={() => deleteShow(show.id)}
                    className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'participants' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Users className="w-6 h-6" />
            Participant Applications
          </h3>
          <div className="space-y-4">
            {participants.map((participant: any) => (
              <div
                key={participant.id}
                className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-gray-900">{participant.stage_name}</h4>
                    <p className="text-gray-600 text-sm">
                      By: {participant.user_profiles?.full_name}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Show: {participant.shows?.title}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    participant.status === 'approved' ? 'bg-green-100 text-green-800' :
                    participant.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    participant.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {participant.status}
                  </span>
                </div>
                {participant.bio && (
                  <p className="text-gray-600 text-sm mb-3">{participant.bio}</p>
                )}
                {participant.status === 'pending' && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => updateParticipantStatus(participant.id, 'approved')}
                      className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all text-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => updateParticipantStatus(participant.id, 'rejected')}
                      className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all text-sm"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                    {participant.voice_clip_url && (
                      <a
                        href={participant.voice_clip_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View Clip
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
