
import React, { useState } from 'react';
import { AppState, UserRole, User, Task, TaskStatus, DailyReport, ReportStatus, LeaveStatus, Notice } from '../types';
import PerformanceAnalyzer from '../components/AttendanceChart';

interface AdminDashboardProps {
  state: AppState;
  onLogout: () => void;
  onUpdateRole: (userId: string, newRole: UserRole) => void;
  onCreateTask: (task: Task) => void;
  onReviewReport: (reportId: string, status: ReportStatus) => void;
  onReviewLeave: (leaveId: string, status: LeaveStatus) => void;
  onPostNotice: (notice: Notice) => void;
  onUpdateProfile: (userId: string, updates: Partial<User>) => void;
  onDeleteAccount: (userId: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ state, onLogout, onCreateTask, onReviewReport, onReviewLeave, onPostNotice, onUpdateProfile, onDeleteAccount }) => {
  const { users, reports, leaves, attendance, tasks } = state;
  const [activeTab, setActiveTab] = useState<'TEAM' | 'REPORTS' | 'TASKS' | 'NOTICES'>('TEAM');

  const getStatusColor = (lastActive?: string) => {
    if (!lastActive) return 'bg-zinc-800';
    const diff = Date.now() - new Date(lastActive).getTime();
    return diff < 300000 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-zinc-700';
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 pb-32 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="relative">
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
             <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
             Admin Hub
          </h1>
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1 ml-6">Global Oversight Portal</p>
        </div>
        <button onClick={onLogout} className="px-6 py-2.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl text-[10px] font-black uppercase transition-all hover:bg-rose-500 hover:text-white tracking-widest shadow-lg">Terminate Secure Session</button>
      </div>

      <div className="flex gap-2 mb-10 bg-zinc-950/40 p-1.5 rounded-2xl border border-white/5 overflow-x-auto scrollbar-hide">
        {['TEAM', 'REPORTS', 'TASKS', 'NOTICES'].map((t: any) => (
          <button key={t} onClick={() => setActiveTab(t as any)} className={`tab-btn flex-1 min-w-[120px] ${activeTab === t ? 'active' : ''}`}>{t}</button>
        ))}
      </div>

      <div className="space-y-10">
        {activeTab === 'TEAM' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in">
             <div className="lg:col-span-12">
                <PerformanceAnalyzer records={attendance} tasks={tasks} />
             </div>
             <div className="lg:col-span-8 space-y-6">
               <div className="premium-card p-8">
                 <h3 className="text-[10px] font-black text-zinc-500 uppercase mb-8 tracking-[0.2em]">Personnel Directory ({users.length})</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {users.map(u => (
                     <div key={u.id} className="p-5 bg-zinc-950/40 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-emerald-500/20 transition-all">
                       <div className="flex items-center gap-4">
                         <div className="relative">
                            <img src={u.avatar} className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 object-cover" alt="av" />
                            <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-[#121215] rounded-full ${getStatusColor(u.lastActive)}`}></div>
                         </div>
                         <div>
                           <p className="text-sm font-bold text-white">{u.name}</p>
                           <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{u.role === 'ADMIN' ? 'SUPER ADMIN' : u.uid}</p>
                         </div>
                       </div>
                       <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                         <button onClick={() => {
                           const tag = prompt('Assign Performance Label:');
                           if(tag) onUpdateProfile(u.id, { tags: [...u.tags, tag.toUpperCase()] });
                         }} className="p-2 text-emerald-500 bg-emerald-500/5 rounded-lg border border-emerald-500/10 hover:bg-emerald-500 hover:text-black transition-all" title="Add Label">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                         </button>
                         <button onClick={() => {
                           if(confirm(`Erase Agent ${u.name} from records?`)) onDeleteAccount(u.id);
                         }} className="p-2 text-rose-500 bg-rose-500/5 rounded-lg border border-rose-500/10 hover:bg-rose-500 hover:text-white transition-all" title="Erase Record">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             </div>

             <div className="lg:col-span-4 space-y-6">
               <div className="premium-card p-8 bg-emerald-500/[0.02]">
                 <h3 className="text-[10px] font-black text-zinc-500 uppercase mb-8 tracking-[0.2em]">Pending Isolations</h3>
                 <div className="max-h-[500px] overflow-y-auto pr-2 space-y-4">
                   {leaves.filter(l => l.status === 'PENDING').length === 0 ? <p className="text-center py-10 text-zinc-800 text-[10px] font-black uppercase tracking-widest">Registry Clear</p> : leaves.filter(l => l.status === 'PENDING').map(l => (
                     <div key={l.id} className="p-5 bg-zinc-950 rounded-2xl border border-white/5 shadow-xl space-y-3 hover:border-emerald-500/20 transition-all">
                       <div className="flex justify-between items-start">
                         <div>
                           <p className="text-xs font-black text-emerald-500 uppercase">{l.userName}</p>
                           <p className="text-[9px] text-zinc-600 font-bold">{l.startDate} ~ {l.endDate}</p>
                         </div>
                         <span className="text-[8px] bg-white/5 px-2 py-1 rounded-md text-zinc-500 font-bold">{l.type}</span>
                       </div>
                       <p className="text-[11px] text-zinc-400 italic leading-relaxed">"{l.reason}"</p>
                       <div className="flex gap-2 pt-2">
                         <button onClick={() => onReviewLeave(l.id, LeaveStatus.APPROVED)} className="flex-1 py-2 bg-emerald-500 text-black text-[10px] font-black rounded-lg uppercase transition-all hover:bg-emerald-400">Validate</button>
                         <button onClick={() => onReviewLeave(l.id, LeaveStatus.REJECTED)} className="flex-1 py-2 bg-zinc-800 text-zinc-500 text-[10px] font-black rounded-lg uppercase transition-all hover:bg-zinc-700">Deny</button>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
          </div>
        )}

        {activeTab === 'REPORTS' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in">
            <h3 className="text-xs font-black text-center text-zinc-500 uppercase tracking-widest mb-10">Global Log Matrix</h3>
            {reports.length === 0 ? <p className="text-center py-20 text-zinc-800 font-black uppercase text-xs tracking-widest">No Logs Buffered</p> : reports.slice().reverse().map(r => (
               <div key={r.id} className={`premium-card p-8 border-l-4 space-y-4 transition-all ${r.status === 'APPROVED' ? 'border-emerald-500 bg-emerald-500/[0.02]' : r.status === 'REJECTED' ? 'border-rose-500 bg-rose-500/[0.02]' : 'border-indigo-500 bg-indigo-500/[0.02]'}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                       <p className="text-xs font-black text-white uppercase tracking-widest">{r.userName}</p>
                       <span className="w-1.5 h-1.5 rounded-full bg-zinc-700"></span>
                       <p className="text-xs font-bold text-zinc-500">{r.taskTitle}</p>
                    </div>
                    <span className="text-[9px] text-zinc-600 font-black uppercase tracking-tighter">{r.date}</span>
                  </div>
                  <div className="bg-black/40 p-5 rounded-2xl border border-white/5 italic text-sm text-zinc-300 leading-relaxed font-medium">"{r.workDone}"</div>
                  
                  {r.attachment && (
                    <div className="p-3 bg-zinc-950 rounded-xl border border-white/5 flex items-center justify-between">
                       <p className="text-[10px] text-zinc-600 font-black uppercase">Buffered Evidence Attachment</p>
                       <button onClick={() => window.open(r.attachment)} className="text-[9px] text-emerald-500 font-black uppercase hover:underline">View Evidence</button>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    {r.status === ReportStatus.PENDING && (
                      <>
                        <button onClick={() => onReviewReport(r.id, ReportStatus.APPROVED)} className="px-5 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all">Accept</button>
                        <button onClick={() => onReviewReport(r.id, ReportStatus.REJECTED)} className="px-5 py-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">Reject</button>
                      </>
                    )}
                    <span className="ml-auto text-[8px] font-black text-zinc-700 uppercase self-center">{r.status}</span>
                  </div>
               </div>
            ))}
          </div>
        )}

        {activeTab === 'TASKS' && (
          <div className="max-w-md mx-auto animate-in">
            <form onSubmit={(e) => {
              e.preventDefault();
              const d = new FormData(e.currentTarget);
              onCreateTask({ id: 'tk-'+Date.now(), title: d.get('title') as string, description: d.get('desc') as string, assignedTo: [d.get('user') as string], status: TaskStatus.PENDING, createdAt: new Date().toISOString() });
              (e.target as HTMLFormElement).reset();
              setActiveTab('TEAM');
            }} className="premium-card p-10 space-y-5 border-t-2 border-indigo-500 shadow-2xl">
              <h3 className="text-xl font-black text-center mb-6 text-white uppercase tracking-tighter">Deploy Personal Directive</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-zinc-600 uppercase ml-1">Mission Identifier</label>
                   <input name="title" required placeholder="Objective..." className="w-full bg-zinc-950 border border-white/10 p-4 rounded-xl text-sm outline-none focus:border-indigo-500 transition-all text-white placeholder-zinc-800" />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-zinc-600 uppercase ml-1">Assigned Personnel</label>
                   <select name="user" required className="w-full bg-zinc-950 border border-white/10 p-4 rounded-xl text-sm outline-none text-white appearance-none cursor-pointer focus:border-indigo-500">
                     <option value="">Select identity...</option>
                     {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.uid})</option>)}
                   </select>
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-zinc-600 uppercase ml-1">Directive Payload</label>
                   <textarea name="desc" required placeholder="Mission parameters..." className="w-full h-32 bg-zinc-950 border border-white/10 p-4 rounded-xl text-sm outline-none focus:border-indigo-500 transition-all text-white placeholder-zinc-800" />
                </div>
                <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg">Deploy Mission</button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'NOTICES' && (
          <div className="max-w-md mx-auto animate-in">
            <form onSubmit={(e) => {
              e.preventDefault();
              const d = new FormData(e.currentTarget);
              onPostNotice({ id: 'nc-'+Date.now(), title: d.get('title') as string, content: d.get('content') as string, author: 'Admin', timestamp: new Date().toISOString(), priority: 'NORMAL', targetId: d.get('target') as string });
              (e.target as HTMLFormElement).reset();
              setActiveTab('TEAM');
            }} className="premium-card p-10 space-y-5 border-t-2 border-emerald-500 shadow-2xl">
              <h3 className="text-xl font-black text-center mb-6 text-white uppercase tracking-tighter">Secure Broadcaster</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-zinc-600 uppercase ml-1">Broadcast Scope</label>
                   <select name="target" className="w-full bg-zinc-950 border border-white/10 p-4 rounded-xl text-sm text-white appearance-none cursor-pointer focus:border-emerald-500">
                     <option value="ALL">Global Channel (Everyone)</option>
                     <optgroup label="Direct Uplink">
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                     </optgroup>
                   </select>
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-zinc-600 uppercase ml-1">Broadcast Header</label>
                   <input name="title" required placeholder="Subject..." className="w-full bg-zinc-950 border border-white/10 p-4 rounded-xl text-sm outline-none focus:border-emerald-500 text-white placeholder-zinc-800" />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-zinc-600 uppercase ml-1">Payload Content</label>
                   <textarea name="content" required placeholder="Message details..." className="w-full h-32 bg-zinc-950 border border-white/10 p-4 rounded-xl text-sm outline-none focus:border-emerald-500 text-white placeholder-zinc-800" />
                </div>
                <button type="submit" className="w-full py-4 bg-emerald-600 text-black font-black rounded-xl text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg">Execute Broadcast</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
