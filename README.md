# Rexel Store — Plateforme de Notification Multi-Canal

Projet de Fin d'Année (PFA) — Génie informatique. Système de notification événementiel (Push / Email / SMS) branché sur un mini e-commerce B2B : Spring Boot, Kafka, Axon Framework (CQRS), Keycloak, Angular. Conteneurisé (Docker) et orchestrable via Kubernetes.

## Fonctionnalités

- Boutique B2B : catalogue, commandes, demande de produit (client ↔ admin)
- Notifications déclenchées par événements Kafka, distribuées en Push (WebSocket temps réel), Email (Gmail SMTP, HTML) et SMS (Vonage)
- Historique et suivi de livraison géré en CQRS via Axon Framework
- Authentification unique (SSO) via Keycloak
- Espace admin : dashboard, statistiques, envoi manuel, gestion clients/commandes

## Stack technique

Spring Boot 3 / Java 21 · Axon Framework · Apache Kafka · Keycloak · PostgreSQL · Angular 19 · Tailwind CSS · Vonage (SMS) · Docker / Docker Compose · Kubernetes · GitHub Actions (CI)

## Démarrage rapide

### Avec Docker (recommandé)

```bash
cp .env.example .env   # renseigner GMAIL_USERNAME/GMAIL_APP_PASSWORD et VONAGE_API_KEY/VONAGE_API_SECRET
docker compose up --build
```

Démarre l'ensemble de la stack (Kafka, PostgreSQL, Keycloak, les deux backends et le front-end) en une seule commande :

| Service | Port |
|---|---|
| Front-end (Angular / nginx) | `:4200` |
| `rexel-mini-store` | `:8081` |
| `notification-service` | `:8080` |
| Kafka UI | `:8090` |
| Keycloak | `:8180` |
| PostgreSQL | `:5433` |

### En développement local

```bash
docker compose up -d kafka postgres keycloak   # infra seule

cd backend/notification-service && mvn spring-boot:run  # :8080
cd backend/rexel-mini-store && mvn spring-boot:run       # :8081

cd frontend/rexel-mini-store-frontend && npm install && npx ng serve   # :4200
```

Keycloak (`:8180`) doit être configuré une première fois (realm, clients, comptes).

Le canal Email nécessite un compte Gmail + [mot de passe d'application](https://myaccount.google.com/apppasswords) (`GMAIL_USERNAME`/`GMAIL_APP_PASSWORD`). Le canal SMS nécessite un compte [Vonage](https://developer.vonage.com/) (`VONAGE_API_KEY`/`VONAGE_API_SECRET`) — sans ces identifiants, les canaux correspondants échouent proprement (raison journalisée) sans bloquer les autres.

### Kubernetes

Manifests dans [`k8s/`](k8s/) (un `Deployment` + `Service` par composant). Testé sur le cluster intégré à Docker Desktop :

```bash
kubectl create secret generic pfa-secrets --from-literal=GMAIL_USERNAME=... --from-literal=GMAIL_APP_PASSWORD=... --from-literal=VONAGE_API_KEY=... --from-literal=VONAGE_API_SECRET=...
kubectl apply -f k8s/
kubectl port-forward svc/frontend 4200:80
```

## Comptes de démonstration

| Rôle | Username | Mot de passe |
|---|---|---|
| ADMIN | `admin` | `admin123` |
| USER | `john` | `john123` |

## Documentation

- API : Swagger UI sur chaque backend (`/swagger-ui/index.html`)
- Intégration continue : `.github/workflows/ci.yml` (compilation des 3 composants à chaque push/PR sur `main`)
