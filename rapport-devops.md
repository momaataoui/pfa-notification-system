# Plan DevOps — Docker / Kubernetes / CI-CD

*Créé le 2026-08-04.*

> Périmètre non demandé explicitement par l'encadrant à l'origine, mais cohérent avec le stack cible annoncé dès le début du projet (Kubernetes mentionné dans les spécifications initiales — voir `rapport-avancement-pfa.md` section 4).

## 1. Pourquoi cette partie

Aujourd'hui, faire tourner le projet exige d'installer Java 21 + Maven, Node + Angular CLI, et de lancer 4 commandes manuelles dans des terminaux séparés (Docker Compose pour l'infra, `mvn spring-boot:run` ×2, `ng serve`). L'objectif du DevOps est double :

1. **Reproductibilité** : n'importe qui (encadrant, jury, futur développeur) doit pouvoir lancer tout le système avec une seule commande, sans installer d'outillage de développement sur sa machine.
2. **Démonstration de compétences** : conteneurisation, orchestration et intégration continue sont des compétences attendues dans un cursus ISIBD, et souvent valorisées en soutenance indépendamment du fonctionnel.

## 2. Étape A — Dockerfiles par composant

Un `Dockerfile` multi-stage pour chacun des 3 composants applicatifs (l'infra — Postgres/Kafka/Keycloak — utilise déjà des images officielles toutes prêtes, pas besoin de Dockerfile custom) :

| Composant | Image de build | Image finale | Pourquoi multi-stage |
|---|---|---|---|
| `notification-service` | `maven:3.9-eclipse-temurin-21` | `eclipse-temurin:21-jre-alpine` | L'image de build contient Maven + le JDK complet (~500 Mo) pour compiler ; l'image finale ne garde que le `.jar` déjà compilé sur un JRE minimal (quelques dizaines de Mo) — inutile d'embarquer l'outillage de compilation en production |
| `rexel-mini-store` | `maven:3.9-eclipse-temurin-21` | `eclipse-temurin:21-jre-alpine` | Même principe |
| `rexel-mini-store-frontend` | `node:20-alpine` | `nginx:alpine` | Angular produit des fichiers statiques (HTML/JS/CSS) après `ng build` — inutile d'embarquer Node en production, `nginx` sert juste ces fichiers |

**✅ Statut (2026-08-10) : terminée.** Les 3 `Dockerfile` (multi-stage, un par composant) + leurs `.dockerignore` sont écrits, et chaque image a été construite avec succès (`docker build`) : `notification-service` (166 Mo), `rexel-mini-store` (151 Mo), `rexel-frontend` (27,4 Mo, servi par nginx avec un `nginx.conf` dédié pour le routing Angular côté client).

## 3. Étape B — Intégration dans `docker-compose.yml`

Étendre le `docker-compose.yml` existant (qui ne contient aujourd'hui que Postgres/Kafka/Kafka UI/Keycloak) pour y ajouter les 3 services applicatifs, avec leurs variables d'environnement adaptées au réseau Docker interne (ex: `spring.datasource.url` pointant vers le nom de service `postgres` au lieu de `localhost:5433`, `issuer-uri` vers `keycloak` au lieu de `localhost:8180`). Objectif final : `docker compose up --build` démarre tout le système en une seule commande, infra + applicatif.

**✅ Statut (2026-08-10) : terminée et testée de bout en bout.** Point technique notable : Kafka devait exposer un double listener (`localhost:9092` pour l'hôte, `kafka:29092` pour le réseau Docker interne), et la validation JWT des deux backends est passée de `issuer-uri` à `jwk-set-uri` (adresse interne `http://keycloak:8080/...`) pour contourner le fait qu'un token émis via `localhost:8180` (vu du navigateur) n'est pas vérifiable de la même façon depuis l'intérieur d'un conteneur — compromis accepté en dev local (signature vérifiée, provenance exacte du token non re-vérifiée). Testé avec `docker compose up --build` : les 6 conteneurs démarrent dans le bon ordre (`depends_on` + `healthcheck`), et un cycle complet a été vérifié (commande passée via un token Keycloak réel → événement Kafka → notification persistée `DELIVERED` en Push + Email réel).

## 4. Étape C — Manifests Kubernetes

Une fois le Compose validé, transposition en manifests K8s : un `Deployment` + `Service` par composant, un `ConfigMap` pour la configuration non sensible, et un `Secret` pour les identifiants Gmail (`GMAIL_APP_PASSWORD`) et le mot de passe admin Keycloak — jamais en clair dans les manifests versionnés. Testable en local via le Kubernetes intégré à Docker Desktop (`kubectl apply -f k8s/`), sans besoin de cluster cloud.

**✅ Statut (2026-08-22) : terminée et testée.** 7 fichiers dans `k8s/` : `secret.yaml`, `postgres.yaml`, `kafka.yaml`, `keycloak.yaml`, `notification-service.yaml`, `rexel-mini-store.yaml`, `frontend.yaml` (Deployment + Service regroupés par fichier). Deux simplifications assumées par rapport à Compose :
- **Thème de login Keycloak custom non repris** (nécessiterait un `ConfigMap` par fichier de thème, fragile pour une arborescence) — thème par défaut de Keycloak utilisé dans ce manifest.
- **Kafka simplifié à un seul listener** (`kafka:9092`) — en K8s, contrairement à Compose, aucun backend ne tourne "sur l'hôte", donc plus besoin du double listener.
- Accès local prévu via `kubectl port-forward` (pas de `NodePort`) — le frontend Angular appelle les backends sur des ports fixes (`8080`/`8081`) codés en dur, incompatibles avec la plage `NodePort` (30000-32767) de Kubernetes.

**Test réalisé** : Kubernetes activé dans Docker Desktop (cluster `docker-desktop`, kubeadm, 1 nœud). Images taguées pour correspondre aux manifests (`notification-service:latest`, `rexel-mini-store:latest`, `rexel-frontend:latest`), Secret créé avec les vraies valeurs via `kubectl create secret` (jamais commitées), déploiement de tous les manifests avec `kubectl apply -f k8s/`. **Les 6 pods démarrent et passent `Running` (1/1 Ready)** sans erreur : Postgres, Kafka, Keycloak, `notification-service`, `rexel-mini-store`, `frontend`. Connectivité vérifiée via `kubectl port-forward` : catalogue produits réel (`rexel-mini-store`), Swagger UI (`notification-service`), page d'accueil (`frontend`) — tous répondent `200`.

**Limite assumée** : le realm Keycloak (`rexel-realm`, comptes, clients) n'a pas été recréé dans ce cluster K8s isolé (base de données Postgres distincte de celle de Docker Compose) — seul le realm `master` par défaut existe. Le test valide donc le **déploiement et le démarrage** de l'architecture complète, pas un scénario métier de bout en bout comme celui déjà validé sous Docker Compose (section 3).

## 5. Étape D — CI/CD (GitHub Actions)

Un workflow (`.github/workflows/ci.yml`) déclenché à chaque `push` sur `main` : compilation + tests des deux backends Maven, build Angular du frontend. Extension possible si le temps le permet : build et publication des images Docker vers un registre (ex: GitHub Container Registry).

**✅ Statut (2026-08-10) : écrit, pas encore poussé sur GitHub.** 3 jobs en parallèle (un par composant) : `mvn compile` pour les deux backends, `npm ci` + `npm run build` pour le frontend. Pas d'étape de tests automatisés pour l'instant (aucune suite de tests n'existe encore dans le projet) — juste une vérification de compilation à chaque push/pull request vers `main`.

## 6. Ordre de priorité recommandé

Les étapes A et B (Dockerfiles + Compose) ont le meilleur ratio effort/impact et sont la priorité avant la soutenance. Les étapes C (Kubernetes) et D (CI/CD) sont un plus si le temps le permet, mais ne conditionnent pas la démonstration du fonctionnel.
