# Puter.com AI Module

Module d'intégration de **Puter.com AI** avec **Function Calling** pour Phone Manager Pro. Permet à l'IA d'agir de manière autonome sur les dépôts GitHub.

## 🚀 Capacités

L'IA peut :
- **Lire** le code et les fichiers du dépôt
- **Analyser** les logs des workflows GitHub Actions
- **Créer/Modifier** des fichiers dans le dépôt
- **Forker** le dépôt
- **Déclencher** des workflows GitHub Actions
- **Vérifier** le statut des builds APK
- **Créer** des pull requests

## 📁 Structure

```
puter/
├── puterAiClient.ts       # Wrapper pour puter.ai.chat()
├── puterTools.ts          # Définitions des tools (JSON Schema)
├── puterGithubTools.ts    # Implémentation des tools
├── puterAiAgent.ts        # Orchestration de l'agent IA
├── index.ts               # Exports principaux
└── README.md              # Cette documentation
```

## 🔧 Tools disponibles

### Lecture
- `read_repo_file` - Lire un fichier du dépôt
- `list_repo_files` - Lister les fichiers
- `read_repo_logs` - Consulter les logs des workflows
- `get_repo_info` - Obtenir les infos du dépôt
- `check_missing_files` - Vérifier les fichiers manquants

### Écriture
- `create_or_update_file` - Créer ou modifier un fichier
- `create_new_file` - Créer un fichier avec template
- `create_pull_request` - Créer une pull request

### Workflows
- `trigger_workflow` - Déclencher un workflow GitHub Actions
- `get_build_status` - Vérifier le statut du build
- `fork_repo` - Forker le dépôt

### Analyse
- `analyze_error` - Analyser une erreur de build

## 💻 Utilisation

### 1. Charger Puter.js

```typescript
import { loadPuterLibrary, isPuterLoaded } from '@/lib/puter';

// Au démarrage de l'app
const loaded = await loadPuterLibrary();
if (loaded) {
  console.log('Puter.js chargé');
}
```

### 2. Créer une session d'agent

```typescript
import { createAgentSession, runAiAgent } from '@/lib/puter';
import { parseRepoUrl } from '@/lib/githubClient';

const repoInfo = parseRepoUrl('https://github.com/owner/repo');
const session = createAgentSession(repoInfo, 'gpt-5.4-nano');

const result = await runAiAgent(
  session,
  'Analyse le dépôt et corrige les erreurs de build',
  {
    maxIterations: 10,
    toolCategories: ['all'],
    onAction: (action) => {
      console.log(`Action: ${action.type}`, action);
    },
  }
);
```

### 3. Streaming (pour l'UI)

```typescript
import { runAiAgentStreaming } from '@/lib/puter';

for await (const action of runAiAgentStreaming(session, prompt)) {
  if (action.type === 'tool_call') {
    console.log(`Tool: ${action.tool_name}`);
    console.log(`Result: ${action.tool_result}`);
  } else if (action.type === 'response') {
    console.log(`AI: ${action.message}`);
  }
}
```

### 4. Appel direct à l'IA

```typescript
import { callPuterAI, ALL_PUTER_TOOLS } from '@/lib/puter';

const response = await callPuterAI(
  'Quels sont les fichiers manquants?',
  {
    model: 'gpt-5.4-nano',
    tools: ALL_PUTER_TOOLS,
  }
);

if (response.message.tool_calls) {
  // L'IA veut appeler des outils
  for (const toolCall of response.message.tool_calls) {
    console.log(`Tool: ${toolCall.function.name}`);
  }
} else {
  // Réponse texte directe
  console.log(response.message.content);
}
```

## 🎯 Cas d'usage

### Analyse et correction automatique

```typescript
const prompt = `Analyse ce dépôt et corrige automatiquement les problèmes:
1. Vérifie les fichiers manquants
2. Consulte les logs des workflows
3. Crée les fichiers nécessaires
4. Déclenche un nouveau build`;

const result = await runAiAgent(session, prompt, {
  maxIterations: 15,
  toolCategories: ['all'],
});
```

### Préparation pour la compilation APK

```typescript
const prompt = `Prépare ce dépôt pour la compilation APK:
1. Vérifie capacitor.config.json
2. Vérifie android/app/build.gradle
3. Crée les fichiers manquants
4. Vérifie le workflow GitHub Actions`;

const result = await runAiAgent(session, prompt, {
  toolCategories: ['read', 'write'],
});
```

### Analyse des erreurs

```typescript
const prompt = `Analyse ces erreurs de build et propose des corrections:
${errorLogs}`;

const result = await runAiAgent(session, prompt, {
  toolCategories: ['read', 'write'],
});
```

## 🔐 Sécurité

- Les outils GitHub utilisent le token GitHub de l'utilisateur (déjà authentifié)
- Les appels à Puter.ai.chat() utilisent le modèle user-pays (l'utilisateur paie ses crédits)
- Pas de backend nécessaire (frontend-only)
- Les outils sont limités aux opérations sur le dépôt

## 📊 Modèles disponibles

Puter supporte 500+ modèles :
- **OpenAI** : gpt-5.4-nano, gpt-5.2-chat, etc.
- **Google** : gemini-2.5-flash-lite, etc.
- **Anthropic** : Claude 3 models
- **xAI**, **Mistral**, **DeepSeek**, **OpenRouter**

## 🐛 Débogage

### Vérifier la connexion Puter

```typescript
import { testPuterConnection } from '@/lib/puter';

const connected = await testPuterConnection();
console.log('Puter connected:', connected);
```

### Voir les actions de l'agent

```typescript
const { actions } = getSessionSummary(session);
actions.forEach(action => {
  console.log(`[${action.timestamp}] ${action.type}`, action);
});
```

### Logs détaillés

```typescript
for await (const action of runAiAgentStreaming(session, prompt)) {
  console.log(JSON.stringify(action, null, 2));
}
```

## 📚 Ressources

- [Puter.com Documentation](https://docs.puter.com/)
- [puter.ai.chat() API](https://docs.puter.com/AI/chat/)
- [Function Calling Guide](https://docs.puter.com/AI/chat/#function-calling)
- [Puter Models List](https://docs.puter.com/AI/listModels/)

## 🔄 Flux d'exécution

```
Utilisateur
    ↓
Prompt → runAiAgent()
    ↓
buildSystemPrompt() + messages
    ↓
callPuterAIWithHistory()
    ↓
Puter AI (500+ modèles)
    ↓
Response avec tool_calls?
    ├─ OUI → executeTool() → Octokit/GitHub API
    │         ↓
    │         Ajouter résultat aux messages
    │         ↓
    │         Boucle (max 10 itérations)
    │
    └─ NON → Réponse finale
             ↓
             Utilisateur
```

## 🚀 Prochaines étapes

- [ ] Intégrer PuterAIChat.tsx dans l'interface
- [ ] Tester avec des cas réels
- [ ] Ajouter des templates de prompts
- [ ] Implémenter la persistance des sessions
- [ ] Ajouter des webhooks GitHub pour les notifications
- [ ] Créer des workflows pré-configurés
