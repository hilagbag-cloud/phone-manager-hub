// Browser Notification service for APK Builder events
// Uses the Web Notification API (works in browser + Capacitor WebView)

export type NotificationType = 'build_complete' | 'build_failed' | 'scan_complete' | 'ai_analysis' | 'error';

interface NotificationOptions {
  title: string;
  body: string;
  type: NotificationType;
  link?: string;
}

class NotificationService {
  private _permission: NotificationPermission = 'default';

  get isSupported(): boolean {
    return 'Notification' in window;
  }

  get permission(): NotificationPermission {
    return this._permission;
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) return false;
    
    try {
      const result = await Notification.requestPermission();
      this._permission = result;
      return result === 'granted';
    } catch {
      return false;
    }
  }

  async send({ title, body, type }: NotificationOptions): Promise<void> {
    if (!this.isSupported) return;

    // Auto-request permission if not yet asked
    if (this._permission === 'default') {
      const granted = await this.requestPermission();
      if (!granted) return;
    }

    if (this._permission !== 'granted') return;

    const icon = this.getIcon(type);

    try {
      new Notification(title, {
        body,
        icon,
        badge: '/placeholder.svg',
        tag: `apk-builder-${type}-${Date.now()}`,
      });
    } catch {
      // Fallback: some environments don't support Notification constructor
      // The in-app toast will still show
    }
  }

  // Convenience methods
  async buildComplete(appName: string): Promise<void> {
    await this.send({
      title: '✅ Build terminé !',
      body: `L'APK de "${appName}" est prêt à être téléchargé.`,
      type: 'build_complete',
    });
  }

  async buildFailed(appName: string, reason?: string): Promise<void> {
    await this.send({
      title: '❌ Build échoué',
      body: reason || `La compilation de "${appName}" a échoué. Vérifiez les logs.`,
      type: 'build_failed',
    });
  }

  async scanComplete(repoName: string, issueCount: number): Promise<void> {
    await this.send({
      title: '🔍 Analyse terminée',
      body: issueCount > 0
        ? `${issueCount} problème(s) détecté(s) dans "${repoName}".`
        : `Aucun problème détecté dans "${repoName}". Prêt pour le build !`,
      type: 'scan_complete',
    });
  }

  async aiAnalysisComplete(summary: string): Promise<void> {
    await this.send({
      title: '🤖 Analyse IA terminée',
      body: summary,
      type: 'ai_analysis',
    });
  }

  async error(message: string): Promise<void> {
    await this.send({
      title: '⚠️ Erreur',
      body: message,
      type: 'error',
    });
  }

  private getIcon(type: NotificationType): string {
    // Use placeholder for now — can be replaced with custom icons
    return '/placeholder.svg';
  }
}

// Singleton
export const notificationService = new NotificationService();
