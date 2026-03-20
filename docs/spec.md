# Spec — AgroControl Plátano Hartón

## 1. Arquitectura General

```
┌─────────────────────────────────────────────────┐
│  FRONTEND (GitHub Pages)                         │
│  HTML5 + CSS3 + JS Modular                       │
│  Sin frameworks — Vanilla JS con módulos ES6     │
└──────────────────┬──────────────────────────────┘
                   │ HTTP / REST / JSON
┌──────────────────▼──────────────────────────────┐
│  BACKEND (Node.js + Express)                     │
│  API REST con JWT auth                           │
└──────────────────┬──────────────────────────────┘
                   │ Mongoose ODM
┌──────────────────▼──────────────────────────────┐
│  DATABASE (MongoDB Atlas)                        │
└─────────────────────────────────────────────────┘
```

## 2. Colecciones MongoDB

### users
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string",
  "password": "string (hashed)",
  "role": "admin | viewer",
  "isActive": true,
  "createdAt": "Date"
}
```

### expenses
```json
{
  "_id": "ObjectId",
  "date": "Date",
  "amount": "number",
  "description": "string",
  "category": "trabajadores | maquinaria | insumos | otros",
  "phase": "ObjectId → phases",
  "createdBy": "ObjectId → users",
  "createdAt": "Date"
}
```

### phases
```json
{
  "_id": "ObjectId",
  "name": "string",
  "order": "number",
  "status": "pending | in_progress | completed",
  "startDate": "Date",
  "endDate": "Date",
  "progressPercent": "number (0-100)",
  "notes": "string",
  "imageUrls": ["string"],
  "updatedAt": "Date"
}
```

### scheduled_payments
```json
{
  "_id": "ObjectId",
  "description": "string",
  "amount": "number",
  "dueDate": "Date",
  "category": "string",
  "isPaid": false,
  "paidAt": "Date | null",
  "createdAt": "Date"
}
```

### production_records
```json
{
  "_id": "ObjectId",
  "date": "Date",
  "bunchesHarvested": "number",
  "weightKg": "number",
  "pricePerKg": "number",
  "totalRevenue": "number",
  "notes": "string",
  "createdAt": "Date"
}
```

### calendar_events
```json
{
  "_id": "ObjectId",
  "title": "string",
  "date": "Date",
  "type": "abono | limpieza | cosecha | pago | otro",
  "phase": "ObjectId → phases (opcional)",
  "notes": "string",
  "createdAt": "Date"
}
```

## 3. API Endpoints

### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/auth/login | Login con JWT |
| POST | /api/auth/register | Registro (solo admin puede crear viewers) |
| GET | /api/auth/profile | Perfil del usuario autenticado |

### Expenses
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/expenses | Listar con filtros (fecha, categoría, fase) |
| POST | /api/expenses | Crear gasto |
| PUT | /api/expenses/:id | Editar gasto |
| DELETE | /api/expenses/:id | Eliminar gasto |
| GET | /api/expenses/summary | Totales por categoría y fase |

### Phases
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/phases | Listar todas las fases |
| PUT | /api/phases/:id | Actualizar progreso/estado/fotos |

### Scheduled Payments
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/payments | Listar pagos (con filtro isPaid) |
| POST | /api/payments | Crear pago programado |
| PUT | /api/payments/:id | Editar pago |
| PATCH | /api/payments/:id/pay | Marcar como pagado |
| DELETE | /api/payments/:id | Eliminar pago |

### Production
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/production | Listar registros |
| POST | /api/production | Crear registro de cosecha |
| PUT | /api/production/:id | Editar registro |
| DELETE | /api/production/:id | Eliminar registro |
| GET | /api/production/summary | Totales y proyecciones |

### Calendar
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/calendar | Eventos por mes/año |
| POST | /api/calendar | Crear evento |
| PUT | /api/calendar/:id | Editar evento |
| DELETE | /api/calendar/:id | Eliminar evento |

### Dashboard
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/dashboard | KPIs, resumen financiero, alertas |

## 4. Frontend — Vistas

| Vista | Ruta hash | Descripción |
|-------|-----------|-------------|
| Dashboard | #/ | KPIs + gráficas + alertas |
| Gastos | #/expenses | CRUD gastos con filtros |
| Fases | #/phases | Progreso visual por fase |
| Pagos | #/payments | Calendario de pagos |
| Producción | #/production | Registros + proyección |
| Calendario | #/calendar | Vista mensual agrícola |
| Ajustes | #/settings | Config del proyecto |

## 5. Componentes Frontend

- `Sidebar` — navegación lateral con iconos
- `Header` — título + usuario + toggle tema
- `KPICard` — tarjeta métrica reutilizable
- `ExpenseForm` — modal formulario gastos
- `PhaseCard` — card con barra de progreso
- `PaymentCard` — card pago con alerta visual
- `ProductionChart` — gráfica ingresos vs gastos
- `CalendarWidget` — mini calendario navegable
- `AlertBanner` — banner alertas de pagos próximos
- `DataTable` — tabla genérica con paginación
- `Modal` — modal reutilizable
- `Toast` — notificaciones temporales

## 6. Seguridad
- JWT con expiración 24h
- Bcrypt para passwords
- Rate limiting en auth
- CORS configurado para dominio GitHub Pages
- Solo admin puede escribir/editar/eliminar

## 7. Variables de entorno (.env)
```
PORT=3000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
JWT_EXPIRES_IN=24h
FRONTEND_URL=https://tuusuario.github.io
```
