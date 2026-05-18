import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import PeopleView from './views/PeopleView';
import ProfileView from './views/ProfileView';
import { motion, AnimatePresence } from 'motion/react';
import { Users, User, LogIn, LogOut } from 'lucide-react';

const AppContent = () => {
  const { user, loading, login, logout, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'people' | 'profile'>('people');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-sans text-slate-900">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-sans text-slate-900">
        <div className="w-full max-w-sm space-y-12 text-center">
          <div className="space-y-6">
            <div className="w-20 h-20 bg-brand-primary rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-brand-primary/30">
              <Users className="text-white w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">LoanDealer</h1>
              <p className="text-slate-500 font-medium leading-relaxed">
                Re-imagined personal debt management for the modern collector.
              </p>
            </div>
          </div>

          <button
            onClick={login}
            className="w-full bg-slate-900 text-white p-5 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98]"
          >
            <LogIn size={20} />
            Sign in with Google
          </button>

          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-loose">
            Security & Privacy First • SSL Encrypted
          </p>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (activeTab) {
      case 'people': return <PeopleView />;
      case 'profile': return <ProfileView />;
      default: return <PeopleView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col justify-between p-8">
        <div className="space-y-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
              <Users className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">LoanDealer</span>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('people')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'people' 
                  ? 'bg-slate-50 text-brand-primary shadow-sm ring-1 ring-slate-100' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users size={20} />
              Contacts
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'profile' 
                  ? 'bg-slate-50 text-brand-primary shadow-sm ring-1 ring-slate-100' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <User size={20} />
              Account
            </button>
          </nav>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 upper tracking-widest mb-3">ACTIVE SESSION</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-primary/10 text-brand-primary rounded-full overflow-hidden flex items-center justify-center font-bold text-sm">
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt="" />
                ) : (
                  profile?.displayName?.charAt(0) || 'U'
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{profile?.displayName}</p>
                <p className="text-[10px] text-slate-500 truncate">{profile?.email}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto min-h-screen">
        <div className="max-w-4xl mx-auto w-full p-6 md:p-10 pb-32">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[calc(100%-3rem)] z-50">
        <div className="bg-white border border-slate-200 p-2 rounded-2xl flex items-center justify-between shadow-2xl shadow-slate-200/50">
          <button
            onClick={() => setActiveTab('people')}
            className={`flex-1 py-3 flex flex-col items-center gap-1 rounded-xl transition-all ${activeTab === 'people' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}
          >
            <Users size={18} />
            <span className="text-[9px] font-bold uppercase tracking-widest">People</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 flex flex-col items-center gap-1 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}
          >
            <User size={18} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Account</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}
