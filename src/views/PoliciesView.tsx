import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, FileText, Lock, Globe, Heart, Scale } from 'lucide-react';

const PoliciesView: React.FC = () => {
  const policies = [
    {
      title: "Privacy Commitment",
      icon: <Lock className="text-cyan-500" size={24} />,
      content: `At LoanDealer, your financial data is personal. We employ state-of-the-art Firestore security rules to ensure that only you can access your records. We do not sell metadata to third parties. Your transactions are stored and handled with peak encryption standards provided by Google Cloud Platform.`
    },
    {
      title: "Terms of Engagement",
      icon: <Scale className="text-brand-primary" size={24} />,
      content: `By using this service, you acknowledge that LoanDealer is a record-keeping utility. We do not facilitate legal binding of loans. We are not responsible for any financial disputes. Users are expected to maintain accurate records honestly.`
    },
    {
      title: "Account Destruction",
      icon: <ShieldCheck className="text-emerald-500" size={24} />,
      content: `You maintain complete sovereignty over your data. At any moment, you can choose to 'Purge' your account from the Settings tab. This wipes all auth tokens, user profiles, and associated loan logs from our cloud infrastructure permanently.`
    },
    {
      title: "Community Standards",
      icon: <Heart className="text-rose-500" size={24} />,
      content: `This application is built for transparency between friends and collaborators. We encourage fair split practices and frequent settlement of outstanding balances to maintain healthy financial relationships.`
    }
  ];

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-none">Security & Policy</h1>
          <p className="text-sm text-slate-500 font-medium mt-2">Our commitment to your financial integrity</p>
        </div>
        <div className="flex -space-x-2">
          {[1,2,3].map(i => (
            <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-slate-400">
              <ShieldCheck size={16} />
            </div>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {policies.map((policy, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm space-y-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 text-slate-900 rounded-xl flex items-center justify-center border border-slate-100 group-hover:scale-110 group-hover:bg-brand-primary/5 transition-all">
                {policy.icon}
              </div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">{policy.title}</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              {policy.content}
            </p>
            <div className="pt-4 flex items-center gap-2 text-[10px] font-bold text-brand-primary uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Detailed view</span>
              <FileText size={12} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="pt-10 border-t border-slate-100">
        <div className="flex flex-col items-center text-center space-y-4">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em]">Infrastructure Protocol</p>
          <div className="flex items-center justify-center gap-3">
            <div className="px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-2">
              <Globe size={14} className="text-slate-400" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Edge Network</span>
            </div>
            <div className="px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-2">
              <ShieldCheck size={14} className="text-slate-400" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">End-to-End Encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoliciesView;
