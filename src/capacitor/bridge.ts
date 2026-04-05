/**
 * Capacitor Bridge
 * Centralise les interactions avec les plugins natifs Capacitor.
 * Quand l'app tourne dans un navigateur standard (sans Capacitor),
 * on retourne des données mockées pour permettre le test.
 */

import { Contact, Sms, FileEntry, CallLog, AppPermissions } from '@/types';
import { mockContacts, mockSms, mockFiles, mockCallLogs } from './mockData';

// Vérifie si Capacitor est disponible (mode natif)
export const isNative = (): boolean => {
  return !!(window as any).Capacitor;
};

// ========== PERMISSIONS ==========

export async function checkPermissions(): Promise<AppPermissions> {
  if (isNative()) {
    // En mode natif, interroger chaque plugin Capacitor
    // const { Contacts } = (window as any).Capacitor.Plugins;
    // const contactPerm = await Contacts.requestPermissions();
    // ... etc
  }
  // Mode démo : toutes les permissions sont accordées
  return {
    contacts: 'granted',
    sms: 'granted',
    storage: 'granted',
    callLog: 'granted',
  };
}

export async function requestPermission(type: keyof AppPermissions): Promise<boolean> {
  if (isNative()) {
    // Appel natif via Capacitor.Plugins
    console.log(`Requesting native permission: ${type}`);
    return true;
  }
  return true; // Mode démo
}

// ========== CONTACTS ==========

let demoContacts = [...mockContacts];

export async function getContacts(): Promise<Contact[]> {
  if (isNative()) {
    // const { Contacts } = (window as any).Capacitor.Plugins;
    // const result = await Contacts.getContacts();
    // return mapCapacitorContacts(result);
  }
  return [...demoContacts];
}

export async function addContact(contact: Omit<Contact, 'id' | 'createdAt'>): Promise<Contact> {
  const newContact: Contact = {
    ...contact,
    id: `c_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  if (isNative()) {
    // Appel natif Capacitor
  }
  demoContacts = [newContact, ...demoContacts];
  return newContact;
}

export async function updateContact(contact: Contact): Promise<Contact> {
  if (isNative()) {
    // Appel natif
  }
  demoContacts = demoContacts.map(c => c.id === contact.id ? contact : c);
  return contact;
}

export async function deleteContact(id: string): Promise<void> {
  if (isNative()) {
    // Appel natif
  }
  demoContacts = demoContacts.filter(c => c.id !== id);
}

// ========== SMS ==========

let demoSms = [...mockSms];

export async function getSms(): Promise<Sms[]> {
  if (isNative()) {
    // const { SMS } = (window as any).Capacitor.Plugins;
    // return await SMS.getMessages();
  }
  return [...demoSms];
}

export async function sendSms(phone: string, content: string): Promise<Sms> {
  const newSms: Sms = {
    id: `sms_${Date.now()}`,
    phone,
    content,
    date: new Date().toISOString(),
    type: 'sent',
    read: true,
  };
  if (isNative()) {
    // const { SMS } = (window as any).Capacitor.Plugins;
    // await SMS.send({ phoneNumber: phone, message: content });
  }
  demoSms = [newSms, ...demoSms];
  return newSms;
}

export async function deleteSms(ids: string[]): Promise<void> {
  if (isNative()) {
    // Appel natif
  }
  demoSms = demoSms.filter(s => !ids.includes(s.id));
}

// ========== FICHIERS ==========

let demoFiles = [...mockFiles];

export async function getFiles(path?: string): Promise<FileEntry[]> {
  if (isNative()) {
    // const { Filesystem } = (window as any).Capacitor.Plugins;
    // return await Filesystem.readdir({ path, directory: 'EXTERNAL_STORAGE' });
  }
  return demoFiles;
}

export async function deleteFile(path: string): Promise<void> {
  if (isNative()) {
    // Appel natif
  }
  console.log(`Deleted file: ${path}`);
}

export async function createDirectory(path: string): Promise<void> {
  if (isNative()) {
    // Appel natif Filesystem
  }
  console.log(`Created directory: ${path}`);
}

// ========== HISTORIQUE D'APPELS ==========

let demoCallLogs = [...mockCallLogs];

export async function getCallLogs(): Promise<CallLog[]> {
  if (isNative()) {
    // const { CallLog } = (window as any).Capacitor.Plugins;
    // return await CallLog.getCallLogs();
  }
  return [...demoCallLogs];
}

export async function deleteCallLog(id: string): Promise<void> {
  if (isNative()) {
    // Appel natif
  }
  demoCallLogs = demoCallLogs.filter(c => c.id !== id);
}

export async function clearCallLogs(): Promise<void> {
  if (isNative()) {
    // Appel natif
  }
  demoCallLogs = [];
}

// ========== PARTAGE & TOAST ==========

export async function shareFile(path: string, title?: string): Promise<void> {
  if (isNative()) {
    // const { Share } = (window as any).Capacitor.Plugins;
    // await Share.share({ title, url: path });
  }
  console.log(`Sharing: ${path}`);
}

export async function showNativeToast(message: string): Promise<void> {
  if (isNative()) {
    // const { Toast } = (window as any).Capacitor.Plugins;
    // await Toast.show({ text: message });
  }
  console.log(`Toast: ${message}`);
}
