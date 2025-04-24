# 🧠 AI Script Generator with Ollama, Supabase & React

Ce projet est une application web complète qui permet aux utilisateurs de générer automatiquement des **scripts JavaScript** à partir d’une description textuelle, en utilisant un agent IA local basé sur **Ollama**. Les exemples sont stockés dans **Supabase** pour un entraînement contextuel.

## 🛠️ Stack technique

- 🧠 IA : [Ollama](https://ollama.com/) avec `codellama`
- 🔥 Frontend : React 18 + TypeScript + Tailwind CSS
- ⚙️ Backend : Node.js + Express
- 📦 Base de données : Supabase (PostgreSQL)
- 📡 API : RESTful
- 🧪 Entraînement IA : Vectorisation + comparaison sémantique (TensorFlow.js, USE)

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
Par défaut, l’API tourne sur : http://localhost:3001

3. Frontend – App React
bash
cd client
npm install
npm run dev
Frontend disponible sur : http://localhost:5173
