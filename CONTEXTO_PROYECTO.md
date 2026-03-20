# CONTEXTO COMPLETO — AgroControl Plátano Hartón
> Archivo de recuperación de contexto para Claude. Actualizado: 2026-03-19

---

## ¿QUÉ ES?

Sistema web de gestión agrícola para un cultivo de **plátano hartón en Granada, Meta, Colombia**.

**Propietario del proyecto:** Carlos Martínez
**Ruta local:** `/Users/carlosmartinez/Documents/app_agricola/`

---

## STACK TÉCNICO

| Capa | Tecnología | Notas |
|------|------------|-------|
| Frontend | HTML5 + CSS3 + Vanilla JS (ES Modules) | SPA con hash routing, sin framework |
| Backend | Node.js + Express | API REST |
| Base de datos | MongoDB (Atlas) + Mongoose ODM | |
| Auth | JWT + bcryptjs | Token en localStorage, 24h expiry |
| Deploy Frontend | GitHub Pages | Requiere sin build step |
| Deploy Backend | Railway o Render | Variables de entorno vía panel |
| Gráficas | Chart.js 4.x (CDN) | Cargado on-demand |

---

## ESTRUCTURA DE ARCHIVOS

```
app_agricola/
├── docs/
│   ├── idea.md            — Concepto del proyecto
│   ├── prompt.md          — Decisiones técnicas justificadas
│   ├── spec.md            — Especificación completa (modelos + API)
│   ├── roadmap.md         — Fases de desarrollo
│   └── tasks.md           — Checklist de tareas
│
├── backend/
│   ├── server.js          — Entry point Express
│   ├── package.json
│   ├── .env.example
│   ├── config/
│   │   └── database.js    — Conexión MongoDB
│   ├── models/
│   │   ├── User.js
│   │   ├── Expense.js
│   │   ├── Phase.js
│   │   ├── ScheduledPayment.js
│   │   ├── ProductionRecord.js
│   │   └── CalendarEvent.js
│   ├── middleware/
│   │   ├── auth.js         — JWT protect + adminOnly
│   │   ├── errorHandler.js
│   │   └── rateLimiter.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── expenseController.js
│   │   ├── phaseController.js
│   │   ├── paymentController.js
│   │   ├── productionController.js
│   │   ├── calendarController.js
│   │   └── dashboardController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── expenses.js
│   │   ├── phases.js
│   │   ├── payments.js
│   │   ├── production.js
│   │   ├── calendar.js
│   │   └── dashboard.js
│   └── scripts/
│       └── seed.js         — Datos demo + 2 users + 7 fases
│
└── frontend/
    ├── index.html          — SPA entry point
    ├── css/
    │   ├── variables.css   — Design tokens + tema oscuro automático
    │   ├── base.css        — Reset + tipografía + botones + tabla
    │   ├── layout.css      — Sidebar + header + grid
    │   ├── components.css  — KPIs, modal, toast, phases, payments...
    │   ├── animations.css  — keyframes
    │   └── responsive.css  — Breakpoints móvil
    ├── js/
    │   ├── app.js          — Entry point (initTheme + initAuth + initRouter)
    │   ├── state.js        — Estado global (auth, route)
    │   ├── router.js       — Hash routing SPA
    │   ├── ui.js           — Helpers DOM + formatters
    │   └── views/
    │       ├── login.js
    │       ├── dashboard.js  — KPIs + Chart.js (doughnut + bar)
    │       ├── expenses.js   — CRUD + filtros + paginación
    │       ├── phases.js     — 7 fases con progreso visual + fotos
    │       ├── payments.js   — Pagos con alertas vencidos/próximos
    │       ├── production.js — Cosechas + ROI + preview ingresos
    │       ├── calendar.js   — Calendario mensual + eventos
    │       └── settings.js   — Tema + API URL + perfil
    ├── services/
    │   ├── api.js           — Fetch wrapper con auth + 401 redirect
    │   ├── authService.js
    │   ├── expenseService.js
    │   ├── phaseService.js
    │   ├── paymentService.js
    │   ├── productionService.js
    │   ├── calendarService.js
    │   └── dashboardService.js
    └── components/
        ├── sidebar.js       — Nav con iconos emoji
        ├── header.js        — Título + toggle tema + alertas badge
        ├── modal.js         — Modal reutilizable genérico
        └── toast.js         — Notificaciones temporales
```

---

## COLECCIONES MONGODB

| Colección | Campos clave |
|-----------|-------------|
| `users` | name, email, password(hashed), role(admin/viewer), isActive |
| `expenses` | date, amount, description, category, phase→Phase, createdBy→User |
| `phases` | name, order(1-7), status, progressPercent, startDate, endDate, imageUrls[] |
| `scheduledpayments` | description, amount, dueDate, category, isPaid, paidAt |
| `productionrecords` | date, bunchesHarvested, weightKg, pricePerKg, totalRevenue |
| `calendarevents` | title, date, type, phase→Phase, notes |

---

## API ENDPOINTS

```
GET  /api/health                    — Sin auth, health check
POST /api/auth/login                — Rate limited (10/15min)
POST /api/auth/register             — Requiere auth (admin crea viewers)
GET  /api/auth/profile              — Requiere auth

GET  /api/dashboard                 — KPIs + alertas + gráficas

GET  /api/expenses                  — Filtros: category, phase, startDate, endDate, page, limit
POST /api/expenses                  — Admin only
PUT  /api/expenses/:id              — Admin only
DELETE /api/expenses/:id            — Admin only
GET  /api/expenses/summary          — Totales por categoría y fase

GET  /api/phases                    — Ordenadas por order
GET  /api/phases/:id/detail         — Fase + gastos
PUT  /api/phases/:id                — Admin only (progressPercent auto-ajusta status)

GET  /api/payments                  — Filtros: isPaid, startDate, endDate
POST /api/payments                  — Admin only
PUT  /api/payments/:id              — Admin only
PATCH /api/payments/:id/pay         — Admin only (marca como pagado)
DELETE /api/payments/:id            — Admin only

GET  /api/production                — Paginado
POST /api/production                — Admin only (totalRevenue = weightKg * pricePerKg)
PUT  /api/production/:id            — Admin only
DELETE /api/production/:id          — Admin only
GET  /api/production/summary        — Totales + ROI

GET  /api/calendar                  — Filtro: month, year
POST /api/calendar                  — Admin only
PUT  /api/calendar/:id              — Admin only
DELETE /api/calendar/:id            — Admin only
```

---

## FASES DEL CULTIVO (seed inicial)

1. Alquiler del terreno
2. Alistamiento del terreno
3. Preabono
4. Siembra
5. Sellado
6. Limpieza de maleza
7. Aplicación de abono

---

## CREDENCIALES DEMO (post-seed)

```
Admin:  admin@agrocontrol.com  /  Admin2024!
Viewer: viewer@agrocontrol.com /  Viewer2024!
```

---

## CATEGORÍAS

**Gastos:** trabajadores | maquinaria | insumos | otros
**Pagos programados:** + arriendo
**Eventos calendario:** abono | limpieza | cosecha | pago | siembra | otro

---

## DISEÑO / UX

- Tema claro/oscuro automático via `prefers-color-scheme` + override manual
- Design tokens en `css/variables.css` (colores, espaciados, sombras)
- Color primario: **#22c55e** (verde agrícola)
- Color acento: **#f59e0b** (tierra/dorado)
- Sidebar fijo en desktop, overlay en móvil (breakpoint 768px)
- Modales reutilizables vía `modal.js`
- Toasts para feedback: success/error/warning/info
- KPI Cards con accent color variable por CSS custom property

---

## PASOS PARA ARRANCAR

### Backend
```bash
cd /Users/carlosmartinez/Documents/app_agricola/backend
npm install
cp .env.example .env
# Editar .env con MONGODB_URI real
npm run seed    # Crear fases y usuarios demo
npm run dev     # Servidor en puerto 3000
```

### Frontend
```bash
# Opción 1: Live Server (VS Code extension)
# Click derecho en index.html → Open with Live Server

# Opción 2: Python
cd /Users/carlosmartinez/Documents/app_agricola/frontend
python3 -m http.server 5500

# Opción 3: npx
npx serve frontend/
```

---

## DEPLOY PRODUCCIÓN

### Backend — Railway
1. Crear proyecto en railway.app
2. Conectar repo GitHub
3. Variables de entorno:
   - `MONGODB_URI` = connection string Atlas
   - `JWT_SECRET` = string aleatorio largo
   - `FRONTEND_URL` = https://tuusuario.github.io/agrocontrol
   - `NODE_ENV` = production

### Frontend — GitHub Pages
1. Poner carpeta `frontend/` como root del repo (o configurar source folder)
2. Antes de subir, actualizar `API_BASE` en `frontend/services/api.js` con la URL de Railway
3. Settings → Pages → Branch: main / folder: /frontend

---

## PENDIENTES / MEJORAS FUTURAS

- [ ] Cambio de contraseña desde settings
- [ ] Exportar gastos a CSV/Excel
- [ ] Notificaciones push para pagos (Service Worker)
- [ ] Fotos subidas directamente (no solo URLs externas)
- [ ] Multiusuario: crear users desde el panel admin
- [ ] Gráfica producción vs gastos en el tiempo (vista producción)
- [ ] PWA (offline capability)

---

## CONTEXTO PARA CONTINUAR

Si la memoria se resetea, este archivo contiene TODO lo necesario.
El proyecto está **completamente funcional** — solo requiere:
1. `npm install` en `/backend`
2. Configurar `.env` con MongoDB URI
3. `npm run seed`
4. Abrir `frontend/index.html` con Live Server

**Última modificación:** 2026-03-19
**Estado:** ✅ Desarrollo completo — listo para configuración de deploy
