

# 🧠 Script Generator with Ollama + WP Framework

Ce projet est une application complète permettant de générer automatiquement des scripts d'automatisation Web à l'aide du framework `WP` et du modèle local `Ollama`.

## 🚀 Fonctionnalités

- 🧠 Génération de scripts basée sur des descriptions (prompt)
- 🧩 Utilise un modèle LLM local personnalisé (`script-generator`)
- 🛠 Framework WP pour automatiser des tâches web : clics, formulaires, navigation, etc.
- 💾 Stockage des scripts dans Supabase (optionnel)
- 📄 Export des résultats au format PDF
- ⚡ Interface moderne avec React + TypeScript


---

## 🚀 Lancement du projet

### 1. Cloner le repo

```bash
git clone https://github.com/ton-utilisateur/ollama-script-generator.git
cd ollama-script-generator ```
2. Backend – API Node + Ollama
   Installer les dépendances
bash
cd server
npm install
Lancer Ollama
bash
ollama start
Assure-toi que le modèle codellama est bien téléchargé :
bash
ollama run codellama
Démarrer l'API
bash
npm run dev
Par défaut, l’API tourne sur : http://localhost:5001

3. Frontend – App React
bash
cd client
npm install
npm run dev
Frontend disponible sur : http://localhost:5173
