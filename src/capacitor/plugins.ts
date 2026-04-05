/**
 * Capacitor Plugins Configuration
 * Liste des plugins Capacitor utilisés et leurs configurations
 */

export const CAPACITOR_PLUGINS = {
  // Contacts Management
  Contacts: {
    name: '@capacitor/contacts',
    description: 'Accès aux contacts du téléphone',
    methods: ['getContacts', 'saveContact', 'deleteContact'],
  },
  
  // SMS Management
  SMS: {
    name: '@capacitor/sms',
    description: 'Envoi et récupération des SMS',
    methods: ['getMessages', 'sendMessage', 'deleteMessage'],
  },
  
  // File System
  Filesystem: {
    name: '@capacitor/filesystem',
    description: 'Accès au système de fichiers',
    methods: ['readdir', 'mkdir', 'deleteFile', 'writeFile', 'readFile'],
  },
  
  // Call Log
  CallLog: {
    name: '@capacitor/call-log',
    description: 'Historique des appels',
    methods: ['getCallLogs', 'deleteCallLog', 'clearCallLogs'],
  },
  
  // Sharing
  Share: {
    name: '@capacitor/share',
    description: 'Partage de fichiers et contenu',
    methods: ['share'],
  },
  
  // Toast Notifications
  Toast: {
    name: '@capacitor/toast',
    description: 'Notifications toast natives',
    methods: ['show'],
  },
  
  // Permissions
  Permissions: {
    name: '@capacitor/permissions',
    description: 'Gestion des permissions système',
    methods: ['query', 'request'],
  },
  
  // Phone Calls
  Call: {
    name: '@capacitor/call',
    description: 'Effectuer des appels téléphoniques',
    methods: ['call'],
  },
  
  // App Info
  App: {
    name: '@capacitor/app',
    description: 'Informations sur l\'application',
    methods: ['getInfo', 'exitApp'],
  },
  
  // Status Bar
  StatusBar: {
    name: '@capacitor/status-bar',
    description: 'Contrôle de la barre de statut',
    methods: ['setStyle', 'setBackgroundColor'],
  },
  
  // Safe Area
  SafeArea: {
    name: '@capacitor/safe-area',
    description: 'Gestion des zones sûres (notch, etc.)',
    methods: ['getSafeAreaInsets'],
  },
};

/**
 * Installation des plugins
 * 
 * Exécutez les commandes suivantes dans le répertoire du projet :
 * 
 * npm install @capacitor/contacts
 * npm install @capacitor/sms
 * npm install @capacitor/filesystem
 * npm install @capacitor/call-log
 * npm install @capacitor/share
 * npm install @capacitor/toast
 * npm install @capacitor/permissions
 * npm install @capacitor/call
 * npm install @capacitor/app
 * npm install @capacitor/status-bar
 * npm install @capacitor/safe-area
 * 
 * Ou en une seule commande :
 * npm install @capacitor/{contacts,sms,filesystem,call-log,share,toast,permissions,call,app,status-bar,safe-area}
 */

export const INSTALLATION_COMMAND = `npm install @capacitor/{contacts,sms,filesystem,call-log,share,toast,permissions,call,app,status-bar,safe-area}`;

/**
 * Permissions requises pour Android
 * À ajouter dans android/app/src/main/AndroidManifest.xml
 */
export const ANDROID_PERMISSIONS = [
  'android.permission.READ_CONTACTS',
  'android.permission.WRITE_CONTACTS',
  'android.permission.READ_SMS',
  'android.permission.SEND_SMS',
  'android.permission.READ_CALL_LOG',
  'android.permission.WRITE_CALL_LOG',
  'android.permission.READ_EXTERNAL_STORAGE',
  'android.permission.WRITE_EXTERNAL_STORAGE',
  'android.permission.CALL_PHONE',
];

/**
 * Permissions requises pour iOS
 * À ajouter dans ios/App/App/Info.plist
 */
export const IOS_PERMISSIONS = {
  NSContactsUsageDescription: 'Accès aux contacts pour la gestion',
  NSPhotoLibraryUsageDescription: 'Accès à la galerie photo',
  NSCameraUsageDescription: 'Accès à la caméra',
  NSMicrophoneUsageDescription: 'Accès au microphone',
};
