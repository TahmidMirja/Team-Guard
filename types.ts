
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  BLOCKED = 'BLOCKED'
}

export enum ReportStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface TaskFeedback {
  id: string;
  author: string;
  message: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'SUCCESS' | 'INFO' | 'WARNING' | 'TASK' | 'MESSAGE';
  read: boolean;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  author: string;
  timestamp: string;
  priority: 'NORMAL' | 'URGENT';
  targetId: string; // 'ALL' or specific User ID
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string[];
  status: TaskStatus;
  createdAt: string;
  attachment?: string;
  feedback?: TaskFeedback[];
}

export interface DailyReport {
  id: string;
  userId: string;
  userName: string;
  taskId: string;
  taskTitle: string;
  date: string;
  workDone: string;
  problems: string;
  daysToFinish: string;
  hasErrors: boolean;
  attachment?: string; 
  status: ReportStatus;
  adminComment?: string;
  timestamp: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  timestamp: string;
  shift: 'AFTERNOON' | 'NIGHT';
  status: 'PRESENT' | 'LATE' | 'MISSED';
  location?: { lat: number; lng: number };
}

export interface User {
  id: string;
  uid: string;
  name: string;
  email: string;
  password?: string;
  bio?: string;
  role: UserRole;
  joinedAt: string;
  avatar: string;
  points: number;
  tags: string[];
  notifications: Notification[];
  lastActive?: string;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  type: 'SICK' | 'CASUAL' | 'PERSONAL';
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  timestamp: string;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  attendance: AttendanceRecord[];
  tasks: Task[];
  reports: DailyReport[];
  leaves: LeaveRequest[];
  notices: Notice[];
  language: 'EN' | 'BN';
}
