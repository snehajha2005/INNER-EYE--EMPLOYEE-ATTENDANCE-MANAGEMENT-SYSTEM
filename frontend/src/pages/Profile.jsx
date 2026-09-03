import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loader from '../components/Loader';
import { formatDate } from '../utils/formatters';
import { User, Mail, ShieldCheck, Calendar, Edit3, CheckCircle2, AlertCircle, Save } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/me');
      if (res.data) {
        setProfileData(res.data);
        setNameInput(res.data.name || '');
        updateUser(res.data);
      }
    } catch (err) {
      // Fallback to auth context user if api call fails
      if (user) {
        setProfileData(user);
        setNameInput(user.name || '');
      } else {
        setError('Failed to load profile details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      setError('Name cannot be empty');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const res = await api.put('/auth/profile', { name: nameInput.trim() });
      setProfileData(res.data);
      updateUser(res.data);

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  const roleRaw = (profileData?.role || '').toLowerCase();
  const isHr = roleRaw === 'hr' || roleRaw === 'admin' || roleRaw === 'hr admin';
  let roleTitle = 'Employee';
  if (roleRaw === 'hr') roleTitle = 'HR Admin';
  else if (roleRaw === 'admin') roleTitle = 'Admin';
  else if (roleRaw === 'hr admin') roleTitle = 'HR Admin';
  else if (profileData?.role) roleTitle = profileData.role;

  const idLabel = isHr ? 'HR Admin ID' : 'Employee ID';

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200/60 pb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Account Profile</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Manage your account information and credentials</p>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 p-4 rounded-2xl flex items-center space-x-3 border border-rose-200 text-sm font-medium">
          <AlertCircle className="shrink-0 text-rose-500" size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl flex items-center space-x-3 border border-emerald-200 text-sm font-medium">
          <CheckCircle2 className="shrink-0 text-emerald-600" size={20} />
          <span>{success}</span>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="card p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col sm:flex-row items-center gap-6 shadow-xl">
        <div className="w-20 h-20 rounded-2xl bg-blue-600/90 text-white flex items-center justify-center text-3xl font-black shadow-lg border border-blue-400/30 shrink-0">
          {profileData?.name ? profileData.name.charAt(0).toUpperCase() : <User size={36} />}
        </div>

        <div className="space-y-1.5 text-center sm:text-left flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-2xl font-black tracking-tight">{profileData?.name}</h2>
            <span className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider self-center sm:self-auto border ${
              isHr ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}>
              {roleTitle}
            </span>
          </div>

          <p className="text-xs font-medium text-slate-300 flex items-center justify-center sm:justify-start gap-1.5">
            <Mail size={14} className="text-slate-400" />
            {profileData?.email}
          </p>

          <p className="text-xs font-mono text-slate-400">
            {idLabel}: <span className="text-white font-bold">{profileData?.employeeId}</span>
          </p>
        </div>

        <button
          onClick={() => {
            setIsEditing(!isEditing);
            setNameInput(profileData?.name || '');
            setError('');
            setSuccess('');
          }}
          className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0"
        >
          <Edit3 size={15} />
          {isEditing ? 'Cancel Edit' : 'Edit Profile'}
        </button>
      </div>

      {/* Edit Profile Form (When Active) */}
      {isEditing && (
        <div className="card p-6 border-blue-200 bg-blue-50/30 space-y-4">
          <div className="border-b border-slate-200/60 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Edit3 size={18} className="text-blue-600" />
              Edit Account Information
            </h3>
            <p className="text-xs text-slate-500">Update your full display name</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                required
                className="input-field"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary py-2.5 px-5 text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20"
              >
                <Save size={15} />
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn-secondary py-2.5 px-4 text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Account Details Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">Personal & Account Summary</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="card p-5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User size={14} className="text-slate-500" /> Full Name
            </span>
            <p className="text-base font-extrabold text-slate-900">{profileData?.name}</p>
          </div>

          {/* ID */}
          <div className="card p-5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-slate-500" /> {idLabel}
            </span>
            <p className="text-base font-extrabold text-slate-900 font-mono">{profileData?.employeeId}</p>
          </div>

          {/* Email */}
          <div className="card p-5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Mail size={14} className="text-slate-500" /> Email Address
            </span>
            <p className="text-base font-extrabold text-slate-900">{profileData?.email}</p>
          </div>

          {/* Account Role */}
          <div className="card p-5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-slate-500" /> Account Role
            </span>
            <p className="text-base font-extrabold text-slate-900 capitalize">{roleTitle}</p>
          </div>

          {/* Member Since / Join Date */}
          <div className="card p-5 space-y-1 sm:col-span-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Calendar size={14} className="text-slate-500" /> Member Since / Join Date
            </span>
            <p className="text-base font-extrabold text-slate-900">
              {profileData?.createdAt ? formatDate(profileData.createdAt) : 'Registered Account'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
