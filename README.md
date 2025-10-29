# Colibrí – Backend (Monorepo de Microservicios)

Este repo contiene el **backend por microservicios** (Nest.js), el **API Gateway**, **Nginx** y orquestación para dev/local con Docker Compose. Bases de datos: **PostgreSQL** (transaccional) y **MongoDB** (geoespacial).

## Estructura
```
apigateway/                 # API Gateway (Nest) - JWT, CORS, routing
nginx/                      # Nginx reverse proxy
microservices/
  auth/                     # Autenticación (login/registro, JWT/refresh)
  users-profiles/           # Identidad + perfiles (client/driver/admin)
  routes-search/            # Rutas + búsqueda 2dsphere (Mongo)
  reservations/             # Estados de reserva
  wallet-conciliation/      # Hold/Release/Refund (ACID, idempotencia)
  driverday/                # Chofer por jornada
  notifications/            # Notificaciones asíncronas
shared/                     # DTOs/utils compartidos
scripts/                    # Migraciones/seeds/helpers
docker-compose.yml          # Levante local (dev)
.github/workflows/ci.yml    # CI simple (build por carpeta)
```

## Ramas (simples y cortas)
- **main**: producción estable (tag `vX.Y.Z`). PR solo desde `dev`.
- **dev**: integración/QA.

**Ramas de trabajo** (nacen de `dev`, PR a `dev`):
- `feat-<servicio>-<slug>` → nueva funcionalidad  
  Ej: `feat-users-kyc`, `feat-routes-bbox`
- `fix-<servicio>-<slug>` → corrección de bug  
  Ej: `fix-wallet-refund`
- `chore-<servicio>-<slug>` → mantenimiento  
  Ej: `chore-reservations-refactor`
- `docs-<area>-<slug>` → documentación  
  Ej: `docs-arch-diagram`
- `ops-<area>-<slug>` → infra/CI  
  Ej: `ops-nginx-compression`

**Especiales (opcionales):**
- `release-x.y.z` para congelar QA
- `hotfix-<slug>` desde `main` (luego back-merge a `dev`)

### Cómo crear ramas cortas
```bash
# desde dev
git checkout dev && git pull
git checkout -b feat-users-kyc
# ...commit/push...
git push -u origin feat-users-kyc
# abrir PR a dev
```

## Flujo de trabajo
1. Crea tu rama corta desde `dev`.
2. Desarrolla solo en tu microservicio (y `shared` si aplica).
3. Prueba con Docker Compose local.
4. Abre PR a `dev` (CI corre; CODEOWNERS revisan).
5. QA valida; luego PR `dev`→`main` con tag para release.

## Docker Compose (local)
Requisitos: Docker / Docker Compose.
```bash
docker compose up --build
```
- Nginx: http://localhost:80
- Gateway: http://localhost:8080
- Postgres: localhost:5432 (user: postgres / pass: dev / db: colibri)
- Mongo: localhost:27017

## Reglas de datos
- Cada microservicio es **dueño** de sus tablas/colecciones.
- Migraciones en `microservices/<svc>/migrations` (Postgres).
- Índices Mongo en `microservices/routes-search/indices`.

## CI (mínimo)
El workflow compila imágenes por carpeta tocada. Extiende con tests/lint según avance.

---
Cualquier duda: abrir un issue o preguntar en el canal del equipo.
