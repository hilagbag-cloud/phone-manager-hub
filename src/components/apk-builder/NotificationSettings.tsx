import { useState, useEffect } from 'react';
import { notificationService } from '@/lib/notifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BellOff, Check } from 'lucide-react';

const NotificationSettings = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const supported = notificationService.isSupported;

  useEffect(() => {
    if (supported) {
      setPermission(Notification.permission);
    }
  }, [supported]);

  const handleEnable = async () => {
    const granted = await notificationService.requestPermission();
    setPermission(granted ? 'granted' : 'denied');
  };

  const handleTest = () => {
    notificationService.buildComplete('Test App');
  };

  if (!supported) {
    return (
      <Card>
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">Les notifications ne sont pas supportées par ce navigateur.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {permission === 'granted' ? (
          <>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Check className="h-4 w-4" />
              Notifications activées
            </div>
            <Button variant="outline" size="sm" onClick={handleTest} className="w-full text-xs">
              Envoyer une notification test
            </Button>
          </>
        ) : permission === 'denied' ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BellOff className="h-4 w-4" />
            Notifications bloquées. Modifiez les paramètres de votre navigateur.
          </div>
        ) : (
          <Button onClick={handleEnable} variant="outline" size="sm" className="w-full">
            <Bell className="h-4 w-4 mr-2" />
            Activer les notifications
          </Button>
        )}
        <p className="text-[11px] text-muted-foreground">
          Recevez des alertes quand un build est terminé, une analyse est complète, ou en cas d'erreur.
        </p>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
