# Cahier des charges — Système de Notification Multi-Canal (`notification-service`)

> Cœur du PFA. `rexel-mini-store` (déjà construit) joue le rôle de générateur d'événements réels ; ce document couvre le service qui les reçoit, décide des canaux, et les distribue (Push / Email / SMS).

---

## 1. Contexte

Projet de Fin d'Année (PFA), stage de 2 mois chez SQLI, mission client Rexel France. Exercice académique isolé — jamais intégré à la vraie application Rexel. L'architecture est traitée "comme si" c'était des microservices, avec l'accord de l'encadrant.

Deux services composent le système :
- **`rexel-mini-store`** — mini e-commerce B2B simulant l'activité Rexel (construit, testé)
- **`notification-service`** — objet de ce document, **pas encore commencé**

Les deux communiquent uniquement via **Kafka** (topic `rexel.events`) et via une **voie manuelle directe** (formulaire admin). Ils n'ont **aucune identité partagée** (pas de SSO) : le seul lien entre un `StoreUser` (mini-store) et un `User` (notification-service) est l'**email**.

## 2. Objectifs

1. Consommer les événements métier publiés par `rexel-mini-store` sur Kafka
2. Décider automatiquement du/des canal(aux) selon le type et l'urgence de l'événement
3. Permettre à un ADMIN de déclencher une notification manuellement (utilisateur unique / groupe / diffusion générale)
4. Distribuer la notification sur les bons canaux : **Push** (temps réel), **Email**, **SMS**
5. Conserver un historique consultable (statut lu/non lu, filtrable par date/statut/canal)
6. Respecter la visibilité par rôle : un USER ne voit que ses notifications ciblées + les diffusions générales ; les alertes de stock restent réservées à l'ADMIN

## 3. Architecture générale

```
rexel-mini-store ──publie──▶ Kafka (topic: rexel.events) ──consomme──▶ notification-service
                                                                              │
Admin ──POST /admin/notifications (voie manuelle, sans Kafka)───────────────▶│
                                                                              │
                                                        ┌─────────────────────┼─────────────────────┐
                                                        ▼                     ▼                     ▼
                                                  Push (WebSocket)      Email (MailDev)        SMS (simulé)
```

*(Diagramme détaillé déjà produit séparément — cf. artifact partagé plus tôt dans la conversation.)*

## 4. Stack technique

| Composant | Choix |
|---|---|
| Backend | Spring Boot 3.x / Java 21 |
| Base de données | PostgreSQL (`pfa_notifications`, déjà créée dans `pfa-postgres`) |
| Messagerie asynchrone | **Kafka** (topic `rexel.events`, déjà en place dans `docker-compose.yml` — ⚠️ bascule RabbitMQ→Kafka décidée le 2026-07-11, **pas encore validée avec l'encadrant**, à rappeler en soutenance) |
| Temps réel | Spring WebSocket + STOMP |
| Authentification | JWT maison (BCrypt, rôles `ADMIN`/`USER`) — **réelle**, contrairement à l'auth simulée de `rexel-mini-store` |
| Email | Spring Mail (`JavaMailSender`) → **MailDev** en local (aucun vrai envoi, capture visible sur `http://localhost:1080`) |
| SMS | Simulation par défaut (log + historique) — intégration Twilio/Vonage possible plus tard si un compte est créé |
| Frontend | Angular, projet séparé `notification-frontend` (microfrontend), client WebSocket via RxStomp |

## 5. Modèle de données

**`User`**
| Champ | Type | Remarque |
|---|---|---|
| id | Long | |
| firstName / lastName | String | |
| email | String | identifiant de connexion + clé de corrélation avec `rexel-mini-store` |
| password | String | **hashé (BCrypt)**, contrairement au mini-store |
| role | enum `ADMIN` / `USER` | |

**`Notification`**
| Champ | Type | Remarque |
|---|---|---|
| id | Long | |
| recipientType | enum `USER` / `GROUP` / `BROADCAST` | |
| recipientEmail | String (nullable) | rempli si `USER`, sinon null pour `BROADCAST` |
| title | String | |
| message | String | |
| channels | Set&lt;enum `PUSH`/`EMAIL`/`SMS`&gt; | décidés automatiquement ou choisis par l'admin |
| priority | enum `LOW`/`NORMAL`/`HIGH` | dérivé de `urgency` pour les événements auto |
| sourceEventType | String (nullable) | ex: `ORDER_SUCCESS`, null si créée manuellement |
| read | boolean | par défaut `false` |
| createdAt | LocalDateTime | |

## 6. Contrat d'événement Kafka (rappel, déjà en place côté producteur)

```json
{
  "userId": "mohammed@rexel.com",
  "message": "Commande #12 confirmee pour Disjoncteur 16A (quantite: 1)",
  "type": "ORDER_SUCCESS",
  "urgency": "normal"
}
```

`userId` = email du client (pas d'ID numérique, cf. section 1).

## 7. Règles métier — décision de canal (V1 : logique en dur en Java)

| Événement | Canaux | Visibilité |
|---|---|---|
| `ORDER_SUCCESS` | Push + Email | USER concerné uniquement |
| `LOW_STOCK_ALERT` | Email seul | **ADMIN uniquement**, jamais visible USER |
| Diffusion manuelle (admin) | Choix libre Push/Email/SMS | USER ciblé / groupe / tous |

**Progression Kafka** :
- **V1 (à faire en premier)** : un seul topic `rexel.events`, `notification-service` lit `type`/`urgency` et décide en Java quel(s) canal(aux) déclencher.
- **V2 (plus tard, pas validée)** : plusieurs topics dédiés par type d'événement — à ne pas commencer avant que V1 soit stable.

## 8. Sécurité

- JWT signé (durée de vie à définir, ex: 2h), filtre Spring Security sur chaque requête
- Mots de passe hashés avec BCrypt
- Comptes **pré-remplis via `data.sql`** (pas d'inscription libre — cohérent avec la décision prise pour l'auth du mini-store, où l'inscription libre avait du sens ; ici les destinataires sont connus à l'avance)
- Rôles : `ADMIN` (accès à l'envoi manuel + historique complet), `USER` (accès à ses propres notifications + diffusions)

## 9. Endpoints REST prévus

| Méthode | Endpoint | Rôle | Description |
|---|---|---|---|
| POST | `/api/auth/login` | public | Connexion, retourne un JWT |
| GET | `/api/notifications/me` | USER | Ses notifications ciblées + diffusions générales |
| PATCH | `/api/notifications/{id}/read` | USER | Marquer comme lue |
| POST | `/api/admin/notifications` | ADMIN | Création manuelle (destinataire, canaux, titre, message, priorité) |
| GET | `/api/admin/notifications` | ADMIN | Historique complet, filtrable par date/statut/canal |

## 10. WebSocket (canal Push)

- Endpoint STOMP (ex: `/ws`), poignée de main authentifiée par JWT
- Un utilisateur connecté s'abonne à sa propre file (ex: `/user/queue/notifications`)
- Point d'attention Kubernetes (déjà noté) : sticky sessions ou relais nécessaire si plusieurs réplicas de `notification-service` tournent en parallèle

## 11. Canaux d'envoi — détails d'implémentation

- **Push** : `SimpMessagingTemplate.convertAndSendToUser(email, "/queue/notifications", payload)`
- **Email** : `JavaMailSender`, template texte simple, SMTP pointé vers le conteneur MailDev (à ajouter dans `docker-compose.yml`)
- **SMS** : interface `SmsSender` avec une implémentation par défaut qui logge + enregistre dans l'historique sans appel réseau réel (même logique que la simulation de paiement du mini-store)

## 12. Frontend `notification-frontend` (Angular, nouveau projet séparé)

- Page de connexion (vraie, avec JWT cette fois)
- **Côté USER** : cloche de notifications (badge non-lues), liste, marquer comme lu
- **Côté ADMIN** : formulaire d'envoi manuel (type de destinataire dynamique, canaux, titre, message, priorité) + tableau d'historique filtrable (date / statut / canal)
- Client WebSocket (RxStomp) pour la réception en temps réel

---

## 13. Plan de réalisation — étape par étape

> Rappel méthode de travail : **un fichier à la fois**, explication avant écriture, confirmation avant de passer au suivant (contrairement au rythme rapide utilisé pour `rexel-mini-store`).

### Phase 1 — Socle du projet
1. `pom.xml` (web, security, data-jpa, validation, postgresql, kafka, mail, websocket, lombok)
2. `application.yml` (Postgres `pfa_notifications`, Kafka `localhost:9092`, config JWT, config mail)
3. Entités `User`, `Role` (enum), `Notification`, `RecipientType` (enum), `Channel` (enum), `Priority` (enum)
4. `data.sql` (comptes de démo ADMIN + USER)

### Phase 2 — Authentification réelle (JWT)
5. `UserRepository`, `NotificationRepository`
6. `JwtService` (génération / validation de token)
7. `SecurityConfig` (filtre JWT, règles d'accès par rôle)
8. `AuthController` + DTOs (login)

### Phase 3 — Ingestion des événements Kafka
9. `RexelEvent` (DTO miroir du contrat JSON)
10. Config consommateur Kafka (`application.yml` + éventuelle classe de config)
11. `NotificationEventListener` (`@KafkaListener`, topic `rexel.events`)
12. `ChannelDecisionService` (règles V1 : `if/else` selon `type`/`urgency`)

### Phase 4 — Persistence et consultation
13. `NotificationService` (création, marquage lu, recherche par destinataire/rôle)
14. `NotificationController` (`GET /api/notifications/me`, `PATCH /api/notifications/{id}/read`)

### Phase 5 — Voie manuelle admin
15. `AdminNotificationController` (`POST /api/admin/notifications`)
16. Réutilisation de `NotificationService` pour la création + dispatch

### Phase 6 — Canal Push (temps réel)
17. `WebSocketConfig` (endpoint STOMP, authentification de la poignée de main)
18. `PushNotificationSender`

### Phase 7 — Canal Email
19. Ajout du service `maildev` dans `docker-compose.yml`
20. `EmailNotificationSender`

### Phase 8 — Canal SMS
21. `SmsNotificationSender` (simulation : log + historique)

### Phase 9 — Historique admin
22. `AdminNotificationController` — ajout de l'endpoint `GET` avec filtres (date/statut/canal)

### Phase 10 — Frontend `notification-frontend`
23. Structure Angular + routing (login, espace user, espace admin)
24. `AuthService` + guards (réutilisation du pattern déjà validé sur le mini-store)
25. Client WebSocket (RxStomp) + service de notifications temps réel
26. Composant cloche + liste de notifications (USER)
27. Composant formulaire d'envoi manuel (ADMIN)
28. Composant tableau d'historique filtrable (ADMIN)

### Phase 11 — Vérification de bout en bout
29. Test : commande sur `rexel-mini-store` → événement Kafka visible dans Kafka UI → notification créée → push reçu en temps réel + email visible dans MailDev
30. Test : envoi manuel admin → visible côté destinataire concerné

---

## 14. Points ouverts / à confirmer plus tard

- Bascule Kafka non validée avec l'encadrant — à mentionner en soutenance
- Fournisseur SMS réel si besoin un jour (Twilio vs Vonage) — hors scope immédiat, simulation suffit
- CI/CD et déploiement Kubernetes — hors scope de cette phase, prévu plus tard dans le projet
