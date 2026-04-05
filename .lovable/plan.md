
## Plan: Refonte APK Builder - Persistance, Auto-Update & UX

### 1. Persistance des données (Dexie/IndexedDB)
- Stocker token GitHub, config IA, config app, historique de builds dans IndexedDB via Dexie
- Restaurer automatiquement au lancement
- Chiffrement léger du token (obfuscation base64 + préfixe)

### 2. Sélection de repos GitHub via API
- Remplacer le champ URL par un flow : entrer token → lister les repos (publics + privés) → sélectionner
- Utiliser `octokit.repos.listForAuthenticatedUser()` avec pagination
- Barre de recherche/filtre sur les repos
- Auto-générer le package ID depuis owner/repo

### 3. Modèles IA dynamiques
- Interroger l'API du fournisseur pour lister les modèles disponibles (`/v1/models`)
- Remplacer le champ texte par un Select avec les modèles récupérés
- Fallback sur les modèles par défaut si l'API ne répond pas

### 4. Auto-update de l'APK
- Configurer `capacitor.config.ts` avec `server.url` pointant vers l'URL de production
- L'APK charge toujours la dernière version publiée depuis `https://phone-central-hub.lovable.app/`
- Pas besoin de re-télécharger l'APK pour chaque mise à jour

### 5. Logs détaillés et gestion d'erreurs
- Enrichir les logs avec des liens cliquables vers GitHub Actions
- Afficher les erreurs de manière structurée avec bouton "Corriger" qui redirige vers la section appropriée
- Catégoriser les erreurs (token, repo, build, workflow)

### 6. Permissions token GitHub
- Guider l'utilisateur pour créer un token avec les scopes nécessaires : `repo`, `workflow`, `read:org`
- Valider les scopes du token via l'API et afficher les permissions manquantes
- Lien direct vers la page de création de token avec les bons scopes pré-cochés

### 7. Centrer l'app sur APK Builder
- Faire de la page APK Builder la page d'accueil
- Simplifier la navigation

### Fichiers à modifier/créer
- `src/lib/storage.ts` (nouveau - persistance Dexie)
- `src/lib/aiClient.ts` (ajouter fetch modèles)
- `src/stores/apkBuilderStore.ts` (persistance)
- `src/components/apk-builder/RepoSelector.tsx` (nouveau - sélection repos)
- `src/components/apk-builder/AISettings.tsx` (modèles dynamiques)
- `src/components/apk-builder/TokenInput.tsx` (validation scopes)
- `src/components/apk-builder/BuildLogs.tsx` (logs enrichis)
- `src/pages/ApkBuilderPage.tsx` (refonte étapes)
- `src/App.tsx` (route par défaut)
- `capacitor.config.ts` (auto-update)
