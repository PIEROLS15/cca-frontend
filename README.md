# Comunidad Campesina Asia - Frontend

[![CI](https://github.com/PIEROLS15/cca-frontend/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/PIEROLS15/cca-frontend/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/next.js-16.2.6-black)
![React](https://img.shields.io/badge/react-19.2.4-61DAFB)
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-4.x-38B2AC)
![Zustand](https://img.shields.io/badge/zustand-5.x-ffb300)

Frontend modular construido con **Next.js App Router + React** para el sistema de gestion comunal.
Incluye autenticacion, control por roles/permisos, panel de control, CRUDs, solicitudes, verificacion de certificados y exportacion de reportes.

---

## Tecnologias principales

- [Next.js 16](https://nextjs.org/) - Framework de React con App Router.
- [React 19](https://react.dev/) - UI declarativa basada en componentes.
- [TypeScript](https://www.typescriptlang.org/) - Tipado estatico.
- [Tailwind CSS 4](https://tailwindcss.com/) - Estilos utilitarios.
- [Zustand](https://zustand.docs.pmnd.rs/) - Estado global ligero.
- [Radix UI](https://www.radix-ui.com/) - Componentes accesibles de interfaz.
- [Sonner](https://sonner.emilkowal.ski/) - Notificaciones toast.
- [Recharts](https://recharts.org/) - Graficos del dashboard.
- [date-fns](https://date-fns.org/) - Utilidades de fechas.

---

## Estructura del proyecto

```bash
src/
  app/                      # Next.js App Router
    (public)/               # Rutas publicas
    layout.tsx              # Layout raiz
    page.tsx                # Dashboard
    perfil/
    clientes/
    comuneros/
    sectores/
    tipos-terreno/
    usuarios/
    certificados/
    solicitudes-certificados/
    solicitudes-acta/
  components/               # UI y vistas reutilizables
    layout/
    login/
    ui/
    dashboard/
    clientes/
    certificados/
    profile/
    solicitudes-acta/
    solicitudes-certificados/
    usuarios/
  context/                  # Estado global
  hooks/                    # Logica reutilizable
  lib/                      # Utilidades y datos estaticos
  services/                 # Acceso a API y reglas de negocio
  store/                    # Estado global con Zustand
  types/                    # Tipos TypeScript
  proxy.ts                  # Middleware/proxy de autenticacion
```

---

## Configuracion

### Prerequisitos

- Node.js 20 o superior
- pnpm instalado globalmente
- Backend disponible para consumir la API

Verifica versiones:

```bash
node -v
pnpm -v
```

### Variables de entorno

Crea el archivo `.env` en la raiz de `cca-frontend` usando `.env.example` como referencia:

```bash
NEXT_PUBLIC_API_URL=http://localhost:9001
```

`FRONTEND_PORT=9000` aparece como referencia en `.env.example`, pero el puerto de desarrollo esta fijado en el script `dev`.

---

## Instalacion

1. Clona el repositorio y entra al frontend:

```bash
git clone https://github.com/PIEROLS15/comunidad-campesina-asia.git
cd comunidad-campesina-asia/cca-frontend
```

2. Instala dependencias:

```bash
pnpm install
```

3. Crea el archivo `.env`:

```bash
cp .env.example .env
```

4. Ajusta `NEXT_PUBLIC_API_URL` segun tu backend local o remoto.

---

## Desarrollo

Inicia el frontend en modo desarrollo:

```bash
pnpm run dev
```

Servidor por defecto: `http://localhost:9000`

---

## Docker

### Prerequisitos

- [Docker](https://docs.docker.com/engine/install/) y [Docker Compose](https://docs.docker.com/compose/install/) instalados.

### Configuracion

El contenedor del frontend necesita `NEXT_PUBLIC_API_URL` para conectarse al backend.
Si usas `docker compose`, define tambien `FRONTEND_PORT` para exponer el puerto local.

### Primer despliegue

1. Crea el archivo `.env` en la raiz de `cca-frontend` usando `.env.example` como referencia:

```bash
cp .env.example .env
```

2. Ajusta las variables segun tu entorno.

3. Construye e inicia los contenedores:

```bash
docker compose up -d --build
```

Esto levanta el frontend en el puerto definido por `FRONTEND_PORT`.

### Rebuild manual

```bash
docker compose up -d --build frontend
```

### Pruebas con Docker

Para validar el frontend contra el backend de pruebas:

Antes de ejecutarlo, crea `.env` desde `.env.example` y completa la seccion de test.

```bash
docker compose --env-file .env -p cca-frontend-test -f docker-compose.test.yml up -d --build frontend
pnpm test:e2e
```

Antes de correr `Playwright`, asegúrate de tener arriba el backend de test en `9101`.
El archivo `.env` se carga automaticamente desde `playwright.config.ts`, asi que no hace falta exportar `FRONTEND_TEST_URL` a mano.
`pnpm test:e2e` ejecuta Playwright; ya no hay tests unitarios en este frontend.

Para limpiar el entorno de pruebas:

```bash
docker compose --env-file .env -p cca-frontend-test -f docker-compose.test.yml down
```

El script `deploy/test/deploy.sh` automatiza ese flujo en el VPS.

### Modo visual de Playwright

```bash
pnpm exec playwright test --debug
pnpm exec playwright codegen http://127.0.0.1:9100/login
```

### Detener contenedores

```bash
docker compose down
```

### Despliegue en VPS

Para produccion usamos release por carpeta y rollback seguro.

Estructura esperada:

```bash
/opt/app/frontend/current
/opt/app/frontend/releases/<sha>
/opt/app/frontend/shared/.env
```

Antes del primer deploy crea el archivo `/opt/app/frontend/shared/.env` con la URL publica del backend:

```bash
NEXT_PUBLIC_API_URL=https://api.comunidadcampesina-asia.com
NEXT_PUBLIC_TRACKING_URL=https://seguimiento.comunidadcampesina-asia.com
FRONTEND_PORT=9000
```

El workflow `deploy-frontend.yml` sube un release nuevo, valida `/api/health` y solo despues promueve el release.
Recuerda que `FRONTEND_PORT` define el puerto expuesto en el host, mientras que el frontend dentro del contenedor escucha siempre en `9000`.
Para exponerlo al public usa Caddy con `comunidadcampesina-asia.com` apuntando a `127.0.0.1:9000`.

```caddy
comunidadcampesina-asia.com {
  reverse_proxy 127.0.0.1:9000
}
```

---

## Scripts disponibles

```bash
pnpm run dev      # Ejecuta Next.js en modo desarrollo
pnpm run build    # Genera build de produccion
pnpm run start    # Ejecuta la build generada
pnpm run lint     # Ejecuta ESLint
```

---

## Funcionalidades

- Autenticacion y sesion de usuario.
- Dashboard con metricas y graficas.
- CRUD de usuarios, clientes, sectores y tipos de terreno.
- CRUD y gestion de certificados.
- Solicitudes de certificados y solicitudes de acta.
- Verificacion publica de certificados.
- Control de acceso por roles y rutas.

---

## Contribucion

1. Crea una rama para tu cambio (`feature/...` o `fix/...`).
2. Mantiene la estructura por capas: `app`, `components`, `hooks`, `services`, `types`, etc.
3. Si cambias contratos con la API, actualiza los servicios y tipos correspondientes.
4. Ejecuta `pnpm run lint` antes de abrir un Pull Request.

---

## Licencia

Este proyecto no declara una licencia publica.

---

Desarrollado por [PIEROLS15](https://github.com/PIEROLS15)
