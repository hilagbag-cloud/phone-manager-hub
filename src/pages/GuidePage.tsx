import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ExternalLink } from 'lucide-react';
import { LINKS } from '@/lib/links';

const GuidePage = () => (
  <div className="pb-20">
    <PageHeader title="Guide" subtitle="Documentation et aide" />
    <div className="px-4 space-y-4">

      <Card>
        <CardHeader><CardTitle className="text-base">Exporter depuis Lovable vers GitHub</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-2">
          <ol className="list-decimal pl-4 space-y-1">
            <li>Dans l'éditeur Lovable, allez dans <strong>Paramètres du projet → GitHub</strong></li>
            <li>Cliquez sur <strong>Connect project</strong></li>
            <li>Autorisez l'application Lovable sur GitHub</li>
            <li>Choisissez votre compte et créez le dépôt</li>
          </ol>
          <a href={LINKS.lovableGithubDocs} target="_blank" rel="noopener noreferrer" className="text-primary underline text-xs inline-flex items-center gap-1">
            Documentation complète <ExternalLink className="h-3 w-3" />
          </a>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Créer un token GitHub</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-2">
          <ol className="list-decimal pl-4 space-y-1">
            <li>
              <a href={LINKS.githubTokenNew} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                Ouvrir la page de création <ExternalLink className="h-3 w-3 inline" />
              </a>
            </li>
            <li>Sélectionnez les droits <code className="bg-muted px-1 rounded">repo</code> et <code className="bg-muted px-1 rounded">workflow</code></li>
            <li>Cliquez sur <strong>Generate token</strong></li>
            <li>Copiez le token (il commence par <code className="bg-muted px-1 rounded">ghp_</code>)</li>
          </ol>
          <a href={LINKS.githubTokenDocs} target="_blank" rel="noopener noreferrer" className="text-primary underline text-xs inline-flex items-center gap-1">
            Aide officielle GitHub <ExternalLink className="h-3 w-3" />
          </a>
        </CardContent>
      </Card>

      <Accordion type="single" collapsible>
        <AccordionItem value="faq-1">
          <AccordionTrigger className="text-sm">Puis-je publier sur le Play Store ?</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground">
            L'APK générée est une version <strong>debug</strong>. Pour publier sur le Play Store, il faudra signer l'APK avec une clé de release. Cette fonctionnalité sera disponible dans une future mise à jour.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="faq-2">
          <AccordionTrigger className="text-sm">La compilation échoue, que faire ?</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground">
            Vérifiez les logs affichés dans l'application. Les erreurs les plus courantes sont : token expiré, dépôt privé sans accès, ou erreur de build JavaScript. Consultez les logs détaillés sur GitHub Actions en cliquant sur le lien fourni.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="faq-3">
          <AccordionTrigger className="text-sm">Mon application fonctionne-t-elle hors-ligne ?</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground">
            L'APK embarque les fichiers de votre application localement. Elle fonctionnera sans connexion Internet si votre app ne dépend pas d'API externes.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  </div>
);

export default GuidePage;
