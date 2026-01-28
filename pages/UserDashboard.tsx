
import React, { useState, useRef, useEffect } from 'react';
import { AppState, AttendanceRecord, Task, TaskStatus, DailyReport, ReportStatus, User, LeaveRequest, LeaveStatus } from '../types.ts';
import Clock from '../components/Clock.tsx';

interface UserDashboardProps {
  state: AppState;
  onLogout: () => void;
  onRecordAttendance: (record: AttendanceRecord) => void;
  onApplyLeave: (req: LeaveRequest) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onSendReport: (report: DailyReport, isComplete: boolean) => void;
  onUpdateProfile: (userId: string, updates: Partial<User>) => void;
  onToggleLang: () => void;
  onClearNotifs: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ state, onRecordAttendance, onApplyLeave, onSendReport, onUpdateProfile, onUpdateTaskStatus, onLogout }) => {
  const { currentUser, tasks, notices, leaves, users } = state;
  const [activeTab, setActiveTab] = useState<'HOME' | 'TASKS' | 'LEAVE' | 'PROFILE'>('HOME');
  const [showNotices, setShowNotices] = useState(false);
  const [readNotices, setReadNotices] = useState<string[]>(() => JSON.parse(localStorage.getItem('tg_read_notices') || '[]'));

  // Form States
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [leaveType, setLeaveType] = useState<'PERSONAL' | 'SICK' | 'CASUAL'>('PERSONAL');
  const [reportText, setReportText] = useState('');
  const [daysLeft, setDaysLeft] = useState('0');
  const [hasError, setHasError] = useState(false);
  const [attachment, setAttachment] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reportAttachmentRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('tg_read_notices', JSON.stringify(readNotices));
  }, [readNotices]);

  if (!currentUser) return null;

  const isShiftActive = (shift: 'AFTERNOON' | 'NIGHT') => {
    const hour = new Date().getHours();
    if (shift === 'AFTERNOON') return hour >= 12 && hour < 16;
    if (shift === 'NIGHT') return (hour >= 20 && hour < 24) || (hour >= 0 && hour < 1);
    return false;
  };

  const markAsRead = (id: string) => {
    if (!readNotices.includes(id)) setReadNotices([...readNotices, id]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'AVATAR' | 'ATTACHMENT') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (target === 'AVATAR') {
          onUpdateProfile(currentUser.id, { avatar: reader.result as string });
        } else {
          setAttachment(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const myTasks = tasks.filter(t => t.assignedTo.includes(currentUser.id));
  const myLeaves = leaves.filter(l => l.userId === currentUser.id);
  const myNotices = notices.filter(n => n.targetId === 'ALL' || n.targetId === currentUser.id);
  const unreadCount = myNotices.filter(n => !readNotices.includes(n.id)).length;

  const getStatusColor = (lastActive?: string) => {
    if (!lastActive) return 'bg-zinc-800';
    const diff = Date.now() - new Date(lastActive).getTime();
    return diff < 300000 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-zinc-700';
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 pb-32 animate-in relative">
      <div className="flex flex-col md:flex-row items-center gap-8 mb-10 premium-card p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-emerald-500 animate-gradient-x"></div>
        <div className="relative group">
          <img src={currentUser.avatar} className="w-24 h-24 rounded-3xl bg-zinc-900 border border-white/10 p-1 object-cover shadow-2xl" alt="avatar" />
          <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/60 rounded-3xl hidden group-hover:flex items-center justify-center cursor-pointer text-[10px] font-black tracking-widest">EDIT IDENTITY</div>
          <input type="file" ref={fileInputRef} onChange={(e) => handleFileUpload(e, 'AVATAR')} accept="image/*" className="hidden" />
          <div className={`absolute -bottom-1 -right-1 w-6 h-6 border-4 border-[#121215] rounded-full ${getStatusColor(currentUser.lastActive)} animate-pulse`}></div>
        </div>
        <div className="text-center md:text-left flex-1">
          <h1 className="text-3xl font-black text-white tracking-tighter">{currentUser.name}</h1>
          <p className="text-xs text-emerald-500 font-bold uppercase tracking-[0.2em] mt-1">{currentUser.uid} • ACTIVE AGENT</p>
          
          <button onClick={() => setShowNotices(!showNotices)} className="mt-6 flex items-center gap-3 px-5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all relative">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            Notice Board
            {unreadCount > 0 && <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-[9px] border-2 border-[#121215] animate-bounce shadow-lg">{unreadCount}</span>}
          </button>
        </div>
        <Clock />
      </div>

      <div className="mb-10 px-6 py-4 bg-zinc-950/40 rounded-[2rem] border border-white/5 flex items-center gap-6 overflow-x-auto scrollbar-hide">
         <div className="flex flex-col">
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Team Pulse</p>
            <p className="text-[11px] font-bold text-emerald-500">Live Status</p>
         </div>
         <div className="flex -space-x-3">
           {users.map(u => (
             <div key={u.id} className="relative group cursor-help">
               <img src={u.avatar} className="w-10 h-10 rounded-full border-2 border-[#09090b] bg-zinc-900 object-cover" alt={u.name} />
               <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#09090b] ${getStatusColor(u.lastActive)}`}></div>
               <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-zinc-900 border border-white/10 text-[9px] font-black text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-2xl z-50">{u.name} ({getStatusColor(u.lastActive).includes('emerald') ? 'Active' : 'Away'})</div>
             </div>
           ))}
         </div>
      </div>

      {showNotices && (
        <div className="mb-8 premium-card p-8 border-l-4 border-emerald-500 bg-[#141417] animate-in shadow-2xl relative">
           <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
               <h3 className="text-xs font-black text-white uppercase tracking-widest">Broadcast Logs</h3>
             </div>
             <button onClick={() => setShowNotices(false)} className="text-zinc-600 hover:text-white transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
           </div>
           <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scroll">
             {myNotices.length === 0 ? <p className="text-center py-12 text-zinc-800 text-[10px] font-black uppercase tracking-widest">No transmissions buffering</p> : myNotices.slice().reverse().map(n => (
               <div key={n.id} onClick={() => markAsRead(n.id)} className={`p-6 rounded-3xl border cursor-pointer transition-all ${readNotices.includes(n.id) ? 'bg-zinc-950/40 border-white/5 opacity-60' : 'bg-rose-500/5 border-rose-500/30 shadow-[0_0_30px_rgba(244,63,94,0.1)]'}`}>
                 <div className="flex justify-between items-start mb-2">
                   <h4 className={`text-sm font-black tracking-tight ${readNotices.includes(n.id) ? 'text-zinc-400' : 'text-rose-400'}`}>{n.title}</h4>
                   <span className="text-[8px] text-zinc-600 font-bold uppercase">{new Date(n.timestamp).toLocaleTimeString()}</span>
                 </div>
                 <p className="text-xs text-zinc-400 leading-relaxed font-medium">{n.content}</p>
                 {!readNotices.includes(n.id) && <p className="text-[8px] text-rose-500 font-black mt-4 uppercase tracking-[0.2em] animate-pulse">● Unread Signal</p>}
               </div>
             ))}
           </div>
        </div>
      )}

      <div className="flex gap-2 mb-10 bg-zinc-950/40 p-2 rounded-2xl border border-white/5 overflow-x-auto scrollbar-hide">
        {['HOME', 'TASKS', 'LEAVE', 'PROFILE'].map((t: any) => (
          <button key={t} onClick={() => setActiveTab(t)} className={`tab-btn flex-1 min-w-[100px] ${activeTab === t ? 'active' : ''}`}>{t === 'HOME' ? 'Dashboard' : t}</button>
        ))}
      </div>

      <div className="space-y-8">
        {activeTab === 'HOME' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in">
            <div className="premium-card p-10 group border border-white/5 hover:border-emerald-500/30 transition-all">
              <div className="flex justify-between items-start mb-6">
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Afternoon Cycle (12-16)</p>
                <div className={`w-3 h-3 rounded-full ${isShiftActive('AFTERNOON') ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-zinc-800'}`}></div>
              </div>
              <h3 className="text-2xl font-black mb-8 text-white tracking-tighter">Afternoon Node</h3>
              <button disabled={!isShiftActive('AFTERNOON')} onClick={() => onRecordAttendance({ id: 'at-'+Date.now(), userId: currentUser.id, shift: 'AFTERNOON', timestamp: new Date().toISOString(), status: 'PRESENT' })} className="btn-emerald w-full py-4.5 rounded-2xl text-[11px] uppercase tracking-[0.2em]">{isShiftActive('AFTERNOON') ? 'CHECK-IN' : 'NODE LOCKED'}</button>
            </div>
            <div className="premium-card p-10 group border border-white/5 hover:border-emerald-500/30 transition-all">
              <div className="flex justify-between items-start mb-6">
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Night Cycle (20-00)</p>
                <div className={`w-3 h-3 rounded-full ${isShiftActive('NIGHT') ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-zinc-800'}`}></div>
              </div>
              <h3 className="text-2xl font-black mb-8 text-white tracking-tighter">Night Node</h3>
              <button disabled={!isShiftActive('NIGHT')} onClick={() => onRecordAttendance({ id: 'at-'+Date.now(), userId: currentUser.id, shift: 'NIGHT', timestamp: new Date().toISOString(), status: 'PRESENT' })} className="btn-emerald w-full py-4.5 rounded-2xl text-[11px] uppercase tracking-[0.2em]">{isShiftActive('NIGHT') ? 'CHECK-IN' : 'NODE LOCKED'}</button>
            </div>
          </div>
        )}

        {activeTab === 'TASKS' && (
          <div className="space-y-6 animate-in">
             <div className="premium-card p-10">
                <div className="flex items-center gap-3 mb-10">
                   <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em]">Personal Directives</h3>
                   <div className="h-[1px] flex-1 bg-white/5"></div>
                </div>
                {myTasks.length === 0 ? <p className="text-center py-16 text-zinc-800 text-[10px] font-black uppercase tracking-[0.2em]">No active mission parameters</p> : myTasks.map(t => (
                  <div key={t.id} className="p-8 bg-zinc-950/60 rounded-[2rem] mb-6 border border-white/5 flex flex-col md:flex-row justify-between gap-6 group hover:border-emerald-500/20 transition-all shadow-xl">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-2 h-2 rounded-full ${t.status === TaskStatus.COMPLETED ? 'bg-emerald-500' : 'bg-indigo-500 animate-pulse'}`}></div>
                        <p className="font-black text-white text-base tracking-tight">{t.title}</p>
                      </div>
                      <p className="text-sm text-zinc-400 leading-relaxed font-medium">{t.description}</p>
                    </div>
                    <div className="flex gap-3 items-center">
                       {t.status !== TaskStatus.COMPLETED && <button onClick={() => onUpdateTaskStatus(t.id, TaskStatus.COMPLETED)} className="px-6 py-3 text-[10px] font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-xl hover:bg-emerald-500 hover:text-black transition-all uppercase tracking-widest">Finalize</button>}
                       <button onClick={() => setSelectedTaskId(t.id)} className="px-6 py-3 text-[10px] font-black text-white bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all uppercase tracking-widest">Report</button>
                    </div>
                  </div>
                ))}
             </div>

             {selectedTaskId && (
               <div className="premium-card p-12 animate-in space-y-8 bg-[#131316] border-t-2 border-emerald-500 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Status Uplink</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Cycle Count Left</label>
                       <input type="number" value={daysLeft} onChange={e => setDaysLeft(e.target.value)} className="w-full bg-zinc-950 border border-white/10 p-5 rounded-2xl text-white text-sm focus:border-emerald-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Evidence Capture</label>
                       <button onClick={() => reportAttachmentRef.current?.click()} className="w-full bg-zinc-950 border border-white/10 p-5 rounded-2xl text-xs text-zinc-500 text-left truncate hover:bg-zinc-900 transition-colors">{attachment ? 'Buffer Ready' : 'Select Signal Capture'}</button>
                       <input type="file" ref={reportAttachmentRef} onChange={(e) => handleFileUpload(e, 'ATTACHMENT')} className="hidden" accept="image/*" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-rose-500/5 p-5 rounded-2xl border border-rose-500/10">
                    <input type="checkbox" id="hasErr" checked={hasError} onChange={e => setHasError(e.target.checked)} className="w-5 h-5 rounded-lg accent-rose-500 cursor-pointer" />
                    <label htmlFor="hasErr" className="text-[11px] font-black text-rose-500 uppercase tracking-widest cursor-pointer">Protocol Breach / Blocker detected</label>
                  </div>
                  <textarea value={reportText} onChange={e => setReportText(e.target.value)} placeholder="Elaborate mission results..." className="w-full bg-zinc-950 border border-white/10 rounded-3xl p-7 text-sm outline-none min-h-[180px] focus:border-emerald-500 text-white placeholder-zinc-800 shadow-inner" />
                  <div className="flex gap-4">
                    <button onClick={() => {
                      if(!reportText) return alert("Logs cannot be null.");
                      onSendReport({ id: 'rp-'+Date.now(), userId: currentUser.id, userName: currentUser.name, taskId: selectedTaskId, taskTitle: tasks.find(ts=>ts.id===selectedTaskId)?.title || '', date: new Date().toLocaleDateString(), workDone: reportText, problems: '', daysToFinish: daysLeft, hasErrors: hasError, attachment: attachment, status: ReportStatus.PENDING, timestamp: new Date().toISOString() }, false);
                      setReportText(''); setSelectedTaskId(''); setDaysLeft('0'); setHasError(false); setAttachment('');
                    }} className="btn-emerald flex-1 py-5 rounded-2xl text-[11px] uppercase tracking-[0.2em] shadow-xl">Transmit Log</button>
                    <button onClick={() => setSelectedTaskId('')} className="px-10 py-5 bg-zinc-900 text-zinc-500 font-black text-[11px] rounded-2xl uppercase tracking-widest hover:bg-zinc-800 transition-all">Abort</button>
                  </div>
               </div>
             )}
          </div>
        )}

        {activeTab === 'LEAVE' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in">
            <div className="premium-card p-10 space-y-8 border-t-2 border-indigo-500 shadow-xl">
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Isolation Filing</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-600 uppercase ml-1">Start Cycle</label>
                  <input type="date" value={leaveStart} onChange={e => setLeaveStart(e.target.value)} className="w-full bg-zinc-950 border border-white/10 rounded-2xl p-5 text-sm text-white focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-600 uppercase ml-1">End Cycle</label>
                  <input type="date" value={leaveEnd} onChange={e => setLeaveEnd(e.target.value)} className="w-full bg-zinc-950 border border-white/10 rounded-2xl p-5 text-sm text-white focus:border-indigo-500 outline-none transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-600 uppercase ml-1">Signal Mode</label>
                <select value={leaveType} onChange={e => setLeaveType(e.target.value as any)} className="w-full bg-zinc-950 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none focus:border-indigo-500 appearance-none shadow-inner">
                  <option value="PERSONAL">Personal Downtime</option>
                  <option value="SICK">Medical Isolation</option>
                  <option value="CASUAL">Casual Override</option>
                </select>
              </div>
              <textarea value={leaveReason} onChange={e => setLeaveReason(e.target.value)} placeholder="Elaborate isolation parameters..." className="w-full bg-zinc-950 border border-white/10 rounded-3xl p-6 text-sm h-40 text-white focus:border-indigo-500 transition-all outline-none placeholder-zinc-800 shadow-inner" />
              <button onClick={() => {
                if(!leaveReason || !leaveStart || !leaveEnd) return alert("Incomplete parameters.");
                onApplyLeave({ id: 'lv-'+Date.now(), userId: currentUser.id, userName: currentUser.name, reason: leaveReason, status: LeaveStatus.PENDING, startDate: leaveStart, endDate: leaveEnd, type: leaveType as any, timestamp: new Date().toISOString() });
                setLeaveReason(''); setLeaveStart(''); setLeaveEnd('');
              }} className="btn-emerald w-full py-5 rounded-2xl text-[11px] uppercase tracking-[0.2em] bg-indigo-500 hover:bg-indigo-400 shadow-indigo-500/20 shadow-lg">Submit Request</button>
            </div>
            <div className="premium-card p-10">
               <div className="flex items-center gap-3 mb-10">
                   <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em]">Registry History</h3>
                   <div className="h-[1px] flex-1 bg-white/5"></div>
                </div>
              <div className="space-y-5 max-h-[600px] overflow-y-auto pr-3 custom-scroll">
                {myLeaves.length === 0 ? <p className="text-center py-20 text-zinc-800 text-[10px] font-black uppercase tracking-[0.2em]">Registry empty</p> : myLeaves.slice().reverse().map(l => (
                  <div key={l.id} className="p-6 bg-zinc-950/40 rounded-3xl border border-white/5 flex flex-col gap-3 group hover:border-white/10 transition-all">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-black text-zinc-400 tracking-tight">{l.startDate} ~ {l.endDate}</p>
                      <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-xl ${l.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500' : l.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-500' : 'bg-zinc-800 text-zinc-600'}`}>{l.status}</span>
                    </div>
                    <p className="text-xs text-zinc-500 italic font-medium leading-relaxed truncate">"{l.reason}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'PROFILE' && (
          <div className="premium-card p-14 text-center animate-in max-w-xl mx-auto border-t-4 border-emerald-500 shadow-2xl">
            <h3 className="text-3xl font-black text-white mb-12 tracking-tighter uppercase">Identity Profile</h3>
            <div className="grid grid-cols-1 gap-5">
               <button onClick={() => { const b = prompt("Update Bio Registry:", currentUser.bio); if (b !== null) onUpdateProfile(currentUser.id, { bio: b }); }} className="w-full py-5.5 bg-white/5 border border-white/10 text-[11px] font-black uppercase rounded-2xl hover:bg-white/10 transition-all tracking-widest shadow-lg">Edit Biography</button>
               <button onClick={() => { const n = prompt("Identity Refinement:", currentUser.name); if (n) onUpdateProfile(currentUser.id, { name: n }); }} className="w-full py-5.5 bg-white/5 border border-white/10 text-[11px] font-black uppercase rounded-2xl hover:bg-white/10 transition-all tracking-widest shadow-lg">Rename Identity</button>
               <button onClick={() => fileInputRef.current?.click()} className="w-full py-5.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[11px] font-black uppercase rounded-2xl hover:bg-emerald-500 hover:text-black transition-all tracking-widest shadow-lg">Refresh Avatar</button>
               <div className="pt-12 border-t border-white/5 mt-8">
                 <button onClick={onLogout} className="w-full py-5.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[11px] font-black uppercase rounded-2xl hover:bg-rose-500 hover:text-white transition-all tracking-widest shadow-lg shadow-rose-500/10">Terminate Identity</button>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
