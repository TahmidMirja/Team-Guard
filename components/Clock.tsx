
import React, { useState, useEffect } from 'react';

const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-right">
      <div className="text-3xl font-black text-white tracking-tighter">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest mt-1">
        {time.toLocaleDateString([], { month: 'short', day: 'numeric' })}
      </div>
    </div>
  );
};

export default Clock;
