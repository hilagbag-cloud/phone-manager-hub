export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  group?: string;
  avatar?: string;
  createdAt: string;
}

export interface Sms {
  id: string;
  contactId?: string;
  contactName?: string;
  phone: string;
  content: string;
  date: string;
  type: 'inbox' | 'sent';
  read: boolean;
}

export interface FileEntry {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  mimeType?: string;
  size?: number;
  modifiedAt: string;
  children?: FileEntry[];
}

export interface CallLog {
  id: string;
  contactId?: string;
  contactName?: string;
  phone: string;
  type: 'incoming' | 'outgoing' | 'missed';
  date: string;
  duration: number; // seconds
}

export interface BackupData {
  id: string;
  date: string;
  contacts: Contact[];
  sms: Sms[];
  callLogs: CallLog[];
  version: string;
}

export type PermissionStatus = 'granted' | 'denied' | 'prompt';

export interface AppPermissions {
  contacts: PermissionStatus;
  sms: PermissionStatus;
  storage: PermissionStatus;
  callLog: PermissionStatus;
}
