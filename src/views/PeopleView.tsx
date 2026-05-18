import React, { useState, useMemo } from 'react';
import { useData, FriendLog } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Plus, ArrowUpRight, ArrowDownLeft, Check, ChevronRight, User, ArrowLeft, Trash2, Calendar, Notebook, RotateCcw, X, TriangleAlert } from 'lucide-react';
import { format } from 'date-fns';

type Tab = 'overview' | 'people';

const PeopleView: React.FC = () => {
  const { friendLogs, addFriendLog, updateFriendLog, deleteFriendLog } = useData();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editingLog, setEditingLog] = useState<FriendLog | null>(null);
  const [confirmRevertId, setConfirmRevertId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const currency = profile?.currency || '$';

  const peopleBalances = useMemo(() => {
    const people: Record<string, { lent: number; borrowed: number; logs: FriendLog[] }> = {};
    
    friendLogs.forEach(log => {
      const normalizedName = log.personName.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      if (!people[normalizedName]) {
        people[normalizedName] = { lent: 0, borrowed: 0, logs: [] };
      }
      people[normalizedName].logs.push({ ...log, personName: normalizedName });
      if (log.status === 'pending') {
        if (log.type === 'lent') people[normalizedName].lent += log.amount;
        else people[normalizedName].borrowed += log.amount;
      }
    });

    return Object.entries(people).map(([name, data]) => ({
      name,
      ...data,
      balance: data.lent - data.borrowed
    })).sort((a, b) => b.lent + b.borrowed - (a.lent + a.borrowed));
  }, [friendLogs]);

  const uniquePeopleNames = useMemo(() => {
    return peopleBalances.map(p => p.name);
  }, [peopleBalances]);

  const filteredSuggestions = useMemo(() => {
    if (!nameInput) return [];
    return uniquePeopleNames.filter(name => 
      name.toLowerCase().includes(nameInput.toLowerCase()) && 
      name.toLowerCase() !== nameInput.toLowerCase()
    );
  }, [uniquePeopleNames, nameInput]);

  const selectedPersonData = useMemo(() => {
    return peopleBalances.find(p => p.name === selectedPerson);
  }, [peopleBalances, selectedPerson]);

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const personNameRaw = (formData.get('personName') as string) || nameInput;
    const amount = Number(formData.get('amount'));
    const note = formData.get('note') as string;
    const type = formData.get('type') as 'lent' | 'borrowed';
    const dueDate = formData.get('dueDate') as string;
    const transactionDate = formData.get('transactionDate') as string;

    if (personNameRaw && amount) {
      const personName = personNameRaw.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      
      if (editingLog) {
        await updateFriendLog(editingLog.id, {
          personName,
          amount,
          note,
          type,
          dueDate,
          transactionDate
        });
      } else {
        await addFriendLog({
          personName,
          amount,
          note,
          type,
          dueDate,
          transactionDate: transactionDate || format(new Date(), 'yyyy-MM-dd'),
          status: 'pending'
        });
      }
      
      setShowAdd(false);
      setEditingLog(null);
      setNameInput('');
      setAmountInput('');
    }
  };

  const openEdit = (log: FriendLog) => {
    setEditingLog(log);
    setNameInput(log.personName);
    setAmountInput(log.amount.toString());
    setShowAdd(true);
  };

  return (
    <div className="space-y-6 md:space-y-10 relative">
      <AnimatePresence mode="wait">
        {!selectedPerson ? (
          <motion.div
            key="list-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            {/* Content Tabs - Integrated into layout */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200">
                <div className="flex items-center gap-6">
                  {(['overview', 'people'] as Tab[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative ${
                        activeTab === tab 
                          ? 'text-slate-900' 
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {activeTab === 'overview' ? (
                <div className="flex flex-col gap-8">
                  {/* Summary Totals Moved to Top */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                    <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm space-y-2">
                      <p className="text-[9px] md:text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em]">Total Lent</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl md:text-2xl font-bold text-slate-900 leading-none">
                          {currency}{friendLogs.filter(l => l.type === 'lent' && l.status === 'pending').reduce((sum, l) => sum + l.amount, 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm space-y-2">
                      <p className="text-[9px] md:text-[10px] font-bold text-rose-600 uppercase tracking-[0.2em]">Total Owed</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl md:text-2xl font-bold text-slate-900 leading-none">
                          {currency}{friendLogs.filter(l => l.type === 'borrowed' && l.status === 'pending').reduce((sum, l) => sum + l.amount, 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="hidden lg:block bg-brand-primary/[0.03] p-6 rounded-2xl border border-brand-primary/10 shadow-sm space-y-2">
                      <p className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.2em]">Net Liquid</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-slate-900 leading-none">
                          {currency}{(friendLogs.filter(l => l.type === 'lent' && l.status === 'pending').reduce((sum, l) => sum + l.amount, 0) - friendLogs.filter(l => l.type === 'borrowed' && l.status === 'pending').reduce((sum, l) => sum + l.amount, 0)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Live Activity</h3>
                      <button className="text-[9px] font-bold text-brand-primary uppercase tracking-widest hover:underline">Full Audit</button>
                    </div>
                    <div className="space-y-4">
                      {friendLogs.length === 0 ? (
                        <div className="bg-white p-8 border border-slate-200 border-dashed rounded-xl text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                          No Recent Flow
                        </div>
                      ) : (
                        friendLogs.slice(0, 6).map(log => (
                          <div key={log.id} className="bg-white p-6 border border-slate-200 rounded-xl flex items-center justify-between hover:border-slate-300 transition-colors group">
                            <div className="flex items-center gap-6">
                              <div className={`w-11 h-11 rounded-lg flex items-center justify-center transition-colors ${log.type === 'lent' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                {log.type === 'lent' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate mb-1.5">
                                  <span className="text-slate-400 font-normal mr-2">({log.note || 'General split'})</span>
                                  {log.personName}
                                </p>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-3">
                                    {log.dueDate && (
                                      <div className="flex items-center gap-1 text-[8px] font-bold text-rose-500 uppercase bg-rose-50 px-2 py-0.5 rounded leading-none border border-rose-100">
                                        <Calendar size={8} />
                                        Due {format(new Date(log.dueDate), 'MMM d')}
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                                    <Calendar size={10} />
                                    Entry: {format(new Date(log.transactionDate || log.createdAt?.toDate?.() || new Date()), 'MMM d, yyyy')}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className={`text-xs font-bold ${log.status === 'returned' ? 'text-slate-300 line-through' : 'text-slate-900'}`}>
                                  {currency}{log.amount.toLocaleString()}
                                </p>
                                <p className={`text-[10px] font-bold uppercase transition-colors ${log.status === 'returned' ? 'text-rose-500' : 'text-slate-400'}`}>
                                  {log.status}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <button onClick={() => openEdit(log)} className="p-1.5 text-slate-200 hover:text-brand-primary transition-colors"><Notebook size={14} /></button>
                                {log.status === 'pending' ? (
                                  <button onClick={() => updateFriendLog(log.id, 'returned')} className="p-1.5 text-slate-300 hover:text-emerald-600 rounded-md transition-colors"><Check size={14} /></button>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    {confirmRevertId === log.id ? (
                                      <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                                        <TriangleAlert size={10} className="text-amber-500" />
                                        <button 
                                          onClick={() => {
                                            updateFriendLog(log.id, { status: 'pending' });
                                            setConfirmRevertId(null);
                                          }}
                                          className="text-[8px] font-bold uppercase tracking-widest text-emerald-600 hover:text-emerald-700"
                                        >
                                          Revert
                                        </button>
                                        <button onClick={() => setConfirmRevertId(null)} className="text-slate-400"><X size={10} /></button>
                                      </div>
                                    ) : (
                                      <button onClick={() => setConfirmRevertId(log.id)} className="p-1.5 text-slate-200 hover:text-emerald-600 transition-colors"><RotateCcw size={14} /></button>
                                    )}
                                    <button onClick={() => deleteFriendLog(log.id)} className="p-1.5 text-slate-100 hover:text-rose-600 rounded-md transition-colors"><Trash2 size={14} /></button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* People Detail Grid - More compact on mobile */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                  {peopleBalances.map((person, idx) => (
                    <motion.div
                      layout
                      key={person.name}
                      onClick={() => setSelectedPerson(person.name)}
                      className="bg-white p-4 md:p-6 border border-slate-200 rounded-xl md:rounded-2xl hover:border-brand-primary cursor-pointer group transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
                          ['bg-blue-50 text-blue-600', 'bg-emerald-50 text-emerald-600', 'bg-purple-50 text-purple-600', 'bg-orange-50 text-orange-600', 'bg-rose-50 text-rose-600'][idx % 5]
                        } group-hover:bg-brand-primary group-hover:text-white`}>
                          {person.name.charAt(0)}
                        </div>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-primary transition-colors" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs md:text-sm font-bold text-slate-900 truncate">{person.name}</p>
                        <p className={`text-base md:text-lg font-bold tracking-tight ${person.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {person.balance > 0 ? '+' : ''}{currency}{person.balance.toLocaleString()}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{person.logs.length} events</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* Person Detail View */
          <motion.div
            key="detail-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSelectedPerson(null)}
                  className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">{selectedPerson}</h2>
              </div>
              <button 
                onClick={() => setShowAdd(true)}
                className="px-6 py-2 bg-brand-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-primary/20"
              >
                + Add Record
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-900 p-5 md:p-8 rounded-2xl text-white space-y-4 md:space-y-8 overflow-hidden relative">
                  <div className="relative z-10 space-y-3 md:space-y-6">
                    <div>
                      <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1 md:mb-2">Net Position</p>
                      <p className="text-3xl md:text-5xl font-bold tracking-tighter">
                        {selectedPersonData?.balance! > 0 ? '+' : ''}{currency}{selectedPersonData?.balance.toLocaleString()}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 md:gap-4 border-t border-slate-800 pt-4 md:pt-6">
                      <div>
                        <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-0.5 md:mb-1">Lent</p>
                        <p className="text-sm md:text-lg font-bold text-emerald-400">{currency}{selectedPersonData?.lent.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-0.5 md:mb-1">Debt</p>
                        <p className="text-sm md:text-lg font-bold text-rose-400">{currency}{selectedPersonData?.borrowed.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <Users className="absolute -right-6 -bottom-6 text-white/5 pointer-events-none w-32 h-32 md:w-44 md:h-44 md:-right-12 md:-bottom-12" />
                </div>
              </div>

              <div className="lg:col-span-3 space-y-6 flex flex-col">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Transaction Ledger</h3>
                <div className="flex-1 space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
                  {selectedPersonData?.logs.map(log => (
                    <div key={log.id} className="bg-white p-6 border border-slate-200 rounded-xl flex items-center justify-between hover:border-slate-300 transition-colors group">
                       <div className="flex items-center gap-6">
                          <div className={`w-11 h-11 rounded-lg flex items-center justify-center transition-colors ${log.type === 'lent' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                              {log.type === 'lent' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                          </div>
                          <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate mb-1.5">{log.note || 'Manual entry'}</p>
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                  {log.dueDate && (
                                    <div className="flex items-center gap-1 text-[8px] font-bold text-rose-500 uppercase bg-rose-50 px-2 py-0.5 rounded leading-none border border-rose-100">
                                      <Calendar size={8} />
                                      Due {format(new Date(log.dueDate), 'MMM d')}
                                    </div>
                                  )}
                                </div>
                                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                                  <Calendar size={10} />
                                  Entry: {format(new Date(log.transactionDate || log.createdAt?.toDate?.() || new Date()), 'MMM d, yyyy')}
                                </p>
                              </div>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className="text-right">
                              <p className={`text-xs font-bold ${log.status === 'returned' ? 'text-slate-300 line-through' : 'text-slate-900'}`}>
                                 {currency}{log.amount.toLocaleString()}
                              </p>
                              <p className={`text-[10px] font-bold uppercase transition-colors ${log.status === 'returned' ? 'text-rose-500' : 'text-slate-400'}`}>
                                {log.status}
                              </p>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => openEdit(log)} className="p-1.5 text-slate-200 hover:text-brand-primary transition-colors"><Notebook size={14} /></button>
                            {log.status === 'pending' ? (
                              <button onClick={() => updateFriendLog(log.id, 'returned')} className="p-1.5 text-slate-300 hover:text-emerald-600 rounded-md transition-colors"><Check size={14} /></button>
                            ) : (
                              <div className="flex items-center gap-1">
                                {confirmRevertId === log.id ? (
                                  <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                                    <TriangleAlert size={10} className="text-amber-500" />
                                    <button 
                                      onClick={() => {
                                        updateFriendLog(log.id, { status: 'pending' });
                                        setConfirmRevertId(null);
                                      }}
                                      className="text-[8px] font-bold uppercase tracking-widest text-emerald-600 hover:text-emerald-700"
                                    >
                                      Revert
                                    </button>
                                    <button onClick={() => setConfirmRevertId(null)} className="text-slate-400"><X size={10} /></button>
                                  </div>
                                ) : (
                                  <button onClick={() => setConfirmRevertId(log.id)} className="p-1.5 text-slate-200 hover:text-emerald-600 transition-colors"><RotateCcw size={14} /></button>
                                )}
                                <button onClick={() => deleteFriendLog(log.id)} className="p-1.5 text-slate-100 hover:text-rose-600 rounded-md transition-colors"><Trash2 size={14} /></button>
                              </div>
                            )}
                          </div>
                       </div>
                    </div>
                  ))}
                  {selectedPersonData?.logs.length === 0 && (
                    <div className="p-12 text-center text-slate-400 text-xs font-medium italic border border-slate-100 rounded-2xl border-dashed">
                      No transactions recorded
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button - Mobile Only */}
      <div className="md:hidden fixed bottom-28 right-6 z-40">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setNameInput('');
            setEditingLog(null);
            setAmountInput('');
            setShowAdd(true);
          }}
          className="w-14 h-14 bg-brand-primary text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-primary/40 active:bg-brand-secondary transition-colors"
        >
          <Plus size={24} strokeWidth={3} />
        </motion.button>
      </div>

      {/* Modern Compact Modal */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setShowAdd(false); setEditingLog(null); }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: 20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.98 }}
              className="relative w-full max-w-md bg-white rounded-2xl p-8 space-y-8 shadow-2xl border border-slate-200"
            >
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{editingLog ? 'Edit Record' : 'New Entry'}</h2>
                <p className="text-sm text-slate-500 font-medium">Capture a financial exchange detail.</p>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-6">
                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                  {['lent', 'borrowed'].map(t => (
                    <label key={t} className="flex-1">
                      <input type="radio" name="type" value={t} defaultChecked={editingLog ? editingLog.type === t : t === 'lent'} className="sr-only peer" />
                      <div className="peer-checked:bg-white peer-checked:text-slate-900 peer-checked:shadow-sm text-slate-400 py-3 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] text-center cursor-pointer transition-all">
                        {t === 'lent' ? 'I Lent' : 'I Borrowed'}
                      </div>
                    </label>
                  ))}
                </div>

                <div className="space-y-2 relative">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact Name</label>
                  <input 
                    required name="personName" type="text" value={nameInput}
                    onChange={(e) => { setNameInput(e.target.value); setShowSuggestions(true); }}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary outline-none text-sm font-bold transition-all placeholder:text-slate-300"
                    placeholder="Enter friend or dealer name..."
                    autoComplete="off"
                  />
                  
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute z-[110] left-0 right-0 top-[calc(100%+6px)] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden divide-y divide-slate-50">
                      {filteredSuggestions.map((name) => (
                        <button key={name} type="button" onClick={() => { setNameInput(name); setShowSuggestions(false); }} className="w-full p-4 text-left text-xs font-bold text-slate-700 hover:bg-slate-50">{name}</button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount ({currency})</label>
                    <input required name="amount" type="number" step="0.01" value={amountInput} onChange={(e) => setAmountInput(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary outline-none text-sm font-bold" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Memo</label>
                    <input name="note" type="text" defaultValue={editingLog?.note} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary outline-none text-sm font-medium" placeholder="What's it for?" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transaction Date</label>
                    <div className="relative">
                      <input 
                        name="transactionDate" 
                        type="date" 
                        defaultValue={editingLog?.transactionDate || format(new Date(), 'yyyy-MM-dd')}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary outline-none text-sm font-bold transition-all text-slate-900" 
                      />
                      <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Return By (Due Date)</label>
                    <div className="relative">
                      <input 
                        name="dueDate" 
                        type="date" 
                        defaultValue={editingLog?.dueDate}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary outline-none text-sm font-bold transition-all text-slate-900" 
                      />
                      <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowAdd(false); setEditingLog(null); }} className="flex-1 p-4 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-all">Cancel</button>
                  <button type="submit" className="flex-1 p-4 bg-brand-primary text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition-all">
                    {editingLog ? 'Update Record' : 'Save Record'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Minus: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default PeopleView;
