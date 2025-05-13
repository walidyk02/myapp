# Script Generator - Documentation Technique

## 📋 Vue d'ensemble du projet

Script Generator est une application web moderne qui utilise l'IA pour générer automatiquement des scripts d'automatisation web. Le projet combine des technologies de pointe pour offrir une solution robuste et flexible.

## 🏗️ Architecture du Projet

```
myapp/
├── script-generator/     # Configuration du modèle IA
│   └── Modelfile        # Configuration CodeLlama
├── server/              # Backend Express
│   ├── index.js        # Serveur principal
│   └── supabase.js     # Intégration BDD
├── src/                 # Frontend React
│   ├── App.tsx         # Application principale
│   └── components/     # Composants UI
└── package.json        # Dépendances
```

## 🛠️ Stack Technique

### Frontend
- React avec TypeScript
- Vite pour le bundling
- Tailwind CSS pour le styling
- React Hot Toast pour les notifications

### Backend
- Express.js
- Supabase pour la persistance
- Ollama pour l'IA
- Gestion d'erreurs robuste

### IA et Automatisation
- CodeLlama 7B comme modèle de base
- Framework WP personnalisé
- Système de prompting avancé

## 🤖 Composants Principaux

### 1. Modèle IA (Modelfile)
```
FROM codellama:7b-instruct-q4_0

PARAMETER temperature 0.5
PARAMETER top_p 0.95
```

### 2. Framework d'Automatisation (WP)

#### Timing & Contrôle
- `randomNumber(min, max)`: Génération de nombres aléatoires
- `wait(seconds)`: Attente fixe
- `randomWait(min, max)`: Attente aléatoire

#### Interactions Web
- `typeText({ selector, type }, text)`: Saisie de texte
- `clickElement({ selector, type })`: Actions de clic
- `checkElement({ selector, type })`: Validation d'éléments

#### Logging & Erreurs
- `logMessage(message)`: Journalisation
- Gestion d'erreurs intégrée

### 3. API Backend

#### Routes Principales
- `/api/generate`: Génération de scripts
- `/api/status`: État du système
- `/api/healthcheck`: Vérification de santé

#### Exemple de Génération
```javascript
app.post('/api/generate', async (req, res) => {
  const { name, description } = req.body;
  const { prompt, examples } = await generatePrompt(name, description);
  // Génération via Ollama
  // Validation et stockage
});
```

## 🔄 Flux de Travail

1. **Requête Utilisateur**
   - Nom du script
   - Description de l'automatisation

2. **Génération du Prompt**
   - Récupération des exemples
   - Intégration du core code
   - Construction du contexte

3. **Génération IA**
   - Utilisation de CodeLlama
   - Application des paramètres optimisés
   - Validation du résultat

4. **Stockage et Retour**
   - Sauvegarde dans Supabase
   - Retour du script généré
   - Logging des résultats

## 📊 Exemple de Script Généré

```javascript
try {
    await WP.logMessage("🚀 Démarrage");

    const selectors = {
        searchInput: { selector: "//input[@name='search']", type: types.xpath },
        submitBtn: { selector: "#submit", type: types.selector }
    };

    await WP.gotoURL("https://example.com");
    await WP.randomWait(2, 4);

    await WP.typeTextByXpath(selectors.searchInput.selector, "recherche");
    await WP.randomWait(1, 2);

    await WP.clickElementBySelector(selectors.submitBtn.selector);
    await WP.logMessage("✅ Recherche effectuée");

} catch (error) {
    await WP.logMessage(`❌ Erreur: ${error.message}`);
}
```

## 🔒 Sécurité et Validation

- Validation des scripts générés
- Gestion des erreurs complète
- Sécurisation des appels API
- Logging détaillé

## 📈 Points Forts

1. **IA Avancée**
   - Modèle CodeLlama optimisé
   - Système de prompting intelligent
   - Apprentissage continu

2. **Architecture Robuste**
   - Séparation claire des responsabilités
   - Code modulaire et maintenable
   - Tests et validation intégrés

3. **Expérience Utilisateur**
   - Interface intuitive
   - Feedback en temps réel
   - Documentation complète

## 🔄 Cycle de Développement

1. **Développement**
   - Vite pour le développement rapide
   - Hot reloading
   - TypeScript pour la sécurité du code

2. **Tests**
   - Validation des scripts
   - Tests d'intégration
   - Monitoring des performances

3. **Déploiement**
   - Configuration simple
   - Déploiement automatisé
   - Monitoring en production

## 📚 Utilisation des Utilitaires

### Timing
```javascript
await WP.randomWait(2, 4);     // Attente aléatoire
await WP.wait(2);              // Attente fixe
```

### Interactions
```javascript
await WP.typeText(selector, "texte");
await WP.clickElement(selector);
```

### Validation
```javascript
if (await WP.checkElement(selector)) {
    // Élément trouvé
}
```

## 🔜 Évolutions Futures

1. **Améliorations IA**
   - Modèles plus performants
   - Meilleure personnalisation
   - Apprentissage continu

2. **Nouvelles Fonctionnalités**
   - Plus d'actions automatisées
   - Interface améliorée
   - Nouveaux types de scripts

3. **Optimisations**
   - Performance accrue
   - Meilleure gestion mémoire
   - Scalabilité améliorée

## 📝 Conclusion

Script Generator représente une solution innovante combinant IA et automatisation web. Son architecture moderne et sa facilité d'utilisation en font un outil puissant pour la génération de scripts d'automatisation.
