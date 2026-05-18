import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { 
  LogOut, 
  Trash2, 
  ShieldCheck, 
  AlertCircle, 
  Camera, 
  Mail, 
  CreditCard,
  ChevronRight,
  User,
  Settings,
  Lock,
  Globe
} from 'lucide-react';
import { format } from 'date-fns';

const ProfileView: React.FC = () => {
  const { user, profile, logout, deleteAccount, updateProfile } = useAuth();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const securityItems = [
    {
      id: 'email',
      icon: <Mail size={18} />,
      label: 'Email Verification',
      status: user?.emailVerified ? 'Verified' : 'Unverified',
      color: user?.emailVerified ? 'text-emerald-500' : 'text-rose-500',
      action: !user?.emailVerified ? 'Verify Now' : null
    },
    {
      id: 'account',
      icon: <ShieldCheck size={18} />,
      label: 'Security Status',
      status: 'Protected',
      color: 'text-emerald-500',
      action: null
    },
    {
      id: 'data',
      icon: <Lock size={18} />,
      label: 'Data Encryption',
      status: 'Active',
      color: 'text-emerald-500',
      action: null
    }
  ];

  const handleCurrencyChange = async (curr: string) => {
    await updateProfile({ currency: curr });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
    } catch (e) {
      alert('Error deleting account. Your session might be too old. Please re-login and try again.');
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Account Settings</h1>
          <p className="text-sm text-slate-500 font-medium">Manage your identity and financial preferences</p>
        </div>
        <button 
          onClick={logout}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-[0.98]"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Profile Card & Bio */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center text-center space-y-6 shadow-sm">
            <div className="relative">
              <div className="w-28 h-28 rounded-2xl p-1 bg-gradient-to-tr from-brand-primary to-blue-400 overflow-hidden shadow-xl">
                <div className="w-full h-full rounded-xl bg-white flex items-center justify-center text-slate-200 overflow-hidden">
                  {profile?.photoURL ? (
                    <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} />
                  )}
                </div>
              </div>
              <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-primary text-white rounded-xl flex items-center justify-center border-4 border-white shadow-lg transition-transform hover:scale-110 active:scale-95">
                <Camera size={16} />
              </button>
            </div>
            
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{profile?.displayName}</h2>
              <p className="text-sm font-medium text-slate-400">{profile?.email}</p>
            </div>

            <div className="w-full pt-6 border-t border-slate-50 flex items-center justify-center gap-12">
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-1">Status</p>
                <p className="text-xs font-bold text-emerald-500 uppercase tracking-tighter">Verified</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-1">Created</p>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-tighter">
                  {profile?.createdAt ? format(profile.createdAt.toDate(), 'MMM d, yyyy') : 'Recently'}
                </p>
              </div>
            </div>

            <button onClick={() => updateProfile({ displayName: profile?.displayName })} className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10">
              Edit Profile
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">Currency</p>
              <p className="text-xl font-bold text-slate-900">{profile?.currency || '$'}</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">Language</p>
              <p className="text-xl font-bold text-slate-900">EN</p>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="lg:col-span-3 space-y-10">
          {/* Preferences Section */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Personalization</h3>
            <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-50 shadow-sm overflow-hidden">
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center border border-slate-100">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-800 block">Default Currency</label>
                    <p className="text-xs text-slate-500 font-medium leading-none mt-1">Symbol used for all displays</p>
                  </div>
                </div>
                <div className="flex gap-2 p-1 bg-slate-50 rounded-lg">
                  {['$', '€', '£'].map((curr) => (
                    <button 
                      key={curr}
                      onClick={() => handleCurrencyChange(curr)}
                      className={`w-9 h-9 rounded-md text-xs font-bold transition-all ${profile?.currency === curr ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center border border-slate-100">
                    <Globe size={20} />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-800 block">System Region</label>
                    <p className="text-xs text-slate-500 font-medium leading-none mt-1">Timezone & display language</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">English (US)</span>
                  <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </section>

          {/* Security & Access */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Security & Shield</h3>
            <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-50 shadow-sm overflow-hidden">
              {securityItems.map((item) => (
                <div key={item.id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center border border-slate-100 italic transition-transform hover:rotate-6">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 tracking-tight">{item.label}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${item.color.replace('text', 'bg')}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-widest leading-none ${item.color}`}>{item.status}</span>
                      </div>
                    </div>
                  </div>
                  {item.action ? (
                    <button className="px-4 py-2 bg-brand-primary/[0.08] text-brand-primary rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-brand-primary/20 transition-colors">
                      {item.action}
                    </button>
                  ) : (
                    <div className="px-3 py-1 bg-slate-50 rounded-md border border-slate-100">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Enabled</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Destructive Actions */}
          <section className="space-y-6 pt-4">
            {!showConfirmDelete ? (
              <button 
                onClick={() => setShowConfirmDelete(true)}
                className="w-full flex items-center justify-center gap-3 p-5 text-rose-500 bg-white border-2 border-slate-50 rounded-2xl hover:bg-rose-50 hover:border-rose-100 transition-all group"
              >
                <div className="p-2 bg-rose-50 rounded-lg group-hover:bg-rose-100 transition-colors">
                  <Trash2 size={16} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Permanently Close Account</span>
              </button>
            ) : (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-10 space-y-8 text-center animate-pulse-once">
                <div className="w-16 h-16 bg-white text-rose-500 rounded-2xl flex items-center justify-center mx-auto shadow-sm animate-bounce">
                  <AlertCircle size={32} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-rose-900 tracking-tight">Warning: Extreme Action</h4>
                  <p className="text-sm text-rose-600 font-medium max-w-[280px] mx-auto">
                    Continuing will wipe your profile and purge all transaction history. This is irreversible.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => setShowConfirmDelete(false)}
                    className="flex-1 py-4 bg-white text-slate-600 font-bold rounded-xl text-xs uppercase tracking-widest border border-slate-200 hover:bg-slate-50 transition-all"
                  >
                    Stay Protected
                  </button>
                  <button 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 py-4 bg-rose-600 text-white font-bold rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-rose-600/20 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {isDeleting ? 'Erasing...' : 'Confirm Destruction'}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
