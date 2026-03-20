# Tasks — AgroControl Plátano Hartón

## BACKEND

### Setup
- [x] package.json con dependencias
- [x] server.js con Express + CORS + rate limit
- [x] config/database.js conexión MongoDB
- [x] .env.example

### Modelos
- [x] models/User.js
- [x] models/Expense.js
- [x] models/Phase.js
- [x] models/ScheduledPayment.js
- [x] models/ProductionRecord.js
- [x] models/CalendarEvent.js

### Middleware
- [x] middleware/auth.js (JWT verify)
- [x] middleware/adminOnly.js
- [x] middleware/errorHandler.js
- [x] middleware/rateLimiter.js

### Controllers
- [x] controllers/authController.js
- [x] controllers/expenseController.js
- [x] controllers/phaseController.js
- [x] controllers/paymentController.js
- [x] controllers/productionController.js
- [x] controllers/calendarController.js
- [x] controllers/dashboardController.js

### Routes
- [x] routes/auth.js
- [x] routes/expenses.js
- [x] routes/phases.js
- [x] routes/payments.js
- [x] routes/production.js
- [x] routes/calendar.js
- [x] routes/dashboard.js

### Scripts
- [x] scripts/seed.js — datos iniciales (fases + admin user)

## FRONTEND

### Base
- [x] index.html con estructura SPA
- [x] css/variables.css (design tokens)
- [x] css/base.css (reset + tipografía)
- [x] css/layout.css (sidebar + grid)
- [x] css/components.css (cards, forms, buttons)
- [x] css/responsive.css (breakpoints móvil)
- [x] css/animations.css (transiciones)

### JS Core
- [x] js/app.js (router + init)
- [x] js/state.js (estado global)
- [x] js/router.js (hash routing)
- [x] js/ui.js (helpers DOM)

### Services
- [x] services/api.js (fetch wrapper con auth)
- [x] services/authService.js
- [x] services/expenseService.js
- [x] services/phaseService.js
- [x] services/paymentService.js
- [x] services/productionService.js
- [x] services/calendarService.js
- [x] services/dashboardService.js

### Components
- [x] components/sidebar.js
- [x] components/header.js
- [x] components/modal.js
- [x] components/toast.js
- [x] components/kpiCard.js
- [x] components/dataTable.js
- [x] components/charts.js (Chart.js wrapper)

### Views
- [x] js/views/dashboard.js
- [x] js/views/expenses.js
- [x] js/views/phases.js
- [x] js/views/payments.js
- [x] js/views/production.js
- [x] js/views/calendar.js
- [x] js/views/login.js
- [x] js/views/settings.js
