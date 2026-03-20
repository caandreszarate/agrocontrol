# CONTEXTO COMPLETO — AgroControl Plátano Hartón
> Archivo de recuperación de contexto para Claude. Actualizado: 2026-03-20

---

## ¿QUÉ ES?

Sistema web de gestión agrícola para un cultivo de **plátano hartón en Granada, Meta, Colombia**.

**Propietario:** Carlos Martínez (GitHub: `caandreszarate`)
**Ruta local:** `/Users/carlosmartinez/Documents/app_agricola/`

---

## ESTADO ACTUAL — ✅ PRODUCCIÓN FUNCIONANDO

### ✅ Frontend — GitHub Pages
- **URL:** `https://caandreszarate.github.io/agrocontrol/`
- **Rama:** `gh-pages` (solo archivos frontend en raíz)
- **Estado:** Desplegado y funcionando

### ✅ Backend — Railway
- **URL pública:** `https://agrocontrol-production.up.railway.app`
- **URL interna:** `agrocontrol.railway.internal`
- **Estado:** ✅ Desplegado, conectado a MongoDB Atlas, login funciona

### ✅ MongoDB Atlas
- **Cluster:** `cluster0.zvzj8xv.mongodb.net`
- **Usuario DB:** `caandreszarate_db_user`
- **Password DB:** `[ver en Railway → Variables o en .env local]`
- **Base de datos:** `agrocontrol`
- **URI completa:**
  ```
  mongodb+srv://caandreszarate_db_user:[PASSWORD]@cluster0.zvzj8xv.mongodb.net/agrocontrol?retryWrites=true&w=majority&appName=Cluster0
  ```
- **Usuarios en DB:** 2 (admin + viewer, creados con `npm run seed`)

---

## CREDENCIALES DEMO

```
Admin:  admin@agrocontrol.com  /  Admin2024!
Viewer: viewer@agrocontrol.com /  Viewer2024!
```

---

## HISTORIAL DE PROBLEMAS RESUELTOS

| # | Problema | Causa | Fix |
|---|----------|-------|-----|
| 1 | `npm: command not found` en Railway | Nixpacks no encontraba Node.js (package.json en subcarpeta `backend/`) | `nixpacks.toml` con `nodejs_20` |
| 2 | `undefined variable 'npm-9_x'` | Nombre de paquete Nix inválido | Eliminado `npm-9_x`; `nodejs_20` ya incluye npm |
| 3 | `MONGODB_URI` undefined en Railway | Variables de entorno no configuradas | Agregar variables manualmente en Railway |
| 4 | URI con prefijo `%20=mongodb+srv://` | Railway codificaba mal el valor pegado en Raw Editor | Fix regex en `database.js`: `rawUri.replace(/^[^m]*(mongodb)/i, 'mongodb')` |
| 5 | Login 401 en producción | Railway conectaba a BD `agr` en vez de `agrocontrol` | Fix en `database.js`: `.replace(/[\r\n\s]+/g, '')` para eliminar saltos de línea en la URI |
| 6 | `userCount: 0` | BD correcta pero sin usuarios | `npm run seed` local pobló Atlas |
| 7 | gh-pages con `node_modules` | Primera copia incluía todo el proyecto | Usar directorio temporal solo con archivos frontend |

---

## VARIABLES DE ENTORNO RAILWAY (correctas)

```
MONGODB_URI=mongodb+srv://caandreszarate_db_user:[PASSWORD]@cluster0.zvzj8xv.mongodb.net/agrocontrol?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=agrocontrol_jwt_secret_2024_granada_meta
JWT_EXPIRES_IN=24h
NODE_ENV=production
FRONTEND_URL=https://caandreszarate.github.io
```

> **IMPORTANTE:** Si vuelves a editar `MONGODB_URI` en Railway, usa el botón "New Variable" y no el Raw Editor — el Raw Editor a veces inserta saltos de línea invisibles que truncan el nombre de la BD.

---

## STACK TÉCNICO

| Capa | Tecnología |
|------|------------|
| Frontend | HTML5 + CSS3 + Vanilla JS (ES Modules) — SPA hash routing |
| Backend | Node.js + Express — API REST |
| Base de datos | MongoDB Atlas + Mongoose |
| Auth | JWT 24h + bcryptjs |
| Deploy Frontend | GitHub Pages (rama `gh-pages`) |
| Deploy Backend | Railway (repo `caandreszarate/agrocontrol`, carpeta `backend/`) |
| Gráficas | Chart.js 4.x CDN |

---

## ESTRUCTURA DE ARCHIVOS

```
app_agricola/
├── CONTEXTO_PROYECTO.md     ← este archivo
├── railway.json             ← config Railway (apunta a backend/)
├── nixpacks.toml            ← Node.js 20 para Railway
├── .gitignore
├── docs/                    ← idea, spec, roadmap, tasks, prompt
├── backend/
│   ├── server.js            ← Express app (puerto $PORT o 3000)
│   ├── .env                 ← LOCAL ONLY (no en git)
│   ├── .env.example
│   ├── config/database.js   ← Fix URI Railway: regex limpia prefijos y saltos de línea
│   ├── models/              ← User, Expense, Phase, ScheduledPayment, ProductionRecord, CalendarEvent
│   ├── middleware/          ← auth.js (JWT), errorHandler.js, rateLimiter.js
│   ├── controllers/         ← auth, expense, phase, payment, production, calendar, dashboard
│   ├── routes/              ← auth, expenses, phases, payments, production, calendar, dashboard
│   └── scripts/seed.js      ← Crea 7 fases + admin + viewer + datos demo
└── frontend/
    ├── index.html
    ├── assests/img/hero_agricultura.jpg   ← OJO: "assests" con typo intencional
    ├── css/                 ← variables, base, layout, components, animations, responsive
    ├── js/
    │   ├── app.js, router.js, state.js, ui.js
    │   └── views/           ← login, dashboard, expenses, phases, payments, production, calendar, settings
    ├── services/            ← api.js (API_BASE auto: localhost dev / Railway prod)
    └── components/          ← sidebar, header, modal, toast
```

---

## GITHUB

- **Repo:** `https://github.com/caandreszarate/agrocontrol`
- **Rama main:** código fuente completo
- **Rama gh-pages:** solo frontend (se actualiza con force push desde temp dir)
- **Token GitHub:** `ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` ← ver localmente en `.env` o generar nuevo en GitHub

### Comando para actualizar gh-pages
```bash
TMPDIR=$(mktemp -d)
cp -r /Users/carlosmartinez/Documents/app_agricola/frontend/. "$TMPDIR/"
cd "$TMPDIR"
git init && git config user.email "caandreszarate@github.com" && git config user.name "caandreszarate"
git checkout -b gh-pages && git add . && git commit -m "deploy: mensaje"
git remote add origin https://TU_TOKEN@github.com/caandreszarate/agrocontrol.git
git push origin gh-pages --force
```

### Comando para actualizar main
```bash
cd /Users/carlosmartinez/Documents/app_agricola
git add . && git commit -m "mensaje" && git push origin main
```

---

## FASES DEL CULTIVO (seed)

1. Alquiler del terreno
2. Alistamiento del terreno
3. Preabono
4. Siembra
5. Sellado
6. Limpieza de maleza
7. Aplicación de abono

---

## DISEÑO LOGIN

Login tipo hero de dos columnas:
- **Izquierda:** imagen `assests/img/hero_agricultura.jpg` + overlay verde + título "Del campo a tus datos" + 3 stats
- **Derecha:** formulario con ícono toggle password, shake animation en error, feedback visual en éxito

---

## ARCHIVOS CLAVE — FIXES APLICADOS

### `backend/config/database.js`
```js
const rawUri = process.env.MONGODB_URI || '';
const uri = rawUri.replace(/^[^m]*(mongodb)/i, 'mongodb').replace(/[\r\n\s]+/g, '');
```

### `frontend/services/api.js`
```js
const API_BASE = (() => {
  const saved = localStorage.getItem('agro_api_url');
  if (saved) return `${saved}/api`;
  const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  return isLocal
    ? 'http://localhost:3000/api'
    : 'https://agrocontrol-production.up.railway.app/api';
})();
```

### `nixpacks.toml`
```toml
[phases.setup]
nixPkgs = ["nodejs_20"]
[phases.install]
cmds = ["cd backend && npm install"]
[phases.build]
cmds = []
[start]
cmd = "cd backend && node server.js"
```

---

## COMMITS RELEVANTES

| Commit | Descripción |
|--------|-------------|
| `58ab61e` | Initial commit: Sistema Agrícola completo |
| `289abbd` | fix: add /api/debug endpoint + fix MONGODB_URI prefix (Railway) |
| `edb9909` | fix: strip newlines from MONGODB_URI before connect |
| último | fix: remove /api/debug endpoint (problema resuelto) |

---

## PENDIENTES

- [ ] Probar todas las secciones del dashboard con datos reales
- [ ] Verificar que Chart.js carga correctamente en producción
- [ ] Opcional: agregar más usuarios o roles según necesidad
