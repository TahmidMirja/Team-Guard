
import React, { useState } from 'react';
import { AppState, UserRole, User, Task, TaskStatus, DailyReport, ReportStatus, LeaveStatus, Notice } from '../types.ts';
import PerformanceAnalyzer from '../components/AttendanceChart.tsx';

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
    return diff < 300000 ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-zinc-700';
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 pb-32 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
        <div className="relative">
          <div className="flex items-center gap-4">
             <div className="w-4 h-4 bg-emerald-500 rounded-full animate-ping absolute -left-2 top-1/2 -translate-y-1/2 opacity-20"></div>
             <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Admin Hub</h1>
          </div>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] mt-2 ml-1">Live Management Command Node</p>
        </div>
        <button onClick={onLogout} className="px-8 py-3 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl text-[11px] font-black uppercase transition-all hover:bg-rose-500 hover:text-white tracking-[0.2em] shadow-lg shadow-rose-500/5">Sign Out Signal</button>
      </div>

      <div className="flex gap-2 mb-12 bg-zinc-950/40 p-2 rounded-[2rem] border border-white/5 overflow-x-auto scrollbar-hide">
        {['TEAM', 'REPORTS', 'TASKS', 'NOTICES'].map((t: any) => (
          <button key={t} onClick={() => setActiveTab(t as any)} className={`tab-btn flex-1 min-w-[140px] py-4 ${activeTab === t ? 'active' : ''}`}>{t}</button>
        ))}
      </div>

      <div className="space-y-12">
        {activeTab === 'TEAM' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in">
             <div className="lg:col-span-12">
                <PerformanceAnalyzer records={attendance} tasks={tasks} />
             </div>
             <div className="lg:col-span-8 space-y-8">
               <div className="premium-card p-10">
                 <h3 className="text-[11px] font-black text-zinc-500 uppercase mb-10 tracking-[0.3em]">Operational Personnel ({users.length})</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   {users.map(u => (
                     <div key={u.id} className="p-6 bg-zinc-950/40 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-emerald-500/30 transition-all shadow-xl">
                       <div className="flex items-center gap-5">
                         <div className="relative">
                            <img src={u.avatar} className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5 object-cover shadow-2xl" alt="av" />
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-[#121215] rounded-full ${getStatusColor(u.lastActive)}`}></div>
                         </div>
                         <div>
                           <p className="text-base font-black text-white tracking-tight">{u.name}</p>
                           <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">{u.role === 'ADMIN' ? 'SUPERVISOR' : u.uid}</p>
                         </div>
                       </div>
                       <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all">
                         <button onClick={() => {
                           const tag = prompt('Assign Signal Label:');
                           if(tag) onUpdateProfile(u.id, { tags: [...u.tags, tag.toUpperCase()] });
                         }} className="p-3 text-emerald-500 bg-emerald-500/10 rounded-xl border border-emerald-500/20 hover:bg-emerald-500 hover:text-black transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                         </button>
                         <button onClick={() => {
                           if(confirm(`Erase records for Agent ${u.name}?`)) onDeleteAccount(u.id);
                         }} className="p-3 text-rose-500 bg-rose-500/10 rounded-xl border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             </div>

             <div className="lg:col-span-4 space-y-8">
               <div className="premium-card p-10 bg-emerald-500/[0.03] border-emerald-500/10 shadow-emerald-500/5 shadow-2xl">
                 <h3 className="text-[11px] font-black text-zinc-500 uppercase mb-10 tracking-[0.3em]">Isolation Request Queue</h3>
                 <div className="max-h-[600px] overflow-y-auto pr-3 custom-scroll space-y-5">
                   {leaves.filter(l => l.status === 'PENDING').length === 0 ? <p className="text-center py-20 text-zinc-800 text-[10px] font-black uppercase tracking-widest">Protocol Buffer Clear</p> : leaves.filter(l => l.status === 'PENDING').map(l => (
                     <div key={l.id} className="p-6 bg-zinc-950 rounded-3xl border border-white/5 shadow-2xl space-y-4 hover:border-emerald-500/20 transition-all group">
                       <div className="flex justify-between items-start">
                         <div>
                           <p className="text-sm font-black text-emerald-500 uppercase tracking-tight">{l.userName}</p>
                           <p className="text-[10px] text-zinc-500 font-bold mt-1">{l.startDate} ~ {l.endDate}</p>
                         </div>
                         <span className="text-[9px] bg-white/5 px-3 py-1.5 rounded-xl text-zinc-400 font-black tracking-widest uppercase">{l.type}</span>
                       </div>
                       <p className="text-xs text-zinc-400 italic leading-relaxed font-medium">"{l.reason}"</p>
                       <div className="flex gap-3 pt-2">
                         <button onClick={() => onReviewLeave(l.id, LeaveStatus.APPROVED)} className="flex-1 py-3 bg-emerald-500 text-black text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">Authorize</button>
                         <button onClick={() => onReviewLeave(l.id, LeaveStatus.REJECTED)} className="flex-1 py-3 bg-zinc-800 text-zinc-500 text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-zinc-700 transition-all">Reject</button>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
          </div>
        )}

        {activeTab === 'REPORTS' && (
          <div className="max-w-3xl mx-auto space-y-8 animate-in">
            <h3 className="text-[11px] font-black text-center text-zinc-500 uppercase tracking-[0.4em] mb-12">Signal Status Matrix</h3>
            {reports.length === 0 ? <p className="text-center py-32 text-zinc-800 font-black uppercase text-xs tracking-[0.3em]">Matrix Void</p> : reports.slice().reverse().map(r => (
               <div key={r.id} className={`premium-card p-10 border-l-8 space-y-6 transition-all hover:scale-[1.01] ${r.status === 'APPROVED' ? 'border-emerald-500 bg-emerald-500/[0.02]' : r.status === 'REJECTED' ? 'border-rose-500 bg-rose-500/[0.02]' : 'border-indigo-500 bg-indigo-500/[0.02]'}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                       <p className="text-sm font-black text-white uppercase tracking-tight">{r.userName}</p>
                       <div className="w-1.5 h-1.5 rounded-full bg-zinc-800"></div>
                       <p className="text-xs font-bold text-zinc-500">{r.taskTitle}</p>
                    </div>
                    <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">{r.date}</span>
                  </div>
                  <div className="bg-black/60 p-7 rounded-[2rem] border border-white/5 italic text-sm text-zinc-300 leading-relaxed font-medium shadow-inner">"{r.workDone}"</div>
                  
                  {r.attachment && (
                    <div className="p-4 bg-zinc-950 rounded-2xl border border-white/5 flex items-center justify-between shadow-xl">
                       <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Evidence Buffered</p>
                       <button onClick={() => window.open(r.attachment)} className="text-[10px] text-emerald-500 font-black uppercase tracking-widest hover:underline hover:text-emerald-400 transition-all">View Capture</button>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    {r.status === ReportStatus.PENDING && (
                      <>
                        <button onClick={() => onReviewReport(r.id, ReportStatus.APPROVED)} className="px-8 py-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all shadow-lg">Buffer Accept</button>
                        <button onClick={() => onReviewReport(r.id, ReportStatus.REJECTED)} className="px-8 py-3 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-lg">Signal Void</button>
                      </>
                    )}
                    <span className="ml-auto text-[10px] font-black text-zinc-700 uppercase self-center tracking-widest">{r.status}</span>
                  </div>
               </div>
            ))}
          </div>
        )}

        {activeTab === 'TASKS' && (
          <div className="max-w-xl mx-auto animate-in">
            <form onSubmit={(e) => {
              e.preventDefault();
              const d = new FormData(e.currentTarget);
              onCreateTask({ id: 'tk-'+Date.now(), title: d.get('title') as string, description: d.get('desc') as string, assignedTo: [d.get('user') as string], status: TaskStatus.PENDING, createdAt: new Date().toISOString() });
              (e.target as HTMLFormElement).reset();
              setActiveTab('TEAM');
            }} className="premium-card p-12 space-y-8 border-t-4 border-indigo-500 shadow-2xl bg-[#121215]/80">
              <h3 className="text-3xl font-black text-center mb-10 text-white uppercase tracking-tighter">Deploy Mission</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-zinc-600 uppercase ml-2 tracking-widest">Objective Signal</label>
                   <input name="title" required placeholder="Directive Header..." className="w-full bg-zinc-950 border border-white/10 p-5 rounded-2xl text-sm outline-none focus:border-indigo-500 transition-all text-white placeholder-zinc-800 shadow-inner" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-zinc-600 uppercase ml-2 tracking-widest">Personnel Target</label>
                   <select name="user" required className="w-full bg-zinc-950 border border-white/10 p-5 rounded-2xl text-sm outline-none text-white appearance-none cursor-pointer focus:border-indigo-500 shadow-inner">
                     <option value="">Select ID...</option>
                     {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.uid})</option>)}
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-zinc-600 uppercase ml-2 tracking-widest">Directive Payload</label>
                   <textarea name="desc" required placeholder="Outline mission goals..." className="w-full h-40 bg-zinc-950 border border-white/10 p-6 rounded-3xl text-sm outline-none focus:border-indigo-500 transition-all text-white placeholder-zinc-800 shadow-inner" />
                </div>
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl text-[11px] uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20">Initiate Deployment</button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'NOTICES' && (
          <div className="max-w-xl mx-auto animate-in">
            <form onSubmit={(e) => {
              e.preventDefault();
              const d = new FormData(e.currentTarget);
              onPostNotice({ id: 'nc-'+Date.now(), title: d.get('title') as string, content: d.get('content') as string, author: 'Admin', timestamp: new Date().toISOString(), priority: 'NORMAL', targetId: d.get('target') as string });
              (e.target as HTMLFormElement).reset();
              setActiveTab('TEAM');
            }} className="premium-card p-12 space-y-8 border-t-4 border-emerald-500 shadow-2xl bg-[#121215]/80">
              <h3 className="text-3xl font-black text-center mb-10 text-white uppercase tracking-tighter">Global Broadcaster</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-zinc-600 uppercase ml-2 tracking-widest">Broadcast Target Range</label>
                   <select name="target" className="w-full bg-zinc-950 border border-white/10 p-5 rounded-2xl text-sm text-white appearance-none cursor-pointer focus:border-emerald-500 shadow-inner">
                     <option value="ALL">Global Channel (Everyone)</option>
                     <optgroup label="Direct Signals" className="bg-zinc-900 text-zinc-500">
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                     </optgroup>
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-zinc-600 uppercase ml-2 tracking-widest">Uplink Header</label>
                   <input name="title" required placeholder="Broadcast Subject..." className="w-full bg-zinc-950 border border-white/10 p-5 rounded-2xl text-sm outline-none focus:border-emerald-500 text-white placeholder-zinc-800 shadow-inner" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-zinc-600 uppercase ml-2 tracking-widest">Uplink Message Data</label>
                   <textarea name="content" required placeholder="Transmission details..." className="w-full h-40 bg-zinc-950 border border-white/10 p-6 rounded-3xl text-sm outline-none focus:border-emerald-500 text-white placeholder-zinc-800 shadow-inner" />
                </div>
                <button type="submit" className="w-full py-5 bg-emerald-600 text-black font-black rounded-2xl text-[11px] uppercase tracking-[0.2em] hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/20">Execute Uplink</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
