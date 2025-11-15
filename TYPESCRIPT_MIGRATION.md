# Migration TypeScript - OPM-Bot

## 📋 Changements effectués

Le projet a été migré vers TypeScript avec les modifications suivantes :

### 1. Dépendances ajoutées
- `typescript` - Compilateur TypeScript
- `ts-node` - Exécution directe de fichiers TypeScript
- `@types/node` - Types pour Node.js
- `@types/sqlite3` - Types pour SQLite3

### 2. Fichiers de configuration
- **`tsconfig.json`** - Configuration du compilateur TypeScript
- **`types.d.ts`** - Déclarations de types pour l'API Clash Royale et les types globaux
- **`nodemon.json`** - Mis à jour pour surveiller les fichiers `.ts`
- **`.gitignore`** - Ajout de `dist/` et `*.js.map`

### 3. Fichiers convertis
- ✅ **`OPM-Stats.ts`** - Fichier principal converti en TypeScript
- ✅ **`commands/ffplayer.ts`** - Commande ffplayer convertie en TypeScript

### 4. Scripts npm mis à jour

```json
{
  "start": "ts-node OPM-Stats.ts",           // Démarrage avec ts-node
  "dev": "nodemon --exec ts-node OPM-Stats.ts", // Mode développement
  "build": "tsc",                             // Compilation TypeScript → JavaScript
  "start:prod": "node dist/OPM-Stats.js"     // Démarrage en production (après build)
}
```

## 🚀 Utilisation

### Développement (avec TypeScript directement)
```bash
npm run dev
```
ou
```bash
npm start
```

### Production (compilation puis exécution)
```bash
# 1. Compiler TypeScript → JavaScript
npm run build

# 2. Exécuter le JavaScript compilé
npm run start:prod
```

## 📁 Structure du projet

```
OPM-Bot/
├── OPM-Stats.ts          # Fichier principal (TypeScript)
├── OPM-Stats.js          # Ancien fichier (peut être supprimé)
├── types.d.ts            # Déclarations de types
├── tsconfig.json         # Configuration TypeScript
├── dist/                 # Dossier de compilation (généré par tsc)
│   └── ...
├── commands/
│   ├── ffplayer.ts       # Commande en TypeScript
│   └── *.js              # Autres commandes (JavaScript pour l'instant)
├── events/
│   └── *.js              # Events (JavaScript pour l'instant)
└── utils/
    └── *.js              # Utilitaires (JavaScript pour l'instant)
```

## 🔄 Migration progressive

Le projet peut fonctionner avec un **mélange de fichiers TypeScript et JavaScript** :
- Les fichiers `.ts` sont chargés directement par `ts-node`
- Les fichiers `.js` continuent de fonctionner normalement
- Vous pouvez migrer les autres fichiers progressivement

### Pour convertir d'autres fichiers :
1. Renommer `.js` → `.ts`
2. Ajouter les types nécessaires
3. Utiliser `import` au lieu de `require` (recommandé)
4. Vérifier la compilation avec `npx tsc --noEmit`

## 📝 Types disponibles

Le fichier `types.d.ts` contient les interfaces pour :
- `Player` - Joueur Clash Royale
- `Clan` - Clan Clash Royale
- `Card` - Carte du jeu
- `ClashRoyaleAPI` - Interface de l'API
- `RegisteredClan` - Clans enregistrés dans la base de données

## ⚙️ Configuration TypeScript

Le `tsconfig.json` est configuré pour :
- Target : **ES2022**
- Module : **CommonJS** (compatible avec Node.js)
- Strict mode : **Activé** (typage strict)
- Source maps : **Activés** (pour le débogage)
- Output : **dist/** (compilation)

## 🐛 Débogage

Pour déboguer avec les source maps :
1. Compiler avec `npm run build`
2. Les fichiers `.js.map` permettent de mapper le code compilé vers le TypeScript original

## 📌 Notes importantes

- Les fichiers `.js` existants continuent de fonctionner
- Le bot charge automatiquement les fichiers `.ts` et `.js` dans `commands/` et `events/`
- En production, il est recommandé de compiler (`npm run build`) puis d'exécuter le JavaScript (`npm run start:prod`) pour de meilleures performances
