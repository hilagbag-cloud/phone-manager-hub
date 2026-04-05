/**
 * Capacitor Bridge
 * Centralise les interactions avec les plugins natifs Capacitor.
 * Quand l'app tourne dans un navigateur standard (sans Capacitor),
 * on retourne des données mockées pour permettre le test.
 * 
 * Plugins utilisés :
 * - @capacitor/contacts : Gestion des contacts
 * - @capacitor/sms : Envoi de SMS
 * - @capacitor/filesystem : Accès aux fichiers
 * - @capacitor/call-log : Historique d'appels
 * - @capacitor/share : Partage de fichiers
 * - @capacitor/toast : Notifications toast
 * - @capacitor/permissions : Gestion des permissions
 */

import { Contact, Sms, FileEntry, CallLog, AppPermissions } from '@/types';
import { mockContacts, mockSms, mockFiles, mockCallLogs } from './mockData';

// Vérifie si Capacitor est disponible (mode natif)
export const isNative = (): boolean => {
  return !!(window as any).Capacitor;
};

// Cache local pour les données en mode démo
let demoContacts = [...mockContacts];
let demoSms = [...mockSms];
let demoFiles = [...mockFiles];
let demoCallLogs = [...mockCallLogs];

// ========== PERMISSIONS ==========

export async function checkPermissions(): Promise<AppPermissions> {
  if (isNative()) {
    try {
      const { Permissions } = (window as any).Capacitor.Plugins;
      const contactPerm = await Permissions.query({ name: 'contacts' });
      const smsPerm = await Permissions.query({ name: 'sms' });
      const storagePerm = await Permissions.query({ name: 'storage' });
      
      return {
        contacts: contactPerm.state === 'granted' ? 'granted' : 'denied',
        sms: smsPerm.state === 'granted' ? 'granted' : 'denied',
        storage: storagePerm.state === 'granted' ? 'granted' : 'denied',
        callLog: 'granted', // Call log permissions handled separately
      };
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
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
    try {
      const { Permissions } = (window as any).Capacitor.Plugins;
      const permissionName = type === 'callLog' ? 'callLog' : type;
      const result = await Permissions.request({ name: permissionName });
      return result.state === 'granted';
    } catch (error) {
      console.error(`Error requesting ${type} permission:`, error);
      return false;
    }
  }
  return true; // Mode démo
}

// ========== CONTACTS ==========

export async function getContacts(): Promise<Contact[]> {
  if (isNative()) {
    try {
      const { Contacts } = (window as any).Capacitor.Plugins;
      const result = await Contacts.getContacts();
      return (result.contacts || []).map((c: any) => ({
        id: c.contactId,
        name: c.name || 'Unknown',
        phone: c.phones?.[0]?.number || '',
        email: c.emails?.[0]?.address || '',
        group: 'General',
        createdAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching contacts:', error);
      return demoContacts;
    }
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
    try {
      const { Contacts } = (window as any).Capacitor.Plugins;
      await Contacts.saveContact({
        contact: {
          name: newContact.name,
          phones: [{ number: newContact.phone }],
          emails: [{ address: newContact.email }],
        },
      });
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  }
  
  demoContacts = [newContact, ...demoContacts];
  return newContact;
}

export async function updateContact(contact: Contact): Promise<Contact> {
  if (isNative()) {
    try {
      const { Contacts } = (window as any).Capacitor.Plugins;
      await Contacts.saveContact({
        contact: {
          contactId: contact.id,
          name: contact.name,
          phones: [{ number: contact.phone }],
          emails: [{ address: contact.email }],
        },
      });
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  }
  
  demoContacts = demoContacts.map(c => c.id === contact.id ? contact : c);
  return contact;
}

export async function deleteContact(id: string): Promise<void> {
  if (isNative()) {
    try {
      const { Contacts } = (window as any).Capacitor.Plugins;
      await Contacts.deleteContact({ contactId: id });
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  }
  
  demoContacts = demoContacts.filter(c => c.id !== id);
}

// ========== SMS ==========

export async function getSms(): Promise<Sms[]> {
  if (isNative()) {
    try {
      const { SMS } = (window as any).Capacitor.Plugins;
      const result = await SMS.getMessages();
      return (result.messages || []).map((m: any) => ({
        id: m.id,
        phone: m.address,
        content: m.body,
        date: new Date(m.date).toISOString(),
        type: m.type === 1 ? 'received' : 'sent',
        read: m.read === 1,
      }));
    } catch (error) {
      console.error('Error fetching SMS:', error);
      return demoSms;
    }
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
    try {
      const { SMS } = (window as any).Capacitor.Plugins;
      await SMS.sendMessage({
        phoneNumber: phone,
        message: content,
      });
    } catch (error) {
      console.error('Error sending SMS:', error);
    }
  }
  
  demoSms = [newSms, ...demoSms];
  return newSms;
}

export async function deleteSms(ids: string[]): Promise<void> {
  if (isNative()) {
    try {
      const { SMS } = (window as any).Capacitor.Plugins;
      for (const id of ids) {
        await SMS.deleteMessage({ messageId: id });
      }
    } catch (error) {
      console.error('Error deleting SMS:', error);
    }
  }
  
  demoSms = demoSms.filter(s => !ids.includes(s.id));
}

export async function exportSmsAsJson(): Promise<string> {
  return JSON.stringify(demoSms, null, 2);
}

// ========== FICHIERS ==========

export async function getFiles(path?: string): Promise<FileEntry[]> {
  if (isNative()) {
    try {
      const { Filesystem } = (window as any).Capacitor.Plugins;
      const result = await Filesystem.readdir({
        path: path || '/',
        directory: (window as any).Capacitor.Filesystem.Directory.ExternalStorage,
      });
      return (result.files || []).map((f: any) => ({
        name: f.name,
        path: `${path}/${f.name}`,
        type: f.type === 'directory' ? 'folder' : 'file',
        size: f.size || 0,
        modified: f.mtime ? new Date(f.mtime).toISOString() : new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching files:', error);
      return demoFiles;
    }
  }
  return demoFiles;
}

export async function deleteFile(path: string): Promise<void> {
  if (isNative()) {
    try {
      const { Filesystem } = (window as any).Capacitor.Plugins;
      await Filesystem.deleteFile({
        path,
        directory: (window as any).Capacitor.Filesystem.Directory.ExternalStorage,
      });
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }
  
  demoFiles = demoFiles.filter(f => f.path !== path);
  console.log(`Deleted file: ${path}`);
}

export async function createDirectory(path: string): Promise<void> {
  if (isNative()) {
    try {
      const { Filesystem } = (window as any).Capacitor.Plugins;
      await Filesystem.mkdir({
        path,
        directory: (window as any).Capacitor.Filesystem.Directory.ExternalStorage,
        recursive: true,
      });
    } catch (error) {
      console.error('Error creating directory:', error);
    }
  }
  
  demoFiles.push({
    name: path.split('/').pop() || 'Folder',
    path,
    type: 'folder',
    size: 0,
    modified: new Date().toISOString(),
  });
  console.log(`Created directory: ${path}`);
}

// ========== HISTORIQUE D'APPELS ==========

export async function getCallLogs(): Promise<CallLog[]> {
  if (isNative()) {
    try {
      const { CallLog } = (window as any).Capacitor.Plugins;
      const result = await CallLog.getCallLogs();
      return (result.callLogs || []).map((c: any) => ({
        id: c.id,
        phone: c.number,
        name: c.name || 'Unknown',
        type: c.type === 1 ? 'incoming' : c.type === 2 ? 'outgoing' : 'missed',
        duration: c.duration || 0,
        date: new Date(c.date).toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching call logs:', error);
      return demoCallLogs;
    }
  }
  return [...demoCallLogs];
}

export async function deleteCallLog(id: string): Promise<void> {
  if (isNative()) {
    try {
      const { CallLog } = (window as any).Capacitor.Plugins;
      await CallLog.deleteCallLog({ callLogId: id });
    } catch (error) {
      console.error('Error deleting call log:', error);
    }
  }
  
  demoCallLogs = demoCallLogs.filter(c => c.id !== id);
}

export async function clearCallLogs(): Promise<void> {
  if (isNative()) {
    try {
      const { CallLog } = (window as any).Capacitor.Plugins;
      await CallLog.clearCallLogs();
    } catch (error) {
      console.error('Error clearing call logs:', error);
    }
  }
  
  demoCallLogs = [];
}

// ========== PARTAGE & NOTIFICATIONS ==========

export async function shareFile(path: string, title?: string): Promise<void> {
  if (isNative()) {
    try {
      const { Share } = (window as any).Capacitor.Plugins;
      await Share.share({
        title: title || 'Share',
        url: path,
      });
    } catch (error) {
      console.error('Error sharing file:', error);
    }
  }
  
  console.log(`Sharing: ${path}`);
}

export async function showNativeToast(message: string, duration: 'short' | 'long' = 'short'): Promise<void> {
  if (isNative()) {
    try {
      const { Toast } = (window as any).Capacitor.Plugins;
      await Toast.show({
        text: message,
        duration: duration === 'long' ? 3500 : 2000,
      });
    } catch (error) {
      console.error('Error showing toast:', error);
    }
  }
  
  console.log(`Toast: ${message}`);
}

// ========== APPELS TÉLÉPHONIQUES ==========

export async function makeCall(phoneNumber: string): Promise<void> {
  if (isNative()) {
    try {
      const { Call } = (window as any).Capacitor.Plugins;
      await Call.call({ number: phoneNumber });
    } catch (error) {
      console.error('Error making call:', error);
    }
  }
  
  console.log(`Calling: ${phoneNumber}`);
}

// ========== SAUVEGARDE & RESTAURATION ==========

export async function exportAllData(): Promise<string> {
  const data = {
    contacts: demoContacts,
    sms: demoSms,
    files: demoFiles,
    callLogs: demoCallLogs,
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

export async function importAllData(jsonData: string): Promise<void> {
  try {
    const data = JSON.parse(jsonData);
    if (data.contacts) demoContacts = data.contacts;
    if (data.sms) demoSms = data.sms;
    if (data.files) demoFiles = data.files;
    if (data.callLogs) demoCallLogs = data.callLogs;
    console.log('Data imported successfully');
  } catch (error) {
    console.error('Error importing data:', error);
  }
}

export async function resetAllData(): Promise<void> {
  demoContacts = [...mockContacts];
  demoSms = [...mockSms];
  demoFiles = [...mockFiles];
  demoCallLogs = [...mockCallLogs];
  console.log('All data reset to defaults');
}
