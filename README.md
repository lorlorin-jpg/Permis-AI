# Permis AI — Préparez votre permis de conduire suisse avec l'IA

**Permis AI** est une application mobile complète pour préparer l'examen théorique du permis de conduire suisse. Elle combine une banque de questions officielle, des simulations d'examens réalistes et un assistant IA qui explique chaque règle de circulation en français, allemand ou italien.

---

## Fonctionnalités

- **Banque de questions** : Plus de 1 000 questions officielles couvrant tous les thèmes de l'examen théorique suisse (panneaux, priorités, autoroute, alcool, distances, conduite écologique, etc.)
- **Simulations d'examens** : 45 questions en 45 minutes, conditions réelles, score immédiat avec correction détaillée
- **Assistant IA (ChatGPT-powered)** : Posez vos questions en langage naturel, obtenez des explications claires avec exemples et mémo mnémotechniques
- **Progression gamifiée** : XP, niveaux, streaks journaliers, badges et classements
- **Mode hors-ligne** : Continuez à réviser sans connexion internet
- **Statistiques détaillées** : Suivez vos progrès par catégorie, identifiez vos points faibles
- **Freemium** : 2 examens gratuits par jour, accès illimité avec abonnement Premium (Stripe)

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Mobile | Expo / React Native (SDK 50), Expo Router, NativeWind |
| Backend | Next.js 14 (App Router + API Routes), TypeScript |
| Base de données | PostgreSQL via Supabase + Prisma ORM |
| Cache | Upstash Redis (rate limiting, sessions) |
| IA | OpenAI GPT-4o via Vercel AI SDK |
| Paiements | Stripe (abonnements mensuels/annuels) |
| Auth | Supabase Auth + JWT (jose) |
| État côté mobile | Zustand + TanStack Query |
| UI mobile | NativeWind (Tailwind CSS), React Native Reanimated, Gorhom Bottom Sheet |

---

## Structure du projet

```
Permis-AI/
├── apps/
│   ├── api/          # Backend Next.js 14 (API Routes, Server Actions)
│   └── mobile/       # Application Expo React Native
├── packages/
│   ├── shared/       # Types TypeScript et constantes partagés
│   └── ui/           # Composants UI partagés (futur dashboard web)
└── package.json      # Monorepo npm workspaces
```

---

## Prérequis

- Node.js >= 20
- npm >= 10
- Compte [Supabase](https://supabase.com) (base de données + auth)
- Compte [Upstash](https://upstash.com) (Redis)
- Compte [OpenAI](https://platform.openai.com) (API GPT-4o)
- Compte [Stripe](https://stripe.com) (paiements)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) pour le mobile

---

## Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/your-org/permis-ai.git
cd permis-ai
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
cp apps/api/.env.example apps/api/.env.local
```

Remplissez toutes les variables dans `apps/api/.env.local` (voir section ci-dessous).

### 4. Initialiser la base de données

```bash
cd apps/api
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. Lancer en développement

```bash
# Depuis la racine — lance api + mobile en parallèle
npm run dev

# Ou individuellement :
npm run dev:api      # Next.js sur http://localhost:3000
npm run dev:mobile   # Expo sur exp://localhost:8081
```

---

## Variables d'environnement

Créez `apps/api/.env.local` à partir de `apps/api/.env.example` :

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | URL de connexion Supabase (pooler) |
| `DIRECT_URL` | URL directe Supabase (pour migrations Prisma) |
| `SUPABASE_URL` | URL de votre projet Supabase |
| `SUPABASE_ANON_KEY` | Clé publique Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service Supabase (côté serveur uniquement) |
| `OPENAI_API_KEY` | Clé API OpenAI (GPT-4o) |
| `ANTHROPIC_API_KEY` | Clé API Anthropic (Claude, fallback) |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secret webhook Stripe |
| `STRIPE_PREMIUM_PRICE_ID` | ID du prix Stripe pour l'abonnement Premium |
| `NEXTAUTH_SECRET` | Secret JWT (générez avec `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | URL de l'API en production |
| `UPSTASH_REDIS_REST_URL` | URL REST Upstash Redis |
| `UPSTASH_REDIS_REST_TOKEN` | Token Upstash Redis |
| `NEXT_PUBLIC_APP_URL` | URL publique de l'app (ex: https://api.permis-ai.ch) |

---

## Déploiement

### API (Next.js) — Vercel

```bash
# Connecter à Vercel
npx vercel link

# Déployer
npx vercel --prod
```

Ajoutez toutes les variables d'environnement dans le dashboard Vercel.

### Mobile — EAS Build (Expo)

```bash
cd apps/mobile

# Installer EAS CLI
npm install -g eas-cli

# Configurer le projet
eas build:configure

# Build iOS
eas build --platform ios --profile production

# Build Android
eas build --platform android --profile production

# Soumettre aux stores
eas submit --platform ios
eas submit --platform android
```

### Webhooks Stripe

En production, configurez le webhook Stripe pour pointer vers :
`https://api.permis-ai.ch/api/webhooks/stripe`

Événements à écouter :
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

---

## Licence

Propriétaire — © 2024 Permis AI. Tous droits réservés.
