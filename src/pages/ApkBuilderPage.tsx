import PageHeader from '@/components/PageHeader';
import StepIndicator from '@/components/apk-builder/StepIndicator';
import RepoSelector from '@/components/apk-builder/RepoSelector';
import TokenInput from '@/components/apk-builder/TokenInput';
import AppConfig from '@/components/apk-builder/AppConfig';
import AnalysisReport from '@/components/apk-builder/AnalysisReport';
import BuildLogs from '@/components/apk-builder/BuildLogs';
import BuildHistory from '@/components/apk-builder/BuildHistory';
import AIChat from '@/components/apk-builder/AIChat';
import AISettings from '@/components/apk-builder/AISettings';
import NotificationSettings from '@/components/apk-builder/NotificationSettings';
import GitHubLogsViewer from '@/components/apk-builder/GitHubLogsViewer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useApkBuilderStore } from '@/stores/apkBuilderStore';
import { useGitHubApi } from '@/hooks/useGitHubApi';
import { useBuildPolling } from '@/hooks/useBuildPolling';
import { Download, ExternalLink, Loader2, Rocket, Settings, ChevronDown, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

const ApkBuilderPage = () => {
  const { step, setStep, analysis, isAnalyzing, isBuilding, downloadUrl, logs, token } = useApkBuilderStore();
  const { analyze, fixAndBuild } = useGitHubApi();
  const [showAiSettings, setShowAiSettings] = useState(false);

  useBuildPolling();

  const handleBuild = async () => {
    if (!analysis) {
      const result = await analyze();
      if (!result) return;
    }
    await fixAndBuild();
  };

  const hasErrors = logs.some(l => l.type === 'error');
  const effectiveStep = !token && step !== 1 ? 1 : step;

  return (
    <div className="pb-20">
      <PageHeader
        title="APK Builder"
        subtitle="Transformez votre PWA en APK Android"
        action={
          <Button variant="ghost" size="icon" onClick={() => setShowAiSettings(!showAiSettings)}>
            <Settings className="h-5 w-5" />
          </Button>
        }
      />

      <div className="px-4">
        <StepIndicator current={effectiveStep} onStepClick={setStep} />

        {showAiSettings && (
          <div className="mb-4 space-y-3">
            <AISettings />
            <NotificationSettings />
          </div>
        )}

        {effectiveStep === 1 && <TokenInput />}
        {effectiveStep === 0 && <RepoSelector />}
        {effectiveStep === 2 && <AppConfig />}

        {effectiveStep === 3 && (
          <div className="space-y-4">
            {!analysis && !isAnalyzing && (
              <Button onClick={analyze} className="w-full" disabled={isAnalyzing}>
                <Rocket className="h-4 w-4 mr-2" />
                Analyser mon dépôt
              </Button>
            )}

            {isAnalyzing && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">Analyse en cours...</span>
              </div>
            )}

            {analysis && <AnalysisReport analysis={analysis} />}

            {hasErrors && !isBuilding && (
              <Card className="border-destructive bg-destructive/5">
                <CardContent className="pt-4 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div className="space-y-2 flex-1">
                    <p className="text-sm font-medium text-destructive">Des erreurs ont été détectées</p>
                    <p className="text-xs text-muted-foreground">
                      Vérifiez les logs ci-dessous. L'assistant IA peut analyser les erreurs et proposer des solutions.
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setStep(1)} className="text-xs">
                        Vérifier le token
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setStep(2)} className="text-xs">
                        Modifier la config
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {analysis && !isBuilding && !downloadUrl && (
              <Button onClick={handleBuild} className="w-full" size="lg">
                <Rocket className="h-4 w-4 mr-2" />
                Corriger et compiler l'APK
              </Button>
            )}

            {isBuilding && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="ml-2 text-sm">Compilation en cours...</span>
              </div>
            )}

            {downloadUrl && (
              <Card className="border-primary">
                <CardContent className="pt-6 text-center space-y-3">
                  <Download className="h-10 w-10 text-primary mx-auto" />
                  <p className="font-semibold text-foreground">Votre APK est prêt !</p>
                  <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="w-full">
                      Télécharger l'APK <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </a>
                  <p className="text-xs text-muted-foreground">
                    L'APK se met à jour automatiquement grâce à la configuration server.url dans Capacitor.
                  </p>
                </CardContent>
              </Card>
            )}

            <BuildLogs />

            {/* GitHub Actions Logs Viewer */}
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between text-sm">
                  📋 Logs GitHub Actions
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <GitHubLogsViewer />
              </CollapsibleContent>
            </Collapsible>

            {/* Build History */}
            <BuildHistory />

            {/* AI Chat */}
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between text-sm">
                  🤖 Assistant IA (analyse complète)
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <AIChat />
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApkBuilderPage;
