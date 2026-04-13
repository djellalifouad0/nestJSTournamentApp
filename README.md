# Tournament Manager - Gestionnaire de Tournois de Jeux Video

API REST + Frontend pour la gestion de tournois de jeux video. Permet de creer des tournois, inscrire des joueurs, gerer les matchs et suivre les resultats en temps reel.

## Stack technique

- **Backend**: NestJS, TypeScript (strict mode), TypeORM, PostgreSQL
- **Frontend**: React, Vite, TypeScript, Tailwind CSS
- **Auth**: JWT avec Passport
- **Temps reel**: WebSocket (socket.io)
- **Documentation**: Swagger/OpenAPI
- **Containerisation**: Docker, Docker Compose

## Prerequis

- [Docker](https://docs.docker.com/get-docker/) et Docker Compose
- [Node.js 20+](https://nodejs.org/) (pour le developpement local sans Docker)

## Installation et lancement

### Mode developpement (avec Docker)

```bash
# Cloner le projet
git clone <url-du-repo>
cd tournament-nestJS

# Lancer tous les services (backend + frontend + PostgreSQL)
docker compose -f docker-compose.dev.yml up --build
```

Les services sont disponibles sur :
- **Backend API**: http://localhost:3000
- **Swagger docs**: http://localhost:3000/api/docs
- **Frontend**: http://localhost:5173

### Mode production (avec Docker)

```bash
docker compose -f docker-compose.prod.yml up --build
```

- **Backend API**: http://localhost:3000
- **Frontend**: http://localhost:80

### Mode developpement (sans Docker)

```bash
# 1. Installer les dependances backend
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env
# Modifier .env avec vos parametres PostgreSQL

# 3. Lancer le backend
npm run start:dev

# 4. Dans un autre terminal, installer et lancer le frontend
cd frontend
npm install
npm run dev
```

## Variables d'environnement

Voir `.env.example` :

| Variable | Description | Default |
|----------|-------------|---------|
| DB_HOST | Hote PostgreSQL | postgres |
| DB_PORT | Port PostgreSQL | 5432 |
| DB_USERNAME | Utilisateur PostgreSQL | postgres |
| DB_PASSWORD | Mot de passe PostgreSQL | postgres |
| DB_NAME | Nom de la base | tournament_db |
| JWT_SECRET | Cle secrete JWT | - |
| JWT_EXPIRATION | Duree du token (secondes) | 3600 |
| PORT | Port du backend | 3000 |

## Lancer les tests

```bash
# Tests unitaires (34 tests)
npm run test

# Tests d'integration E2E (42 tests)
npm run test:e2e

# Lint
npm run lint

# Build
npm run build
```

## Routes API

### Authentification

| Methode | Route | Description | Auth |
|---------|-------|-------------|------|
| POST | `/auth/register` | Inscription d'un joueur | Non |
| POST | `/auth/login` | Connexion (retourne JWT) | Non |

### Tournois

| Methode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/tournaments` | Liste des tournois (filtrable par `?status=`) | Non |
| POST | `/tournaments` | Creer un tournoi | Oui |
| GET | `/tournaments/:id` | Details d'un tournoi | Non |
| PUT | `/tournaments/:id` | Modifier un tournoi | Oui |
| DELETE | `/tournaments/:id` | Supprimer un tournoi | Oui |
| POST | `/tournaments/:id/join` | Rejoindre un tournoi | Oui |
| GET | `/tournaments/:id/matches` | Matchs d'un tournoi | Non |
| POST | `/tournaments/:id/generate-brackets` | Generer les brackets | Oui |

### Joueurs

| Methode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/players` | Liste des joueurs | Non |
| GET | `/players/:id` | Profil d'un joueur | Non |
| GET | `/players/:id/tournaments` | Tournois d'un joueur | Non |
| GET | `/players/:id/stats` | Statistiques d'un joueur | Non |

### Matchs

| Methode | Route | Description | Auth |
|---------|-------|-------------|------|
| POST | `/matches/:id/result` | Soumettre un resultat | Oui |

### Jeux

| Methode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/games` | Liste des jeux | Non |
| POST | `/games` | Ajouter un jeu | Admin |

### Statistiques

| Methode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/stats/leaderboard` | Classement global | Non |
| GET | `/tournaments/:id/standings` | Classement d'un tournoi | Non |

## Architecture du projet

```
tournament-nestJS/
  src/
    auth/              # Module authentification (JWT, Passport)
    tournaments/       # Module tournois (CRUD + WebSocket Gateway)
    players/           # Module joueurs
    matches/           # Module matchs
    games/             # Module jeux
    stats/             # Module statistiques (leaderboard, standings)
    brackets/          # Module brackets (generation single-elimination)
    common/            # Guards, Interceptors, Decorators
    main.ts            # Point d'entree (Swagger, ValidationPipe, etc.)
    app.module.ts      # Module racine
  test/                # Tests E2E
  frontend/            # Application React (Vite + Tailwind)
    src/
      api/             # Clients API (axios)
      context/         # AuthContext
      components/      # Composants reutilisables
      pages/           # Pages de l'application
      hooks/           # Hooks (WebSocket)
  Dockerfile           # Build multi-stage backend
  docker-compose.dev.yml
  docker-compose.prod.yml
```

## Documentation Swagger

Accessible sur `http://localhost:3000/api/docs` une fois le backend lance.

Tous les endpoints sont documentes avec :
- `@ApiTags` pour le groupement
- `@ApiOperation` pour la description
- `@ApiResponse` pour les codes de retour
- `@ApiBearerAuth` pour les routes authentifiees
- `@ApiProperty` sur tous les DTOs

## Fonctionnalites bonus

1. **WebSocket temps reel** : Notifications en temps reel (changement de statut, inscription, resultats)
2. **Systeme de brackets** : Generation automatique de brackets single-elimination avec gestion des byes
3. **Statistiques avancees** : Victoires, defaites, winrate, classement global
4. **Documentation Swagger** : API entierement documentee
5. **Tests unitaires** : Tests pour chaque service avec mocking TypeORM
