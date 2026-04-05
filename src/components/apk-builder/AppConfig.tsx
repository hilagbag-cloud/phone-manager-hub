import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useApkBuilderStore } from '@/stores/apkBuilderStore';

const AppConfig = () => {
  const { appConfig, setAppConfig, setStep } = useApkBuilderStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Étape 3 : Configuration (optionnel)</CardTitle>
        <CardDescription>
          Personnalisez le nom et l'identifiant de votre application Android.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Nom de l'application</Label>
          <Input
            value={appConfig.appName}
            onChange={(e) => setAppConfig({ appName: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Package ID</Label>
          <Input
            value={appConfig.appId}
            onChange={(e) => setAppConfig({ appId: e.target.value })}
            placeholder="com.monentreprise.monapp"
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Format : nom de domaine inversé (ex: com.example.monapp)
          </p>
        </div>
        <div className="space-y-2">
          <Label>Version</Label>
          <Input
            value={appConfig.version}
            onChange={(e) => setAppConfig({ version: e.target.value })}
            placeholder="1.0.0"
          />
        </div>

        <Button onClick={() => setStep(3)} className="w-full">
          Analyser et compiler
        </Button>
      </CardContent>
    </Card>
  );
};

export default AppConfig;
