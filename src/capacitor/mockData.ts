import { Contact, Sms, FileEntry, CallLog } from '@/types';

export const mockContacts: Contact[] = [
  { id: '1', name: 'Alice Martin', phone: '+33 6 12 34 56 78', email: 'alice@email.com', group: 'Famille', createdAt: '2024-01-15' },
  { id: '2', name: 'Bob Dupont', phone: '+33 6 23 45 67 89', email: 'bob@email.com', group: 'Travail', createdAt: '2024-02-10' },
  { id: '3', name: 'Claire Moreau', phone: '+33 6 34 56 78 90', email: 'claire@email.com', group: 'Amis', createdAt: '2024-01-20' },
  { id: '4', name: 'David Bernard', phone: '+33 6 45 67 89 01', group: 'Travail', createdAt: '2024-03-05' },
  { id: '5', name: 'Emma Petit', phone: '+33 6 56 78 90 12', email: 'emma@email.com', group: 'Famille', createdAt: '2024-02-28' },
  { id: '6', name: 'François Leroy', phone: '+33 6 67 89 01 23', group: 'Amis', createdAt: '2024-01-08' },
  { id: '7', name: 'Gabrielle Roux', phone: '+33 6 78 90 12 34', email: 'gab@email.com', createdAt: '2024-04-12' },
  { id: '8', name: 'Hugo Simon', phone: '+33 6 89 01 23 45', email: 'hugo@email.com', group: 'Travail', createdAt: '2024-03-18' },
  { id: '9', name: 'Isabelle Laurent', phone: '+33 6 90 12 34 56', group: 'Famille', createdAt: '2024-02-14' },
  { id: '10', name: 'Julien Garcia', phone: '+33 6 01 23 45 67', email: 'julien@email.com', group: 'Amis', createdAt: '2024-05-01' },
  { id: '11', name: 'Karine Thomas', phone: '+33 6 11 22 33 44', createdAt: '2024-01-30' },
  { id: '12', name: 'Lucas Robert', phone: '+33 6 22 33 44 55', email: 'lucas@email.com', group: 'Travail', createdAt: '2024-04-22' },
  { id: '13', name: 'Marie Dubois', phone: '+33 6 33 44 55 66', group: 'Famille', createdAt: '2024-03-10' },
  { id: '14', name: 'Nicolas Richard', phone: '+33 6 44 55 66 77', email: 'nico@email.com', createdAt: '2024-02-05' },
  { id: '15', name: 'Olivia Morel', phone: '+33 6 55 66 77 88', email: 'olivia@email.com', group: 'Amis', createdAt: '2024-05-15' },
];

export const mockSms: Sms[] = [
  { id: 's1', contactId: '1', contactName: 'Alice Martin', phone: '+33 6 12 34 56 78', content: 'Salut ! On se voit ce weekend ?', date: '2024-06-01T10:30:00', type: 'inbox', read: true },
  { id: 's2', contactId: '1', contactName: 'Alice Martin', phone: '+33 6 12 34 56 78', content: 'Oui, samedi à 14h ça te va ?', date: '2024-06-01T10:35:00', type: 'sent', read: true },
  { id: 's3', contactId: '2', contactName: 'Bob Dupont', phone: '+33 6 23 45 67 89', content: 'Réunion reportée à demain matin', date: '2024-06-02T08:15:00', type: 'inbox', read: true },
  { id: 's4', contactId: '3', contactName: 'Claire Moreau', phone: '+33 6 34 56 78 90', content: 'Joyeux anniversaire ! 🎂', date: '2024-06-03T00:01:00', type: 'sent', read: true },
  { id: 's5', contactId: '5', contactName: 'Emma Petit', phone: '+33 6 56 78 90 12', content: "N'oublie pas le dîner chez maman dimanche", date: '2024-06-03T18:00:00', type: 'inbox', read: false },
  { id: 's6', contactId: '8', contactName: 'Hugo Simon', phone: '+33 6 89 01 23 45', content: 'Le rapport est envoyé, tu peux le relire ?', date: '2024-06-04T09:20:00', type: 'inbox', read: false },
  { id: 's7', contactId: '8', contactName: 'Hugo Simon', phone: '+33 6 89 01 23 45', content: 'Je regarde ça tout de suite', date: '2024-06-04T09:25:00', type: 'sent', read: true },
  { id: 's8', contactId: '10', contactName: 'Julien Garcia', phone: '+33 6 01 23 45 67', content: 'Match de foot ce soir, tu viens ?', date: '2024-06-04T14:00:00', type: 'inbox', read: true },
  { id: 's9', contactId: '6', contactName: 'François Leroy', phone: '+33 6 67 89 01 23', content: 'Code promo : SUMMER24 pour -20% !', date: '2024-06-05T11:30:00', type: 'inbox', read: false },
  { id: 's10', contactId: '12', contactName: 'Lucas Robert', phone: '+33 6 22 33 44 55', content: 'Peux-tu valider ma pull request ?', date: '2024-06-05T15:45:00', type: 'inbox', read: true },
  { id: 's11', contactId: '12', contactName: 'Lucas Robert', phone: '+33 6 22 33 44 55', content: "C'est fait, beau travail !", date: '2024-06-05T16:00:00', type: 'sent', read: true },
  { id: 's12', contactId: '15', contactName: 'Olivia Morel', phone: '+33 6 55 66 77 88', content: 'Tu as vu le dernier épisode ?', date: '2024-06-06T20:10:00', type: 'inbox', read: false },
  { id: 's13', contactId: '13', contactName: 'Marie Dubois', phone: '+33 6 33 44 55 66', content: "Appelle-moi quand tu peux s'il te plaît", date: '2024-06-06T21:00:00', type: 'inbox', read: false },
  { id: 's14', contactId: '4', contactName: 'David Bernard', phone: '+33 6 45 67 89 01', content: 'Contrat signé, merci pour tout !', date: '2024-06-07T10:00:00', type: 'sent', read: true },
  { id: 's15', contactId: '9', contactName: 'Isabelle Laurent', phone: '+33 6 90 12 34 56', content: 'Photos de vacances envoyées par email', date: '2024-06-07T12:30:00', type: 'inbox', read: true },
  { id: 's16', contactId: '7', contactName: 'Gabrielle Roux', phone: '+33 6 78 90 12 34', content: 'RDV médecin confirmé pour lundi 9h', date: '2024-06-07T14:15:00', type: 'inbox', read: true },
  { id: 's17', contactId: '11', contactName: 'Karine Thomas', phone: '+33 6 11 22 33 44', content: 'Merci pour ton aide hier !', date: '2024-06-08T08:00:00', type: 'sent', read: true },
  { id: 's18', contactId: '14', contactName: 'Nicolas Richard', phone: '+33 6 44 55 66 77', content: 'Nouvelle version déployée en prod', date: '2024-06-08T16:30:00', type: 'inbox', read: false },
  { id: 's19', contactId: '2', contactName: 'Bob Dupont', phone: '+33 6 23 45 67 89', content: 'Bien reçu, à demain au bureau', date: '2024-06-08T17:00:00', type: 'sent', read: true },
  { id: 's20', contactId: '5', contactName: 'Emma Petit', phone: '+33 6 56 78 90 12', content: "J'arrive dans 10 minutes !", date: '2024-06-09T12:50:00', type: 'sent', read: true },
];

export const mockFiles: FileEntry[] = [
  {
    id: 'f1', name: 'Stockage interne', path: '/storage', type: 'directory', modifiedAt: '2024-06-01',
    children: [
      {
        id: 'f2', name: 'DCIM', path: '/storage/DCIM', type: 'directory', modifiedAt: '2024-06-05',
        children: [
          { id: 'f3', name: 'photo_001.jpg', path: '/storage/DCIM/photo_001.jpg', type: 'file', mimeType: 'image/jpeg', size: 3200000, modifiedAt: '2024-06-01' },
          { id: 'f4', name: 'photo_002.jpg', path: '/storage/DCIM/photo_002.jpg', type: 'file', mimeType: 'image/jpeg', size: 2800000, modifiedAt: '2024-06-03' },
          { id: 'f5', name: 'video_001.mp4', path: '/storage/DCIM/video_001.mp4', type: 'file', mimeType: 'video/mp4', size: 52000000, modifiedAt: '2024-06-04' },
        ]
      },
      {
        id: 'f6', name: 'Documents', path: '/storage/Documents', type: 'directory', modifiedAt: '2024-06-07',
        children: [
          { id: 'f7', name: 'rapport_annuel.pdf', path: '/storage/Documents/rapport_annuel.pdf', type: 'file', mimeType: 'application/pdf', size: 1500000, modifiedAt: '2024-05-20' },
          { id: 'f8', name: 'notes.txt', path: '/storage/Documents/notes.txt', type: 'file', mimeType: 'text/plain', size: 2048, modifiedAt: '2024-06-07' },
          { id: 'f9', name: 'budget_2024.xlsx', path: '/storage/Documents/budget_2024.xlsx', type: 'file', mimeType: 'application/vnd.ms-excel', size: 450000, modifiedAt: '2024-04-15' },
        ]
      },
      {
        id: 'f10', name: 'Musique', path: '/storage/Musique', type: 'directory', modifiedAt: '2024-03-10',
        children: [
          { id: 'f11', name: 'chanson_favoris.mp3', path: '/storage/Musique/chanson_favoris.mp3', type: 'file', mimeType: 'audio/mpeg', size: 8500000, modifiedAt: '2024-03-10' },
        ]
      },
      {
        id: 'f12', name: 'Téléchargements', path: '/storage/Téléchargements', type: 'directory', modifiedAt: '2024-06-08',
        children: [
          { id: 'f13', name: 'app_update.apk', path: '/storage/Téléchargements/app_update.apk', type: 'file', mimeType: 'application/vnd.android.package-archive', size: 25000000, modifiedAt: '2024-06-08' },
          { id: 'f14', name: 'presentation.pptx', path: '/storage/Téléchargements/presentation.pptx', type: 'file', mimeType: 'application/vnd.ms-powerpoint', size: 3200000, modifiedAt: '2024-06-06' },
        ]
      },
    ]
  },
];

export const mockCallLogs: CallLog[] = [
  { id: 'c1', contactId: '1', contactName: 'Alice Martin', phone: '+33 6 12 34 56 78', type: 'incoming', date: '2024-06-09T09:15:00', duration: 180 },
  { id: 'c2', contactId: '2', contactName: 'Bob Dupont', phone: '+33 6 23 45 67 89', type: 'outgoing', date: '2024-06-09T10:30:00', duration: 45 },
  { id: 'c3', contactId: '3', contactName: 'Claire Moreau', phone: '+33 6 34 56 78 90', type: 'missed', date: '2024-06-08T14:20:00', duration: 0 },
  { id: 'c4', contactId: '5', contactName: 'Emma Petit', phone: '+33 6 56 78 90 12', type: 'incoming', date: '2024-06-08T18:45:00', duration: 600 },
  { id: 'c5', contactId: '8', contactName: 'Hugo Simon', phone: '+33 6 89 01 23 45', type: 'outgoing', date: '2024-06-07T11:00:00', duration: 120 },
  { id: 'c6', phone: '+33 6 99 88 77 66', type: 'missed', date: '2024-06-07T15:30:00', duration: 0 },
  { id: 'c7', contactId: '10', contactName: 'Julien Garcia', phone: '+33 6 01 23 45 67', type: 'incoming', date: '2024-06-06T20:00:00', duration: 300 },
  { id: 'c8', contactId: '13', contactName: 'Marie Dubois', phone: '+33 6 33 44 55 66', type: 'outgoing', date: '2024-06-06T08:30:00', duration: 90 },
  { id: 'c9', contactId: '15', contactName: 'Olivia Morel', phone: '+33 6 55 66 77 88', type: 'missed', date: '2024-06-05T12:10:00', duration: 0 },
  { id: 'c10', contactId: '4', contactName: 'David Bernard', phone: '+33 6 45 67 89 01', type: 'incoming', date: '2024-06-05T16:45:00', duration: 420 },
];
