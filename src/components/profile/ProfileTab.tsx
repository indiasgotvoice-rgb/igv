import { useState, useEffect } from 'react';
import { User, Edit2, Save, Award, Mic2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Participant } from '../../lib/supabase';

export default function ProfileTab() {
  const { profile, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [myParticipations, setMyParticipations] = useState<Participant[]>([]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setPhone(profile.phone || '');
      loadMyParticipations();
    }
  }, [profile]);

  const loadMyParticipations = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('participants')
        .select('*, shows(title, scheduled_at, status)')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyParticipations(data || []);
    } catch (error) {
      console.error('Error loading participations:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await updateProfile({
        full_name: fullName,
        phone: phone || undefined,
      });

      if (error) throw error;
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
            <CheckCircle className="w-4 h-4" />
            Approved
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
            <Clock className="w-4 h-4" />
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
            <XCircle className="w-4 h-4" />
            Rejected
          </span>
        );
      case 'performing':
        return (
          <span className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
            <Mic2 className="w-4 h-4" />
            Performing
          </span>
        );
      default:
        return null;
    }
  };

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-red-600 to-orange-600 text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{profile.full_name}</h2>
              <p className="text-gray-600 capitalize flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  profile.user_type === 'admin' ? 'bg-purple-600' :
                  profile.user_type === 'participant' ? 'bg-orange-600' :
                  'bg-blue-600'
                }`}></span>
                {profile.user_type}
              </p>
            </div>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg font-semibold transition-all"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 font-medium px-4 py-2 bg-gray-50 rounded-lg">
                {profile.full_name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number (Optional)
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 font-medium px-4 py-2 bg-gray-50 rounded-lg">
                {profile.phone || 'Not provided'}
              </p>
            )}
          </div>
        </div>

        {isEditing && (
          <button
            onClick={() => {
              setIsEditing(false);
              setFullName(profile.full_name);
              setPhone(profile.phone || '');
            }}
            className="mt-4 text-gray-600 hover:text-gray-800 text-sm"
          >
            Cancel
          </button>
        )}
      </div>

      {(profile.user_type === 'participant' || profile.user_type === 'admin') && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-orange-600" />
            My Participations
          </h3>

          {myParticipations.length === 0 ? (
            <div className="text-center py-12">
              <Mic2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No participations yet</p>
              <p className="text-gray-400 text-sm">
                Check out the Shows tab to apply for upcoming performances!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myParticipations.map((participation: any) => (
                <div
                  key={participation.id}
                  className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{participation.stage_name}</h4>
                      <p className="text-gray-600 text-sm">
                        Show: {participation.shows?.title || 'Unknown Show'}
                      </p>
                    </div>
                    {getStatusBadge(participation.status)}
                  </div>

                  {participation.bio && (
                    <p className="text-gray-600 text-sm mb-3">{participation.bio}</p>
                  )}

                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-yellow-600" />
                      <span className="font-semibold">{participation.total_votes} votes</span>
                    </div>
                    {participation.shows?.scheduled_at && (
                      <div>
                        {new Date(participation.shows.scheduled_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
