
import React from 'react';
import { AttendanceRecord, Task, TaskStatus } from '../types';

interface PerformanceAnalyzerProps {
  records: AttendanceRecord[];
  tasks: Task[];
}

const PerformanceAnalyzer: React.FC<PerformanceAnalyzerProps> = ({ records, tasks }) => {
  // Logic for Attendance Trend (Last 7 Days)
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toLocaleDateString();
    const count = records.filter(r => new Date(r.timestamp).toLocaleDateString() === dateStr).length;
    return { label: d.toLocaleDateString([], { weekday: 'short' }), count };
  });

  // Logic for Task Completion (Total vs Completed)
  const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
  const pendingTasks = tasks.filter(t => t.status !== TaskStatus.COMPLETED).length;
  const totalTasks = tasks.length || 1;
  const completionRate = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="space-y-8">
      {/* Attendance Trend Graph */}
      <div className="bg-[#161b22] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path></svg>
        </div>
        <div className="flex justify-between items-center mb-8 relative z-10">
          <div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Attendance Trend</h3>
            <p className="text-2xl font-black text-white">Live Cycle Analysis</p>
          </div>
          <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] text-emerald-400 font-black uppercase tracking-widest animate-pulse">
            Stable Output
          </div>
        </div>
        
        <div className="h-48 flex items-end justify-between gap-3 px-2 relative z-10">
          {last7Days.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center group">
              <div 
                style={{ height: `${(day.count / 2) * 100}%` }}
                className={`w-full max-w-[50px] rounded-t-2xl transition-all duration-700 relative ${day.count > 0 ? 'bg-gradient-to-t from-indigo-600 via-indigo-400 to-cyan-400 shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'bg-white/5'}`}
              >
                {day.count > 0 && <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-black px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Active Node</div>}
              </div>
              <span className="text-[9px] text-slate-500 font-black mt-4 uppercase tracking-widest">{day.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Task Fulfillment Matrix */}
      <div className="bg-[#161b22] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="flex justify-between items-center mb-8">
           <div>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Task fulfillment</h3>
              <p className="text-2xl font-black text-white">Mission Success: {completionRate}%</p>
           </div>
           <div className="text-right">
              <p className="text-[9px] font-black text-slate-500 uppercase">Completed / Total</p>
              <p className="text-lg font-black text-indigo-400">{completedTasks} / {tasks.length}</p>
           </div>
        </div>
        
        <div className="relative h-6 bg-black/40 rounded-full border border-white/5 overflow-hidden mb-4">
           <div 
             className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-600 to-cyan-500 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(6,182,212,0.5)]"
             style={{ width: `${completionRate}%` }}
           ></div>
        </div>
        <div className="flex justify-between text-[10px] font-black uppercase text-slate-600 tracking-widest">
           <span>Initiated</span>
           <span>Objective Reached</span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalyzer;
