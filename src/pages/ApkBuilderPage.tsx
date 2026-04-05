import PageHeader from '@/components/PageHeader';
import StepIndicator from '@/components/apk-builder/StepIndicator';
import RepoForm from '@/components/apk-builder/RepoForm';
import TokenInput from '@/components/apk-builder/TokenInput';
import AppConfig from '@/components/apk-builder/AppConfig';
import AnalysisReport from '@/components/apk-builder/AnalysisReport';
import BuildLogs from '@/components/apk-builder/BuildLogs';
import AIChat from '@/components/apk-builder/AIChat';
import TokenInput from '@/components/apk-builder/TokenInput';
import AppConfig from '@/components/apk-builder/AppConfig';
import AnalysisReport from '@/components/apk-builder/AnalysisReport';
import BuildLogs from '@/components/apk-builder/BuildLogs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useApkBuilderStore } from '@/stores/apkBuilderStore';
import { useGitHubApi } from '@/hooks/useGitHubApi';
import { useBuildPolling } from '@/hooks/useBuildPolling';
import { Download, ExternalLink, Loader2, Rocket } from 'lucide-react';

const ApkBuilderPage = () => {
  const { step, setStep, analysis, isAnalyzing, isBuilding, downloadUrl } = useApkBuilderStore();
  const { analyze, fixAndBuild } = useGitHubApi();

  useBuildPolling();

  const handleBuild = async () => {
    if (!analysis) {
      const result = await analyze();
      if (!result) return;
    }
    await fixAndBuild();
  };

  return (
    <div className="pb-20">
      <PageHeader
        title="APK Builder"
        subtitle="Transformez votre PWA en APK Android"
      />

      <div className="px-4">
        <StepIndicator current={step} onStepClick={setStep} />

        {step === 0 && <RepoForm />}
        {step === 1 && <TokenInput />}
        {step === 2 && <AppConfig />}
        {step === 3 && (
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
                    Vous serez redirigé vers GitHub Actions pour télécharger l'artefact.
                  </p>
                </CardContent>
              </Card>
            )}

            <BuildLogs />
            <AIChat />
          </div>
        )}
      </div>
    </div>
  );
};

export default ApkBuilderPage;
