export enum UserRole {
  Admin = 'Admin',
  Employee = 'Employee',
}

export interface User {
  id: number;
  fullName: string;
  role: UserRole;
  email: string;
  minutesUsed: number;
}

export interface Organization {
  id: number;
  name: string;
  email: string;
  phone: string;
  usersCount: number;
  users: User[];
  address: string;
  finance: {
    tariffPerMinute: number;
    usedThisMonth: number;
    calculatedBill: number;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'employee' | 'client';
  original: string;
  translated: string;
  timestamp: string;
  isAudio?: boolean;
}

export interface ChatSession {
  id: string;
  clientLanguage: string;
  employerLanguage: string;
  startTime: string;
  messages: ChatMessage[];
}

export enum AppRoute {
  Dashboard = '/',
  Organizations = '/organizations',
  OrganizationDetail = '/organizations/:id',
  Payments = '/payments',
  DualTranslateSetup = '/translate',
  DualTranslateLive = '/translate/live',
  ChatLog = '/chat-log/:id',
}
