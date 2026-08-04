# Rexel Mini Store — Plateforme de Notification Multi-Canal

Projet de Fin d'Année (PFA) — ISIBD. Système de notification événementiel (Push / Email / SMS) branché sur un mini e-commerce B2B : Spring Boot, Kafka, Axon Framework (CQRS), Keycloak, Angular.

> Exercice académique isolé — non affilié ni intégré à la véritable plateforme Rexel.

## Fonctionnalités

- Boutique B2B : catalogue, commandes, demande de produit (client ↔ admin)
- Notifications déclenchées par événements Kafka, distribuées en Push (temps réel) et Email (Gmail SMTP)
- Historique et suivi de livraison géré en CQRS via Axon Framework
- Authentification unique (SSO) via Keycloak
- Espace admin : dashboard, statistiques, gestion clients/commandes

## Stack technique

Spring Boot 3 / Java 21 · Axon Framework · Apache Kafka · Keycloak · PostgreSQL · Angular 19 · Tailwind CSS

## Démarrage rapide

```bash
docker compose up -d                                   # Kafka, Postgres, Keycloak

cd backend/notification-service && mvn spring-boot:run  # :8080
cd backend/rexel-mini-store && mvn spring-boot:run       # :8081

cd frontend/rexel-mini-store-frontend && npm install && npx ng serve   # :4200
```

Keycloak (`:8180`) doit être configuré une première fois (realm, clients, comptes) — détails dans [`rapport-avancement-pfa.md`](rapport-avancement-pfa.md).

Le canal Email nécessite un compte Gmail + [mot de passe d'application](https://myaccount.google.com/apppasswords), exposé via `GMAIL_USERNAME`/`GMAIL_APP_PASSWORD`.

## Comptes de démonstration

| Rôle | Username | Mot de passe |
|---|---|---|
| ADMIN | `admin` | `admin123` |
| USER | `john` | `john123` |

## Documentation

- API : Swagger UI sur chaque backend (`/swagger-ui/index.html`)
- Conception détaillée, architecture, phases : [`rapport-avancement-pfa.md`](rapport-avancement-pfa.md)
