
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.tsx';
import Signup from './pages/Signup.tsx';
import UserDashboard from './pages/UserDashboard.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import { User, UserRole, AppState, TaskStatus, DailyReport, ReportStatus, Task, Notice, LeaveRequest, AttendanceRecord, LeaveStatus } from './types.ts';

const LOGIN_URL = "https://n8n.srv1106977.hstgr.cloud/webhook/40892fd8-42cb-40ca-8fa8-75edcffefa32";
const EVENTS_URL = "https://n8n.srv1106977.hstgr.cloud/webhook/a4dda97d-a837-436b-925d-0a50afee1c7b";
const ADMIN_EMAIL = "tahmidmirja25@gmail.com";

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentUser: null, users: [], attendance: [], tasks: [], 
    reports: [], leaves: [], notices: [], language: 'EN'
  });
  const [loading, setLoading] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(true);

  const triggerEventWebhook = async (payload: any) => {
    try {
      await fetch(EVENTS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error("Event Sync Error:", err);
    }
  };

  const fetchGlobalState = useCallback(async () => {
    try {
      const res = await fetch(EVENTS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'GET_STATE' })
      });
      if (res.ok) {
        const data = await res.json();
        const newState = Array.isArray(data) ? data[0] : data;
        if (newState && !newState.error) {
          setState(p => ({
            ...p,
            users: newState.users || p.users,
            tasks: newState.tasks || p.tasks,
            notices: newState.notices || p.notices,
            leaves: newState.leaves || p.leaves,
            attendance: newState.attendance || p.attendance,
            reports: newState.reports || p.reports
          }));
        }
      }
    } catch (err) {
      console.warn("Polling Desynced.");
    }
  }, []);

  useEffect(() => {
    if (!state.currentUser) return;
    const heartbeat = setInterval(() => {
      triggerEventWebhook({ 
        action: 'HEARTBEAT', 
        userId: state.currentUser?.id, 
        email: state.currentUser?.email,
        timestamp: new Date().toISOString() 
      });
    }, 30000); 
    return () => clearInterval(heartbeat);
  }, [state.currentUser]);

  useEffect(() => {
    const saved = localStorage.getItem('tg_v10_session');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        setState(p => ({ ...p, currentUser: user }));
      } catch (e) {
        localStorage.removeItem('tg_v10_session');
      }
    }
    setLoading(false);
    fetchGlobalState();
    const interval = setInterval(fetchGlobalState, 8000);
    return () => clearInterval(interval);
  }, [fetchGlobalState]);

  const loginHandler = async (email: string, pass?: string) => {
    try {
      const res = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: pass })
      });
      if (res.ok) {
        const data = await res.json();
        let userData;
        const responseData = Array.isArray(data) ? data[0] : data;
        const rawOutput = responseData.output;
        
        if (rawOutput) {
          try {
            const cleanJson = rawOutput.replace(/```json\n?|```/g, '').trim();
            const parsed = JSON.parse(cleanJson);
            if (parsed.success) userData = parsed.user;
          } catch (e) { console.error("Agent Output Parsing Failed", e); }
        } else if (responseData.success) {
          userData = responseData.user;
        }

        if (!userData) return false;

        const isHardAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        const user: User = {
          id: userData.id || 'u-' + Date.now(),
          uid: userData.fields?.["ID NO."] || userData.uid || 'ID-' + Math.floor(Math.random() * 9000),
          name: userData.fields?.["Full Name"] || userData.name || email.split('@')[0],
          email: email,
          role: isHardAdmin ? UserRole.ADMIN : (userData.fields?.Role === 'ADMIN' ? UserRole.ADMIN : UserRole.USER),
          avatar: userData.fields?.Avatar || userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          points: userData.points || 0,
          tags: userData.tags || [],
          joinedAt: new Date().toISOString(),
          notifications: [],
          bio: userData.fields?.Bio || userData.bio || '',
          lastActive: new Date().toISOString()
        };

        setState(p => ({ ...p, currentUser: user }));
        localStorage.setItem('tg_v10_session', JSON.stringify(user));
        return true;
      }
    } catch (err) { console.error("Login Auth Error:", err); }
    return false;
  };

  const handleProfileUpdate = (id: string, updates: Partial<User>) => {
    setState(p => {
      if (p.currentUser?.id !== id) return p;
      const updated = { ...p.currentUser, ...updates };
      localStorage.setItem('tg_v10_session', JSON.stringify(updated));
      return { ...p, currentUser: updated };
    });
    triggerEventWebhook({ action: 'PROFILE_UPDATE', Name: state.currentUser?.name, Updates: updates });
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>;

  const commonProps = {
    onLogout: () => { localStorage.removeItem('tg_v10_session'); setState(p => ({ ...p, currentUser: null })); },
    onUpdateProfile: handleProfileUpdate,
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-[#09090b] text-zinc-100">
        <Routes>
          <Route path="/login" element={state.currentUser ? <Navigate to="/" /> : <Login onLogin={loginHandler} />} />
          <Route path="/signup" element={<Signup onSignup={async (n, e, p) => {
             const uid = 'ID-' + Math.floor(Math.random()*9000);
             const role = (e.toLowerCase() === ADMIN_EMAIL.toLowerCase()) ? UserRole.ADMIN : UserRole.USER;
             const user: User = { id: 'u-'+Date.now(), uid, name: n, email: e, role, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${n}`, points: 0, tags: [], joinedAt: new Date().toISOString(), notifications: [], bio: '', lastActive: new Date().toISOString() };
             setState(p => ({ ...p, currentUser: user, users: [...p.users, user] }));
             localStorage.setItem('tg_v10_session', JSON.stringify(user));
             triggerEventWebhook({ action: 'signup', "Full Name": n, "Email": e, "Password": p, "Role": role, "ID NO.": uid });
             return true;
          }} />} />
          <Route path="/" element={
            state.currentUser ? (
              state.currentUser.role === UserRole.ADMIN ? (
                <div>
                   <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-zinc-900/90 backdrop-blur-2xl border border-white/10 p-1.5 rounded-2xl flex shadow-2xl">
                     <button onClick={() => setIsAdminMode(true)} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${isAdminMode ? 'bg-emerald-500 text-black' : 'text-zinc-500 hover:text-white'}`}>Admin</button>
                     <button onClick={() => setIsAdminMode(false)} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${!isAdminMode ? 'bg-emerald-500 text-black' : 'text-zinc-500 hover:text-white'}`}>Member View</button>
                   </div>
                   {isAdminMode ? (
                     <AdminDashboard 
                       state={state} {...commonProps}
                       onReviewLeave={(id, s) => {
                         setState(p => ({ ...p, leaves: p.leaves.map(l => l.id === id ? { ...l, status: s } : l) }));
                         triggerEventWebhook({ action: 'LEAVE_DECISION', leaveId: id, status: s });
                       }}
                       onDeleteAccount={(id) => setState(p => ({ ...p, users: p.users.filter(u => u.id !== id) }))}
                       onPostNotice={(n) => {
                         setState(p => ({ ...p, notices: [n, ...p.notices] }));
                         triggerEventWebhook({ action: 'NOTICE_POST', Title: n.title, Content: n.content, Target: n.targetId });
                       }}
                       onCreateTask={(t) => {
                         setState(p => ({ ...p, tasks: [...p.tasks, t] }));
                         const targetUser = state.users.find(u => u.id === t.assignedTo[0]);
                         triggerEventWebhook({ action: 'task', "Name": targetUser?.name || "Member", "Date ": new Date().toLocaleDateString(), "Task details": `${t.title}: ${t.description}` });
                       }}
                       onReviewReport={(id, s) => setState(p => ({ ...p, reports: p.reports.map(r => r.id === id ? { ...r, status: s } : r) }))}
                       onUpdateRole={(id, r) => setState(p => ({ ...p, users: p.users.map(u => u.id === id ? { ...u, role: r } : u) }))}
                     />
                   ) : (
                     <UserDashboard 
                       state={state} {...commonProps}
                       onRecordAttendance={(r) => {
                         setState(p => ({ ...p, attendance: [r, ...p.attendance] }));
                         triggerEventWebhook({ action: 'attendeace', "Name": state.currentUser?.name, "Date": new Date().toLocaleDateString(), "Present": "True" });
                       }}
                       onApplyLeave={(l) => {
                         setState(p => ({ ...p, leaves: [l, ...p.leaves] }));
                         triggerEventWebhook({ action: 'suti', "Name": l.userName, "Start date": l.startDate, "End date": l.endDate, "Type": l.type, "Reson": l.reason });
                       }}
                       onSendReport={(r, c) => {
                         setState(p => ({ ...p, reports: [r, ...p.reports], tasks: c ? p.tasks.map(t => t.id === r.taskId ? { ...t, status: TaskStatus.COMPLETED } : t) : p.tasks }));
                         triggerEventWebhook({ action: 'report/update', "Name": r.userName, "Date": r.date, "Task name": r.taskTitle, "How many day": r.daysToFinish, "Report": r.workDone, "Attachment": r.attachment || "None", "Eror": r.hasErrors ? "True" : "False" });
                       }}
                       onUpdateTaskStatus={(id, s) => setState(p => ({ ...p, tasks: p.tasks.map(t => t.id === id ? { ...t, status: s } : t) }))}
                       onToggleLang={() => {}} onClearNotifs={() => {}}
                     />
                   )}
                </div>
              ) : (
                <UserDashboard 
                  state={state} {...commonProps}
                  onRecordAttendance={(r) => {
                    setState(p => ({ ...p, attendance: [r, ...p.attendance] }));
                    triggerEventWebhook({ action: 'attendeace', "Name": state.currentUser?.name, "Date": new Date().toLocaleDateString(), "Present": "True" });
                  }}
                  onApplyLeave={(l) => {
                    setState(p => ({ ...p, leaves: [l, ...p.leaves] }));
                    triggerEventWebhook({ action: 'suti', "Name": l.userName, "Start date": l.startDate, "End date": l.endDate, "Type": l.type, "Reson": l.reason });
                  }}
                  onSendReport={(r, c) => {
                    setState(p => ({ ...p, reports: [r, ...p.reports], tasks: c ? p.tasks.map(t => t.id === r.taskId ? { ...t, status: TaskStatus.COMPLETED } : t) : p.tasks }));
                    triggerEventWebhook({ action: 'report/update', "Name": r.userName, "Date": r.date, "Task name": r.taskTitle, "How many day": r.daysToFinish, "Report": r.workDone, "Attachment": r.attachment || "None", "Eror": r.hasErrors ? "True" : "False" });
                  }}
                  onUpdateTaskStatus={(id, s) => setState(p => ({ ...p, tasks: p.tasks.map(t => t.id === id ? { ...t, status: s } : t) }))}
                  onToggleLang={() => {}} onClearNotifs={() => {}}
                />
              )
            ) : <Navigate to="/login" />
          } />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;
