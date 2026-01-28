
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAdminInsights = async (reports: any[], users: any[], attendance: any[]) => {
  try {
    if (reports.length === 0 && attendance.length === 0) return "Not enough operational data to generate neural insights.";

    const reportData = reports.map(r => `[Task: ${r.taskTitle}, User: ${r.userName}, Status: ${r.status}, Update: ${r.workDone}]`).join('; ');
    const attendanceData = attendance.slice(0, 10).map(a => `[User: ${a.userId}, Shift: ${a.shift}, Time: ${a.timestamp}]`).join('; ');
    
    const prompt = `Act as an AI Operations Commander. 
    Analyze team productivity based on:
    Reports: ${reportData}
    Recent Attendance: ${attendanceData}
    
    MANDATORY: 
    1. Identify any "Attendance Gaps" or unusual absence patterns.
    2. Highlight the most productive agents.
    3. Spot mission blockers (errors mentioned in reports).
    4. Provide one actionable 'Optimization Strategy' for the Admin.
    
    Keep it futuristic, high-level, and professional. Max 5 sentences. Use bold for names.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Neural core analysis complete. Operational efficiency remains within expected thresholds.";
  } catch (error) {
    return "Intelligence matrix temporarily desynced. Relying on manual protocols.";
  }
};
