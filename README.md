# 🧠 Script Generator – Générateur de scripts automatisés intelligents

Ce projet permet de **générer automatiquement des scripts d'automatisation Web** (ex. : login, upload, envoi d'e-mails…) à partir de **descriptions en langage naturel**, grâce à un agent IA local basé sur **Ollama**, **Supabase** et **un framework personnalisé** appelé `WP`.

---

## 🚀 Fonctionnalités

- 📝 Génération automatique de scripts JS à partir de descriptions
- 🤖 Agent IA local via Ollama (modèle personnalisé basé sur `codellama`)
- 📦 Base de données Supabase (stockage des scripts, matching vectoriel)
- 🌐 Interface frontend React + Tailwind CSS
- 🔧 Backend Express.js
- 📁 Téléchargement de PDF + copie des scripts générés
- ✅ Système de référence de scripts pour affiner la génération

---

## 📁 Structure du projet

myapp/
├── /src/ # Frontend React (Vite)
│ ├── components/ # Composants UI (ScriptOutput, AuthForm, etc.)
│ └── lib/ # Connexion Supabase + Ollama
├── /server/ # Backend Express.js
│ └── index.js # Point d’entrée serveur
├── /scripts/ # Scripts d’import, tests, etc.
├── /supabase/ # Migrations SQL
├── Modelfile # Modèle personnalisé pour Ollama
└── README.md

yaml
Copier
Modifier

---

## ⚙️ Installation

### 1. Cloner le projet

```bash
git clone https://github.com/<ton-nom>/script-generator.git
cd script-generator
2. Installer les dépendances
bash
Copier
Modifier
npm install
3. Lancer le backend et le frontend
bash
Copier
Modifier
npm run dev
Cette commande lance :

🔙 server/index.js (Express)

🔛 vite (React frontend)

🧠 Modèle IA (Ollama)
Tu dois avoir Ollama installé localement, avec un modèle personnalisé basé sur codellama.

Exemple de commande :
bash
Copier
Modifier
ollama create script-generator -f ./Modelfile
ollama run script-generator
🗃️ Supabase (Base de données)
Créer un projet sur supabase.com puis :

Ajouter les scripts de migration via /supabase/migrations/*.sql

Récupérer les variables d’environnement :

env
Copier
Modifier
SUPABASE_URL=...
SUPABASE_KEY=...
🔍 Exemples de tests
Tu peux tester avec des descriptions comme :

txt
Copier
Modifier
Nom : SendEmailOutlook
Description : Se connecter à Outlook, rédiger un e-mail avec pièce jointe et l’envoyer.
✨ À venir
Authentification OAuth Supabase

Version mobile responsive

Historique des générations

Personnalisation avancée du modèle IA

🤝 Contribuer
Les contributions sont les bienvenues ! Tu peux :

Proposer des exemples de scripts

Améliorer le prompt ou la base de données

Ajouter des fonctions dans le framework WP
